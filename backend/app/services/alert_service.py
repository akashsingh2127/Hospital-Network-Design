from typing import List, Optional
from sqlalchemy.orm import Session
from backend.app.models.network import AlertModel
from backend.app.schemas.network import AlertSchema, DataSource, SeverityLevel
from backend.app.integrations.telemetry_fallback import TelemetryFallback

class AlertService:
    @staticmethod
    def get_alerts(
        db: Session,
        severity: Optional[SeverityLevel] = None,
        source: Optional[DataSource] = None,
        limit: int = 50
    ) -> List[AlertSchema]:
        query = db.query(AlertModel).order_by(AlertModel.timestamp.desc())

        if severity:
            query = query.filter(AlertModel.severity == severity.value)
        if source:
            query = query.filter(AlertModel.source == source.value)

        db_alerts = query.limit(limit).all()
        alerts = [AlertSchema.model_validate(a) for a in db_alerts]

        # If database has few alerts, supplement with explicitly tagged fallback alerts
        if len(alerts) < 4:
            fallback = TelemetryFallback.get_simulated_alerts()
            if severity:
                fallback = [a for a in fallback if a.severity == severity]
            if source:
                fallback = [a for a in fallback if a.source == source]
            alerts.extend(fallback)

        return alerts

    @staticmethod
    def acknowledge_alert(db: Session, alert_id: int) -> bool:
        alert = db.query(AlertModel).filter(AlertModel.id == alert_id).first()
        if alert:
            alert.is_acknowledged = True
            db.commit()
            return True
        return False
