import json
from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.app.models.network import (
    HospitalModel,
    DeviceModel,
    VlanModel,
    AlertModel,
    EventLogModel
)
from backend.app.schemas.network import (
    DataSource,
    StatusLevel,
    DashboardSummarySchema,
    HospitalSchema,
    DeviceSchema,
    DeviceDetailSchema,
    InterfaceDetail,
    VlanSchema,
    AlertSchema,
    EventLogSchema,
    NetworkHealthSchema,
    TopologySchema,
    TopologyNode,
    TopologyEdge,
    NetworkServiceSchema,
    IntegrationStatusSchema
)
from backend.app.integrations.packet_tracer import PacketTracerIntegration
from backend.app.integrations.network_probe import NetworkProbe
from backend.app.integrations.telemetry_fallback import TelemetryFallback

class NetworkService:
    @staticmethod
    def get_dashboard_summary(db: Session) -> DashboardSummarySchema:
        integration = PacketTracerIntegration.get_status()
        hospitals_db = db.query(HospitalModel).all()
        devices_db = db.query(DeviceModel).all()
        vlans_db = db.query(VlanModel).all()
        alerts_db = db.query(AlertModel).order_by(AlertModel.timestamp.desc()).limit(10).all()
        events_count = db.query(EventLogModel).count()

        services = NetworkProbe.check_hq_services()

        # Count device status
        online_count = sum(1 for d in devices_db if d.status in ("ONLINE", "OPERATIONAL"))
        offline_count = sum(1 for d in devices_db if d.status == "OFFLINE")
        unverified_count = sum(1 for d in devices_db if d.status in ("UNVERIFIED", "UNKNOWN"))

        # Health calculations
        pt_active = integration.packet_tracer_running
        health_score = 95 if pt_active else 65

        # Include simulated telemetry if allowed, explicitly marked
        telemetry_points = TelemetryFallback.get_simulated_metrics()

        health = NetworkHealthSchema(
            overall_health_score=health_score,
            total_devices=len(devices_db),
            online_devices=online_count,
            unverified_devices=unverified_count,
            offline_devices=offline_count,
            verified_latency_ms=None,
            verified_packet_loss_pct=None,
            integration_status=integration.overall_integration_state,
            source=integration.data_source_mode,
            telemetry_history=telemetry_points
        )

        active_alerts = [AlertSchema.model_validate(a) for a in alerts_db]
        if len(active_alerts) < 4:
            active_alerts.extend(TelemetryFallback.get_simulated_alerts())

        if integration.overall_integration_state == "CONNECTED":
            overall_source = DataSource.PACKET_TRACER
            sync_status = "SYNCHRONIZED"
        elif integration.overall_integration_state == "PARTIAL":
            overall_source = DataSource.PACKET_TRACER
            sync_status = "PARTIAL_SYNC"
        else:
            overall_source = DataSource.SIMULATED
            sync_status = "OUT_OF_SYNC"

        return DashboardSummarySchema(
            project_title="Smart Multi-Speciality Hospital Network",
            system_time=datetime.utcnow(),
            data_source=overall_source,
            integration=integration,
            total_hospitals=len(hospitals_db),
            total_devices=len(devices_db),
            online_devices=online_count,
            offline_devices=offline_count,
            unverified_devices=unverified_count,
            total_vlans=len(vlans_db),
            active_alerts_count=len([a for a in active_alerts if not a.is_acknowledged]),
            hospitals=[HospitalSchema.model_validate(h) for h in hospitals_db],
            recent_alerts=active_alerts,
            services=services,
            health=health,
            recent_events_count=events_count,
            sync_status=sync_status
        )

    @staticmethod
    def get_hospitals(db: Session) -> List[HospitalSchema]:
        hospitals = db.query(HospitalModel).all()
        result = []
        for h in hospitals:
            vlans = db.query(VlanModel).filter(VlanModel.hospital_id == h.id).all()
            devices = db.query(DeviceModel).filter(DeviceModel.hospital_id == h.id).all()
            schema = HospitalSchema.model_validate(h)
            schema.vlans = [VlanSchema.model_validate(v) for v in vlans]
            schema.devices = [DeviceSchema.model_validate(d) for d in devices]
            result.append(schema)
        return result

    @staticmethod
    def get_devices(db: Session, hospital_id: Optional[str] = None, status: Optional[str] = None) -> List[DeviceSchema]:
        query = db.query(DeviceModel)
        if hospital_id:
            query = query.filter(DeviceModel.hospital_id == hospital_id)
        if status:
            if status.upper() == "ONLINE":
                query = query.filter(DeviceModel.status.in_(["ONLINE", "OPERATIONAL"]))
            elif status.upper() == "OFFLINE":
                query = query.filter(DeviceModel.status == "OFFLINE")
            elif status.upper() == "UNVERIFIED":
                query = query.filter(DeviceModel.status.in_(["UNVERIFIED", "UNKNOWN"]))

        return [DeviceSchema.model_validate(d) for d in query.all()]

    @staticmethod
    def get_device_detail(device_id: str, db: Session) -> Optional[DeviceDetailSchema]:
        device = db.query(DeviceModel).filter(DeviceModel.id == device_id).first()
        if not device:
            return None

        # Parse interfaces
        interfaces_list = []
        if device.interfaces_json:
            try:
                raw_ifaces = json.loads(device.interfaces_json)
                interfaces_list = [InterfaceDetail(**iface) for iface in raw_ifaces]
            except Exception:
                pass

        # Parse connected peers
        peers_list = []
        if device.connected_devices_json:
            try:
                peers_list = json.loads(device.connected_devices_json)
            except Exception:
                pass

        # Parse VLANs
        vlans_list = []
        if device.vlans_json:
            try:
                vlans_list = json.loads(device.vlans_json)
            except Exception:
                pass

        # Parse routing info
        routing_dict = None
        if device.routing_info_json:
            try:
                routing_dict = json.loads(device.routing_info_json)
            except Exception:
                pass

        # Fetch recent events involving this device
        events_db = db.query(EventLogModel).filter(
            EventLogModel.affected_device_id == device_id
        ).order_by(EventLogModel.timestamp.desc()).limit(10).all()

        recent_events = [EventLogSchema.model_validate(ev) for ev in events_db]

        base_schema = DeviceSchema.model_validate(device)
        return DeviceDetailSchema(
            **base_schema.model_dump(),
            interfaces=interfaces_list,
            connected_devices=peers_list,
            vlans=vlans_list,
            routing_info=routing_dict,
            recent_events=recent_events
        )

    @staticmethod
    def get_vlans(db: Session, hospital_id: Optional[str] = None) -> List[VlanSchema]:
        query = db.query(VlanModel)
        if hospital_id:
            query = query.filter(VlanModel.hospital_id == hospital_id)
        return [VlanSchema.model_validate(v) for v in query.all()]

    @staticmethod
    def get_events(
        db: Session,
        category: Optional[str] = None,
        severity: Optional[str] = None,
        hospital_id: Optional[str] = None,
        device_id: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 50
    ) -> List[EventLogSchema]:
        query = db.query(EventLogModel).order_by(EventLogModel.timestamp.desc())

        if category and category.upper() != "ALL":
            query = query.filter(EventLogModel.category == category.upper())
        if severity and severity.upper() != "ALL":
            query = query.filter(EventLogModel.severity == severity.upper())
        if hospital_id:
            query = query.filter(EventLogModel.hospital_id == hospital_id)
        if device_id:
            query = query.filter(EventLogModel.affected_device_id == device_id)
        if search:
            s = f"%{search}%"
            query = query.filter(
                or_(
                    EventLogModel.description.ilike(s),
                    EventLogModel.event_type.ilike(s),
                    EventLogModel.affected_device_id.ilike(s),
                    EventLogModel.event_id.ilike(s)
                )
            )

        events_db = query.limit(limit).all()
        result = []
        for ev in events_db:
            schema = EventLogSchema.model_validate(ev)
            if ev.metadata_json:
                try:
                    schema.metadata = json.loads(ev.metadata_json)
                except Exception:
                    pass
            result.append(schema)
        return result

    @staticmethod
    def get_topology(db: Session) -> TopologySchema:
        integration = PacketTracerIntegration.get_status()
        src = DataSource.PACKET_TRACER if integration.packet_tracer_running else DataSource.SIMULATED

        nodes: List[TopologyNode] = [
            TopologyNode(id="r0", label="R0 (ISP Router)", node_type="ISP", ip="200.1.1.1", status=StatusLevel.ONLINE, source=src, device_id="r0_isp"),
            TopologyNode(id="sw0", label="ISP Switch", node_type="SWITCH", ip="200.1.1.254", status=StatusLevel.ONLINE, source=src, device_id="sw0_isp"),

            # HQ Nodes
            TopologyNode(id="r1", label="R1 (HQ Edge)", node_type="EDGE_ROUTER", hospital_id="hq", ip="200.1.1.2", status=StatusLevel.ONLINE, source=src, device_id="r1_hq_edge"),
            TopologyNode(id="r2", label="R2 (HQ Core)", node_type="CORE_ROUTER", hospital_id="hq", ip="10.255.0.2", status=StatusLevel.ONLINE, source=src, device_id="r2_hq_core"),
            TopologyNode(id="sw_hq", label="HQ Switch", node_type="SWITCH", hospital_id="hq", ip="10.0.1.2", status=StatusLevel.ONLINE, source=src, device_id="sw_hq_access"),
            TopologyNode(id="dmz_servers", label="HQ DMZ Server Farm", node_type="SERVER", hospital_id="hq", ip="10.0.1.160/28", status=StatusLevel.ONLINE, source=src, device_id="srv_dns"),
            TopologyNode(id="srv_dns", label="DNS Server", node_type="SERVER", hospital_id="hq", ip="10.0.1.162", status=StatusLevel.UNVERIFIED, source=DataSource.BACKEND_PROBE, device_id="srv_dns"),
            TopologyNode(id="srv_http", label="Web Portal", node_type="SERVER", hospital_id="hq", ip="10.0.1.163", status=StatusLevel.UNVERIFIED, source=DataSource.BACKEND_PROBE, device_id="srv_http"),

            # Diagnostic Nodes
            TopologyNode(id="r4", label="R4 (Diag Edge)", node_type="EDGE_ROUTER", hospital_id="diag", ip="200.1.1.6", status=StatusLevel.ONLINE, source=src, device_id="r4_diag_edge"),
            TopologyNode(id="r5", label="R5 (Diag Core)", node_type="CORE_ROUTER", hospital_id="diag", ip="10.255.0.6", status=StatusLevel.ONLINE, source=src, device_id="r5_diag_core"),
            TopologyNode(id="sw_diag", label="Diag Switch", node_type="SWITCH", hospital_id="diag", ip="10.1.0.2", status=StatusLevel.ONLINE, source=src, device_id="sw_diag_access"),

            # Emergency Nodes
            TopologyNode(id="r6", label="R6 (Emer Edge)", node_type="EDGE_ROUTER", hospital_id="emer", ip="200.1.1.10", status=StatusLevel.ONLINE, source=src, device_id="r6_emer_edge"),
            TopologyNode(id="r7", label="R7 (Emer Core)", node_type="CORE_ROUTER", hospital_id="emer", ip="10.255.0.10", status=StatusLevel.ONLINE, source=src, device_id="r7_emer_core"),
            TopologyNode(id="sw_emer", label="Emer Switch", node_type="SWITCH", hospital_id="emer", ip="10.2.0.2", status=StatusLevel.ONLINE, source=src, device_id="sw_emer_access"),

            # Telemedicine Nodes
            TopologyNode(id="r9", label="R9 (Tele Edge)", node_type="EDGE_ROUTER", hospital_id="tele", ip="200.1.1.14", status=StatusLevel.ONLINE, source=src, device_id="r9_tele_edge"),
            TopologyNode(id="r10", label="R10 (Tele Core)", node_type="CORE_ROUTER", hospital_id="tele", ip="10.255.0.14", status=StatusLevel.ONLINE, source=src, device_id="r10_tele_core"),
            TopologyNode(id="sw_tele", label="Tele Switch", node_type="SWITCH", hospital_id="tele", ip="10.3.0.2", status=StatusLevel.ONLINE, source=src, device_id="sw_tele_access"),

            # Maternity Nodes
            TopologyNode(id="r11", label="R11 (Mat Edge)", node_type="EDGE_ROUTER", hospital_id="mat", ip="200.1.1.18", status=StatusLevel.ONLINE, source=src, device_id="r11_mat_edge"),
            TopologyNode(id="r12", label="R12 (Mat Core)", node_type="CORE_ROUTER", hospital_id="mat", ip="10.255.0.18", status=StatusLevel.ONLINE, source=src, device_id="r12_mat_core"),
            TopologyNode(id="sw_mat", label="Mat Switch", node_type="SWITCH", hospital_id="mat", ip="10.4.0.2", status=StatusLevel.ONLINE, source=src, device_id="sw_mat_access"),

            # Children Nodes
            TopologyNode(id="r13", label="R13 (Child Edge)", node_type="EDGE_ROUTER", hospital_id="child", ip="200.1.1.22", status=StatusLevel.ONLINE, source=src, device_id="r13_child_edge"),
            TopologyNode(id="r14", label="R14 (Child Core)", node_type="CORE_ROUTER", hospital_id="child", ip="10.255.0.22", status=StatusLevel.ONLINE, source=src, device_id="r14_child_core"),
            TopologyNode(id="sw_child", label="Child Switch", node_type="SWITCH", hospital_id="child", ip="10.5.0.2", status=StatusLevel.ONLINE, source=src, device_id="sw_child_access"),
        ]

        edges: List[TopologyEdge] = [
            TopologyEdge(id="e_r0_sw0", source_id="r0", target_id="sw0", label="802.1Q Trunk", link_type="TRUNK", subnet="200.1.1.0/24", status="OPERATIONAL"),

            # ISP Switch to 6 Edge Routers
            TopologyEdge(id="e_sw0_r1", source_id="sw0", target_id="r1", label="VLAN 10 /30", link_type="WAN", subnet="200.1.1.0/30", status="OPERATIONAL"),
            TopologyEdge(id="e_sw0_r4", source_id="sw0", target_id="r4", label="VLAN 20 /30", link_type="WAN", subnet="200.1.1.4/30", status="OPERATIONAL"),
            TopologyEdge(id="e_sw0_r6", source_id="sw0", target_id="r6", label="VLAN 30 /30", link_type="WAN", subnet="200.1.1.8/30", status="OPERATIONAL"),
            TopologyEdge(id="e_sw0_r9", source_id="sw0", target_id="r9", label="VLAN 40 /30", link_type="WAN", subnet="200.1.1.12/30", status="OPERATIONAL"),
            TopologyEdge(id="e_sw0_r11", source_id="sw0", target_id="r11", label="VLAN 50 /30", link_type="WAN", subnet="200.1.1.16/30", status="OPERATIONAL"),
            TopologyEdge(id="e_sw0_r13", source_id="sw0", target_id="r13", label="VLAN 60 /30", link_type="WAN", subnet="200.1.1.20/30", status="OPERATIONAL"),

            # Edge to Core Router Point-to-Point WAN links
            TopologyEdge(id="e_r1_r2", source_id="r1", target_id="r2", label="P2P Link", link_type="P2P", subnet="10.255.0.0/30", status="OPERATIONAL"),
            TopologyEdge(id="e_r4_r5", source_id="r4", target_id="r5", label="P2P Link", link_type="P2P", subnet="10.255.0.4/30", status="OPERATIONAL"),
            TopologyEdge(id="e_r6_r7", source_id="r6", target_id="r7", label="P2P Link", link_type="P2P", subnet="10.255.0.8/30", status="OPERATIONAL"),
            TopologyEdge(id="e_r9_r10", source_id="r9", target_id="r10", label="P2P Link", link_type="P2P", subnet="10.255.0.12/30", status="OPERATIONAL"),
            TopologyEdge(id="e_r11_r12", source_id="r11", target_id="r12", label="P2P Link", link_type="P2P", subnet="10.255.0.16/30", status="OPERATIONAL"),
            TopologyEdge(id="e_r13_r14", source_id="r13", target_id="r14", label="P2P Link", link_type="P2P", subnet="10.255.0.20/30", status="OPERATIONAL"),

            # Core Router to Access Switch (Router-on-a-stick)
            TopologyEdge(id="e_r2_swhq", source_id="r2", target_id="sw_hq", label="802.1Q RoAS", link_type="TRUNK", subnet="10.0.0.0/22", status="OPERATIONAL"),
            TopologyEdge(id="e_r5_swdiag", source_id="r5", target_id="sw_diag", label="802.1Q RoAS", link_type="TRUNK", subnet="10.1.0.0/24", status="OPERATIONAL"),
            TopologyEdge(id="e_r7_swemer", source_id="r7", target_id="sw_emer", label="802.1Q RoAS", link_type="TRUNK", subnet="10.2.0.0/24", status="OPERATIONAL"),
            TopologyEdge(id="e_r10_swtele", source_id="r10", target_id="sw_tele", label="802.1Q RoAS", link_type="TRUNK", subnet="10.3.0.0/24", status="OPERATIONAL"),
            TopologyEdge(id="e_r12_swmat", source_id="r12", target_id="sw_mat", label="802.1Q RoAS", link_type="TRUNK", subnet="10.4.0.0/24", status="OPERATIONAL"),
            TopologyEdge(id="e_r14_swchild", source_id="r14", target_id="sw_child", label="802.1Q RoAS", link_type="TRUNK", subnet="10.5.0.0/24", status="OPERATIONAL"),

            # Access Switch to DMZ Servers
            TopologyEdge(id="e_swhq_dmz", source_id="sw_hq", target_id="dmz_servers", label="VLAN 10 Access", link_type="ACCESS", subnet="10.0.1.160/28", status="OPERATIONAL"),
            TopologyEdge(id="e_swhq_dns", source_id="sw_hq", target_id="srv_dns", label="VLAN 10 Access", link_type="ACCESS", subnet="10.0.1.160/28", status="UNKNOWN"),
            TopologyEdge(id="e_swhq_http", source_id="sw_hq", target_id="srv_http", label="VLAN 10 Access", link_type="ACCESS", subnet="10.0.1.160/28", status="UNKNOWN"),
        ]

        return TopologySchema(
            nodes=nodes,
            edges=edges,
            total_nodes=len(nodes),
            total_edges=len(edges),
            source=src
        )
