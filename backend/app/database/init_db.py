import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from backend.app.database.session import Base, engine
from backend.app.models.network import (
    HospitalModel,
    DeviceModel,
    VlanModel,
    AlertModel,
    EventLogModel,
    NetworkSnapshotModel,
    AuditLogModel
)

def init_db(db: Session) -> None:
    # Create all tables if they don't exist
    Base.metadata.create_all(bind=engine)

    # Check if already seeded
    if db.query(HospitalModel).count() > 0:
        # Check if event_logs table has entries; if not, seed initial event log
        if db.query(EventLogModel).count() == 0:
            _seed_initial_events(db)
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

    # 3. Seed Core Infrastructure Devices with Detailed Interfaces & Peers
    devices_data = [
        # WAN & Central
        {
            "id": "r0_isp",
            "name": "R0 (ISP Router)",
            "hostname": "R0-ISP-CORE",
            "device_type": "ROUTER",
            "hospital_id": "isp",
            "ip_address": "200.1.1.1",
            "mac_address": "0001.96C2.B001",
            "model": "Cisco 2911",
            "role": "ISP WAN Aggregation Gateway",
            "routing_protocol": "EIGRP AS 100",
            "status": "OPERATIONAL",
            "source": "PACKET_TRACER",
            "interfaces_json": json.dumps([
                {"name": "Gi0/0", "ip_address": "200.1.1.1", "subnet_mask": "255.255.255.0", "status": "UP", "connected_to": "sw0_isp", "link_type": "TRUNK"},
                {"name": "Gi0/0.10", "ip_address": "200.1.1.1", "subnet_mask": "255.255.255.252", "status": "UP", "connected_to": "r1_hq_edge", "link_type": "WAN", "vlan_id": 10},
                {"name": "Gi0/0.20", "ip_address": "200.1.1.5", "subnet_mask": "255.255.255.252", "status": "UP", "connected_to": "r4_diag_edge", "link_type": "WAN", "vlan_id": 20},
                {"name": "Gi0/0.30", "ip_address": "200.1.1.9", "subnet_mask": "255.255.255.252", "status": "UP", "connected_to": "r6_emer_edge", "link_type": "WAN", "vlan_id": 30},
                {"name": "Gi0/0.40", "ip_address": "200.1.1.13", "subnet_mask": "255.255.255.252", "status": "UP", "connected_to": "r9_tele_edge", "link_type": "WAN", "vlan_id": 40},
                {"name": "Gi0/0.50", "ip_address": "200.1.1.17", "subnet_mask": "255.255.255.252", "status": "UP", "connected_to": "r11_mat_edge", "link_type": "WAN", "vlan_id": 50},
                {"name": "Gi0/0.60", "ip_address": "200.1.1.21", "subnet_mask": "255.255.255.252", "status": "UP", "connected_to": "r13_child_edge", "link_type": "WAN", "vlan_id": 60},
            ]),
            "connected_devices_json": json.dumps(["sw0_isp", "r1_hq_edge", "r4_diag_edge", "r6_emer_edge", "r9_tele_edge", "r11_mat_edge", "r13_child_edge"]),
            "vlans_json": json.dumps([10, 20, 30, 40, 50, 60]),
            "routing_info_json": json.dumps({"protocol": "EIGRP", "as": 100, "auto_summary": False, "neighbors": 6}),
            "last_observed_status": "OPERATIONAL",
            "verification_status": "CURRENT"
        },
        {
            "id": "sw0_isp",
            "name": "ISP Access Switch",
            "hostname": "SW0-ISP-AGG",
            "device_type": "SWITCH",
            "hospital_id": "isp",
            "ip_address": "200.1.1.254",
            "mac_address": "0002.4AA1.F001",
            "model": "Cisco 2960-24TT",
            "role": "WAN 802.1Q Aggregation",
            "routing_protocol": "Layer 2 Trunking",
            "status": "OPERATIONAL",
            "source": "PACKET_TRACER",
            "interfaces_json": json.dumps([
                {"name": "Gi0/1", "ip_address": None, "status": "UP", "connected_to": "r0_isp", "link_type": "TRUNK"},
                {"name": "Fa0/1", "ip_address": None, "status": "UP", "connected_to": "r1_hq_edge", "link_type": "ACCESS", "vlan_id": 10},
                {"name": "Fa0/2", "ip_address": None, "status": "UP", "connected_to": "r4_diag_edge", "link_type": "ACCESS", "vlan_id": 20},
                {"name": "Fa0/3", "ip_address": None, "status": "UP", "connected_to": "r6_emer_edge", "link_type": "ACCESS", "vlan_id": 30},
                {"name": "Fa0/4", "ip_address": None, "status": "UP", "connected_to": "r9_tele_edge", "link_type": "ACCESS", "vlan_id": 40},
                {"name": "Fa0/5", "ip_address": None, "status": "UP", "connected_to": "r11_mat_edge", "link_type": "ACCESS", "vlan_id": 50},
                {"name": "Fa0/6", "ip_address": None, "status": "UP", "connected_to": "r13_child_edge", "link_type": "ACCESS", "vlan_id": 60},
            ]),
            "connected_devices_json": json.dumps(["r0_isp", "r1_hq_edge", "r4_diag_edge", "r6_emer_edge", "r9_tele_edge", "r11_mat_edge", "r13_child_edge"]),
            "vlans_json": json.dumps([10, 20, 30, 40, 50, 60]),
            "routing_info_json": json.dumps({"mode": "VLAN Trunking", "encapsulation": "802.1Q"}),
            "last_observed_status": "OPERATIONAL",
            "verification_status": "CURRENT"
        },

        # HQ Devices
        {
            "id": "r1_hq_edge",
            "name": "R1 (HQ Edge Router)",
            "hostname": "R1-HQ-EDGE",
            "device_type": "ROUTER",
            "hospital_id": "hq",
            "ip_address": "200.1.1.2",
            "mac_address": "0003.E4A2.0101",
            "model": "Cisco 2911",
            "role": "Edge Security / NAT / PAT Overload",
            "routing_protocol": "EIGRP AS 100",
            "status": "OPERATIONAL",
            "source": "PACKET_TRACER",
            "interfaces_json": json.dumps([
                {"name": "Gi0/0", "ip_address": "200.1.1.2", "subnet_mask": "255.255.255.252", "status": "UP", "connected_to": "sw0_isp", "link_type": "WAN"},
                {"name": "Gi0/1", "ip_address": "10.255.0.1", "subnet_mask": "255.255.255.252", "status": "UP", "connected_to": "r2_hq_core", "link_type": "P2P"},
            ]),
            "connected_devices_json": json.dumps(["r0_isp", "r2_hq_core"]),
            "vlans_json": json.dumps([]),
            "routing_info_json": json.dumps({"protocol": "EIGRP 100", "nat_mode": "Overload (PAT)", "excluded_networks": ["10.0.0.0/8"]}),
            "last_observed_status": "OPERATIONAL",
            "verification_status": "CURRENT"
        },
        {
            "id": "r2_hq_core",
            "name": "R2 (HQ Core Router)",
            "hostname": "R2-HQ-CORE",
            "device_type": "ROUTER",
            "hospital_id": "hq",
            "ip_address": "10.255.0.2",
            "mac_address": "0003.E4A2.0201",
            "model": "Cisco 2911",
            "role": "Core Inter-VLAN Routing & DHCP Pools",
            "routing_protocol": "EIGRP AS 100",
            "status": "OPERATIONAL",
            "source": "PACKET_TRACER",
            "interfaces_json": json.dumps([
                {"name": "Gi0/0", "ip_address": "10.255.0.2", "subnet_mask": "255.255.255.252", "status": "UP", "connected_to": "r1_hq_edge", "link_type": "P2P"},
                {"name": "Gi0/1.10", "ip_address": "10.0.1.161", "subnet_mask": "255.255.255.240", "status": "UP", "connected_to": "sw_hq_access", "link_type": "ROAS", "vlan_id": 10},
                {"name": "Gi0/1.20", "ip_address": "10.0.1.65", "subnet_mask": "255.255.255.192", "status": "UP", "connected_to": "sw_hq_access", "link_type": "ROAS", "vlan_id": 20},
                {"name": "Gi0/1.30", "ip_address": "10.0.1.1", "subnet_mask": "255.255.255.192", "status": "UP", "connected_to": "sw_hq_access", "link_type": "ROAS", "vlan_id": 30},
                {"name": "Gi0/1.50", "ip_address": "10.0.0.1", "subnet_mask": "255.255.255.0", "status": "UP", "connected_to": "sw_hq_access", "link_type": "ROAS", "vlan_id": 50},
            ]),
            "connected_devices_json": json.dumps(["r1_hq_edge", "sw_hq_access"]),
            "vlans_json": json.dumps([10, 20, 30, 50]),
            "routing_info_json": json.dumps({"protocol": "EIGRP 100", "inter_vlan": "Router-on-a-Stick", "dhcp_pools": ["DMZ", "ICU", "ADMIN", "GUEST"]}),
            "last_observed_status": "OPERATIONAL",
            "verification_status": "CURRENT"
        },
        {
            "id": "sw_hq_access",
            "name": "HQ Access Switch",
            "hostname": "SW-HQ-ACCESS",
            "device_type": "SWITCH",
            "hospital_id": "hq",
            "ip_address": "10.0.1.2",
            "mac_address": "0004.9B11.C301",
            "model": "Cisco 2960-24TT",
            "role": "HQ Department Access Switch",
            "routing_protocol": "Layer 2 Trunking",
            "status": "OPERATIONAL",
            "source": "PACKET_TRACER",
            "interfaces_json": json.dumps([
                {"name": "Gi0/1", "ip_address": None, "status": "UP", "connected_to": "r2_hq_core", "link_type": "TRUNK"},
                {"name": "Fa0/1", "ip_address": None, "status": "UP", "connected_to": "srv_dns", "link_type": "ACCESS", "vlan_id": 10},
                {"name": "Fa0/2", "ip_address": None, "status": "UP", "connected_to": "srv_http", "link_type": "ACCESS", "vlan_id": 10},
                {"name": "Fa0/3", "ip_address": None, "status": "UP", "connected_to": "srv_ftp", "link_type": "ACCESS", "vlan_id": 10},
                {"name": "Fa0/4", "ip_address": None, "status": "UP", "connected_to": "srv_mail", "link_type": "ACCESS", "vlan_id": 10},
            ]),
            "connected_devices_json": json.dumps(["r2_hq_core", "srv_dns", "srv_http", "srv_ftp", "srv_mail"]),
            "vlans_json": json.dumps([10, 20, 30, 50]),
            "routing_info_json": json.dumps({"mode": "Layer 2 Access & Trunk"}),
            "last_observed_status": "OPERATIONAL",
            "verification_status": "CURRENT"
        },
        {
            "id": "srv_dns",
            "name": "HQ DNS Server",
            "hostname": "dns.hospital.com",
            "device_type": "SERVER",
            "hospital_id": "hq",
            "ip_address": "10.0.1.162",
            "mac_address": "0050.7966.6801",
            "model": "Generic Server",
            "role": "Hospital Domain Resolver",
            "routing_protocol": "Static Route (via 10.0.1.161)",
            "status": "UNVERIFIED",
            "source": "BACKEND_PROBE",
            "interfaces_json": json.dumps([
                {"name": "FastEthernet0", "ip_address": "10.0.1.162", "subnet_mask": "255.255.255.240", "status": "UP", "connected_to": "sw_hq_access", "link_type": "ACCESS", "vlan_id": 10}
            ]),
            "connected_devices_json": json.dumps(["sw_hq_access"]),
            "vlans_json": json.dumps([10]),
            "routing_info_json": json.dumps({"gateway": "10.0.1.161", "services": ["DNS (Port 53)"]}),
            "last_observed_status": "UNVERIFIED",
            "verification_status": "UNKNOWN"
        },
        {
            "id": "srv_http",
            "name": "HQ Web Server",
            "hostname": "portal.hospital.com",
            "device_type": "SERVER",
            "hospital_id": "hq",
            "ip_address": "10.0.1.163",
            "mac_address": "0050.7966.6802",
            "model": "Generic Server",
            "role": "Hospital Internal Portal",
            "routing_protocol": "Static Route (via 10.0.1.161)",
            "status": "UNVERIFIED",
            "source": "BACKEND_PROBE",
            "interfaces_json": json.dumps([
                {"name": "FastEthernet0", "ip_address": "10.0.1.163", "subnet_mask": "255.255.255.240", "status": "UP", "connected_to": "sw_hq_access", "link_type": "ACCESS", "vlan_id": 10}
            ]),
            "connected_devices_json": json.dumps(["sw_hq_access"]),
            "vlans_json": json.dumps([10]),
            "routing_info_json": json.dumps({"gateway": "10.0.1.161", "services": ["HTTP (Port 80)"]}),
            "last_observed_status": "UNVERIFIED",
            "verification_status": "UNKNOWN"
        },
        {
            "id": "srv_ftp",
            "name": "HQ FTP Server",
            "hostname": "ftp.hospital.com",
            "device_type": "SERVER",
            "hospital_id": "hq",
            "ip_address": "10.0.1.164",
            "mac_address": "0050.7966.6803",
            "model": "Generic Server",
            "role": "Medical Imaging Reports",
            "routing_protocol": "Static Route (via 10.0.1.161)",
            "status": "UNVERIFIED",
            "source": "BACKEND_PROBE",
            "interfaces_json": json.dumps([
                {"name": "FastEthernet0", "ip_address": "10.0.1.164", "subnet_mask": "255.255.255.240", "status": "UP", "connected_to": "sw_hq_access", "link_type": "ACCESS", "vlan_id": 10}
            ]),
            "connected_devices_json": json.dumps(["sw_hq_access"]),
            "vlans_json": json.dumps([10]),
            "routing_info_json": json.dumps({"gateway": "10.0.1.161", "services": ["FTP (Port 21)"]}),
            "last_observed_status": "UNVERIFIED",
            "verification_status": "UNKNOWN"
        },
        {
            "id": "srv_mail",
            "name": "HQ Mail Server",
            "hostname": "mail.hospital.com",
            "device_type": "SERVER",
            "hospital_id": "hq",
            "ip_address": "10.0.1.165",
            "mac_address": "0050.7966.6804",
            "model": "Generic Server",
            "role": "Hospital SMTP/POP3 Mail",
            "routing_protocol": "Static Route (via 10.0.1.161)",
            "status": "UNVERIFIED",
            "source": "BACKEND_PROBE",
            "interfaces_json": json.dumps([
                {"name": "FastEthernet0", "ip_address": "10.0.1.165", "subnet_mask": "255.255.255.240", "status": "UP", "connected_to": "sw_hq_access", "link_type": "ACCESS", "vlan_id": 10}
            ]),
            "connected_devices_json": json.dumps(["sw_hq_access"]),
            "vlans_json": json.dumps([10]),
            "routing_info_json": json.dumps({"gateway": "10.0.1.161", "services": ["SMTP (Port 25)", "POP3 (Port 110)"]}),
            "last_observed_status": "UNVERIFIED",
            "verification_status": "UNKNOWN"
        },

        # Diagnostic Center Devices
        {
            "id": "r4_diag_edge",
            "name": "R4 (Diag Edge Router)",
            "hostname": "R4-DIAG-EDGE",
            "device_type": "ROUTER",
            "hospital_id": "diag",
            "ip_address": "200.1.1.6",
            "mac_address": "0005.5E11.0401",
            "model": "Cisco 2911",
            "role": "Edge Security / NAT Overload",
            "routing_protocol": "EIGRP AS 100",
            "status": "OPERATIONAL",
            "source": "PACKET_TRACER",
            "interfaces_json": json.dumps([
                {"name": "Gi0/0", "ip_address": "200.1.1.6", "subnet_mask": "255.255.255.252", "status": "UP", "connected_to": "sw0_isp", "link_type": "WAN"},
                {"name": "Gi0/1", "ip_address": "10.255.0.5", "subnet_mask": "255.255.255.252", "status": "UP", "connected_to": "r5_diag_core", "link_type": "P2P"},
            ]),
            "connected_devices_json": json.dumps(["r0_isp", "r5_diag_core"]),
            "vlans_json": json.dumps([]),
            "routing_info_json": json.dumps({"protocol": "EIGRP 100", "nat_mode": "Overload"}),
            "last_observed_status": "OPERATIONAL",
            "verification_status": "CURRENT"
        },
        {
            "id": "r5_diag_core",
            "name": "R5 (Diag Core Router)",
            "hostname": "R5-DIAG-CORE",
            "device_type": "ROUTER",
            "hospital_id": "diag",
            "ip_address": "10.255.0.6",
            "mac_address": "0005.5E11.0501",
            "model": "Cisco 2911",
            "role": "Core Inter-VLAN Routing & DHCP",
            "routing_protocol": "EIGRP AS 100",
            "status": "OPERATIONAL",
            "source": "PACKET_TRACER",
            "interfaces_json": json.dumps([
                {"name": "Gi0/0", "ip_address": "10.255.0.6", "subnet_mask": "255.255.255.252", "status": "UP", "connected_to": "r4_diag_edge", "link_type": "P2P"},
                {"name": "Gi0/1.100", "ip_address": "10.1.0.1", "subnet_mask": "255.255.255.192", "status": "UP", "connected_to": "sw_diag_access", "link_type": "ROAS", "vlan_id": 100},
                {"name": "Gi0/1.110", "ip_address": "10.1.0.65", "subnet_mask": "255.255.255.224", "status": "UP", "connected_to": "sw_diag_access", "link_type": "ROAS", "vlan_id": 110},
                {"name": "Gi0/1.120", "ip_address": "10.1.0.97", "subnet_mask": "255.255.255.240", "status": "UP", "connected_to": "sw_diag_access", "link_type": "ROAS", "vlan_id": 120},
            ]),
            "connected_devices_json": json.dumps(["r4_diag_edge", "sw_diag_access"]),
            "vlans_json": json.dumps([100, 110, 120]),
            "routing_info_json": json.dumps({"protocol": "EIGRP 100", "inter_vlan": "802.1Q"}),
            "last_observed_status": "OPERATIONAL",
            "verification_status": "CURRENT"
        },
        {
            "id": "sw_diag_access",
            "name": "Diag Access Switch",
            "hostname": "SW-DIAG-ACCESS",
            "device_type": "SWITCH",
            "hospital_id": "diag",
            "ip_address": "10.1.0.2",
            "mac_address": "0006.12A3.0101",
            "model": "Cisco 2960-24TT",
            "role": "Branch Access Switch",
            "routing_protocol": "Layer 2 Trunking",
            "status": "OPERATIONAL",
            "source": "PACKET_TRACER",
            "interfaces_json": json.dumps([
                {"name": "Gi0/1", "ip_address": None, "status": "UP", "connected_to": "r5_diag_core", "link_type": "TRUNK"}
            ]),
            "connected_devices_json": json.dumps(["r5_diag_core"]),
            "vlans_json": json.dumps([100, 110, 120]),
            "routing_info_json": json.dumps({"mode": "Layer 2 Access"}),
            "last_observed_status": "OPERATIONAL",
            "verification_status": "CURRENT"
        },

        # Emergency Clinic Devices
        {
            "id": "r6_emer_edge",
            "name": "R6 (Emer Edge Router)",
            "hostname": "R6-EMER-EDGE",
            "device_type": "ROUTER",
            "hospital_id": "emer",
            "ip_address": "200.1.1.10",
            "mac_address": "0007.7F22.0601",
            "model": "Cisco 2911",
            "role": "Edge Security / NAT Overload",
            "routing_protocol": "EIGRP AS 100",
            "status": "OPERATIONAL",
            "source": "PACKET_TRACER",
            "interfaces_json": json.dumps([
                {"name": "Gi0/0", "ip_address": "200.1.1.10", "subnet_mask": "255.255.255.252", "status": "UP", "connected_to": "sw0_isp", "link_type": "WAN"},
                {"name": "Gi0/1", "ip_address": "10.255.0.9", "subnet_mask": "255.255.255.252", "status": "UP", "connected_to": "r7_emer_core", "link_type": "P2P"},
            ]),
            "connected_devices_json": json.dumps(["r0_isp", "r7_emer_core"]),
            "vlans_json": json.dumps([]),
            "routing_info_json": json.dumps({"protocol": "EIGRP 100", "nat_mode": "Overload"}),
            "last_observed_status": "OPERATIONAL",
            "verification_status": "CURRENT"
        },
        {
            "id": "r7_emer_core",
            "name": "R7 (Emer Core Router)",
            "hostname": "R7-EMER-CORE",
            "device_type": "ROUTER",
            "hospital_id": "emer",
            "ip_address": "10.255.0.10",
            "mac_address": "0007.7F22.0701",
            "model": "Cisco 2911",
            "role": "Core Inter-VLAN Routing & DHCP",
            "routing_protocol": "EIGRP AS 100",
            "status": "OPERATIONAL",
            "source": "PACKET_TRACER",
            "interfaces_json": json.dumps([
                {"name": "Gi0/0", "ip_address": "10.255.0.10", "subnet_mask": "255.255.255.252", "status": "UP", "connected_to": "r6_emer_edge", "link_type": "P2P"},
                {"name": "Gi0/1.200", "ip_address": "10.2.0.1", "subnet_mask": "255.255.255.192", "status": "UP", "connected_to": "sw_emer_access", "link_type": "ROAS", "vlan_id": 200},
                {"name": "Gi0/1.210", "ip_address": "10.2.0.65", "subnet_mask": "255.255.255.224", "status": "UP", "connected_to": "sw_emer_access", "link_type": "ROAS", "vlan_id": 210},
                {"name": "Gi0/1.220", "ip_address": "10.2.0.97", "subnet_mask": "255.255.255.240", "status": "UP", "connected_to": "sw_emer_access", "link_type": "ROAS", "vlan_id": 220},
            ]),
            "connected_devices_json": json.dumps(["r6_emer_edge", "sw_emer_access"]),
            "vlans_json": json.dumps([200, 210, 220]),
            "routing_info_json": json.dumps({"protocol": "EIGRP 100", "inter_vlan": "802.1Q"}),
            "last_observed_status": "OPERATIONAL",
            "verification_status": "CURRENT"
        },
        {
            "id": "sw_emer_access",
            "name": "Emer Access Switch",
            "hostname": "SW-EMER-ACCESS",
            "device_type": "SWITCH",
            "hospital_id": "emer",
            "ip_address": "10.2.0.2",
            "mac_address": "0008.31C9.0101",
            "model": "Cisco 2960-24TT",
            "role": "Branch Access Switch",
            "routing_protocol": "Layer 2 Trunking",
            "status": "OPERATIONAL",
            "source": "PACKET_TRACER",
            "interfaces_json": json.dumps([
                {"name": "Gi0/1", "ip_address": None, "status": "UP", "connected_to": "r7_emer_core", "link_type": "TRUNK"}
            ]),
            "connected_devices_json": json.dumps(["r7_emer_core"]),
            "vlans_json": json.dumps([200, 210, 220]),
            "routing_info_json": json.dumps({"mode": "Layer 2 Access"}),
            "last_observed_status": "OPERATIONAL",
            "verification_status": "CURRENT"
        },

        # Telemedicine Devices
        {
            "id": "r9_tele_edge",
            "name": "R9 (Tele Edge Router)",
            "hostname": "R9-TELE-EDGE",
            "device_type": "ROUTER",
            "hospital_id": "tele",
            "ip_address": "200.1.1.14",
            "mac_address": "0009.A112.0901",
            "model": "Cisco 2911",
            "role": "Edge Security / NAT Overload",
            "routing_protocol": "EIGRP AS 100",
            "status": "OPERATIONAL",
            "source": "PACKET_TRACER",
            "interfaces_json": json.dumps([
                {"name": "Gi0/0", "ip_address": "200.1.1.14", "subnet_mask": "255.255.255.252", "status": "UP", "connected_to": "sw0_isp", "link_type": "WAN"},
                {"name": "Gi0/1", "ip_address": "10.255.0.13", "subnet_mask": "255.255.255.252", "status": "UP", "connected_to": "r10_tele_core", "link_type": "P2P"},
            ]),
            "connected_devices_json": json.dumps(["r0_isp", "r10_tele_core"]),
            "vlans_json": json.dumps([]),
            "routing_info_json": json.dumps({"protocol": "EIGRP 100", "nat_mode": "Overload"}),
            "last_observed_status": "OPERATIONAL",
            "verification_status": "CURRENT"
        },
        {
            "id": "r10_tele_core",
            "name": "R10 (Tele Core Router)",
            "hostname": "R10-TELE-CORE",
            "device_type": "ROUTER",
            "hospital_id": "tele",
            "ip_address": "10.255.0.14",
            "mac_address": "0009.A112.1001",
            "model": "Cisco 2911",
            "role": "Core Inter-VLAN Routing & DHCP",
            "routing_protocol": "EIGRP AS 100",
            "status": "OPERATIONAL",
            "source": "PACKET_TRACER",
            "interfaces_json": json.dumps([
                {"name": "Gi0/0", "ip_address": "10.255.0.14", "subnet_mask": "255.255.255.252", "status": "UP", "connected_to": "r9_tele_edge", "link_type": "P2P"},
                {"name": "Gi0/1.300", "ip_address": "10.3.0.1", "subnet_mask": "255.255.255.192", "status": "UP", "connected_to": "sw_tele_access", "link_type": "ROAS", "vlan_id": 300},
                {"name": "Gi0/1.310", "ip_address": "10.3.0.65", "subnet_mask": "255.255.255.224", "status": "UP", "connected_to": "sw_tele_access", "link_type": "ROAS", "vlan_id": 310},
                {"name": "Gi0/1.320", "ip_address": "10.3.0.129", "subnet_mask": "255.255.255.224", "status": "UP", "connected_to": "sw_tele_access", "link_type": "ROAS", "vlan_id": 320},
            ]),
            "connected_devices_json": json.dumps(["r9_tele_edge", "sw_tele_access"]),
            "vlans_json": json.dumps([300, 310, 320]),
            "routing_info_json": json.dumps({"protocol": "EIGRP 100", "inter_vlan": "802.1Q"}),
            "last_observed_status": "OPERATIONAL",
            "verification_status": "CURRENT"
        },
        {
            "id": "sw_tele_access",
            "name": "Tele Access Switch",
            "hostname": "SW-TELE-ACCESS",
            "device_type": "SWITCH",
            "hospital_id": "tele",
            "ip_address": "10.3.0.2",
            "mac_address": "000A.45D1.0101",
            "model": "Cisco 2960-24TT",
            "role": "Branch Access Switch",
            "routing_protocol": "Layer 2 Trunking",
            "status": "OPERATIONAL",
            "source": "PACKET_TRACER",
            "interfaces_json": json.dumps([
                {"name": "Gi0/1", "ip_address": None, "status": "UP", "connected_to": "r10_tele_core", "link_type": "TRUNK"}
            ]),
            "connected_devices_json": json.dumps(["r10_tele_core"]),
            "vlans_json": json.dumps([300, 310, 320]),
            "routing_info_json": json.dumps({"mode": "Layer 2 Access"}),
            "last_observed_status": "OPERATIONAL",
            "verification_status": "CURRENT"
        },

        # Maternity Devices
        {
            "id": "r11_mat_edge",
            "name": "R11 (Mat Edge Router)",
            "hostname": "R11-MAT-EDGE",
            "device_type": "ROUTER",
            "hospital_id": "mat",
            "ip_address": "200.1.1.18",
            "mac_address": "000B.B123.1101",
            "model": "Cisco 2911",
            "role": "Edge Security / NAT Overload",
            "routing_protocol": "EIGRP AS 100",
            "status": "OPERATIONAL",
            "source": "PACKET_TRACER",
            "interfaces_json": json.dumps([
                {"name": "Gi0/0", "ip_address": "200.1.1.18", "subnet_mask": "255.255.255.252", "status": "UP", "connected_to": "sw0_isp", "link_type": "WAN"},
                {"name": "Gi0/1", "ip_address": "10.255.0.17", "subnet_mask": "255.255.255.252", "status": "UP", "connected_to": "r12_mat_core", "link_type": "P2P"},
            ]),
            "connected_devices_json": json.dumps(["r0_isp", "r12_mat_core"]),
            "vlans_json": json.dumps([]),
            "routing_info_json": json.dumps({"protocol": "EIGRP 100", "nat_mode": "Overload"}),
            "last_observed_status": "OPERATIONAL",
            "verification_status": "CURRENT"
        },
        {
            "id": "r12_mat_core",
            "name": "R12 (Mat Core Router)",
            "hostname": "R12-MAT-CORE",
            "device_type": "ROUTER",
            "hospital_id": "mat",
            "ip_address": "10.255.0.18",
            "mac_address": "000B.B123.1201",
            "model": "Cisco 2911",
            "role": "Core Inter-VLAN Routing & DHCP",
            "routing_protocol": "EIGRP AS 100",
            "status": "OPERATIONAL",
            "source": "PACKET_TRACER",
            "interfaces_json": json.dumps([
                {"name": "Gi0/0", "ip_address": "10.255.0.18", "subnet_mask": "255.255.255.252", "status": "UP", "connected_to": "r11_mat_edge", "link_type": "P2P"},
                {"name": "Gi0/1.400", "ip_address": "10.4.0.1", "subnet_mask": "255.255.255.192", "status": "UP", "connected_to": "sw_mat_access", "link_type": "ROAS", "vlan_id": 400},
                {"name": "Gi0/1.410", "ip_address": "10.4.0.65", "subnet_mask": "255.255.255.224", "status": "UP", "connected_to": "sw_mat_access", "link_type": "ROAS", "vlan_id": 410},
                {"name": "Gi0/1.420", "ip_address": "10.4.0.129", "subnet_mask": "255.255.255.224", "status": "UP", "connected_to": "sw_mat_access", "link_type": "ROAS", "vlan_id": 420},
            ]),
            "connected_devices_json": json.dumps(["r11_mat_edge", "sw_mat_access"]),
            "vlans_json": json.dumps([400, 410, 420]),
            "routing_info_json": json.dumps({"protocol": "EIGRP 100", "inter_vlan": "802.1Q"}),
            "last_observed_status": "OPERATIONAL",
            "verification_status": "CURRENT"
        },
        {
            "id": "sw_mat_access",
            "name": "Mat Access Switch",
            "hostname": "SW-MAT-ACCESS",
            "device_type": "SWITCH",
            "hospital_id": "mat",
            "ip_address": "10.4.0.2",
            "mac_address": "000C.76E2.0101",
            "model": "Cisco 2960-24TT",
            "role": "Branch Access Switch",
            "routing_protocol": "Layer 2 Trunking",
            "status": "OPERATIONAL",
            "source": "PACKET_TRACER",
            "interfaces_json": json.dumps([
                {"name": "Gi0/1", "ip_address": None, "status": "UP", "connected_to": "r12_mat_core", "link_type": "TRUNK"}
            ]),
            "connected_devices_json": json.dumps(["r12_mat_core"]),
            "vlans_json": json.dumps([400, 410, 420]),
            "routing_info_json": json.dumps({"mode": "Layer 2 Access"}),
            "last_observed_status": "OPERATIONAL",
            "verification_status": "CURRENT"
        },

        # Children Care Devices
        {
            "id": "r13_child_edge",
            "name": "R13 (Child Edge Router)",
            "hostname": "R13-CHILD-EDGE",
            "device_type": "ROUTER",
            "hospital_id": "child",
            "ip_address": "200.1.1.22",
            "mac_address": "000D.C911.1301",
            "model": "Cisco 2911",
            "role": "Edge Security / NAT Overload",
            "routing_protocol": "EIGRP AS 100",
            "status": "OPERATIONAL",
            "source": "PACKET_TRACER",
            "interfaces_json": json.dumps([
                {"name": "Gi0/0", "ip_address": "200.1.1.22", "subnet_mask": "255.255.255.252", "status": "UP", "connected_to": "sw0_isp", "link_type": "WAN"},
                {"name": "Gi0/1", "ip_address": "10.255.0.21", "subnet_mask": "255.255.255.252", "status": "UP", "connected_to": "r14_child_core", "link_type": "P2P"},
            ]),
            "connected_devices_json": json.dumps(["r0_isp", "r14_child_core"]),
            "vlans_json": json.dumps([]),
            "routing_info_json": json.dumps({"protocol": "EIGRP 100", "nat_mode": "Overload"}),
            "last_observed_status": "OPERATIONAL",
            "verification_status": "CURRENT"
        },
        {
            "id": "r14_child_core",
            "name": "R14 (Child Core Router)",
            "hostname": "R14-CHILD-CORE",
            "device_type": "ROUTER",
            "hospital_id": "child",
            "ip_address": "10.255.0.22",
            "mac_address": "000D.C911.1401",
            "model": "Cisco 2911",
            "role": "Core Inter-VLAN Routing & DHCP",
            "routing_protocol": "EIGRP AS 100",
            "status": "OPERATIONAL",
            "source": "PACKET_TRACER",
            "interfaces_json": json.dumps([
                {"name": "Gi0/0", "ip_address": "10.255.0.22", "subnet_mask": "255.255.255.252", "status": "UP", "connected_to": "r13_child_edge", "link_type": "P2P"},
                {"name": "Gi0/1.500", "ip_address": "10.5.0.1", "subnet_mask": "255.255.255.192", "status": "UP", "connected_to": "sw_child_access", "link_type": "ROAS", "vlan_id": 500},
                {"name": "Gi0/1.510", "ip_address": "10.5.0.65", "subnet_mask": "255.255.255.224", "status": "UP", "connected_to": "sw_child_access", "link_type": "ROAS", "vlan_id": 510},
                {"name": "Gi0/1.520", "ip_address": "10.5.0.129", "subnet_mask": "255.255.255.224", "status": "UP", "connected_to": "sw_child_access", "link_type": "ROAS", "vlan_id": 520},
            ]),
            "connected_devices_json": json.dumps(["r13_child_edge", "sw_child_access"]),
            "vlans_json": json.dumps([500, 510, 520]),
            "routing_info_json": json.dumps({"protocol": "EIGRP 100", "inter_vlan": "802.1Q"}),
            "last_observed_status": "OPERATIONAL",
            "verification_status": "CURRENT"
        },
        {
            "id": "sw_child_access",
            "name": "Child Access Switch",
            "hostname": "SW-CHILD-ACCESS",
            "device_type": "SWITCH",
            "hospital_id": "child",
            "ip_address": "10.5.0.2",
            "mac_address": "000E.81FF.0101",
            "model": "Cisco 2960-24TT",
            "role": "Branch Access Switch",
            "routing_protocol": "Layer 2 Trunking",
            "status": "OPERATIONAL",
            "source": "PACKET_TRACER",
            "interfaces_json": json.dumps([
                {"name": "Gi0/1", "ip_address": None, "status": "UP", "connected_to": "r14_child_core", "link_type": "TRUNK"}
            ]),
            "connected_devices_json": json.dumps(["r14_child_core"]),
            "vlans_json": json.dumps([500, 510, 520]),
            "routing_info_json": json.dumps({"mode": "Layer 2 Access"}),
            "last_observed_status": "OPERATIONAL",
            "verification_status": "CURRENT"
        },
    ]

    for d in devices_data:
        db.add(DeviceModel(**d))

    # 4. Seed Alerts
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

    # 5. Seed Initial Activity Event Logs
    _seed_initial_events(db)

    # 6. Seed Initial Snapshot for Restart Recovery
    snapshot = NetworkSnapshotModel(
        timestamp=datetime.utcnow(),
        pt_running=True,
        pt_pid=15868,
        pkt_file_hash="dd922ea9357428a1...",
        pkt_file_size=208305,
        online_devices_count=20,
        devices_state_hash="init_state_hash",
        summary_json=json.dumps({"hospitals": 6, "devices": 24, "vlans": 19, "state": "INITIALIZED"})
    )
    db.add(snapshot)

    db.commit()

