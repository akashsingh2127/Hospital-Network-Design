from fastapi import APIRouter
from backend.app.api.endpoints import (
    health,
    dashboard,
    hospitals,
    devices,
    vlans,
    health_monitoring,
    topology,
    alerts,
    services,
    integration,
    events,
    websocket,
    simulation
)

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(dashboard.router, tags=["Dashboard"])
api_router.include_router(hospitals.router, tags=["Hospitals"])
api_router.include_router(devices.router, tags=["Devices"])
api_router.include_router(vlans.router, tags=["VLANs"])
api_router.include_router(health_monitoring.router, tags=["Network Health"])
api_router.include_router(topology.router, tags=["Topology"])
api_router.include_router(alerts.router, tags=["Alerts"])
api_router.include_router(services.router, tags=["Network Services"])
api_router.include_router(integration.router, tags=["Packet Tracer Integration"])
api_router.include_router(events.router, tags=["Activity & Event Logs"])
api_router.include_router(websocket.router, tags=["Live WebSockets"])
api_router.include_router(simulation.router, tags=["Data Transfer Simulation"])
