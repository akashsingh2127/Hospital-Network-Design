import pytest
from backend.app.database.session import SessionLocal
from backend.app.database.init_db import init_db
from backend.app.api.endpoints.devices import list_devices, get_device_detail

@pytest.fixture(scope="module")
def db_session():
    db = SessionLocal()
    init_db(db)
    yield db
    db.close()

def test_device_detail_r0_isp(db_session):
    detail = get_device_detail("r0_isp", db_session)
    assert detail.id == "r0_isp"
    assert detail.name == "R0 (ISP Router)"
    assert detail.hostname == "R0-ISP-CORE"
    assert len(detail.interfaces) >= 7
    assert any("Gi0/0" in iface.name for iface in detail.interfaces)
    assert "r1_hq_edge" in detail.connected_devices
    assert detail.routing_info is not None
    assert detail.routing_info.get("as") == 100

def test_device_detail_r1_hq_edge(db_session):
    detail = get_device_detail("r1_hq_edge", db_session)
    assert detail.id == "r1_hq_edge"
    assert detail.hostname == "R1-HQ-EDGE"
    assert detail.mac_address is not None
    assert len(detail.interfaces) >= 2
    assert "r0_isp" in detail.connected_devices
    assert "r2_hq_core" in detail.connected_devices

def test_device_filter_by_status(db_session):
    online_devices = list_devices(None, "ONLINE", db_session)
    assert len(online_devices) > 0
    for d in online_devices:
        assert d.status in ["ONLINE", "OPERATIONAL"]

    unverified_devices = list_devices(None, "UNVERIFIED", db_session)
    assert len(unverified_devices) > 0
    for d in unverified_devices:
        assert d.status in ["UNVERIFIED", "UNKNOWN"]
