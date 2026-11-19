import json
from enum import Enum
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, model_validator
import json

class DataSource(str, Enum):
    PACKET_TRACER = "PACKET_TRACER"
    BACKEND_PROBE = "BACKEND_PROBE"
    SIMULATED = "SIMULATED"

class StatusLevel(str, Enum):
    OPERATIONAL = "OPERATIONAL"
    ONLINE = "ONLINE"
    OFFLINE = "OFFLINE"
    DEGRADED = "DEGRADED"
    UNVERIFIED = "UNVERIFIED"
    UNKNOWN = "UNKNOWN"

class SeverityLevel(str, Enum):
    CRITICAL = "CRITICAL"
    ERROR = "ERROR"
    WARNING = "WARNING"
    INFO = "INFO"

class EventCategory(str, Enum):
    DEVICE = "DEVICE"
    INTERFACE = "INTERFACE"
    CONNECTIVITY = "CONNECTIVITY"
    CONFIGURATION = "CONFIGURATION"
    VLAN = "VLAN"
    ROUTING = "ROUTING"
    NETWORK_SERVICE = "NETWORK_SERVICE"
    PACKET_TRACER_SIMULATION = "PACKET_TRACER_SIMULATION"
    INTEGRATION = "INTEGRATION"

class InterfaceDetail(BaseModel):
    name: str
    ip_address: Optional[str] = None
    subnet_mask: Optional[str] = None
    status: str = "UP"  # UP, DOWN, ADMIN_DOWN
    connected_to: Optional[str] = None
    link_type: Optional[str] = None
    vlan_id: Optional[int] = None

class EventLogSchema(BaseModel):
    id: int
    event_id: str
    timestamp: datetime
    category: str
    event_type: str
    severity: str
    source: DataSource
    affected_device_id: Optional[str] = None
    hospital_id: Optional[str] = None
    interface_name: Optional[str] = None
    previous_state: Optional[str] = None
    new_state: Optional[str] = None
    description: str
    detection_method: str
    verification_status: str
    metadata: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="before")
    @classmethod
    def resolve_orm_metadata(cls, data: Any) -> Any:
        if hasattr(data, "__table__"):
            meta = None
            if hasattr(data, "metadata_json") and data.metadata_json:
                try:
                    meta = json.loads(data.metadata_json)
                except Exception:
                    pass
            return {
                "id": data.id,
                "event_id": data.event_id,
                "timestamp": data.timestamp,
                "category": data.category,
                "event_type": data.event_type,
                "severity": data.severity,
                "source": data.source,
                "affected_device_id": data.affected_device_id,
                "hospital_id": data.hospital_id,
                "interface_name": data.interface_name,
                "previous_state": data.previous_state,
                "new_state": data.new_state,
                "description": data.description,
                "detection_method": data.detection_method,
                "verification_status": data.verification_status,
                "metadata": meta,
            }
        return data

class VlanSchema(BaseModel):
    vlan_id: int
    hospital_id: str
    name: str
    subnet: str
    prefix: str
    gateway: str
    usable_hosts: int
    description: Optional[str] = None
    source: DataSource = DataSource.SIMULATED

    model_config = ConfigDict(from_attributes=True)

class DeviceSchema(BaseModel):
    id: str
    name: str
    hostname: Optional[str] = None
    device_type: str  # ROUTER, SWITCH, SERVER, AP
    hospital_id: str
    ip_address: str
    mac_address: Optional[str] = None
    model: Optional[str] = None
    role: Optional[str] = None
    routing_protocol: Optional[str] = None
    status: StatusLevel = StatusLevel.UNVERIFIED
    source: DataSource = DataSource.SIMULATED
    last_verified: Optional[datetime] = None
    last_observed_status: Optional[str] = "OPERATIONAL"
    verification_status: Optional[str] = "CURRENT"

    model_config = ConfigDict(from_attributes=True)

class DeviceDetailSchema(DeviceSchema):
    interfaces: List[InterfaceDetail] = []
    connected_devices: List[str] = []
    vlans: List[int] = []
    routing_info: Optional[Dict[str, Any]] = None
    recent_events: List[EventLogSchema] = []

class HospitalSchema(BaseModel):
    id: str
    name: str
    code: str
    description: Optional[str] = None
    network_block: str
    edge_router: str
    core_router: str
    wan_ip: str
    inter_router_ip: str
    vlan_count: int
    device_count: int
    status: StatusLevel = StatusLevel.UNVERIFIED
    source: DataSource = DataSource.SIMULATED
    vlans: Optional[List[VlanSchema]] = None
    devices: Optional[List[DeviceSchema]] = None

    model_config = ConfigDict(from_attributes=True)

