from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.schemas.network import NetworkHealthSchema
from backend.app.services.network_service import NetworkService

router = APIRouter()

@router.get("/network/health", response_model=NetworkHealthSchema)
def get_network_health(db: Session = Depends(get_db)):
    summary = NetworkService.get_dashboard_summary(db)
    return summary.health
