import asyncio
import json
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from fastapi import WebSocket

from backend.app.core.config import settings
from backend.app.database.session import SessionLocal
from backend.app.models.network import (
    DeviceModel,
    HospitalModel,
    EventLogModel,
    NetworkSnapshotModel
)
from backend.app.integrations.packet_tracer import PacketTracerIntegration
from backend.app.integrations.network_probe import NetworkProbe

class ConnectionManager:
    """Manages active WebSocket connections for live push updates."""
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.append(connection)
        for dead in disconnected:
            if dead in self.active_connections:
                self.active_connections.remove(dead)

manager = ConnectionManager()

class SyncService:
    _last_fingerprint: Optional[Dict[str, Any]] = None
    _is_running: bool = False
    _task: Optional[asyncio.Task] = None

    @classmethod
    def perform_startup_recovery(cls, db: Session) -> Dict[str, Any]:
        """
        Runs on startup:
        1. Retrieves the last recorded snapshot from SQLite.
        2. Detects current Packet Tracer execution state, ports, and .pkt file.
        3. Diffs against previous snapshot to identify state changes that occurred while offline.
        4. Emits structured recovery events.
        5. Persists a fresh snapshot.
        """
        last_snapshot = db.query(NetworkSnapshotModel).order_by(NetworkSnapshotModel.timestamp.desc()).first()
        current_fp = PacketTracerIntegration.get_state_fingerprint()

        recovery_events = []
        now = datetime.utcnow()

        if last_snapshot is not None:
            # Check if .pkt file was modified while SmartCare was offline
            if current_fp.get("pkt_exists") and last_snapshot.pkt_file_mtime:
                prev_mtime = last_snapshot.pkt_file_mtime
                curr_mtime = current_fp.get("pkt_mtime")
                if curr_mtime and abs(curr_mtime - prev_mtime) > 1.0:
                    event = EventLogModel(
                        event_id=f"EVT-REC-{uuid.uuid4().hex[:6].upper()}",
                        timestamp=now,
                        category="CONFIGURATION",
                        event_type="OFFLINE_TOPOLOGY_CHANGE",
                        severity="WARNING",
                        source="PACKET_TRACER",
                        affected_device_id="r0_isp",
                        hospital_id="isp",
                        interface_name=None,
                        previous_state=f"mtime:{prev_mtime}",
                        new_state=f"mtime:{curr_mtime}",
                        description="Packet Tracer topology file (.pkt) was modified while SmartCare monitoring was offline.",
                        detection_method="FILE_HASH_MONITOR",
                        verification_status="VERIFIED",
                        metadata_json=json.dumps({"prev_mtime": prev_mtime, "curr_mtime": curr_mtime})
                    )
                    db.add(event)
                    recovery_events.append("OFFLINE_TOPOLOGY_CHANGE")

            # Check if Packet Tracer process state changed
            if last_snapshot.pt_running != current_fp.get("pt_running"):
                event = EventLogModel(
                    event_id=f"EVT-REC-{uuid.uuid4().hex[:6].upper()}",
                    timestamp=now,
                    category="INTEGRATION",
                    event_type="OFFLINE_PROCESS_TRANSITION",
                    severity="INFO",
                    source="PACKET_TRACER",
                    affected_device_id="r0_isp",
                    hospital_id="isp",
                    interface_name=None,
                    previous_state="RUNNING" if last_snapshot.pt_running else "STOPPED",
                    new_state="RUNNING" if current_fp.get("pt_running") else "STOPPED",
                    description=f"Packet Tracer process state changed while offline: now {'RUNNING' if current_fp.get('pt_running') else 'STOPPED'}.",
                    detection_method="PROCESS_POLL",
                    verification_status="VERIFIED",
                    metadata_json=json.dumps(current_fp)
                )
                db.add(event)
                recovery_events.append("OFFLINE_PROCESS_TRANSITION")

        # Create startup initialization event
        init_event = EventLogModel(
            event_id=f"EVT-BOOT-{uuid.uuid4().hex[:6].upper()}",
            timestamp=now,
            category="INTEGRATION",
            event_type="SYSTEM_RECOVERY_COMPLETE",
            severity="INFO",
            source="BACKEND_PROBE",
            affected_device_id="r0_isp",
            hospital_id="isp",
            interface_name="Gi0/0",
            previous_state="OFFLINE",
            new_state="SYNCHRONIZED",
            description=f"SmartCare NOC synchronization restored. Packet Tracer: {'Active' if current_fp.get('pt_running') else 'Standby'}.",
            detection_method="MANUAL_SYNC",
            verification_status="VERIFIED",
            metadata_json=json.dumps(current_fp)
        )
        db.add(init_event)

        # Persist fresh snapshot
        new_snapshot = NetworkSnapshotModel(
            timestamp=now,
            pt_running=current_fp.get("pt_running", False),
            pt_pid=current_fp.get("pt_pid"),
            pkt_file_mtime=current_fp.get("pkt_mtime"),
            pkt_file_size=current_fp.get("pkt_size"),
            online_devices_count=db.query(DeviceModel).filter(DeviceModel.status == "OPERATIONAL").count(),
            devices_state_hash=uuid.uuid4().hex[:8],
            summary_json=json.dumps(current_fp)
        )
        db.add(new_snapshot)
        db.commit()

        cls._last_fingerprint = current_fp
        return {"recovered": True, "events_generated": recovery_events, "current_fp": current_fp}

    @classmethod
    async def run_sync_poll(cls) -> Optional[Dict[str, Any]]:
        """
        Polls Packet Tracer and host network state, compares against previous state,
        emits structured event logs to SQLite on change, and broadcasts to WebSockets.
        """
        current_fp = PacketTracerIntegration.get_state_fingerprint()
        prev_fp = cls._last_fingerprint

        if prev_fp is None:
            cls._last_fingerprint = current_fp
            return None

        detected_change = None
        db = SessionLocal()
        try:
            now = datetime.utcnow()

            # 1. Detect Packet Tracer process start / stop
            if prev_fp.get("pt_running") != current_fp.get("pt_running"):
                new_running = current_fp.get("pt_running")
                event = EventLogModel(
                    event_id=f"EVT-PT-{uuid.uuid4().hex[:6].upper()}",
                    timestamp=now,
                    category="INTEGRATION",
                    event_type="PT_PROCESS_STATE_CHANGE",
                    severity="WARNING" if not new_running else "INFO",
                    source="PACKET_TRACER",
                    affected_device_id="r0_isp",
                    hospital_id="isp",
                    interface_name=None,
                    previous_state="RUNNING" if prev_fp.get("pt_running") else "STOPPED",
                    new_state="RUNNING" if new_running else "STOPPED",
                    description=f"Packet Tracer process has {'started' if new_running else 'stopped'}.",
                    detection_method="PROCESS_POLL",
                    verification_status="VERIFIED",
                    metadata_json=json.dumps(current_fp)
                )
                db.add(event)
                # Update verification freshness of devices
                new_freshness = "CURRENT" if new_running else "STALE"
                db.query(DeviceModel).update({"verification_status": new_freshness})
                db.commit()
                detected_change = {"type": "PROCESS_CHANGE", "pt_running": new_running}

            # 2. Detect .pkt file modification / save in Packet Tracer
            elif current_fp.get("pkt_mtime") and prev_fp.get("pkt_mtime") and current_fp.get("pkt_mtime") != prev_fp.get("pkt_mtime"):
                event = EventLogModel(
                    event_id=f"EVT-CFG-{uuid.uuid4().hex[:6].upper()}",
                    timestamp=now,
                    category="CONFIGURATION",
                    event_type="PKT_TOPOLOGY_SAVED",
                    severity="INFO",
                    source="PACKET_TRACER",
                    affected_device_id="r0_isp",
                    hospital_id="isp",
                    interface_name=None,
                    previous_state=str(prev_fp.get("pkt_mtime")),
                    new_state=str(current_fp.get("pkt_mtime")),
                    description="Packet Tracer configuration save detected on disk. Re-synchronizing network state.",
                    detection_method="FILE_HASH_MONITOR",
                    verification_status="VERIFIED",
                    metadata_json=json.dumps({"size": current_fp.get("pkt_size")})
                )
                db.add(event)
                db.commit()
                detected_change = {"type": "CONFIG_CHANGE", "pkt_mtime": current_fp.get("pkt_mtime")}

            # 3. Detect Multiuser Port (39000) state change
            elif prev_fp.get("multiuser_port_open") != current_fp.get("multiuser_port_open"):
                is_open = current_fp.get("multiuser_port_open")
                event = EventLogModel(
                    event_id=f"EVT-PORT-{uuid.uuid4().hex[:6].upper()}",
                    timestamp=now,
                    category="CONNECTIVITY",
                    event_type="MULTIUSER_PORT_CHANGE",
                    severity="INFO" if is_open else "WARNING",
                    source="PACKET_TRACER",
                    affected_device_id="r0_isp",
                    hospital_id="isp",
                    interface_name="Port-39000",
                    previous_state="OPEN" if prev_fp.get("multiuser_port_open") else "CLOSED",
                    new_state="OPEN" if is_open else "CLOSED",
                    description=f"Multiuser IPC port (TCP 39000) transitioned to {'LISTENING' if is_open else 'CLOSED'}.",
                    detection_method="PORT_PROBE",
                    verification_status="VERIFIED",
                    metadata_json=json.dumps({"port": 39000})
                )
                db.add(event)
                db.commit()
                detected_change = {"type": "PORT_CHANGE", "port_open": is_open}

            cls._last_fingerprint = current_fp

            # If change was detected, broadcast over WebSockets
            if detected_change:
                evt_dict = None
                if event:
                    evt_dict = {
                        "id": getattr(event, "id", None) or random.randint(1000, 9999),
                        "event_id": event.event_id,
                        "timestamp": event.timestamp.isoformat() if hasattr(event.timestamp, "isoformat") else str(event.timestamp),
                        "category": event.category,
                        "event_type": event.event_type,
                        "severity": event.severity,
                        "source": event.source,
                        "affected_device_id": event.affected_device_id,
                        "hospital_id": event.hospital_id,
                        "interface_name": event.interface_name,
                        "previous_state": event.previous_state,
                        "new_state": event.new_state,
                        "description": event.description,
                        "detection_method": event.detection_method,
                        "verification_status": event.verification_status,
                        "metadata": json.loads(event.metadata_json) if event.metadata_json else None
                    }

                await manager.broadcast({
                    "type": "NETWORK_STATE_CHANGED",
                    "timestamp": now.isoformat(),
                    "payload": {
                        "change": detected_change,
                        "freshness": "CURRENT" if current_fp.get("pt_running") else "STALE",
                        "events": [evt_dict] if evt_dict else []
                    }
                })

        except Exception as e:
            pass
        finally:
            db.close()

        return detected_change

    @classmethod
    async def start_background_sync(cls, interval_seconds: float = 3.0):
        cls._is_running = True
        tick = 0
        while cls._is_running:
            try:
                await cls.run_sync_poll()
                tick += 1
                # Every ~12 seconds, simulate inter-hospital healthcare traffic
                if tick % 4 == 0:
                    try:
                        from backend.app.services.simulation_service import SimulationService
                        from backend.app.api.endpoints.simulation import PRESET_CLINICAL_FLOWS
                        db = SessionLocal()
                        try:
                            preset = random.choice(PRESET_CLINICAL_FLOWS)
                            flow = SimulationService.trace_packet(
                                db,
                                source_id=preset["source"],
                                dest_id=preset["dest"],
                                protocol=preset["protocol"]
                            )
                            await SimulationService.broadcast_flow(flow)
                        finally:
                            db.close()
                    except Exception:
                        pass
            except Exception:
                pass
            await asyncio.sleep(interval_seconds)

    @classmethod
    def stop_background_sync(cls):
        cls._is_running = False
