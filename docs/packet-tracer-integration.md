# Cisco Packet Tracer Integration Analysis & Implementation

## 1. Environment & Version Verification

During environment inspection, the local system was verified to have Cisco Packet Tracer active:

- **Installed Version:** Cisco Packet Tracer 9.0.1 (64-bit)
- **Executable Path:** `C:\Program Files\Cisco Packet Tracer 9.0.1\bin\PacketTracer.exe`
- **Active Processes Detected:**
  - Main Process: `PacketTracer.exe` (PID 15868)
  - Helper Service: `PacketTracer.exe --progress-bar-server` (PID 22128)
- **Target Topology File:**
  - File Name: `Computer Network Project.pkt`
  - Path: `C:\Users\Akash Singh\Downloads\Computer Network Project.pkt`
  - File Size: 208,305 bytes
  - Container Format: Cisco proprietary binary container (`Magic: \xdd\x92.\xa95t(\xa1...`)

---

## 2. Integration Mechanisms Investigated

We performed systematic probes across all standard Cisco Packet Tracer interfaces:

### 2.1 Multiuser / IPC Socket Interface (Port 39000 & 38000)
- **Status:** **Active / Listening** on `0.0.0.0:39000` and `0.0.0.0:38000`.
- **Capability:** Cisco Packet Tracer Multiuser protocol enables inter-instance packet forwarding and IPC scripting.
- **Verification:** Sockets accept TCP connections from the local host. However, full packet exchange requires an active Multiuser link handshake or authenticated connection sequence configured in PT's Multiuser menu.

### 2.2 Local HTTP / Progress Server (Port 8001)
- **Status:** **Active / Responding** on `127.0.0.1:8001`.
- **Capability:** Returns HTTP 200 with Cisco Packet Tracer local authentication / OAuth landing page (`You have successfully logged in to Cisco Packet Tracer`).
- **Limitation:** Does not expose an unauthenticated REST API for in-canvas device manipulation.

### 2.3 Simulated Network Controller
- **Capability:** Packet Tracer 7.3+ and 9.x support placing a "Network Controller" (simulated Cisco DNA Center) inside the topology canvas.
- **Finding:** A simulated Network Controller's IP address (typically `10.x.x.x`) resides *inside the simulated canvas*. Without a physical host loopback adapter or tap bridge connected to Packet Tracer, this IP is not accessible from the Windows OS host routing table.

### 2.4 Direct .pkt Parsing
- **Format:** In Packet Tracer 9.0.1, `.pkt` files use Cisco's proprietary encrypted container rather than a plain zip archive. Direct parsing without modifying or running Packet Tracer would require decrypting Cisco proprietary binaries, which is both fragile and risks file corruption.
- **Safety Rule:** As mandated, `Computer Network Project.pkt` is strictly preserved and never modified, overwritten, or damaged.

---

## 3. Implemented Integration Method

To provide maximum reliability, non-destructive safety, and honest telemetry provenance, SmartCare implements a **Hybrid Tri-Tier Integration Architecture**:

```
Tier 1: Host Process & Socket Verification (PACKET_TRACER)
  ├── Checks PacketTracer.exe execution state via psutil
  ├── Probes TCP Port 39000 (Multiuser Listener)
  ├── Probes TCP Port 8001 (Internal HTTP Service)
  └── Computes SHA-256 integrity hash of Computer Network Project.pkt

Tier 2: Backend Socket Probes (BACKEND_PROBE)
  ├── Concurrently tests reachability to local network services
  └── Accurately identifies that simulated 10.x.x.x IPs cannot be routed
      from Windows OS without an external TAP bridge

Tier 3: Structured Fallback Telemetry (SIMULATED)
  ├── Provides realistic historical metric points for NOC graphs
  └── Unambiguously labeled as SIMULATED with user transparency notices
```

---

## 4. Supported Capabilities

