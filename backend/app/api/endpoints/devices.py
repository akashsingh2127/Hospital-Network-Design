from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.schemas.network import DeviceSchema
from backend.app.services.network_service import NetworkService

router = APIRouter()

@router.get("/devices", response_model=List[DeviceSchema])
def list_devices(
    hospital_id: Optional[str] = Query(None, description="Filter by hospital ID"),
    db: Session = Depends(get_db)
):
    return NetworkService.get_devices(db, hospital_id=hospital_id)
