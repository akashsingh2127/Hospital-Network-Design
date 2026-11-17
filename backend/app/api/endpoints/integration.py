from fastapi import APIRouter
from backend.app.schemas.network import IntegrationStatusSchema
from backend.app.integrations.packet_tracer import PacketTracerIntegration

router = APIRouter()

@router.get("/integration/status", response_model=IntegrationStatusSchema)
def get_integration_status():
    return PacketTracerIntegration.get_status()

@router.post("/integration/refresh", response_model=IntegrationStatusSchema)
def refresh_integration_status():
    return PacketTracerIntegration.get_status()
