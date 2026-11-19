import pytest
from backend.app.database.session import SessionLocal
from backend.app.database.init_db import init_db
from backend.app.services.sync_service import SyncService
from backend.app.integrations.packet_tracer import PacketTracerIntegration

@pytest.fixture(scope="module")
def db_session():
    db = SessionLocal()
    init_db(db)
    yield db
    db.close()

def test_startup_recovery(db_session):
    recovery_res = SyncService.perform_startup_recovery(db_session)
    assert recovery_res["recovered"] is True
    assert "current_fp" in recovery_res
    assert "pt_running" in recovery_res["current_fp"]

def test_state_fingerprint():
    fp = PacketTracerIntegration.get_state_fingerprint()
    assert "pt_running" in fp
    assert "multiuser_port_open" in fp
    assert "http_login_port_open" in fp
    assert "pkt_exists" in fp
