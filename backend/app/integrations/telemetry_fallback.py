from datetime import datetime, timedelta
from typing import List
from backend.app.schemas.network import (
    DataSource,
    SeverityLevel,
    AlertSchema,
    MetricPoint
)

class TelemetryFallback:
    """
    Generates structured demonstration fallback telemetry.
    All data produced by this module is EXPLICITLY tagged with:
    - source = DataSource.SIMULATED
    - is_simulated = True
    Ensuring full transparency and compliance with integration rules.
    """

    @staticmethod
    def get_simulated_metrics() -> List[MetricPoint]:
        now = datetime.utcnow()
        points = []
        # Generate 7 recent hourly sample data points
        sample_latencies = [14.2, 16.8, 15.1, 19.4, 13.9, 14.7, 15.5]
        sample_losses = [0.0, 0.2, 0.0, 0.5, 0.1, 0.0, 0.0]
        sample_reachabilities = [100.0, 98.5, 100.0, 97.2, 100.0, 100.0, 100.0]

        for i in range(7):
            t = now - timedelta(minutes=(6 - i) * 10)
            points.append(MetricPoint(
                timestamp=t.strftime("%H:%M"),
                latency_ms=sample_latencies[i],
                packet_loss_pct=sample_losses[i],
                reachability_pct=sample_reachabilities[i],
                is_simulated=True
            ))
        return points

    @staticmethod
    def get_simulated_alerts() -> List[AlertSchema]:
        now = datetime.utcnow()
        return [
            AlertSchema(
                id=101,
                timestamp=now - timedelta(minutes=14),
                title="EIGRP Neighbor Flap Detected (Simulated)",
                message="Temporary hello hold-time expiration on R4 Gi0/1 (Diagnostic Center Core link). Automatically re-converged via AS 100.",
                severity=SeverityLevel.WARNING,
                category="ROUTING",
                hospital_id="diag",
                device_id="r4_diag_edge",
                source=DataSource.SIMULATED,
                is_acknowledged=False
            ),
            AlertSchema(
                id=102,
                timestamp=now - timedelta(minutes=32),
                title="NAT Translation Pool Spike (Simulated)",
                message="High concurrent NAT overload translations observed on R6 (Emergency Clinic) Gi0/0 public WAN interface.",
                severity=SeverityLevel.INFO,
                category="NAT",
                hospital_id="emer",
                device_id="r6_emer_edge",
                source=DataSource.SIMULATED,
                is_acknowledged=True
            ),
            AlertSchema(
                id=103,
                timestamp=now - timedelta(minutes=58),
                title="Guest Wi-Fi ACL Isolation Enforced (Simulated)",
                message="Unauthorized inter-VLAN probe from VLAN 50 (Guest Wi-Fi) to VLAN 20 (Doctors/ICU) dropped by Extended ACL.",
                severity=SeverityLevel.INFO,
                category="SECURITY",
                hospital_id="hq",
                device_id="r2_hq_core",
                source=DataSource.SIMULATED,
                is_acknowledged=True
            )
        ]
