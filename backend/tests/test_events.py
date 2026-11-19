import pytest
from backend.app.database.session import SessionLocal
from backend.app.database.init_db import init_db
from backend.app.api.endpoints.events import list_events, get_event

@pytest.fixture(scope="module")
def db_session():
    db = SessionLocal()
    init_db(db)
    yield db
    db.close()

def test_list_events(db_session):
    events = list_events(None, None, None, None, None, 50, db_session)
    assert len(events) >= 4
    for ev in events:
        assert ev.event_id is not None
        assert ev.category in [
            "DEVICE", "INTERFACE", "CONNECTIVITY", "CONFIGURATION",
            "VLAN", "ROUTING", "NETWORK_SERVICE", "PACKET_TRACER_SIMULATION", "INTEGRATION"
        ]
        assert ev.severity in ["INFO", "WARNING", "ERROR", "CRITICAL"]

def test_filter_events_by_category(db_session):
    routing_events = list_events("ROUTING", None, None, None, None, 50, db_session)
    for ev in routing_events:
        assert ev.category == "ROUTING"

def test_filter_events_by_severity(db_session):
    info_events = list_events(None, "INFO", None, None, None, 50, db_session)
    for ev in info_events:
        assert ev.severity == "INFO"

def test_search_events(db_session):
    search_results = list_events(None, None, None, None, "EIGRP", 50, db_session)
    assert len(search_results) > 0
    assert any("EIGRP" in ev.description or "EIGRP" in ev.event_id for ev in search_results)

def test_get_single_event(db_session):
    events = list_events(None, None, None, None, None, 1, db_session)
    assert len(events) > 0
    target_id = events[0].event_id
    ev = get_event(target_id, db_session)
    assert ev.event_id == target_id
