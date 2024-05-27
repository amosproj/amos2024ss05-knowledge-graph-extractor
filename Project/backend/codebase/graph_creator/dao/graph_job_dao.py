import os
import uuid
from typing import List

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from common.dependencies import get_db_session
from graph_creator.models.graph_job import GraphJob
from graph_creator.schemas.graph_job import GraphJobCreate


class GraphJobDAO:
    """Class for accessing graph_job table."""

    def __init__(self, session: AsyncSession = Depends(get_db_session)):
        self.session = session

    async def get_graph_job_by_id(self, graph_job_id: uuid.UUID) -> GraphJob:
        """
        Get a graph job by the id.
        """

        return (
            await self.session.execute(
                select(GraphJob).filter(GraphJob.id == graph_job_id)
            )
        ).scalar()

    async def get_graph_job_by_name(self, name: str) -> GraphJob:
        """
        Get a graph job by the name.
        """

        result = await self.session.execute(
            select(GraphJob).filter(GraphJob.name == name)
        )
        return result.scalar()

    async def get_graph_jobs(self, limit: int = 100, offset: int = 0) -> List[GraphJob]:
        """
        Get all graph jobs with limit/offset pagination.
        """

        graph_jobs = await self.session.execute(
            select(GraphJob).limit(limit).offset(offset),
        )

        return list(graph_jobs.scalars().fetchall())

    async def create_graph_job_model(self, graph_job: GraphJobCreate):
        """
        Add a new graph job to the session.
        """

        # Check if graph job exists
        existing_graph_job = await self.get_graph_job_by_name(graph_job.name)

        # If graph job exists raise error
        if existing_graph_job:
            raise ValueError(
                f"Graph job with name '{graph_job.name}' has already been added."
            )

        # Create a new graph job and add it to session
        new_graph_job = GraphJob(
            name=graph_job.name, location=graph_job.location, status=graph_job.status
        )
        self.session.add(new_graph_job)
        await self.session.commit()
        await self.session.refresh(new_graph_job)
        return new_graph_job

    async def delete_graph_job(self, graph_job: GraphJob):
        """
        Delete the graph job
        """

        # Delete the file
        if os.path.exists(graph_job.location):
            os.remove(graph_job.location)

        # Delete the graph job
        if graph_job:
            await self.session.delete(graph_job)
            await self.session.commit()
