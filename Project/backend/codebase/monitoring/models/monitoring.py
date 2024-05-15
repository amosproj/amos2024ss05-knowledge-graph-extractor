from common.models import TrackedModel, Base


class HealthCheck(Base, TrackedModel):
    __tablename__ = "healthcheck"
    __table_args__ = {"extend_existing": True}
