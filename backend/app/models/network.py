from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text
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
    device_type = Column(String, nullable=False)  # ROUTER, SWITCH, SERVER, AP, PC
    hospital_id = Column(String, nullable=False, index=True)
    ip_address = Column(String, nullable=False)
    model = Column(String, nullable=True)
    role = Column(String, nullable=True)
    routing_protocol = Column(String, nullable=True)
    status = Column(String, default="UNVERIFIED")  # ONLINE, OFFLINE, UNVERIFIED
    source = Column(String, default="SIMULATED")
    last_verified = Column(DateTime, default=datetime.utcnow)

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

class AuditLogModel(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    event_type = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    actor = Column(String, default="SYSTEM")
    source = Column(String, default="BACKEND_PROBE")
    metadata_json = Column(Text, nullable=True)
