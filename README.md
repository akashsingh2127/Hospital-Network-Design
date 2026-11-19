# 🏥 SmartCare — Hospital Network Management & Monitoring System

### Enterprise Network Operations Center (NOC) for Multi-Site Cisco Packet Tracer Infrastructure

[![Platform](https://img.shields.io/badge/Platform-Cisco%20Packet%20Tracer%209.0.1-blue)](https://www.netacad.com/courses/packet-tracer)
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20SQLAlchemy%20%7C%20SQLite-green)]()
[![Frontend](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite%20%7C%20Tailwind%20CSS-cyan)]()
[![Routing](https://img.shields.io/badge/Routing-EIGRP%20AS%20100-orange)]()
[![WebSockets](https://img.shields.io/badge/WebSockets-Live%20Sync-purple)]()
[![Tests](https://img.shields.io/badge/Tests-26%20Passed-brightgreen)]()

**SmartCare** is an interactive enterprise network management and monitoring platform designed to interface directly with the **Smart Multi-Speciality Hospital Network** simulated in Cisco Packet Tracer. The system connects a Main Hospital Headquarters with five specialized branches through a hierarchical, VLSM-addressed, EIGRP-routed infrastructure.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Packet Tracer Synchronization Engine](#-packet-tracer-synchronization-engine)
- [Interactive Dashboard Sections](#-interactive-dashboard-sections)
- [Technology Stack](#-technology-stack)
- [Network Architecture & Addressing Reference](#-network-architecture--addressing-reference)
- [Setup & Running Locally](#-setup--running-locally)
- [Testing & Quality Verification](#-testing--quality-verification)
- [Documentation Links](#-documentation-links)

---

## 🎯 Project Overview

Modern multi-branch healthcare networks require reliable monitoring, structured VLAN segmentation, and real-time visibility. **SmartCare** provides a centralized Network Operations Center (NOC) dashboard for monitoring:

- **1 Main Hospital Headquarters (HQ)**
- **5 Specialized Branches:** Diagnostic Center, Emergency Clinic, Telemedicine, Maternity Hospital, and Children Care Hospital
- **1 Central ISP WAN Core:** Simulated ISP Router (R0) and 802.1Q WAN Aggregation Switch

The application dynamically detects the local **Cisco Packet Tracer 9.0.1** simulation process, verifies the integrity of the original `Computer Network Project.pkt` topology file, streams live state updates over **WebSockets**, and maintains strict data provenance across verified and simulated telemetry.

---

## ✨ Key Features

- **Dark Enterprise NOC Dashboard:** Custom-tailored dark navy palette (`#0A0E17`, `#111827`, `#1E293B`) optimized for operations centers.
- **Tri-Tier Data Provenance:** Every metric, card, and device is explicitly attributed as `PACKET_TRACER`, `BACKEND_PROBE`, or `SIMULATED`. Never claims unverified connections are online.
- **Real-Time Packet Tracer Synchronization:** Background polling worker inspecting process state, TCP ports 39000 & 8001, `.pkt` file SHA-256 hash, and file modification time (`mtime`), pushing updates over WebSockets (`/api/v1/ws`) with zero manual page refreshes required.
- **Interactive Device Inspector Modal (`DeviceDetailModal`):** Every router, switch, and server is clickable. Displays hostname, MAC address, operational interfaces (status, IP, connected peer, link type, VLAN), routing protocol configuration (EIGRP AS 100), and related recent events.
- **Interactive Event Inspector Modal (`EventDetailModal`):** Full inspection of recorded events, showing severity, detection method, verification status, affected device, and formatted JSON metadata.
- **Interactive Network Topology Map:** Visual hierarchical view with clickable router/switch/server nodes and operational link badges, plus an all-node graph grid.
- **Complete Device Inventory (`DeviceMonitoringSection`):** Searchable and filterable device inventory table with filters for online/offline/unverified, hospital location, and device type.
- **Complete 19 VLANs Table (`VlanIpSection`):** Searchable table showing all 19 departmental VLANs, CIDR subnets, default gateways, and usable host limits.
- **Structured Activity Logs (`ActivityLogsSection`):** Forensic event log stream persisted in SQLite with category, severity, and location filters, plus live WebSocket event prepending.
- **Restart Recovery & State Persistence:** On server boot, compares current Packet Tracer state against persisted snapshots (`network_snapshots`), detects offline file modifications, and restores state seamlessly.

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SmartCare React Frontend                         │
│   (React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts)   │
└──────────────────┬──────────────────────────────────▲──────────────────┘
                   │ HTTP / REST API (/api/v1)        │ WebSockets (/api/v1/ws)
                   ▼                                  │
┌─────────────────────────────────────────────────────┴──────────────────┐
│                        SmartCare FastAPI Backend                       │
│  (FastAPI, Pydantic v2, SQLAlchemy 2.0, SQLite Persistence)            │
│                                                                        │
│  ┌────────────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │ PacketTracerIntegration│  │  SyncService   │  │  NetworkProbe    │  │
│  │ (Process, Ports, Hash) │  │  (WS / Diff)   │  │  (Socket Probe)  │  │
│  └───────────┬────────────┘  └────────┬───────┘  └────────┬─────────┘  │
└──────────────┼────────────────────────┼───────────────────┼────────────┘
               │                        │                   │
               ▼                        ▼                   ▼
    ┌──────────────────────┐   ┌────────────────┐   ┌──────────────┐
    │ Cisco Packet Tracer  │   │ SQLite Storage │   │ Host Network │
    │ Process (v9.0.1)     │   │ (smartcare.db) │   │ Stack        │
    │ Ports 39000 & 8001   │   │ Event Logs &   │   │ Sockets      │
    │ Non-destructive Hash │   │ Snapshots      │   │              │
    └──────────────────────┘   └────────────────┘   └──────────────┘
```

---

## 🔄 Packet Tracer Synchronization Engine

SmartCare utilizes a multi-layered detection and synchronization pipeline:

1. **Process & Thread Detection:** Uses OS APIs to inspect `PacketTracer.exe` (PID verification, CPU state, command-line arguments).
2. **IPC & Multiuser Port Probing:** Probes TCP Port 39000 (Multiuser Listener) and TCP Port 8001 (Embedded Web/Auth Server) to assess simulation canvas readiness.
3. **Non-Destructive File Fingerprinting:** Computes SHA-256 hash and checks `os.path.getmtime` of `Computer Network Project.pkt`. Detects when the user saves or modifies the topology in Cisco Packet Tracer without modifying the original file.
4. **State Diff & Event Emission:** When a change is detected, `SyncService` diffs the current state against the previous snapshot, emits structured `EventLog` records into SQLite (`event_logs`), and broadcasts `NETWORK_STATE_CHANGED` messages over `/api/v1/ws`.
5. **Startup Recovery:** On backend launch, inspects previous `NetworkSnapshotModel` entries to detect offline changes made while SmartCare was stopped.

---

## 🖥️ Interactive Dashboard Sections

The dashboard is organized into 9 fully functional sections (0 placeholders):

| Section | Description | Key Interactions |
| :--- | :--- | :--- |
| **Network Overview** | Executive summary cards, hospital grid, topology preview, and health status | Metric cards clickable to filter device inventory or jump to sections |
| **Hospital Locations** | Detailed cards for HQ and 5 branches | Click any hospital card to inspect VLAN and device allocations |
| **Network Topology** | Hierarchical view of ISP, Edge, Core, and Access Switches | Click any router/switch/server node to open `DeviceDetailModal` |
| **Device Monitoring** | Complete 24-device inventory table | Search by name, hostname, IP; filter by status (Online, Unverified, Offline) |
| **VLAN & IP Information**| All 19 hospital VLANs with subnets & gateways | Filter by hospital location; search by department or usable host count |
| **Network Health** | Latency, packet loss gauges, and Recharts telemetry history | Host & Packet Tracer verification checklists |
| **Network Services** | DMZ DNS, Web, FTP, and Email service availability | Live socket status and honest connectivity notes |
| **Alerts & Incidents** | Active operational incidents and traps | Filter by source; click device tag or acknowledge button |
| **Activity Logs** | Forensic audit trail of network events | Filter by category, severity, hospital; search; click to view `EventDetailModal` |

---

## ⚙️ Setup & Running Locally

### Prerequisites
- Python 3.10+ (Python 3.13 tested)
- Node.js 18+ (Node.js 22 tested) and npm
- Cisco Packet Tracer 9.0.1 running with `Computer Network Project.pkt` open

### 1. Start the FastAPI Backend
```powershell
# Navigate to the workspace root
cd "c:\Users\Akash Singh\Desktop\Hospital_Network_Design"

# Run Uvicorn backend server
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend will be available at:
- **REST API:** `http://localhost:8000/api/v1`
- **Swagger Documentation:** `http://localhost:8000/docs`
- **WebSockets Endpoint:** `ws://localhost:8000/api/v1/ws`

### 2. Start the React Frontend
```powershell
# Navigate to frontend directory
cd "c:\Users\Akash Singh\Desktop\Hospital_Network_Design\frontend"

# Start Vite development server
npm run dev
```
The frontend dashboard will be available at:
- **URL:** `http://localhost:5173`

---

## 🧪 Testing & Quality Verification

SmartCare includes an automated Pytest test suite covering REST endpoints, device detail schemas, status filters, event log searches, topology node mappings, startup recovery, and state fingerprinting.

```powershell
# Run backend tests
python -m pytest backend/tests -v
```
**Outcome:** 26 passed, 100% green.

```powershell
# Run frontend TypeScript validation & production build
npm --prefix frontend run build
```
**Outcome:** Zero TypeScript errors, production bundle compiled cleanly.

---

## 📚 Documentation Links

- [System Architecture Guide](file:///c:/Users/Akash%20Singh/Desktop/Hospital_Network_Design/docs/architecture.md)
- [Packet Tracer Integration Protocol](file:///c:/Users/Akash%20Singh/Desktop/Hospital_Network_Design/docs/packet-tracer-integration.md)
- [Development Status & Roadmap](file:///c:/Users/Akash%20Singh/Desktop/Hospital_Network_Design/docs/development-status.md)
