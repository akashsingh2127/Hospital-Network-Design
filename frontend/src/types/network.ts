export type DataSource = 'PACKET_TRACER' | 'BACKEND_PROBE' | 'SIMULATED';

export type StatusLevel = 'OPERATIONAL' | 'ONLINE' | 'OFFLINE' | 'DEGRADED' | 'UNVERIFIED' | 'UNKNOWN';

export type SeverityLevel = 'CRITICAL' | 'WARNING' | 'INFO';

export interface Vlan {
  vlan_id: number;
  hospital_id: string;
  name: string;
  subnet: string;
  prefix: string;
  gateway: string;
  usable_hosts: number;
  description?: string;
  source: DataSource;
}

export interface InterfaceDetail {
  name: string;
  ip_address?: string | null;
  subnet_mask?: string | null;
  status: string; // UP, DOWN, ADMIN_DOWN
  connected_to?: string | null;
  link_type?: string | null;
  vlan_id?: number | null;
}

export interface Device {
  id: string;
  name: string;
  hostname?: string;
  device_type: 'ROUTER' | 'SWITCH' | 'SERVER' | 'AP' | 'PC';
  hospital_id: string;
  ip_address: string;
  mac_address?: string | null;
  model?: string;
  role?: string;
  routing_protocol?: string;
  status: StatusLevel;
  source: DataSource;
  last_verified?: string;
  last_observed_status?: string;
  verification_status?: string;
}

export interface EventLog {
  id: number;
  event_id: string;
  timestamp: string;
  category: string;
  event_type: string;
  severity: SeverityLevel;
  source: DataSource;
  affected_device_id?: string | null;
  hospital_id?: string | null;
  interface_name?: string | null;
  previous_state?: string | null;
  new_state?: string | null;
  description: string;
  detection_method: string;
  verification_status: string;
  metadata?: Record<string, any> | null;
}

export interface DeviceDetail extends Device {
  interfaces: InterfaceDetail[];
  connected_devices: string[];
  vlans: number[];
  routing_info?: Record<string, any> | null;
  recent_events: EventLog[];
}

export interface EventFilterParams {
  category?: string;
  severity?: string;
  hospital_id?: string;
  device_id?: string;
  search?: string;
  limit?: number;
}

export interface SimulationHop {
  hop_number: number;
  device_id: string;
  device_name: string;
  device_type: string;
  hospital_id?: string;
  interface_in?: string;
  interface_out?: string;
  action: string;
  latency_ms: number;
  details: string;
}

export interface SimulationFlow {
  flow_id: string;
  timestamp: string;
  source_device_id: string;
  source_device_name: string;
  source_ip: string;
  source_hospital: string;
  dest_device_id: string;
  dest_device_name: string;
  dest_ip: string;
  dest_hospital: string;
  protocol: string;
  status: 'DELIVERED' | 'DROPPED' | 'IN_TRANSIT';
  total_latency_ms: number;
  hops: SimulationHop[];
  path_node_ids: string[];
  path_edge_ids: string[];
  summary: string;
}

export interface SimulationRequest {
  source_device_id: string;
  dest_device_id: string;
  protocol: string;
}

export interface Hospital {
  id: string;
  name: string;
  code: string;
  description?: string;
  network_block: string;
  edge_router: string;
  core_router: string;
  wan_ip: string;
  inter_router_ip: string;
  vlan_count: number;
  device_count: number;
  status: StatusLevel;
  source: DataSource;
  vlans?: Vlan[];
  devices?: Device[];
}

export interface Alert {
  id: number;
  timestamp: string;
  title: string;
  message: string;
  severity: SeverityLevel;
  category: string;
  hospital_id?: string;
  device_id?: string;
  source: DataSource;
  is_acknowledged: boolean;
}

export interface NetworkService {
  id: string;
  name: string;
  protocol: string;
  port: number;
  ip_address: string;
  fqdn?: string;
  status: StatusLevel;
  source: DataSource;
  verification_detail: string;
}

export interface IntegrationStatus {
  packet_tracer_running: boolean;
  packet_tracer_pid?: number;
  packet_tracer_path?: string;
  multiuser_port_open: boolean;
  internal_port_open: boolean;
  http_login_port_open: boolean;
  active_pkt_detected: boolean;
  pkt_file_path?: string;
  pkt_file_size?: number;
  pkt_file_hash?: string;
  last_checked: string;
  overall_integration_state: 'CONNECTED' | 'PARTIAL' | 'DISCONNECTED';
  supported_capabilities: string[];
  unsupported_capabilities: string[];
  data_source_mode: DataSource;
}

export interface MetricPoint {
  timestamp: string;
  latency_ms?: number;
  packet_loss_pct?: number;
  reachability_pct?: number;
  is_simulated: boolean;
}

export interface NetworkHealth {
  overall_health_score: number;
  total_devices: number;
  online_devices: number;
  unverified_devices: number;
  offline_devices: number;
  verified_latency_ms?: number;
  verified_packet_loss_pct?: number;
  integration_status: string;
  source: DataSource;
  telemetry_history: MetricPoint[];
}

export interface DashboardSummary {
  project_title: string;
  system_time: string;
  data_source: DataSource;
  integration: IntegrationStatus;
  total_hospitals: number;
  total_devices: number;
  online_devices: number;
  offline_devices: number;
  unverified_devices: number;
  total_vlans: number;
  active_alerts_count: number;
  recent_events_count?: number;
  sync_status?: string;
  hospitals: Hospital[];
  recent_alerts: Alert[];
  services: NetworkService[];
  health: NetworkHealth;
}

export interface TopologyNode {
  id: string;
  label: string;
  node_type: string;
  hospital_id?: string;
  ip?: string;
  status: StatusLevel;
  source: DataSource;
  device_id?: string;
}

export interface TopologyEdge {
  id: string;
  source_id: string;
  target_id: string;
  label?: string;
  link_type: string;
  subnet?: string;
  status?: string;
}

export interface TopologyData {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
  total_nodes: number;
  total_edges: number;
  source: DataSource;
}
