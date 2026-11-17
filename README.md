# 🏥 SmartCare — Hospital Network Management & Monitoring System

### Enterprise Network Operations Center (NOC) for Multi-Site Cisco Packet Tracer Infrastructure

[![Platform](https://img.shields.io/badge/Platform-Cisco%20Packet%20Tracer%209.0.1-blue)](https://www.netacad.com/courses/packet-tracer)
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20SQLAlchemy%20%7C%20SQLite-green)]()
[![Frontend](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite%20%7C%20Tailwind%20CSS-cyan)]()
[![Routing](https://img.shields.io/badge/Routing-EIGRP%20AS%20100-orange)]()
[![Tests](https://img.shields.io/badge/Tests-16%20Passed-brightgreen)]()

**SmartCare** is an enterprise network management and monitoring platform designed to interface directly with the **Smart Multi-Speciality Hospital Network** simulated in Cisco Packet Tracer. The system connects a Main Hospital Headquarters with five specialized branches through a hierarchical, VLSM-addressed, EIGRP-routed infrastructure.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Packet Tracer Integration & Provenance](#-packet-tracer-integration--provenance)
- [Network Architecture & Addressing Reference](#-network-architecture--addressing-reference)
- [Repository Structure](#-repository-structure)
- [Setup & Running Locally](#-setup--running-locally)
- [Testing & Quality Verification](#-testing--quality-verification)
- [Documentation Links](#-documentation-links)
- [Limitations & Roadmap](#-limitations--roadmap)

---

## 🎯 Project Overview

Modern multi-branch healthcare networks require reliable monitoring, structured VLAN segmentation, and real-time visibility. **SmartCare** provides a centralized Network Operations Center (NOC) dashboard for monitoring:

- **1 Main Hospital Headquarters (HQ)**
- **5 Specialized Branches:** Diagnostic Center, Emergency Clinic, Telemedicine, Maternity Hospital, and Children Care Hospital
- **1 Central ISP WAN Core:** Simulated ISP Router (R0) and 802.1Q WAN Aggregation Switch

The application dynamically detects the local **Cisco Packet Tracer 9.0.1** simulation process, verifies the integrity of the original `Computer Network Project.pkt` topology file, and maintains strict data provenance across verified and simulated telemetry.

---

## ✨ Key Features

- **Dark Enterprise NOC Dashboard:** Custom-tailored dark navy palette (`#0A0E17`, `#111827`, `#1E293B`) optimized for operations centers.
- **Tri-Tier Data Provenance:** Every metric, card, and device is explicitly attributed as `PACKET_TRACER`, `BACKEND_PROBE`, or `SIMULATED`.
- **Packet Tracer Integration Layer:** Probes `PacketTracer.exe` (PID detection), TCP Port 39000 (Multiuser Listener), TCP Port 8001 (HTTP Authentication), and `.pkt` file SHA-256 hash.
- **Six-Site Facility Cards:** Live status, subnet allocation, WAN IP, and router pairs with an interactive modal displaying complete VLAN allocations and usable host limits.
- **Hierarchical Network Topology Visualization:** Visual map showing ISP WAN Core (R0) &rarr; ISP Access Switch &rarr; 6 Edge Routers &rarr; 6 Core Routers &rarr; Access Switches &rarr; 19 Departmental VLANs.
- **Central DMZ Services Probing:** Live socket verification for DNS (`10.0.1.162`), HTTP (`10.0.1.163`), FTP (`10.0.1.164`), and SMTP/POP3 Mail (`10.0.1.165`).
- **Telemetry Trend Timeline:** Recharts latency and reachability series with prominent transparency notices.
- **Recent Operational Alerts:** Filterable incident log with severity badges and interactive acknowledgment.

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SmartCare React Frontend                         │
│   (React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST API (/api/v1)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        SmartCare FastAPI Backend                       │
│  (FastAPI, Pydantic v2, SQLAlchemy 2.0, SQLite Persistence)            │
│                                                                        │
│  ┌────────────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │ PacketTracerIntegration│  │  NetworkProbe  │  │TelemetryFallback │  │
│  │ (Process, Ports, Hash) │  │  (Socket Probe)│  │ (Simulated Demo) │  │
│  └───────────┬────────────┘  └────────┬───────┘  └────────┬─────────┘  │
└──────────────┼────────────────────────┼───────────────────┼────────────┘
               │                        │                   │
               ▼                        ▼                   ▼
    ┌──────────────────────┐   ┌────────────────┐   ┌──────────────┐
    │ Cisco Packet Tracer  │   │ Host Loopback  │   │ Synchronized │
    │ Process (v9.0.1)     │   │ Network Stack  │   │ Mathematical │
    │ Ports 39000 & 8001   │   │ Sockets        │   │ Telemetry    │
    │ Non-destructive Hash │   │                │   │ Model        │
    └──────────────────────┘   └────────────────┘   └──────────────┘
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite 8
- **Language:** TypeScript 5.8 (Strict Typing)
- **Styling:** Tailwind CSS 3.4
- **Icons:** Lucide React
- **Data Visualization:** Recharts 3

### Backend
- **Framework:** FastAPI 0.135
- **Server:** Uvicorn (ASGI)
- **Database:** SQLite with SQLAlchemy 2.0 ORM
- **Validation:** Pydantic v2
- **Process & Socket Inspection:** psutil 7.2 & Python `socket`
- **Testing:** Pytest 9.1 with HTTPX

---

## 🔌 Packet Tracer Integration & Provenance

### Investigated Capabilities in Cisco Packet Tracer 9.0.1:
1. **Multiuser Port (TCP 39000):** Listening and accepting local TCP handshakes.
2. **Local HTTP Port (TCP 8001):** Responding with HTTP 200 OK (Packet Tracer local web service).
3. **Topology File (.pkt):** `Computer Network Project.pkt` (208,305 bytes) verified on disk.
4. **Safety Guarantee:** The original `.pkt` file is **never modified or damaged**.

### Provenance Attribution Labels:
- `PACKET_TRACER`: Data verified directly from Packet Tracer process, ports, or file integrity.
- `BACKEND_PROBE`: Data tested via active host TCP/UDP socket checks.
- `SIMULATED`: Fallback baseline telemetry for charts and demonstration alerts.

---

## 🌐 Network Architecture & Addressing Reference

### Site-Level Allocation
| Site | Code | Network Block | Edge Router | Core Router | WAN Interface | VLAN IDs |
|---|---|---|---|---|---|---|
| Main Hospital HQ | `HQ-MAIN` | `10.0.0.0/22` | R1 | R2 | `200.1.1.2/30` | 10, 20, 30, 50 |
| Diagnostic Center | `BR-DIAG` | `10.1.0.0/24` | R4 | R5 | `200.1.1.6/30` | 100, 110, 120 |
| Emergency Clinic | `BR-EMER` | `10.2.0.0/24` | R6 | R7 | `200.1.1.10/30` | 200, 210, 220 |
| Telemedicine Branch | `BR-TELE` | `10.3.0.0/24` | R9 | R10 | `200.1.1.14/30` | 300, 310, 320 |
| Maternity Hospital | `BR-MAT` | `10.4.0.0/24` | R11 | R12 | `200.1.1.18/30` | 400, 410, 420 |
| Children Care Hospital | `BR-CHILD` | `10.5.0.0/24` | R13 | R14 | `200.1.1.22/30` | 500, 510, 520 |

### Departmental VLANs (19 Segments)
- **HQ:** VLAN 10 (DMZ, 10.0.1.160/28), VLAN 20 (Doctors/ICU, 10.0.1.64/26), VLAN 30 (Billing/Admin, 10.0.1.0/26), VLAN 50 (Guest WiFi, 10.0.0.0/24).
- **Diagnostic:** VLAN 100 (Lab, 10.1.0.0/26), VLAN 110 (Admin, 10.1.0.64/27), VLAN 120 (Staff, 10.1.0.96/28).
- **Emergency:** VLAN 200 (Emergency, 10.2.0.0/26), VLAN 210 (Admin, 10.2.0.64/27), VLAN 220 (IP Phone, 10.2.0.96/28).
- **Telemedicine:** VLAN 300 (Consultation, 10.3.0.0/26), VLAN 310 (Admin, 10.3.0.64/27), VLAN 320 (WiFi, 10.3.0.128/27).
- **Maternity:** VLAN 400 (Maternity, 10.4.0.0/26), VLAN 410 (Admin, 10.4.0.64/27), VLAN 420 (WiFi, 10.4.0.128/27).
- **Children Care:** VLAN 500 (Children, 10.5.0.0/26), VLAN 510 (Admin, 10.5.0.64/27), VLAN 520 (WiFi, 10.5.0.128/27).

---

## 📁 Repository Structure

```
Hospital_Network_Design/
├── README.md                                  ← Comprehensive documentation & project guide
├── docs/
│   ├── architecture.md                        ← Detailed system architecture & design
│   ├── network-inventory.md                   ← Hardware inventory, VLANs, & IP breakdown
│   ├── packet-tracer-integration.md           ← Integration analysis, ports, & limitations
│   └── development-status.md                  ← Phase deliverables & roadmap
├── backend/
│   ├── requirements.txt                       ← Python dependencies
│   ├── .env.example                           ← Backend environment configuration template
│   ├── app/
│   │   ├── main.py                            ← FastAPI entrypoint & lifespan
│   │   ├── core/config.py                     ← Settings & CORS configuration
│   │   ├── database/                          ← SQLite session & init seed
│   │   ├── models/network.py                  ← SQLAlchemy ORM models
│   │   ├── schemas/network.py                 ← Pydantic schemas & enums
│   │   ├── services/                          ← Business logic (Network & Alert services)
│   │   ├── integrations/                      ← PT integration, probes, & fallback
│   │   └── api/                               ← REST API v1 endpoints
│   └── tests/                                 ← Pytest test suite (16 tests)
└── frontend/
    ├── package.json                           ← Node dependencies & scripts
    ├── vite.config.ts                         ← Vite dev server & API proxy
    ├── tailwind.config.js                     ← Enterprise dark theme styling
    ├── .env.example                           ← Frontend environment configuration template
    └── src/
        ├── types/network.ts                   ← TypeScript interfaces
        ├── services/api.ts                    ← Centralized API client
        ├── components/
        │   ├── common/                        ← Badges, Card, Spinner, ErrorBanner
        │   ├── layout/                        ← Sidebar & Header
        │   └── dashboard/                     ← OverviewStats, HospitalCards, TopologyMap, Health, Alerts, Services
        ├── pages/DashboardPage.tsx            ← Consolidated dashboard page
        └── App.tsx                            ← Main layout & auto-refresh polling
```

---

## 🚀 Setup & Running Locally

### Prerequisites
- Python 3.10+ (Tested on Python 3.13)
- Node.js 18+ (Tested on Node.js v22)
- Cisco Packet Tracer (v9.0.1 recommended, open with `Computer Network Project.pkt`)

### 1. Start the Backend
Open a terminal in the project directory:

```powershell
# Navigate to workspace
cd "c:\Users\Akash Singh\Desktop\Hospital_Network_Design"

# Install backend dependencies (if needed)
python -m pip install -r backend/requirements.txt

# Run the FastAPI server
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API will be available at:
- **API Root:** `http://127.0.0.1:8000/api/v1`
- **Interactive Swagger Docs:** `http://127.0.0.1:8000/docs`

### 2. Start the Frontend
Open a second terminal:

```powershell
# Navigate to frontend
cd "c:\Users\Akash Singh\Desktop\Hospital_Network_Design\frontend"

# Start the Vite development server
npm run dev
```
Open your browser to:
- **Dashboard UI:** `http://localhost:5173`

---

## 🧪 Testing & Quality Verification

### Run Backend Tests
Execute the full test suite with Pytest:

```powershell
python -m pytest backend/tests -v
```
**Results:** `16 passed` covering health check, dashboard summary, hospital detail, device filtering, VLAN schemas, integration status, DMZ services, and topology.

### Run Frontend Typecheck & Build
Validate TypeScript and execute production bundle build:

```powershell
cd frontend
npm run build
```
**Results:** Clean build (`dist/assets/index-*.js`, `dist/assets/index-*.css`) with zero compilation errors.

---

## 📚 Documentation Links

- **[System Architecture](file:///c:/Users/Akash%20Singh/Desktop/Hospital_Network_Design/docs/architecture.md)**
- **[Network Inventory & Addressing](file:///c:/Users/Akash%20Singh/Desktop/Hospital_Network_Design/docs/network-inventory.md)**
- **[Packet Tracer Integration Details](file:///c:/Users/Akash%20Singh/Desktop/Hospital_Network_Design/docs/packet-tracer-integration.md)**
- **[Development Status & Next Phase](file:///c:/Users/Akash%20Singh/Desktop/Hospital_Network_Design/docs/development-status.md)**

---

## ⚠️ Limitations & Roadmap

- **Simulated Canvas Namespace:** The internal subnets (`10.0.0.0/8`) exist inside Packet Tracer's virtual memory canvas. The Windows host OS cannot route packets directly into the canvas without an external TAP bridge; these endpoints are accurately designated as `UNVERIFIED`.
- **Phase 1 Boundary:** Login authentication and other sub-pages are preserved as future placeholders according to the project implementation guidelines.
