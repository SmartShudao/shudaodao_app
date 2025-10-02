#!/usr/bin/env python3
# -*- coding:utf-8 -*-
# @License  ：(C)Copyright 2025, 数道智融科技
# @Author   ：Shudaodao Auto Generator
# @Software ：PyCharm
# @Date     ：2025/10/01 23:27:23
# @Desc     ：SQLModel classes for shudaodao_admin.t_enum_group

from typing import Optional, TYPE_CHECKING

from sqlalchemy import BigInteger

from shudaodao_core import BaseResponse
from shudaodao_core import SQLModel, Field

if TYPE_CHECKING:
    pass


class TEnumGroupBase(SQLModel):
    """ 创建、更新 共用字段 """
    group_pid: int = Field(sa_type=BigInteger, description="所属分组")
    group_name: str = Field(max_length=100, description="分组名称")
    sort_order: Optional[int] = Field(default=None, description="排序权重")
    description: Optional[str] = Field(default=None, description="描述")


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
