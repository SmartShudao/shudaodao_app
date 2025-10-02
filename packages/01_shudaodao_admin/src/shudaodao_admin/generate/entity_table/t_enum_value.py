#!/usr/bin/env python3
# -*- coding:utf-8 -*-
# @License  ：(C)Copyright 2025, 数道智融科技
# @Author   ：Shudaodao Auto Generator
# @Software ：PyCharm
# @Date     ：2025/10/01 23:27:23
# @Desc     ：SQLModel classes for shudaodao_admin.t_enum_value

from typing import TYPE_CHECKING, Optional

from sqlalchemy import BigInteger

from shudaodao_core import BaseResponse
from shudaodao_core import SQLModel, Field

if TYPE_CHECKING:
    pass


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
