#!/usr/bin/env python3
# -*- coding:utf-8 -*-
# @License  ：(C)Copyright 2025, 数道智融科技
# @Author   ：Shudaodao Auto Generator
# @Software ：PyCharm
# @Date     ：2025/10/01 23:27:23
# @Desc     ：SQLModel classes for shudaodao_admin.t_enum_field

from typing import TYPE_CHECKING, Optional

from sqlalchemy import BigInteger

from shudaodao_core import BaseResponse
from shudaodao_core import SQLModel, Field

if TYPE_CHECKING:
    pass


class TEnumFieldBase(SQLModel):
    """ 创建、更新 共用字段 """
    group_id: int = Field(sa_type=BigInteger, description="分组内码")
    field_label: str = Field(max_length=50, description="字段标签")
    field_class: str = Field(max_length=50, description="字段类名")
    field_name: str = Field(max_length=50, description="字段列名")
    description: Optional[str] = Field(default=None, description="描述")
    sort_order: Optional[int] = Field(default=None, description="字段索引")
    is_active: Optional[bool] = Field(default=None, description="是否启用")


class TEnumFieldCreate(TEnumFieldBase):
    """ 前端创建模型 - 用于接口请求 """
    ...


class TEnumFieldUpdate(TEnumFieldBase):
    """ 前端更新模型 - 用于接口请求 """
    ...


class TEnumFieldResponse(BaseResponse):
    """ 前端响应模型 - 用于接口响应 """
    field_id: int = Field(description="字段内码", sa_type=BigInteger)
    group_id: int = Field(description="分组内码", sa_type=BigInteger)
    field_label: str = Field(description="字段标签")
    field_class: str = Field(description="字段类名")
    field_name: str = Field(description="字段列名")
    description: Optional[str] = Field(description="描述", default=None)
    sort_order: Optional[int] = Field(description="字段索引", default=None)
    is_active: Optional[bool] = Field(description="是否启用", default=None)
