from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.schemas.network import VlanSchema
from backend.app.services.network_service import NetworkService

router = APIRouter()

@router.get("/vlans", response_model=List[VlanSchema])
def list_vlans(
    hospital_id: Optional[str] = Query(None, description="Filter by hospital ID"),
    db: Session = Depends(get_db)
):
    return NetworkService.get_vlans(db, hospital_id=hospital_id)
