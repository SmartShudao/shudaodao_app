from fastapi.testclient import TestClient
from sqlalchemy import Engine
from sqlmodel import SQLModel

from main import webapp
# from shudaodao_common.entity_table.dept import Dept
# from shudaodao_common.entity_table.user import User
from shudaodao_core import DBEngineService, AuthUser
# from shudaodao_generate.shudao_admin.entity_table.system import System

client = TestClient(webapp)


def test_drop_core():
    engine: Engine = DBEngineService.get_engine("Core")
    SQLModel.metadata.tables[AuthUser.__tablename__].drop(engine)
    # SQLModel.metadata.tables[System.__tablename__].drop(engine)
    assert True


def test_create_core():
    engine: Engine = DBEngineService.get_engine("Core")
    SQLModel.metadata.create_all(engine)
    # SQLModel.metadata.tables[AuthUser.__tablename__].create(engine)
    # SQLModel.metadata.tables[System.__tablename__].create(engine)
    assert True


def test_drop_common():
    engine: Engine = DBEngineService.get_engine("Common")
    # User.metadata.drop_all(engine)
    # Dept.metadata.drop_all(engine)
    assert True


def test_create_common():
    engine: Engine = DBEngineService.get_engine("Common")
    # Dept.metadata.create_all(engine)
    # User.metadata.create_all(engine)
    assert True
