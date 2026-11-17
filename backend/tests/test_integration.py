import pytest
from backend.app.database.session import SessionLocal
from backend.app.database.init_db import init_db
from backend.app.api.endpoints.integration import get_integration_status, refresh_integration_status
from backend.app.api.endpoints.services import list_services
from backend.app.api.endpoints.topology import get_network_topology
from backend.app.api.endpoints.alerts import list_alerts, acknowledge_alert
from backend.app.integrations.telemetry_fallback import TelemetryFallback

@pytest.fixture(scope="module")
def db_session():
    db = SessionLocal()
    init_db(db)
    yield db
    db.close()

def test_integration_status_endpoint():
    status = get_integration_status()
    assert hasattr(status, "packet_tracer_running")
    assert hasattr(status, "multiuser_port_open")
    assert hasattr(status, "overall_integration_state")
    assert len(status.supported_capabilities) > 0
    assert len(status.unsupported_capabilities) > 0
    assert status.data_source_mode in ["PACKET_TRACER", "BACKEND_PROBE", "SIMULATED"]

def test_integration_refresh_endpoint():
    refreshed = refresh_integration_status()
    assert refreshed.overall_integration_state in ["CONNECTED", "PARTIAL", "DISCONNECTED"]

def test_services_endpoint():
    services = list_services()
    assert len(services) == 4
    names = [s.name for s in services]
    assert "Hospital DNS" in names
    assert "Internal Web Portal" in names
    assert "Medical Reports FTP" in names
    assert "Hospital Mail Server" in names
    for s in services:
        assert s.source == "BACKEND_PROBE"
        assert s.status in ["ONLINE", "UNKNOWN", "UNVERIFIED", "OFFLINE"]
        assert len(s.verification_detail) > 0

def test_topology_endpoint(db_session):
    topo = get_network_topology(db_session)
    assert topo.total_nodes >= 15
    assert topo.total_edges >= 15
    node_ids = [n.id for n in topo.nodes]
    assert "r0" in node_ids
    assert "sw0" in node_ids
    assert "r1" in node_ids
    assert "r2" in node_ids
    assert "dmz_servers" in node_ids

def test_alerts_endpoint(db_session):
    alerts = list_alerts(None, None, 50, db_session)
    assert len(alerts) >= 2
    for a in alerts:
        assert a.severity in ["CRITICAL", "WARNING", "INFO"]
        assert a.source in ["PACKET_TRACER", "BACKEND_PROBE", "SIMULATED"]

def test_alert_acknowledgment(db_session):
    res = acknowledge_alert(1, db_session)
    assert res["acknowledged"] is True

def test_telemetry_fallback():
    metrics = TelemetryFallback.get_simulated_metrics()
    assert len(metrics) > 0
    for m in metrics:
        assert m.is_simulated is True
        assert m.latency_ms is not None
