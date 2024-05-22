import uuid
from typing import List

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from common.dependencies import get_db_session
from monitoring.models.monitoring import HealthCheck


class HealthCheckDAO:
    """Class for accessing HealthCheck table."""

    def __init__(self, session: AsyncSession = Depends(get_db_session)):
        self.session = session

    async def create_healthcheck_model(self) -> None:
        """
        Add single healthcheck to session
        """
        self.session.add(HealthCheck())

    async def get_all_healthchecks(self, limit: int, offset: int) -> List[HealthCheck]:
        """
        Get all healthcheck models with limit/offset pagination.
        """
        raw_checks = await self.session.execute(
            select(HealthCheck).limit(limit).offset(offset),
        )

        return list(raw_checks.scalars().fetchall())

    async def get(
        self,
        obj_id: uuid.UUID,
    ) -> HealthCheck:
        """
        Get specific healthcheck model.
        """
        query = select(HealthCheck).filter(HealthCheck.id == obj_id)
        result = await self.session.execute(query)
        healthcheck = result.scalar()
        return healthcheck
