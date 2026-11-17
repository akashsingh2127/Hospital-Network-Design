import pytest
from backend.app.database.session import SessionLocal
from backend.app.database.init_db import init_db
from backend.app.api.endpoints.dashboard import get_dashboard_summary
from backend.app.api.endpoints.hospitals import list_hospitals, get_hospital
from backend.app.api.endpoints.devices import list_devices
from backend.app.api.endpoints.vlans import list_vlans
from backend.app.models.network import HospitalModel, DeviceModel, VlanModel

@pytest.fixture(scope="module")
def db_session():
    db = SessionLocal()
    init_db(db)
    yield db
    db.close()

def test_dashboard_summary_endpoint(db_session):
    summary = get_dashboard_summary(db_session)
    assert summary.project_title == "Smart Multi-Speciality Hospital Network"
    assert summary.total_hospitals == 6
    assert summary.total_vlans == 19
    assert summary.total_devices >= 13
    assert len(summary.hospitals) == 6
    assert summary.data_source in ["PACKET_TRACER", "BACKEND_PROBE", "SIMULATED"]
    assert summary.integration is not None
    assert summary.health is not None
    assert summary.health.overall_health_score >= 50

def test_hospitals_list_endpoint(db_session):
    hospitals = list_hospitals(db_session)
    assert len(hospitals) == 6
    codes = [h.code for h in hospitals]
    assert "HQ-MAIN" in codes
    assert "BR-DIAG" in codes
    assert "BR-EMER" in codes
    assert "BR-TELE" in codes
    assert "BR-MAT" in codes
    assert "BR-CHILD" in codes

def test_hospital_detail_endpoint(db_session):
    hq = get_hospital("hq", db_session)
    assert hq.id == "hq"
    assert hq.edge_router == "R1"
    assert hq.core_router == "R2"
    assert hq.vlan_count == 4
    assert len(hq.vlans) == 4

def test_devices_list_endpoint(db_session):
    devices = list_devices(None, db_session)
    assert len(devices) >= 13
    device_names = [d.name for d in devices]
    assert any("R0" in n for n in device_names)
    assert any("R1" in n for n in device_names)
    assert any("R2" in n for n in device_names)

def test_devices_filter_by_hospital(db_session):
    hq_devices = list_devices("hq", db_session)
    assert len(hq_devices) >= 4
    for d in hq_devices:
        assert d.hospital_id == "hq"

def test_vlans_list_endpoint(db_session):
    vlans = list_vlans(None, db_session)
    assert len(vlans) == 19
    vlan_ids = [v.vlan_id for v in vlans]
    assert 10 in vlan_ids
    assert 20 in vlan_ids
    assert 30 in vlan_ids
    assert 50 in vlan_ids
    assert 100 in vlan_ids
    assert 200 in vlan_ids
    assert 300 in vlan_ids
    assert 400 in vlan_ids
    assert 500 in vlan_ids
