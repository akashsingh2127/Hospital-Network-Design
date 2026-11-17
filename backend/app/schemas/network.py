from enum import Enum
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

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
    WARNING = "WARNING"
    INFO = "INFO"

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
    device_type: str  # ROUTER, SWITCH, SERVER, AP
    hospital_id: str
    ip_address: str
    model: Optional[str] = None
    role: Optional[str] = None
    routing_protocol: Optional[str] = None
    status: StatusLevel = StatusLevel.UNVERIFIED
    source: DataSource = DataSource.SIMULATED
    last_verified: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

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
    last_checked: datetime
    overall_integration_state: str  # CONNECTED, PARTIAL, DISCONNECTED
    supported_capabilities: List[str]
    unsupported_capabilities: List[str]
    data_source_mode: DataSource

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

class TopologyEdge(BaseModel):
    id: str
    source_id: str
    target_id: str
    label: Optional[str] = None
    link_type: str  # WAN, P2P, TRUNK, ACCESS
    subnet: Optional[str] = None

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
