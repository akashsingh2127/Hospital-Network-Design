# Hospital Network Inventory & Addressing Reference

This document catalogs the verified networking infrastructure of the **Smart Multi-Speciality Hospital Network**, distinguishing between information directly verified via Packet Tracer runtime inspection and architecture documented in the design blueprints.

---

## 1. Multi-Site Facility Overview

| Hospital ID | Facility Name | Code | Subnet Block | Edge Router | Core Router | WAN Link (ISP ↔ Edge) | Inter-Router Link (Edge ↔ Core) | VLAN Count | Device Count |
|---|---|---|---|---|---|---|---|---|---|
| `hq` | Main Hospital Headquarters | `HQ-MAIN` | `10.0.0.0/22` | R1 | R2 | `200.1.1.2/30` | `10.255.0.1/30` | 4 | 6 |
| `diag` | Diagnostic Center | `BR-DIAG` | `10.1.0.0/24` | R4 | R5 | `200.1.1.6/30` | `10.255.0.5/30` | 3 | 3 |
| `emer` | Emergency Clinic | `BR-EMER` | `10.2.0.0/24` | R6 | R7 | `200.1.1.10/30` | `10.255.0.9/30` | 3 | 3 |
| `tele` | Telemedicine Branch | `BR-TELE` | `10.3.0.0/24` | R9 | R10 | `200.1.1.14/30` | `10.255.0.13/30` | 3 | 3 |
| `mat` | Maternity Hospital | `BR-MAT` | `10.4.0.0/24` | R11 | R12 | `200.1.1.18/30` | `10.255.0.17/30` | 3 | 3 |
| `child` | Children Care Hospital | `BR-CHILD` | `10.5.0.0/24` | R13 | R14 | `200.1.1.22/30` | `10.255.0.21/30` | 3 | 3 |

---

## 2. WAN & Core Infrastructure Devices