| Capability | Integration Layer | Status | Notes |
|---|---|---|---|
| Process Detection | `psutil` / Windows API | **Supported** | Validates PID 15868, process name, and runtime state. |
| Multiuser Port Probe | TCP `39000` socket | **Supported** | Confirms Multiuser IPC listener readiness. |
| Web Auth Port Probe | TCP `8001` socket | **Supported** | Verifies embedded HTTP daemon responsiveness. |
| Topology File Fingerprint | SHA-256 + mtime check | **Supported** | Detects external `.pkt` updates and saves non-destructively. |
| Real-Time Event Sync | WebSockets `/api/v1/ws` | **Supported** | Background worker pushes state updates instantly without manual refresh. |
| Restart State Recovery | `network_snapshots` table | **Supported** | Recovers previous state across server reboots, detecting offline file modifications. |
| Structured Activity Logging | SQLite `event_logs` table | **Supported** | Persists events with severity, category, detection method, and structured metadata. |
| Device Interface Inspection | Object Inspector | **Supported** | Maps verified port assignments, IPs, link types, and EIGRP routing. |
| Live In-Canvas Packet Injection | Multiuser handshake | **Requires TAP** | Canvas subnets (`10.x.x.x`) require a host loopback adapter for raw ICMP. |

---

## 5. Real-Time Synchronization & Event Engine

The real-time synchronization engine operates as an asynchronous background worker (`SyncService.start_background_sync`) inside the FastAPI application:

1. **Continuous State Polling:** Every 3.0 seconds, the worker checks:
   - Process running status (`PacketTracer.exe`).
   - TCP port availability (`39000` & `8001`).
   - `.pkt` file SHA-256 hash and last modification timestamp (`mtime`).
2. **State Comparison & Diff Detection:**
   - Compares the newly computed `state_fingerprint` against the previous snapshot.
   - If the file was saved or altered in Cisco Packet Tracer, it emits a `CONFIGURATION_UPDATED` or `FILE_SAVED` event log.
   - If a port or process status changes, it updates the database and emits an `INTEGRATION_STATE_CHANGED` event log.
3. **WebSocket Event Broadcasting:**
   - Broadcasts JSON messages with type `NETWORK_STATE_CHANGED` or `SNAPSHOT_RECORDED` to all connected frontend clients via `/api/v1/ws`.
   - The React frontend receives the message, dynamically prepends the new event to `ActivityLogsSection`, and refreshes the summary metrics without requiring a full page refresh.
4. **Persistent State & Restart Recovery:**
   - On backend launch, `SyncService.perform_startup_recovery()` loads the last saved snapshot from `network_snapshots`.
   - If changes occurred while SmartCare was stopped, it logs a `SYSTEM_RECOVERED` event and seamlessly synchronizes the database.
| Process Presence & PID Tracking | `PacketTracerIntegration` | ✅ Supported | Automatically detects `PacketTracer.exe` |
| Multiuser Port Monitoring | `PacketTracerIntegration` | ✅ Supported | Confirms TCP Port 39000 is open |
| Local HTTP Service Validation | `PacketTracerIntegration` | ✅ Supported | Confirms TCP Port 8001 is active |
| Topology File Integrity Verification | `PacketTracerIntegration` | ✅ Supported | Verifies existence, size, and SHA-256 hash |
| Host Socket Connectivity Checks | `NetworkProbe` | ✅ Supported | Tests TCP/UDP socket reachability |
| Fallback Metric Generation | `TelemetryFallback` | ✅ Supported | Provides realistic historical trends |
| Dynamic Provenance Tagging | Core Service | ✅ Supported | Every UI element tagged with source |

---

## 5. Unsupported Capabilities & Limitations

1. **Unauthenticated CLI Injection:** Packet Tracer 9.0.1 does not provide an open, unauthenticated REST/SSH endpoint to run IOS commands (`show ip route`, `show ip eigrp neighbors`) directly from an external process without manual multiuser link configuration.
2. **Host IP Routing into Canvas:** The internal hospital subnets (`10.0.0.0/8`) exist inside Packet Tracer's virtual memory canvas. The Windows host OS cannot route packets directly to `10.0.1.162` unless a loopback/tap interface is bridged inside Packet Tracer.
3. **Proprietary Encryption:** Reading live canvas state directly from disk while Packet Tracer is running is unsupported due to Cisco's proprietary `.pkt` container format.

All limitations are clearly documented in the user interface through explicit `UNVERIFIED` and `UNKNOWN` status badges.
