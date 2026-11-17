import pytest
from backend.app.api.endpoints.health import health_check
from backend.app.main import root, app
from backend.app.core.config import settings

def test_health_endpoint():
    data = health_check()
    assert data["status"] == "healthy"
    assert data["service"] == settings.PROJECT_NAME
    assert data["version"] == settings.VERSION
    assert "timestamp" in data

def test_root_endpoint():
    data = root()
    assert data["status"] == "operational"
    assert "SmartCare" in data["system"]
    assert data["version"] == settings.VERSION

def test_app_routes_registered():
    route_paths = [route.path for route in app.routes]
    assert "/api/v1/health" in route_paths
    assert "/api/v1/dashboard/summary" in route_paths
    assert "/api/v1/hospitals" in route_paths
    assert "/api/v1/devices" in route_paths
    assert "/api/v1/vlans" in route_paths
    assert "/api/v1/network/health" in route_paths
    assert "/api/v1/network/topology" in route_paths
    assert "/api/v1/alerts" in route_paths
    assert "/api/v1/services" in route_paths
    assert "/api/v1/integration/status" in route_paths
