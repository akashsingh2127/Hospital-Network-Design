from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from backend.app.database.session import Base

class HospitalModel(Base):
    __tablename__ = "hospitals"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    code = Column(String, nullable=False)
    description = Column(String, nullable=True)
    network_block = Column(String, nullable=False)
    edge_router = Column(String, nullable=False)
    core_router = Column(String, nullable=False)
    wan_ip = Column(String, nullable=False)
    inter_router_ip = Column(String, nullable=False)
    vlan_count = Column(Integer, default=0)
    device_count = Column(Integer, default=0)
    status = Column(String, default="UNVERIFIED")
    source = Column(String, default="SIMULATED")

class DeviceModel(Base):
    __tablename__ = "devices"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    hostname = Column(String, nullable=True)
    device_type = Column(String, nullable=False)  # ROUTER, SWITCH, SERVER, AP, PC
    hospital_id = Column(String, nullable=False, index=True)
    ip_address = Column(String, nullable=False)
    mac_address = Column(String, nullable=True)
    model = Column(String, nullable=True)
    role = Column(String, nullable=True)
    routing_protocol = Column(String, nullable=True)
    status = Column(String, default="UNVERIFIED")  # ONLINE, OFFLINE, UNVERIFIED
    source = Column(String, default="SIMULATED")
    last_verified = Column(DateTime, default=datetime.utcnow)
    
    # Detailed device attributes for rich modal and state tracking
    interfaces_json = Column(Text, nullable=True)       # Detailed interface list (name, ip, status, peer)
    connected_devices_json = Column(Text, nullable=True) # Peers connected to this device
    vlans_json = Column(Text, nullable=True)            # Associated VLAN numbers & sub-interfaces
    routing_info_json = Column(Text, nullable=True)     # Detailed routing / AS info
    last_observed_status = Column(String, default="OPERATIONAL")
    verification_status = Column(String, default="CURRENT")  # CURRENT, STALE, UNKNOWN

class VlanModel(Base):
    __tablename__ = "vlans"

    vlan_id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(String, nullable=False, index=True)
    name = Column(String, nullable=False)
    subnet = Column(String, nullable=False)
    prefix = Column(String, nullable=False)
    gateway = Column(String, nullable=False)
    usable_hosts = Column(Integer, default=0)
    description = Column(String, nullable=True)
    source = Column(String, default="SIMULATED")

class AlertModel(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String, default="INFO")  # CRITICAL, WARNING, INFO
    category = Column(String, default="CONNECTIVITY")
    hospital_id = Column(String, nullable=True)
    device_id = Column(String, nullable=True)
    source = Column(String, default="SIMULATED")  # PACKET_TRACER, BACKEND_PROBE, SIMULATED
    is_acknowledged = Column(Boolean, default=False)

class EventLogModel(Base):
    __tablename__ = "event_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    event_id = Column(String, unique=True, index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    category = Column(String, index=True, nullable=False)  # DEVICE, INTERFACE, CONNECTIVITY, CONFIGURATION, VLAN, ROUTING, NETWORK_SERVICE, PACKET_TRACER_SIMULATION, INTEGRATION
    event_type = Column(String, nullable=False)
    severity = Column(String, default="INFO", index=True)  # INFO, WARNING, ERROR, CRITICAL
    source = Column(String, default="PACKET_TRACER", index=True)  # PACKET_TRACER, BACKEND_PROBE, SIMULATED
    affected_device_id = Column(String, nullable=True, index=True)
    hospital_id = Column(String, nullable=True, index=True)
    interface_name = Column(String, nullable=True)
    previous_state = Column(String, nullable=True)
    new_state = Column(String, nullable=True)
    description = Column(Text, nullable=False)
    detection_method = Column(String, default="STATE_DIFF")  # FILE_HASH_MONITOR, PORT_PROBE, STATE_DIFF, PROCESS_POLL, MANUAL_SYNC
    verification_status = Column(String, default="VERIFIED")  # VERIFIED, INFERRED, UNVERIFIED
    metadata_json = Column(Text, nullable=True)

class NetworkSnapshotModel(Base):
    __tablename__ = "network_snapshots"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    pt_running = Column(Boolean, default=False)
    pt_pid = Column(Integer, nullable=True)
    pkt_file_hash = Column(String, nullable=True)
    pkt_file_mtime = Column(Float, nullable=True)
    pkt_file_size = Column(Integer, nullable=True)
    online_devices_count = Column(Integer, default=0)
    devices_state_hash = Column(String, nullable=True)
    summary_json = Column(Text, nullable=True)

class AuditLogModel(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    event_type = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    actor = Column(String, default="SYSTEM")
    source = Column(String, default="BACKEND_PROBE")
    metadata_json = Column(Text, nullable=True)
