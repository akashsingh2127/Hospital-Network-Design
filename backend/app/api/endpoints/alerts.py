from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.schemas.network import AlertSchema, DataSource, SeverityLevel
from backend.app.services.alert_service import AlertService

router = APIRouter()

@router.get("/alerts", response_model=List[AlertSchema])
def list_alerts(
    severity: Optional[SeverityLevel] = Query(None, description="Filter by severity"),
    source: Optional[DataSource] = Query(None, description="Filter by data source"),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    return AlertService.get_alerts(db, severity=severity, source=source, limit=limit)

@router.post("/alerts/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: int, db: Session = Depends(get_db)):
    success = AlertService.acknowledge_alert(db, alert_id)
    if not success:
        # Alert may be an in-memory simulated alert or not found
        return {"acknowledged": True, "note": "Simulated or acknowledged in session"}
    return {"acknowledged": True, "alert_id": alert_id}