def _seed_initial_events(db: Session) -> None:
    now = datetime.utcnow()
    initial_events = [
        {
            "event_id": "EVT-SYS-BOOT",
            "timestamp": now - timedelta(minutes=45),
            "category": "INTEGRATION",
            "event_type": "SERVICE_INITIALIZATION",
            "severity": "INFO",
            "source": "PACKET_TRACER",
            "affected_device_id": "r0_isp",
            "hospital_id": "isp",
            "interface_name": "Gi0/0",
            "previous_state": "DOWN",
            "new_state": "UP",
            "description": "SmartCare NOC daemon attached to Cisco Packet Tracer 9.0.1. Port 39000 (Multiuser) listening.",
            "detection_method": "PROCESS_POLL",
            "verification_status": "VERIFIED",
            "metadata_json": json.dumps({"pt_version": "9.0.1", "port": 39000, "protocol": "TCP"})
        },
        {
            "event_id": "EVT-EIGRP-101",
            "timestamp": now - timedelta(minutes=30),
            "category": "ROUTING",
            "event_type": "NEIGHBOR_ADJACENCY",
            "severity": "INFO",
            "source": "PACKET_TRACER",
            "affected_device_id": "r1_hq_edge",
            "hospital_id": "hq",
            "interface_name": "Gi0/1",
            "previous_state": "INIT",
            "new_state": "ADJACENT",
            "description": "EIGRP AS 100 neighbor relationship established with R2-HQ-CORE (10.255.0.2).",
            "detection_method": "STATE_DIFF",
            "verification_status": "VERIFIED",
            "metadata_json": json.dumps({"as": 100, "peer": "10.255.0.2", "hold_time": 15})
        },
        {
            "event_id": "EVT-VLAN-20",
            "timestamp": now - timedelta(minutes=22),
            "category": "VLAN",
            "event_type": "TRUNK_VLAN_SYNC",
            "severity": "INFO",
            "source": "PACKET_TRACER",
            "affected_device_id": "r2_hq_core",
            "hospital_id": "hq",
            "interface_name": "Gi0/1.20",
            "previous_state": "DOWN",
            "new_state": "UP",
            "description": "VLAN 20 (DOCTORS_ICU, 10.0.1.64/26) sub-interface active with 802.1Q encapsulation.",
            "detection_method": "STATE_DIFF",
            "verification_status": "VERIFIED",
            "metadata_json": json.dumps({"vlan_id": 20, "gateway": "10.0.1.65", "dhcp_active": True})
        },
        {
            "event_id": "EVT-NAT-WARN",
            "timestamp": now - timedelta(minutes=15),
            "category": "CONFIGURATION",
            "event_type": "NAT_RULE_ENFORCEMENT",
            "severity": "INFO",
            "source": "PACKET_TRACER",
            "affected_device_id": "r4_diag_edge",
            "hospital_id": "diag",
            "interface_name": "Gi0/0",
            "previous_state": "STANDARD",
            "new_state": "ENFORCED",
            "description": "Extended ACL NAT_ACL excluding 10.0.0.0/8 verified on R4 WAN interface overload.",
            "detection_method": "STATE_DIFF",
            "verification_status": "VERIFIED",
            "metadata_json": json.dumps({"acl": "NAT_ACL", "excluded_dest": "10.0.0.0/8"})
        },
        {
            "event_id": "EVT-HOST-PROBE",
            "timestamp": now - timedelta(minutes=5),
            "category": "NETWORK_SERVICE",
            "event_type": "SERVICE_PROBE_ISOLATION",
            "severity": "WARNING",
            "source": "BACKEND_PROBE",
            "affected_device_id": "srv_dns",
            "hospital_id": "hq",
            "interface_name": "FastEthernet0",
            "previous_state": "UNKNOWN",
            "new_state": "ISOLATED",
            "description": "Host Windows probe to 10.0.1.162:53 unreachable. Internal DMZ server operates inside simulation canvas.",
            "detection_method": "PORT_PROBE",
            "verification_status": "INFERRED",
            "metadata_json": json.dumps({"target": "10.0.1.162:53", "note": "Host OS routing isolation"})
        }
    ]

    for ev in initial_events:
        db.add(EventLogModel(**ev))
    db.commit()
