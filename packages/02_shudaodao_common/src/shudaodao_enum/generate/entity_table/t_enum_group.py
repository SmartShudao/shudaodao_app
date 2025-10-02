#!/usr/bin/env python3
# -*- coding:utf-8 -*-
# @License  ：(C)Copyright 2025, 数道智融科技
# @Author   ：Shudaodao Auto Generator
# @Software ：PyCharm
# @Date     ：2025/10/02 15:52:55
# @Desc     ：SQLModel classes for shudaodao_enum.t_enum_group

from datetime import datetime
from typing import Optional, TYPE_CHECKING

from sqlalchemy import BigInteger, Text

from shudaodao_core import SQLModel, Field, Relationship
from shudaodao_core import get_primary_id, BaseResponse
from ... import RegistryModel, get_table_schema

if TYPE_CHECKING:
    from .t_enum_field import TEnumField


class TEnumGroup(RegistryModel, table=True):
    """ 数据库对象模型 """
    __tablename__ = "t_enum_group"
    __table_args__ = {"schema": get_table_schema(), "comment": "枚举分组表"}

    group_id: int = Field(default_factory=get_primary_id, primary_key=True, sa_type=BigInteger, description="分组内码")
    group_pid: int = Field(sa_type=BigInteger, description="所属分组")
    group_name: str = Field(max_length=100, description="分组名称")
    sort_order: Optional[int] = Field(default=None, nullable=True, description="排序权重")
    description: Optional[str] = Field(default=None, nullable=True, sa_type=Text, description="描述")
    create_by: Optional[str] = Field(default=None, max_length=50, nullable=True, description="创建人")
    create_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(), nullable=True, description="创建日期")
    update_by: Optional[str] = Field(default=None, max_length=50, nullable=True, description="修改人")
    update_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(), nullable=True, description="修改日期")
    tenant_id: Optional[int] = Field(default=None, nullable=True, sa_type=BigInteger, description="租户内码")
    # -- 外键 --> 子对象 --
    enum_fields: list["TEnumField"] = Relationship(back_populates="group")


class TEnumGroupBase(SQLModel):
    """ 创建、更新 共用字段 """
    group_pid: int = Field(sa_type=BigInteger, description="所属分组")
    group_name: str = Field(max_length=100, description="分组名称")
    sort_order: Optional[int] = Field(default=None, description="排序权重")
    description: Optional[str] = Field(default=None, description="描述")
    create_at: Optional[datetime] = Field(default=None, description="创建日期")
    update_at: Optional[datetime] = Field(default=None, description="创建日期")

class TEnumGroupCreate(TEnumGroupBase):
    """ 前端创建模型 - 用于接口请求 """
    ...


class TEnumGroupUpdate(TEnumGroupBase):
    """ 前端更新模型 - 用于接口请求 """
    ...


class TEnumGroupResponse(BaseResponse):
    """ 前端响应模型 - 用于接口响应 """
    group_id: int = Field(description="分组内码", sa_type=BigInteger)
    group_pid: int = Field(description="所属分组", sa_type=BigInteger)
    group_name: str = Field(description="分组名称")
    sort_order: Optional[int] = Field(description="排序权重", default=None)
    description: Optional[str] = Field(description="描述", default=None)
    create_at: Optional[datetime] = Field(default=None, description="创建日期")
    update_at: Optional[datetime] = Field(default=None, description="创建日期")