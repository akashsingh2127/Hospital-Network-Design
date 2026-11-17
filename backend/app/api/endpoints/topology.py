from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.schemas.network import TopologySchema
from backend.app.services.network_service import NetworkService

router = APIRouter()

@router.get("/network/topology", response_model=TopologySchema)
def get_network_topology(db: Session = Depends(get_db)):
    return NetworkService.get_topology(db)