| Device ID | Device Name | Type | Model | Role | Management / Interface IP | Routing / Encapsulation | Provenance |
|---|---|---|---|---|---|---|---|
| `r0_isp` | R0 (ISP Router) | ROUTER | Cisco 2911 | WAN Aggregation Gateway | `200.1.1.1/24` (Gi0/0 sub-interfaces) | EIGRP AS 100 | Verified / Blueprint |
| `sw0_isp` | ISP Access Switch | SWITCH | Cisco 2960 | 802.1Q WAN Trunk Aggregation | `200.1.1.254` | 802.1Q Trunk (6 WAN VLANs) | Verified / Blueprint |
| `r1_hq_edge` | R1 (HQ Edge Router) | ROUTER | Cisco 2911 | Edge Boundary / NAT / PAT | `200.1.1.2/30` (WAN), `10.255.0.1/30` | EIGRP AS 100 + NAT Overload | Verified / Blueprint |
| `r2_hq_core` | R2 (HQ Core Router) | ROUTER | Cisco 2911 | Core Inter-VLAN Routing & DHCP | `10.255.0.2/30` (P2P), RoAS Sub-interfaces | EIGRP AS 100 + RoAS (802.1Q) | Verified / Blueprint |
| `sw_hq_access` | HQ Access Switch | SWITCH | Cisco 2960 | Department L2 Switching | `10.0.1.2` | 802.1Q Trunk to R2 | Verified / Blueprint |
| `r4_diag_edge` | R4 (Diag Edge Router) | ROUTER | Cisco 2911 | Edge Boundary / NAT / PAT | `200.1.1.6/30` (WAN), `10.255.0.5/30` | EIGRP AS 100 + NAT Overload | Verified / Blueprint |
| `r5_diag_core` | R5 (Diag Core Router) | ROUTER | Cisco 2911 | Core Inter-VLAN Routing & DHCP | `10.255.0.6/30` (P2P), RoAS Sub-interfaces | EIGRP AS 100 + RoAS (802.1Q) | Verified / Blueprint |
| `sw_diag_access`| Diag Access Switch | SWITCH | Cisco 2960 | Branch L2 Switching | `10.1.0.2` | 802.1Q Trunk to R5 | Verified / Blueprint |
| `r6_emer_edge` | R6 (Emer Edge Router) | ROUTER | Cisco 2911 | Edge Boundary / NAT / PAT | `200.1.1.10/30` (WAN), `10.255.0.9/30` | EIGRP AS 100 + NAT Overload | Verified / Blueprint |
| `r7_emer_core` | R7 (Emer Core Router) | ROUTER | Cisco 2911 | Core Inter-VLAN Routing & DHCP | `10.255.0.10/30` (P2P), RoAS Sub-interfaces | EIGRP AS 100 + RoAS (802.1Q) | Verified / Blueprint |
| `sw_emer_access`| Emer Access Switch | SWITCH | Cisco 2960 | Branch L2 Switching | `10.2.0.2` | 802.1Q Trunk to R7 | Verified / Blueprint |
| `r9_tele_edge` | R9 (Tele Edge Router) | ROUTER | Cisco 2911 | Edge Boundary / NAT / PAT | `200.1.1.14/30` (WAN), `10.255.0.13/30` | EIGRP AS 100 + NAT Overload | Verified / Blueprint |
| `r10_tele_core`| R10 (Tele Core Router)| ROUTER | Cisco 2911 | Core Inter-VLAN Routing & DHCP | `10.255.0.14/30` (P2P), RoAS Sub-interfaces | EIGRP AS 100 + RoAS (802.1Q) | Verified / Blueprint |
| `sw_tele_access`| Tele Access Switch | SWITCH | Cisco 2960 | Branch L2 Switching | `10.3.0.2` | 802.1Q Trunk to R10 | Verified / Blueprint |
| `r11_mat_edge` | R11 (Mat Edge Router) | ROUTER | Cisco 2911 | Edge Boundary / NAT / PAT | `200.1.1.18/30` (WAN), `10.255.0.17/30` | EIGRP AS 100 + NAT Overload | Verified / Blueprint |
| `r12_mat_core` | R12 (Mat Core Router) | ROUTER | Cisco 2911 | Core Inter-VLAN Routing & DHCP | `10.255.0.18/30` (P2P), RoAS Sub-interfaces | EIGRP AS 100 + RoAS (802.1Q) | Verified / Blueprint |
| `sw_mat_access` | Mat Access Switch | SWITCH | Cisco 2960 | Branch L2 Switching | `10.4.0.2` | 802.1Q Trunk to R12 | Verified / Blueprint |
| `r13_child_edge`| R13 (Child Edge Router)| ROUTER | Cisco 2911 | Edge Boundary / NAT / PAT | `200.1.1.22/30` (WAN), `10.255.0.21/30` | EIGRP AS 100 + NAT Overload | Verified / Blueprint |
| `r14_child_core`| R14 (Child Core Router)| ROUTER | Cisco 2911 | Core Inter-VLAN Routing & DHCP | `10.255.0.22/30` (P2P), RoAS Sub-interfaces | EIGRP AS 100 + RoAS (802.1Q) | Verified / Blueprint |
| `sw_child_access`| Child Access Switch | SWITCH | Cisco 2960 | Branch L2 Switching | `10.5.0.2` | 802.1Q Trunk to R14 | Verified / Blueprint |

---

## 3. Departmental VLAN Segmentation (19 VLANs)

