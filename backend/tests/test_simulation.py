import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_get_simulation_endpoints():
    response = client.get("/api/v1/simulation/endpoints")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    # Check that endpoints include diagnostic and HQ DMZ
    ids = [ep["id"] for ep in data]
    assert "diag_lab_pc" in ids
    assert "hq_dmz_web" in ids

def test_trace_simulation_success():
    req = {
        "source_id": "diag_lab_pc",
        "destination_id": "hq_dmz_ftp",
        "protocol": "FTP"
    }
    response = client.post("/api/v1/simulation/trace", json=req)
    assert response.status_code == 200
    flow = response.json()
    assert flow["source_id"] == "diag_lab_pc"
    assert flow["destination_id"] == "hq_dmz_ftp"
    assert flow["status"] == "SUCCESS"
    assert len(flow["hops"]) >= 5
    # Verify traversal goes through ISP and HQ Edge
    devices_in_path = [hop["device_id"] for hop in flow["hops"]]
    assert "sw0_isp" in devices_in_path
    assert "r0_isp" in devices_in_path
    assert "r1_hq_edge" in devices_in_path

def test_trace_simulation_acl_drop():
    # Children Guest to Admin should be dropped by ACL
    req = {
        "source_id": "child_guest_pc",
        "destination_id": "hq_admin_pc",
        "protocol": "HTTP"
    }
    response = client.post("/api/v1/simulation/trace", json=req)
    assert response.status_code == 200
    flow = response.json()
    assert flow["status"] == "DROPPED"
    assert "ACL" in flow["status_reason"]

def test_trigger_random_simulation():
    response = client.post("/api/v1/simulation/trigger-random")
    assert response.status_code == 200
    flow = response.json()
    assert "source_id" in flow
    assert "destination_id" in flow
    assert "hops" in flow
