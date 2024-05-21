from contextlib import asynccontextmanager
from typing import Awaitable, Callable

from fastapi import FastAPI
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from settings.defaults import DB_URL


def _setup_db(app: FastAPI) -> None:  # pragma: no cover
    """
    Creates connection to the database.

    This function creates SQLAlchemy engine instance,
    session_factory for creating sessions
    and stores them in the application's state property.

    :param app: fastAPI application.
    """
    engine = create_async_engine(DB_URL)
    session_factory = async_sessionmaker(
        engine,
        expire_on_commit=False,
    )
    print("_setup_db")
    app.state.db_engine = engine
    app.state.db_session_factory = session_factory


def register_startup_event(
    app: FastAPI,
) -> Callable[[], Awaitable[None]]:  # pragma: no cover
    """
    Actions to run on application startup.

    This function uses fastAPI app to store data
    in the state, such as db_engine.

    :param app: the fastAPI application.
    :return: function that actually performs actions.
    """

    @asynccontextmanager
    async def lifespan():

        app.middleware_stack = None
        _setup_db(app)
        app.middleware_stack = app.build_middleware_stack()
        yield

    return lifespan


def register_shutdown_event(
    app: FastAPI,
) -> Callable[[], Awaitable[None]]:  # pragma: no cover
    """
    Actions to run on application's shutdown.

    :param app: fastAPI application.
    :return: function that actually performs actions.
    """

    @asynccontextmanager
    async def lifespan():
        yield

        await app.state.db_engine.dispose()
        pass  # noqa: WPS420

    return lifespan
