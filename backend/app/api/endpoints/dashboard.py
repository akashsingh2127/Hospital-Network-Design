from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.schemas.network import DashboardSummarySchema
from backend.app.services.network_service import NetworkService

router = APIRouter()

@router.get("/dashboard/summary", response_model=DashboardSummarySchema)
def get_dashboard_summary(db: Session = Depends(get_db)):
    return NetworkService.get_dashboard_summary(db)
