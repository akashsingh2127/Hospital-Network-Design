# SmartCare Hospital Network System Architecture

## 1. System Overview

**SmartCare** is an enterprise-grade Network Operations Center (NOC) and Monitoring System built specifically for the multi-site Cisco Packet Tracer hospital infrastructure. The platform provides real-time visibility, topology mapping, departmental VLAN inventory, and hybrid telemetry across six specialized healthcare locations and a centralized ISP core.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SmartCare React Frontend                         │
│  (React 19 + TypeScript + Vite + Tailwind CSS + Lucide + Recharts)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST (/api/v1)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        SmartCare FastAPI Backend                       │
│  (FastAPI + Pydantic v2 + SQLAlchemy 2.0 + SQLite Persistence)          │
│                                                                        │
│  ┌────────────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │ PacketTracerIntegration│  │  NetworkProbe  │  │TelemetryFallback │  │
│  │ (Process, Ports, File) │  │  (Socket Probe)│  │ (Simulated Demo) │  │
│  └───────────┬────────────┘  └────────┬───────┘  └────────┬─────────┘  │
└──────────────┼────────────────────────┼───────────────────┼────────────┘
               │                        │                   │
               ▼                        ▼                   ▼
    ┌──────────────────────┐   ┌────────────────┐   ┌──────────────┐
    │ Cisco Packet Tracer  │   │  Local Network │   │ Synchronized │
    │ Process (PID 15868)  │   │  Stack Sockets │   │ Mathematical │
    │ Port 39000 (Multiuser│   │  (127.0.0.1)   │   │ Telemetry    │
    │ Port 8001 (HTTP auth)│   │                │   │ Model        │
    │ .pkt Hash Tracking   │   │                │   │              │
    └──────────────────────┘   └────────────────┘   └──────────────┘
```

---

## 2. Component Design

### 2.1 Frontend Architecture
- **Framework:** React 19 with Vite bundler.
- **Language:** TypeScript (`strict: true`, modular types).
- **Styling:** Tailwind CSS with custom enterprise dark navy color palette (`#0A0E17`, `#111827`, `#1E293B`).
- **State Management:** Reactive hooks with automatic 30-second interval polling and manual on-demand synchronization.
- **Component Hierarchy:**
  - `App.tsx`: Central coordinator managing active navigation tab and global sync.
  - `Sidebar.tsx`: Enterprise navigation separating active operations from future modules.
  - `Header.tsx`: Live time synchronization, integration health badge, and data-source indicator.
  - `OverviewStats.tsx`: High-level aggregated metric cards with source attribution.
  - `HospitalCardsGrid.tsx`: Six-site facility cards with interactive deep-dive modal (`HospitalDetailModal.tsx`).
  - `TopologyMap.tsx`: Hierarchical visual representation of ISP Core, Edge Routers, Core Routers, and RoAS VLAN trunks.
  - `NetworkHealthCard.tsx`: Recharts-based latency/reachability timeline and integration verification checklist.
  - `RecentAlertsCard.tsx`: Severity-categorized alert feed with live acknowledgment and source filters.
  - `NetworkServicesCard.tsx`: Real-time probe verification of HQ DMZ application servers (DNS, Web, FTP, Mail).

### 2.2 Backend Architecture
- **Framework:** FastAPI with asynchronous lifespan management.
- **Database:** SQLite with SQLAlchemy ORM (`Base`, `SessionLocal`, connection pooling).
- **Validation:** Pydantic v2 schemas (`BaseModel`, `ConfigDict(from_attributes=True)`).
- **Services Layer:**
  - `NetworkService`: Aggregates hospital inventory, device roles, VLAN mappings, and topology graphs.
  - `AlertService`: Ingestion, filtering, and acknowledgment of operational events.
- **API Endpoints:**
  - `GET /api/v1/health`: Basic service health check.
  - `GET /api/v1/dashboard/summary`: Consolidated NOC telemetry payload.
  - `GET /api/v1/hospitals`: Six hospital location models with nested VLANs and devices.
  - `GET /api/v1/devices`: Hardware inventory with role, model, and routing protocol.
  - `GET /api/v1/vlans`: 19 departmental VLANs with subnets, gateways, and usable host counts.
  - `GET /api/v1/network/health`: Aggregate health score and telemetry trend series.
  - `GET /api/v1/network/topology`: Hierarchical nodes and edges representing the network links.
  - `GET /api/v1/services`: Availability probe results for centralized DMZ services.
  - `GET /api/v1/alerts`: Event log feed with severity and acknowledgment statuses.
  - `POST /api/v1/integration/refresh`: On-demand re-probing of Packet Tracer processes and ports.

---

## 3. Data Source Attribution Model

To prevent misrepresenting simulated or unverified data, every metric, record, and card in the system is explicitly labeled with its authoritative source:

1. **`PACKET_TRACER`**:
   - Information verified directly from the running Cisco Packet Tracer environment:
     - Process execution (`PacketTracer.exe`, PID tracking).
     - Multiuser socket availability (`TCP port 39000`).
     - Local HTTP service (`TCP port 8001`).
     - Topology project file verification and SHA-256 integrity hash.
2. **`BACKEND_PROBE`**:
   - Information verified through active backend socket connections or host-level routing queries:
     - Local socket connectivity tests.
     - Direct loopback probes to DMZ service ports.
     - Honest reporting of unroutable internal subnets (e.g., `10.0.1.162` isolated inside the canvas).
3. **`SIMULATED`**:
   - Synthetic fallback demonstration data:
     - Historical latency and packet loss trends for chart visualization.
     - Demonstration network events (e.g., EIGRP neighbor hold-time flaps, NAT translation spikes).
   - Displayed with unambiguous yellow/amber badges and transparency notices.

---

## 4. Fallback Telemetry Design

When direct in-canvas packet metrics cannot be extracted through non-intrusive host APIs:
1. The backend automatically switches to `SIMULATED` fallback mode for metric trend series.
2. Live status for devices that cannot be confirmed via host routing is set to `UNVERIFIED` rather than falsely claiming `ONLINE`.
3. The frontend displays a persistent notice explaining that internal canvas subnets are isolated from the host Windows OS routing table.
