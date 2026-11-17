from typing import List
from fastapi import APIRouter
from backend.app.schemas.network import NetworkServiceSchema
from backend.app.integrations.network_probe import NetworkProbe

router = APIRouter()

@router.get("/services", response_model=List[NetworkServiceSchema])
def list_services():
    return NetworkProbe.check_hq_services()
