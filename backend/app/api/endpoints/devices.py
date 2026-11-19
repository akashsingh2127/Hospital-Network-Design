from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.schemas.network import DeviceSchema, DeviceDetailSchema
from backend.app.services.network_service import NetworkService

router = APIRouter()

@router.get("/devices", response_model=List[DeviceSchema])
def list_devices(
    hospital_id: Optional[str] = Query(None, description="Filter by hospital ID"),
    status: Optional[str] = Query(None, description="Filter by status (ONLINE, OFFLINE, UNVERIFIED)"),
    db: Session = Depends(get_db)
):
    if isinstance(status, Session):
        db = status
        status = None
    return NetworkService.get_devices(db, hospital_id=hospital_id, status=status)

@router.get("/devices/{device_id}", response_model=DeviceDetailSchema)
def get_device_detail(
    device_id: str,
    db: Session = Depends(get_db)
):
    detail = NetworkService.get_device_detail(device_id, db)
    if not detail:
        raise HTTPException(status_code=404, detail=f"Device '{device_id}' not found in inventory")
    return detail
