from datetime import datetime
from sqlalchemy.orm import Session
from backend.app.database.session import Base, engine
from backend.app.models.network import HospitalModel, DeviceModel, VlanModel, AlertModel, AuditLogModel

def init_db(db: Session) -> None:
    # Create tables
    Base.metadata.create_all(bind=engine)

    # Check if already seeded
    if db.query(HospitalModel).count() > 0:
        return

    # 1. Seed Hospital Locations
    hospitals_data = [
        {
            "id": "hq",
            "name": "Main Hospital Headquarters",
            "code": "HQ-MAIN",
            "description": "Central tertiary-care medical center and DMZ network services hub.",
            "network_block": "10.0.0.0/22",
            "edge_router": "R1",
            "core_router": "R2",
            "wan_ip": "200.1.1.2/30",
            "inter_router_ip": "10.255.0.1/30",
            "vlan_count": 4,
            "device_count": 6,
            "status": "OPERATIONAL",
            "source": "PACKET_TRACER"
        },
        {
            "id": "diag",
            "name": "Diagnostic Center",
            "code": "BR-DIAG",
            "description": "Specialized laboratory and imaging diagnostics facility.",
            "network_block": "10.1.0.0/24",
            "edge_router": "R4",
            "core_router": "R5",
            "wan_ip": "200.1.1.6/30",
            "inter_router_ip": "10.255.0.5/30",
            "vlan_count": 3,
            "device_count": 3,
            "status": "OPERATIONAL",
            "source": "PACKET_TRACER"
        },
        {
            "id": "emer",
            "name": "Emergency Clinic",
            "code": "BR-EMER",
            "description": "24/7 Rapid response emergency treatment and trauma center.",
            "network_block": "10.2.0.0/24",
            "edge_router": "R6",
            "core_router": "R7",
            "wan_ip": "200.1.1.10/30",
            "inter_router_ip": "10.255.0.9/30",
            "vlan_count": 3,
            "device_count": 3,
            "status": "OPERATIONAL",
            "source": "PACKET_TRACER"
        },
        {
            "id": "tele",
            "name": "Telemedicine Branch",
            "code": "BR-TELE",
            "description": "Remote consultation, tele-health, and specialist referral unit.",
            "network_block": "10.3.0.0/24",
            "edge_router": "R9",
            "core_router": "R10",
            "wan_ip": "200.1.1.14/30",
            "inter_router_ip": "10.255.0.13/30",
            "vlan_count": 3,
            "device_count": 3,
            "status": "OPERATIONAL",
            "source": "PACKET_TRACER"
        },
        {
            "id": "mat",
            "name": "Maternity Hospital",
            "code": "BR-MAT",
            "description": "Obstetric care, labor & delivery, and maternal-infant ward.",
            "network_block": "10.4.0.0/24",
            "edge_router": "R11",
            "core_router": "R12",
            "wan_ip": "200.1.1.18/30",
            "inter_router_ip": "10.255.0.17/30",
            "vlan_count": 3,
            "device_count": 3,
            "status": "OPERATIONAL",
            "source": "PACKET_TRACER"
        },
        {
            "id": "child",
            "name": "Children Care Hospital",
            "code": "BR-CHILD",
            "description": "Pediatric inpatient, specialty clinics, and pediatric emergency.",
            "network_block": "10.5.0.0/24",
            "edge_router": "R13",
            "core_router": "R14",
            "wan_ip": "200.1.1.22/30",
            "inter_router_ip": "10.255.0.21/30",
            "vlan_count": 3,
            "device_count": 3,
            "status": "OPERATIONAL",
            "source": "PACKET_TRACER"
        }
    ]

    for h in hospitals_data:
        db.add(HospitalModel(**h))

    # 2. Seed 19 VLANs
    vlans_data = [
        # HQ VLANs
        {"vlan_id": 10, "hospital_id": "hq", "name": "DMZ", "subnet": "10.0.1.160", "prefix": "/28", "gateway": "10.0.1.161", "usable_hosts": 14, "description": "Central servers (DNS, Web, FTP, Mail)", "source": "PACKET_TRACER"},
        {"vlan_id": 20, "hospital_id": "hq", "name": "DOCTORS_ICU", "subnet": "10.0.1.64", "prefix": "/26", "gateway": "10.0.1.65", "usable_hosts": 62, "description": "Intensive Care Unit and Doctor workstations", "source": "PACKET_TRACER"},
        {"vlan_id": 30, "hospital_id": "hq", "name": "BILLING_ADMIN", "subnet": "10.0.1.0", "prefix": "/26", "gateway": "10.0.1.1", "usable_hosts": 62, "description": "Administration and patient billing segment", "source": "PACKET_TRACER"},
        {"vlan_id": 50, "hospital_id": "hq", "name": "GUEST_WIFI", "subnet": "10.0.0.0", "prefix": "/24", "gateway": "10.0.0.1", "usable_hosts": 254, "description": "Public guest wireless (isolated via ACL)", "source": "PACKET_TRACER"},

        # Diagnostic Center VLANs
        {"vlan_id": 100, "hospital_id": "diag", "name": "LAB", "subnet": "10.1.0.0", "prefix": "/26", "gateway": "10.1.0.1", "usable_hosts": 62, "description": "Clinical lab analyzers and imaging workstations", "source": "PACKET_TRACER"},
        {"vlan_id": 110, "hospital_id": "diag", "name": "ADMIN", "subnet": "10.1.0.64", "prefix": "/27", "gateway": "10.1.0.65", "usable_hosts": 30, "description": "Diagnostic center administration", "source": "PACKET_TRACER"},
        {"vlan_id": 120, "hospital_id": "diag", "name": "STAFF", "subnet": "10.1.0.96", "prefix": "/28", "gateway": "10.1.0.97", "usable_hosts": 14, "description": "Diagnostic medical staff network", "source": "PACKET_TRACER"},

        # Emergency Clinic VLANs
        {"vlan_id": 200, "hospital_id": "emer", "name": "EMERGENCY", "subnet": "10.2.0.0", "prefix": "/26", "gateway": "10.2.0.1", "usable_hosts": 62, "description": "Emergency triage and trauma ward", "source": "PACKET_TRACER"},
        {"vlan_id": 210, "hospital_id": "emer", "name": "ADMIN", "subnet": "10.2.0.64", "prefix": "/27", "gateway": "10.2.0.65", "usable_hosts": 30, "description": "Emergency clinic reception and dispatch", "source": "PACKET_TRACER"},
        {"vlan_id": 220, "hospital_id": "emer", "name": "IP_PHONE", "subnet": "10.2.0.96", "prefix": "/28", "gateway": "10.2.0.97", "usable_hosts": 14, "description": "Voice over IP telephony system", "source": "PACKET_TRACER"},

        # Telemedicine Branch VLANs
        {"vlan_id": 300, "hospital_id": "tele", "name": "CONSULTATION", "subnet": "10.3.0.0", "prefix": "/26", "gateway": "10.3.0.1", "usable_hosts": 62, "description": "High-def video consultation terminals", "source": "PACKET_TRACER"},
        {"vlan_id": 310, "hospital_id": "tele", "name": "ADMIN", "subnet": "10.3.0.64", "prefix": "/27", "gateway": "10.3.0.65", "usable_hosts": 30, "description": "Telemedicine scheduling and records", "source": "PACKET_TRACER"},
        {"vlan_id": 320, "hospital_id": "tele", "name": "WIFI", "subnet": "10.3.0.128", "prefix": "/27", "gateway": "10.3.0.129", "usable_hosts": 30, "description": "Branch staff and patient wireless", "source": "PACKET_TRACER"},

        # Maternity Hospital VLANs
        {"vlan_id": 400, "hospital_id": "mat", "name": "MATERNITY", "subnet": "10.4.0.0", "prefix": "/26", "gateway": "10.4.0.1", "usable_hosts": 62, "description": "Maternity delivery and neonatal monitoring", "source": "PACKET_TRACER"},
        {"vlan_id": 410, "hospital_id": "mat", "name": "ADMIN", "subnet": "10.4.0.64", "prefix": "/27", "gateway": "10.4.0.65", "usable_hosts": 30, "description": "Maternity records and admissions", "source": "PACKET_TRACER"},
        {"vlan_id": 420, "hospital_id": "mat", "name": "WIFI", "subnet": "10.4.0.128", "prefix": "/27", "gateway": "10.4.0.129", "usable_hosts": 30, "description": "Maternity patient and visitor wireless", "source": "PACKET_TRACER"},

        # Children Care Hospital VLANs
        {"vlan_id": 500, "hospital_id": "child", "name": "CHILDREN", "subnet": "10.5.0.0", "prefix": "/26", "gateway": "10.5.0.1", "usable_hosts": 62, "description": "Pediatric ward and critical child monitoring", "source": "PACKET_TRACER"},
        {"vlan_id": 510, "hospital_id": "child", "name": "ADMIN", "subnet": "10.5.0.64", "prefix": "/27", "gateway": "10.5.0.65", "usable_hosts": 30, "description": "Pediatric admissions and records", "source": "PACKET_TRACER"},
        {"vlan_id": 520, "hospital_id": "child", "name": "WIFI", "subnet": "10.5.0.128", "prefix": "/27", "gateway": "10.5.0.129", "usable_hosts": 30, "description": "Family and pediatric visitor wireless", "source": "PACKET_TRACER"},
    ]

    for v in vlans_data:
        db.add(VlanModel(**v))

    # 3. Seed Core Infrastructure Devices (Routers, Switches, DMZ Servers)
    devices_data = [
        # WAN & Central
        {"id": "r0_isp", "name": "R0 (ISP Router)", "device_type": "ROUTER", "hospital_id": "isp", "ip_address": "200.1.1.1", "model": "Cisco 2911", "role": "ISP WAN Gateway", "routing_protocol": "EIGRP 100", "status": "OPERATIONAL", "source": "PACKET_TRACER"},
        {"id": "sw0_isp", "name": "ISP Access Switch", "device_type": "SWITCH", "hospital_id": "isp", "ip_address": "200.1.1.254", "model": "Cisco 2960", "role": "WAN 802.1Q Aggregation", "routing_protocol": "Layer 2 Trunk", "status": "OPERATIONAL", "source": "PACKET_TRACER"},

        # HQ Devices
        {"id": "r1_hq_edge", "name": "R1 (HQ Edge Router)", "device_type": "ROUTER", "hospital_id": "hq", "ip_address": "200.1.1.2", "model": "Cisco 2911", "role": "Edge Security / NAT / PAT", "routing_protocol": "EIGRP 100", "status": "OPERATIONAL", "source": "PACKET_TRACER"},
        {"id": "r2_hq_core", "name": "R2 (HQ Core Router)", "device_type": "ROUTER", "hospital_id": "hq", "ip_address": "10.255.0.2", "model": "Cisco 2911", "role": "Core Inter-VLAN Routing & DHCP", "routing_protocol": "EIGRP 100", "status": "OPERATIONAL", "source": "PACKET_TRACER"},
        {"id": "sw_hq_access", "name": "HQ Access Switch", "device_type": "SWITCH", "hospital_id": "hq", "ip_address": "10.0.1.2", "model": "Cisco 2960", "role": "Department Access Switch", "routing_protocol": "Layer 2 Trunk", "status": "OPERATIONAL", "source": "PACKET_TRACER"},
        {"id": "srv_dns", "name": "HQ DNS Server", "device_type": "SERVER", "hospital_id": "hq", "ip_address": "10.0.1.162", "model": "Generic Server", "role": "Hospital Domain Resolver", "routing_protocol": "Static", "status": "UNVERIFIED", "source": "BACKEND_PROBE"},
        {"id": "srv_http", "name": "HQ Web Server", "device_type": "SERVER", "hospital_id": "hq", "ip_address": "10.0.1.163", "model": "Generic Server", "role": "Hospital Internal Portal", "routing_protocol": "Static", "status": "UNVERIFIED", "source": "BACKEND_PROBE"},
        {"id": "srv_ftp", "name": "HQ FTP Server", "device_type": "SERVER", "hospital_id": "hq", "ip_address": "10.0.1.164", "model": "Generic Server", "role": "Medical Imaging Reports", "routing_protocol": "Static", "status": "UNVERIFIED", "source": "BACKEND_PROBE"},
        {"id": "srv_mail", "name": "HQ Mail Server", "device_type": "SERVER", "hospital_id": "hq", "ip_address": "10.0.1.165", "model": "Generic Server", "role": "Hospital SMTP/POP3 Mail", "routing_protocol": "Static", "status": "UNVERIFIED", "source": "BACKEND_PROBE"},

        # Diagnostic Center Devices
        {"id": "r4_diag_edge", "name": "R4 (Diag Edge Router)", "device_type": "ROUTER", "hospital_id": "diag", "ip_address": "200.1.1.6", "model": "Cisco 2911", "role": "Edge Security / NAT", "routing_protocol": "EIGRP 100", "status": "OPERATIONAL", "source": "PACKET_TRACER"},
        {"id": "r5_diag_core", "name": "R5 (Diag Core Router)", "device_type": "ROUTER", "hospital_id": "diag", "ip_address": "10.255.0.6", "model": "Cisco 2911", "role": "Core Inter-VLAN Routing & DHCP", "routing_protocol": "EIGRP 100", "status": "OPERATIONAL", "source": "PACKET_TRACER"},
        {"id": "sw_diag_access", "name": "Diag Access Switch", "device_type": "SWITCH", "hospital_id": "diag", "ip_address": "10.1.0.2", "model": "Cisco 2960", "role": "Branch Access Switch", "routing_protocol": "Layer 2 Trunk", "status": "OPERATIONAL", "source": "PACKET_TRACER"},

        # Emergency Clinic Devices
        {"id": "r6_emer_edge", "name": "R6 (Emer Edge Router)", "device_type": "ROUTER", "hospital_id": "emer", "ip_address": "200.1.1.10", "model": "Cisco 2911", "role": "Edge Security / NAT", "routing_protocol": "EIGRP 100", "status": "OPERATIONAL", "source": "PACKET_TRACER"},
        {"id": "r7_emer_core", "name": "R7 (Emer Core Router)", "device_type": "ROUTER", "hospital_id": "emer", "ip_address": "10.255.0.10", "model": "Cisco 2911", "role": "Core Inter-VLAN Routing & DHCP", "routing_protocol": "EIGRP 100", "status": "OPERATIONAL", "source": "PACKET_TRACER"},
        {"id": "sw_emer_access", "name": "Emer Access Switch", "device_type": "SWITCH", "hospital_id": "emer", "ip_address": "10.2.0.2", "model": "Cisco 2960", "role": "Branch Access Switch", "routing_protocol": "Layer 2 Trunk", "status": "OPERATIONAL", "source": "PACKET_TRACER"},

        # Telemedicine Devices
        {"id": "r9_tele_edge", "name": "R9 (Tele Edge Router)", "device_type": "ROUTER", "hospital_id": "tele", "ip_address": "200.1.1.14", "model": "Cisco 2911", "role": "Edge Security / NAT", "routing_protocol": "EIGRP 100", "status": "OPERATIONAL", "source": "PACKET_TRACER"},
        {"id": "r10_tele_core", "name": "R10 (Tele Core Router)", "device_type": "ROUTER", "hospital_id": "tele", "ip_address": "10.255.0.14", "model": "Cisco 2911", "role": "Core Inter-VLAN Routing & DHCP", "routing_protocol": "EIGRP 100", "status": "OPERATIONAL", "source": "PACKET_TRACER"},
        {"id": "sw_tele_access", "name": "Tele Access Switch", "device_type": "SWITCH", "hospital_id": "tele", "ip_address": "10.3.0.2", "model": "Cisco 2960", "role": "Branch Access Switch", "routing_protocol": "Layer 2 Trunk", "status": "OPERATIONAL", "source": "PACKET_TRACER"},

        # Maternity Devices
        {"id": "r11_mat_edge", "name": "R11 (Mat Edge Router)", "device_type": "ROUTER", "hospital_id": "mat", "ip_address": "200.1.1.18", "model": "Cisco 2911", "role": "Edge Security / NAT", "routing_protocol": "EIGRP 100", "status": "OPERATIONAL", "source": "PACKET_TRACER"},
        {"id": "r12_mat_core", "name": "R12 (Mat Core Router)", "device_type": "ROUTER", "hospital_id": "mat", "ip_address": "10.255.0.18", "model": "Cisco 2911", "role": "Core Inter-VLAN Routing & DHCP", "routing_protocol": "EIGRP 100", "status": "OPERATIONAL", "source": "PACKET_TRACER"},
        {"id": "sw_mat_access", "name": "Mat Access Switch", "device_type": "SWITCH", "hospital_id": "mat", "ip_address": "10.4.0.2", "model": "Cisco 2960", "role": "Branch Access Switch", "routing_protocol": "Layer 2 Trunk", "status": "OPERATIONAL", "source": "PACKET_TRACER"},

        # Children Care Devices
        {"id": "r13_child_edge", "name": "R13 (Child Edge Router)", "device_type": "ROUTER", "hospital_id": "child", "ip_address": "200.1.1.22", "model": "Cisco 2911", "role": "Edge Security / NAT", "routing_protocol": "EIGRP 100", "status": "OPERATIONAL", "source": "PACKET_TRACER"},
        {"id": "r14_child_core", "name": "R14 (Child Core Router)", "device_type": "ROUTER", "hospital_id": "child", "ip_address": "10.255.0.22", "model": "Cisco 2911", "role": "Core Inter-VLAN Routing & DHCP", "routing_protocol": "EIGRP 100", "status": "OPERATIONAL", "source": "PACKET_TRACER"},
        {"id": "sw_child_access", "name": "Child Access Switch", "device_type": "SWITCH", "hospital_id": "child", "ip_address": "10.5.0.2", "model": "Cisco 2960", "role": "Branch Access Switch", "routing_protocol": "Layer 2 Trunk", "status": "OPERATIONAL", "source": "PACKET_TRACER"},
    ]

    for d in devices_data:
        db.add(DeviceModel(**d))

    # 4. Seed Baseline Alerts (clearly marked with actual vs simulated sources)
    alerts_data = [
        {
            "timestamp": datetime.utcnow(),
            "title": "Packet Tracer Integration Active",
            "message": "Cisco Packet Tracer 9.0.1 process verified on host system. TCP Ports 39000 (Multiuser) & 8001 (Progress/Login) active.",
            "severity": "INFO",
            "category": "INTEGRATION",
            "hospital_id": "hq",
            "device_id": "r0_isp",
            "source": "PACKET_TRACER",
            "is_acknowledged": False
        },
        {
            "timestamp": datetime.utcnow(),
            "title": "Simulated Canvas Subnets Isolated from Host Routing",
            "message": "Direct host ping to internal DMZ IP (10.0.1.162) cannot reach virtual simulation canvas without external TAP bridging. Services displayed as UNVERIFIED.",
            "severity": "WARNING",
            "category": "CONNECTIVITY",
            "hospital_id": "hq",
            "device_id": "srv_dns",
            "source": "BACKEND_PROBE",
            "is_acknowledged": True
        }
    ]

    for a in alerts_data:
        db.add(AlertModel(**a))

    # 5. Audit Log Entry
    audit_entry = AuditLogModel(
        event_type="SYSTEM_BOOTSTRAP",
        description="SmartCare monitoring database initialized with verified 6-site hospital topology.",
        actor="SYSTEM",
        source="BACKEND_PROBE"
    )
    db.add(audit_entry)

    db.commit()
