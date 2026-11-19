from typing import List, Dict, Any
import random
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.schemas.network import SimulationFlow, SimulationRequest
from backend.app.services.simulation_service import SimulationService
from backend.app.models.network import DeviceModel

router = APIRouter()

# Pre-configured clinical workflows for realistic Packet Tracer data simulations
PRESET_CLINICAL_FLOWS = [
    {"source": "sw_emer_access", "dest": "srv_http", "protocol": "HTTP", "desc": "Emergency Triage fetching patient EHR from HQ Internal Web Portal"},
    {"source": "sw_diag_access", "dest": "srv_ftp", "protocol": "FTP", "desc": "Diagnostic Lab uploading PACS radiologic CT scans to HQ Medical Reports FTP"},
    {"source": "sw_tele_access", "dest": "srv_dns", "protocol": "DNS", "desc": "Telemedicine consultation unit performing DNS resolution for hospital.internal"},
    {"source": "sw_mat_access", "dest": "srv_mail", "protocol": "SMTP", "desc": "Maternity delivery ward transmitting neonatal notification alert via Mail"},
    {"source": "sw_child_access", "dest": "srv_http", "protocol": "HTTP", "desc": "Children Care inpatient ward accessing centralized clinical protocols"},
    {"source": "r4_diag_edge", "dest": "r0_isp", "protocol": "EIGRP", "desc": "Diagnostic Center Edge advertising updated routes to ISP AS 100 backbone"},
    {"source": "r6_emer_edge", "dest": "r1_hq_edge", "protocol": "ICMP", "desc": "Emergency-to-HQ WAN point-to-point keepalive ping across ISP core"},
]

@router.post("/simulation/trace", response_model=SimulationFlow)
async def trace_packet_flow(
    req: SimulationRequest,
    db: Session = Depends(get_db)
):
    try:
        flow = SimulationService.trace_packet(
            db,
            source_id=req.source_device_id,
            dest_id=req.dest_device_id,
            protocol=req.protocol
        )
        await SimulationService.broadcast_flow(flow)
        return flow
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")

@router.post("/simulation/trigger-random", response_model=SimulationFlow)
async def trigger_random_simulation(
    db: Session = Depends(get_db)
):
    """Triggers a realistic Packet Tracer hospital data transfer flow and broadcasts it to all clients."""
    preset = random.choice(PRESET_CLINICAL_FLOWS)
    flow = SimulationService.trace_packet(
        db,
        source_id=preset["source"],
        dest_id=preset["dest"],
        protocol=preset["protocol"]
    )
    await SimulationService.broadcast_flow(flow)
    return flow

@router.get("/simulation/endpoints")
def list_simulation_endpoints(db: Session = Depends(get_db)):
    """Returns all available devices categorized for source/destination selection."""
    devices = db.query(DeviceModel).all()
    grouped: Dict[str, List[Dict[str, Any]]] = {}

    for d in devices:
        hosp = d.hospital_id or "core"
        if hosp not in grouped:
            grouped[hosp] = []
        grouped[hosp].append({
            "id": d.id,
            "name": d.name,
            "hostname": d.hostname or d.name,
            "ip": d.ip_address,
            "type": d.device_type,
            "hospital": hosp.upper()
        })

    return grouped
