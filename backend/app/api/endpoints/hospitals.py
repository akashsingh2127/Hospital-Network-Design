from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.schemas.network import HospitalSchema
from backend.app.services.network_service import NetworkService

router = APIRouter()

@router.get("/hospitals", response_model=List[HospitalSchema])
def list_hospitals(db: Session = Depends(get_db)):
    return NetworkService.get_hospitals(db)

@router.get("/hospitals/{hospital_id}", response_model=HospitalSchema)
def get_hospital(hospital_id: str, db: Session = Depends(get_db)):
    hospitals = NetworkService.get_hospitals(db)
    for h in hospitals:
        if h.id.lower() == hospital_id.lower():
            return h
    raise HTTPException(status_code=404, detail=f"Hospital location '{hospital_id}' not found")