class AlertSchema(BaseModel):
    id: int
    timestamp: datetime
    title: str
    message: str
    severity: SeverityLevel
    category: str
    hospital_id: Optional[str] = None
    device_id: Optional[str] = None
    source: DataSource = DataSource.SIMULATED
    is_acknowledged: bool = False

    model_config = ConfigDict(from_attributes=True)

class NetworkServiceSchema(BaseModel):
    id: str
    name: str
    protocol: str
    port: int
    ip_address: str
    fqdn: Optional[str] = None
    status: StatusLevel = StatusLevel.UNKNOWN
    source: DataSource = DataSource.BACKEND_PROBE
    verification_detail: str

class IntegrationStatusSchema(BaseModel):
    packet_tracer_running: bool
    packet_tracer_pid: Optional[int] = None
    packet_tracer_path: Optional[str] = None
    multiuser_port_open: bool
    internal_port_open: bool
    http_login_port_open: bool
    active_pkt_detected: bool
    pkt_file_path: Optional[str] = None
    pkt_file_size: Optional[int] = None
    pkt_file_hash: Optional[str] = None
    pkt_file_mtime: Optional[float] = None
    last_checked: datetime
    overall_integration_state: str  # CONNECTED, PARTIAL, DISCONNECTED
    supported_capabilities: List[str]
    unsupported_capabilities: List[str]
    data_source_mode: DataSource
    freshness: str = "CURRENT"  # CURRENT, STALE, UNKNOWN

class MetricPoint(BaseModel):
    timestamp: str
    latency_ms: Optional[float] = None
    packet_loss_pct: Optional[float] = None
    reachability_pct: Optional[float] = None
    is_simulated: bool = False

class NetworkHealthSchema(BaseModel):
    overall_health_score: int  # 0 - 100
    total_devices: int
    online_devices: int
    unverified_devices: int
    offline_devices: int
    verified_latency_ms: Optional[float] = None  # None if not actually measured
    verified_packet_loss_pct: Optional[float] = None  # None if not actually measured
    integration_status: str
    source: DataSource
    telemetry_history: List[MetricPoint]

class TopologyNode(BaseModel):
    id: str
    label: str
    node_type: str  # ISP, EDGE_ROUTER, CORE_ROUTER, SWITCH, SERVER, VLAN_GROUP
    hospital_id: Optional[str] = None
    ip: Optional[str] = None
    status: StatusLevel
    source: DataSource
    device_id: Optional[str] = None

class TopologyEdge(BaseModel):
    id: str
    source_id: str
    target_id: str
    label: Optional[str] = None
    link_type: str  # WAN, P2P, TRUNK, ACCESS
    subnet: Optional[str] = None
    status: str = "OPERATIONAL"  # OPERATIONAL, FAILED, UNKNOWN

class TopologySchema(BaseModel):
    nodes: List[TopologyNode]
    edges: List[TopologyEdge]
    total_nodes: int
    total_edges: int
    source: DataSource

class DashboardSummarySchema(BaseModel):
    project_title: str
    system_time: datetime
    data_source: DataSource
    integration: IntegrationStatusSchema
    total_hospitals: int
    total_devices: int
    online_devices: int
    offline_devices: int
    unverified_devices: int
    total_vlans: int
    active_alerts_count: int
    hospitals: List[HospitalSchema]
    recent_alerts: List[AlertSchema]
    services: List[NetworkServiceSchema]
    health: NetworkHealthSchema
    recent_events_count: int = 0
    sync_status: str = "SYNCHRONIZED"  # SYNCHRONIZED, RECONNECTING, OUT_OF_SYNC

class SimulationHop(BaseModel):
    hop_number: int
    device_id: str
    device_name: str
    device_type: str
    hospital_id: Optional[str] = None
    interface_in: Optional[str] = None
    interface_out: Optional[str] = None
    action: str  # INGRESS, VLAN_TAGGED, ROUTED_EIGRP, NAT_TRANSLATED, TRUNK_FORWARDED, ACL_INSPECTED, DELIVERED, DROPPED
    latency_ms: float
    details: str

class SimulationFlow(BaseModel):
    flow_id: str
    timestamp: datetime
    source_device_id: str
    source_device_name: str
    source_ip: str
    source_hospital: str
    dest_device_id: str
    dest_device_name: str
    dest_ip: str
    dest_hospital: str
    protocol: str  # ICMP, HTTP, DNS, FTP, EIGRP
    status: str  # DELIVERED, DROPPED, IN_TRANSIT
    total_latency_ms: float
    hops: List[SimulationHop]
    path_node_ids: List[str]
    path_edge_ids: List[str]
    summary: str

class SimulationRequest(BaseModel):
    source_device_id: str
    dest_device_id: str
    protocol: str = "ICMP"
