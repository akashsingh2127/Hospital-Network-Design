import os
import socket
import hashlib
from datetime import datetime
from typing import Dict, Any, Optional
import psutil
from backend.app.core.config import settings
from backend.app.schemas.network import DataSource, IntegrationStatusSchema

class PacketTracerIntegration:
    """
    Dedicated integration layer for Cisco Packet Tracer.
    Inspects process state, open multi-user/IPC ports, and the loaded .pkt file.
    """

    @staticmethod
    def _test_tcp_port(host: str, port: int, timeout: float = 0.5) -> bool:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(timeout)
        try:
            result = s.connect_ex((host, port))
            return result == 0
        except Exception:
            return False
        finally:
            s.close()

    @staticmethod
    def _find_pt_process() -> Optional[Dict[str, Any]]:
        try:
            for proc in psutil.process_iter(['pid', 'name', 'exe', 'cmdline']):
                try:
                    name = proc.info.get('name') or ''
                    if 'packettracer' in name.lower():
                        return {
                            'pid': proc.info.get('pid'),
                            'name': name,
                            'exe': proc.info.get('exe'),
                            'cmdline': proc.info.get('cmdline')
                        }
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    continue
        except Exception:
            pass
        return None

    @classmethod
    def get_status(cls) -> IntegrationStatusSchema:
        pt_proc = cls._find_pt_process()
        is_running = pt_proc is not None
        pid = pt_proc['pid'] if pt_proc else None
        exe_path = pt_proc['exe'] if pt_proc else None

        multiuser_open = cls._test_tcp_port(settings.PT_HOST, settings.PT_PORT_MULTIUSER)
        internal_open = cls._test_tcp_port(settings.PT_HOST, settings.PT_PORT_INTERNAL)
        http_login_open = cls._test_tcp_port(settings.PT_HOST, settings.PT_PORT_HTTP)

        # Inspect .pkt file
        pkt_path = settings.PKT_DEFAULT_FILE
        pkt_exists = os.path.exists(pkt_path)
        pkt_size = None
        pkt_hash = None

        if pkt_exists:
            try:
                pkt_size = os.path.getsize(pkt_path)
                hasher = hashlib.sha256()
                with open(pkt_path, 'rb') as f:
                    # Read in chunks to compute hash safely
                    for chunk in iter(lambda: f.read(65536), b''):
                        hasher.update(chunk)
                pkt_hash = hasher.hexdigest()[:16] + "..."
            except Exception:
                pass

        # Determine overall integration state
        if is_running and multiuser_open and pkt_exists:
            overall_state = "CONNECTED"
            data_source = DataSource.PACKET_TRACER
        elif is_running:
            overall_state = "PARTIAL"
            data_source = DataSource.PACKET_TRACER
        else:
            overall_state = "DISCONNECTED"
            data_source = DataSource.BACKEND_PROBE

        supported = [
            "Local Cisco Packet Tracer Process Verification (v9.0.1)",
            "TCP Multiuser Port Detection (Port 39000)",
            "TCP Internal IPC Socket Monitoring (Port 38000)",
            "Local Progress/HTTP Service Status (Port 8001)",
            "Topology File Verification & SHA-256 Hash Integrity Tracking",
            "Non-destructive Topology Inspection (Preserving .pkt integrity)"
        ]

        unsupported = [
            "Direct in-canvas IOS CLI injection without active Multiuser authentication handshake",
            "Native host IP routing into unbridged Packet Tracer internal subnets (10.0.0.0/8)",
            "Proprietary Cisco encrypted .pkt internal XML parsing without PT runtime decompression"
        ]

        return IntegrationStatusSchema(
            packet_tracer_running=is_running,
            packet_tracer_pid=pid,
            packet_tracer_path=exe_path,
            multiuser_port_open=multiuser_open,
            internal_port_open=internal_open,
            http_login_port_open=http_login_open,
            active_pkt_detected=pkt_exists,
            pkt_file_path=pkt_path if pkt_exists else None,
            pkt_file_size=pkt_size,
            pkt_file_hash=pkt_hash,
            last_checked=datetime.utcnow(),
            overall_integration_state=overall_state,
            supported_capabilities=supported,
            unsupported_capabilities=unsupported,
            data_source_mode=data_source
        )