| Site | VLAN ID | Department Name | Subnet | Prefix | Gateway | Usable Hosts | Description |
|---|---|---|---|---|---|---|---|
| **HQ** | 10 | `DMZ` | `10.0.1.160` | `/28` | `10.0.1.161` | 14 | Central Server Farm (DNS, Web, FTP, Mail) |
| **HQ** | 20 | `DOCTORS_ICU` | `10.0.1.64` | `/26` | `10.0.1.65` | 62 | ICU Patient Monitors & Doctor Workstations |
| **HQ** | 30 | `BILLING_ADMIN` | `10.0.1.0` | `/26` | `10.0.1.1` | 62 | Hospital Billing & Executive Administration |
| **HQ** | 50 | `GUEST_WIFI` | `10.0.0.0` | `/24` | `10.0.0.1` | 254 | Public Visitor Wireless (ACL Isolated) |
| **Diagnostic** | 100 | `LAB` | `10.1.0.0` | `/26` | `10.1.0.1` | 62 | Pathology & Automated Analyzer Equipment |
| **Diagnostic** | 110 | `ADMIN` | `10.1.0.64` | `/27` | `10.1.0.65` | 30 | Diagnostic Facility Administration |
| **Diagnostic** | 120 | `STAFF` | `10.1.0.96` | `/28` | `10.1.0.97` | 14 | Medical Staff Desktops & Printers |
| **Emergency** | 200 | `EMERGENCY` | `10.2.0.0` | `/26` | `10.2.0.1` | 62 | Triage Bays & Trauma Resuscitation |
| **Emergency** | 210 | `ADMIN` | `10.2.0.64` | `/27` | `10.2.0.65` | 30 | Reception, Dispatch & Registration |
| **Emergency** | 220 | `IP_PHONE` | `10.2.0.96` | `/28` | `10.2.0.97` | 14 | Voice Telephony Priority Segment |
| **Telemedicine**| 300 | `CONSULTATION` | `10.3.0.0` | `/26` | `10.3.0.1` | 62 | High-Definition Video Tele-health Suites |
| **Telemedicine**| 310 | `ADMIN` | `10.3.0.64` | `/27` | `10.3.0.65` | 30 | Appointment Scheduling & Tele-records |
| **Telemedicine**| 320 | `WIFI` | `10.3.0.128` | `/27` | `10.3.0.129` | 30 | Telemedicine Branch Wireless Access |
| **Maternity** | 400 | `MATERNITY` | `10.4.0.0` | `/26` | `10.4.0.1` | 62 | Labor, Delivery & Neonatal Monitoring |
| **Maternity** | 410 | `ADMIN` | `10.4.0.64` | `/27` | `10.4.0.65` | 30 | Maternity Admissions & Patient Records |
| **Maternity** | 420 | `WIFI` | `10.4.0.128` | `/27` | `10.4.0.129` | 30 | Patient & Family Wireless Coverage |
| **Children** | 500 | `CHILDREN` | `10.5.0.0` | `/26` | `10.5.0.1` | 62 | Pediatric Inpatient & Critical Pediatric Care |
| **Children** | 510 | `ADMIN` | `10.5.0.64` | `/27` | `10.5.0.65` | 30 | Pediatric Clinic Records & Billing |
| **Children** | 520 | `WIFI` | `10.5.0.128` | `/27` | `10.5.0.129` | 30 | Family Wireless Network |

---

## 4. Centralized DMZ Application Services (HQ VLAN 10)

| Service ID | Service Name | Protocol | Port | IP Address | Hostname / FQDN | Probe Result |
|---|---|---|---|---|---|---|
| `srv_dns` | Hospital DNS Server | UDP/TCP | 53 | `10.0.1.162` | `dns.hospital.com` | `UNVERIFIED` (Isolated simulation canvas) |
| `srv_http`| Hospital Web Portal | TCP | 80 | `10.0.1.163` | `portal.hospital.com` | `UNVERIFIED` (Isolated simulation canvas) |
| `srv_ftp` | Medical Reports FTP | TCP | 21 | `10.0.1.164` | `ftp.hospital.com` | `UNVERIFIED` (Isolated simulation canvas) |
| `srv_mail`| Hospital Mail Server | SMTP/POP3 | 25 | `10.0.1.165` | `mail.hospital.com` | `UNVERIFIED` (Isolated simulation canvas) |
