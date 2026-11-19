from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.schemas.network import EventLogSchema
from backend.app.services.network_service import NetworkService

router = APIRouter()

@router.get("/events", response_model=List[EventLogSchema])
def list_events(
    category: Optional[str] = Query(None, description="Filter by category (DEVICE, INTERFACE, CONFIGURATION, ROUTING, etc.)"),
    severity: Optional[str] = Query(None, description="Filter by severity (INFO, WARNING, ERROR, CRITICAL)"),
    hospital_id: Optional[str] = Query(None, description="Filter by hospital ID"),
    device_id: Optional[str] = Query(None, description="Filter by affected device ID"),
    search: Optional[str] = Query(None, description="Free text search"),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    return NetworkService.get_events(
        db,
        category=category,
        severity=severity,
        hospital_id=hospital_id,
        device_id=device_id,
        search=search,
        limit=limit
    )

@router.get("/events/{event_id}", response_model=EventLogSchema)
def get_event(
    event_id: str,
    db: Session = Depends(get_db)
):
    events = NetworkService.get_events(db, search=event_id, limit=5)
    for ev in events:
        if ev.event_id == event_id or str(ev.id) == event_id:
            return ev
    raise HTTPException(status_code=404, detail=f"Event '{event_id}' not found")
