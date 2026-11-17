import os
from typing import List
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "SmartCare Hospital Network Management and Monitoring System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./smartcare.db")
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000"
    ]
    # Packet Tracer Integration Settings
    PT_HOST: str = os.getenv("PT_HOST", "127.0.0.1")
    PT_PORT_MULTIUSER: int = int(os.getenv("PT_PORT_MULTIUSER", "39000"))
    PT_PORT_INTERNAL: int = int(os.getenv("PT_PORT_INTERNAL", "38000"))
    PT_PORT_HTTP: int = int(os.getenv("PT_PORT_HTTP", "8001"))
    PKT_DEFAULT_FILE: str = os.getenv(
        "PKT_DEFAULT_FILE", 
        r"C:\Users\Akash Singh\Downloads\Computer Network Project.pkt"
    )
    # Simulation fallback mode (explicitly tracked and labeled)
    ALLOW_SIMULATION_FALLBACK: bool = True

settings = Settings()
