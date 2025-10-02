#!/usr/bin/env python3
# -*- coding:utf-8 -*-
# @License  ：(C)Copyright 2025, 数道智融科技
# @Author   ：Shudaodao Auto Generator
# @Software ：PyCharm
# @Date     ：2025/10/02 15:52:55
# @Desc     ：SQLModel classes for shudaodao_enum.t_enum_value

from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import BigInteger, Boolean, Text

from shudaodao_core import SQLModel, Field, Relationship
from shudaodao_core import get_primary_id, BaseResponse
from ... import RegistryModel, get_table_schema, get_foreign_schema

if TYPE_CHECKING:
    from .t_enum_field import TEnumField


class TEnumValue(RegistryModel, table=True):
    """ 数据库对象模型 """
    __tablename__ = "t_enum_value"
    __table_args__ = {"schema": get_table_schema(), "comment": "枚举值表"}

    enum_id: int = Field(default_factory=get_primary_id, primary_key=True, sa_type=BigInteger, description="枚举内码")
    field_id: int = Field(
        sa_type=BigInteger, description="字段内码", foreign_key=f"{get_foreign_schema()}t_enum_field.field_id")
    enum_pid: int = Field(sa_type=BigInteger, description="上级枚举")
    enum_label: str = Field(max_length=100, description="枚举名")
    enum_name: str = Field(max_length=100, description="枚举值")
    enum_value: int = Field(description="枚举中文")
    sort_order: Optional[int] = Field(default=None, nullable=True, description="字段索引")
    is_active: Optional[bool] = Field(default=None, nullable=True, sa_type=Boolean, description="是否启用")
    description: Optional[str] = Field(default=None, nullable=True, sa_type=Text, description="描述")
    create_by: Optional[str] = Field(default=None, max_length=50, nullable=True, description="创建人")
    create_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(), nullable=True, description="创建日期")
    update_by: Optional[str] = Field(default=None, max_length=50, nullable=True, description="修改人")
    update_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(), nullable=True, description="修改日期")
    tenant_id: Optional[int] = Field(default=None, nullable=True, sa_type=BigInteger, description="租户内码")
    # -- 外键 --> 父对象 --
    field: "TEnumField" = Relationship(back_populates="enum_values")


class TEnumValueBase(SQLModel):
    """ 创建、更新 共用字段 """
    field_id: int = Field(sa_type=BigInteger, description="字段内码")
    enum_pid: int = Field(sa_type=BigInteger, description="上级枚举")
    enum_label: str = Field(max_length=100, description="枚举名")
    enum_name: str = Field(max_length=100, description="枚举值")
    enum_value: int = Field(description="枚举中文")
    sort_order: Optional[int] = Field(default=None, description="字段索引")
    is_active: Optional[bool] = Field(default=None, description="是否启用")
    description: Optional[str] = Field(default=None, description="描述")


class TEnumValueCreate(TEnumValueBase):
    """ 前端创建模型 - 用于接口请求 """
    ...


class TEnumValueUpdate(TEnumValueBase):
    """ 前端更新模型 - 用于接口请求 """
    ...


class TEnumValueResponse(BaseResponse):
    """ 前端响应模型 - 用于接口响应 """
    enum_id: int = Field(description="枚举内码", sa_type=BigInteger)
    field_id: int = Field(description="字段内码", sa_type=BigInteger)
    enum_pid: int = Field(description="上级枚举", sa_type=BigInteger)
    enum_label: str = Field(description="枚举名")
    enum_name: str = Field(description="枚举值")
    enum_value: int = Field(description="枚举中文")
    sort_order: Optional[int] = Field(description="字段索引", default=None)
    is_active: Optional[bool] = Field(description="是否启用", default=None)
    description: Optional[str] = Field(description="描述", default=None)
