from sqlalchemy.orm import Session

from app.models.audit_logs import AuditLog


class AuditService:
    def __init__(self, db: Session):
        self.db = db

    def log(
        self,
        *,
        action: str,
        entity_type: str,
        entity_id: str | None = None,
        actor_id: str | None = None,
        ip_address: str | None = None,
        user_agent: str | None = None,
        event_data: dict | None = None,
    ) -> AuditLog:
        audit_log = AuditLog(
            actor_id=actor_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            ip_address=ip_address,
            user_agent=user_agent,
            event_data=event_data,
        )
        self.db.add(audit_log)
        self.db.flush()
        return audit_log
