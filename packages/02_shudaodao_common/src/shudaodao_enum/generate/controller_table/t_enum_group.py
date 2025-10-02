#!/usr/bin/env python3
# -*- coding:utf-8 -*-
# @License  ：(C)Copyright 2025, 数道智融科技
# @Author   ：Shudaodao Auto Generator
# @Software ：PyCharm
# @Date     ：2025/10/02 15:52:55
# @Desc     ：controller classes for shudaodao_enum.t_enum_group

from shudaodao_core import AsyncSession, AuthRouter, Depends
from shudaodao_core import DataService, QueryRequest, ResponseUtil
from ... import get_schema_name, get_engine_name

from ..entity_table.t_enum_group import (
    TEnumGroup, TEnumGroupResponse,
    TEnumGroupCreate, TEnumGroupUpdate
)

TEnumGroup_Router = AuthRouter(
    prefix=f"/v1/{get_schema_name()}/t_enum_group",
    tags=[f"{get_schema_name()}.table"],
    db_config_name=f"{get_engine_name()}",  # 配置文件中的数据库连接名称
    default_role=f"{get_schema_name()}",  # 系统默认角色具有此权限
    auth_obj=f"{get_schema_name()}.t_enum_group"  # 验证权限用的对象名 动作在具体方法中
)


@TEnumGroup_Router.post(
    path="/query", auth_act="query", summary=f"检索 枚举分组表")
async def t_enum_group_query(
        *, query: QueryRequest, db: AsyncSession = Depends(TEnumGroup_Router.get_async_session)
):
    query_model = await DataService.query(
        db, query, model_class=TEnumGroup,
        response_class=TEnumGroupResponse
    )
    return ResponseUtil.success(data=query_model, message="查询成功")


@TEnumGroup_Router.post(
    path="", auth_act="edit", summary=f"创建 枚举分组表")
async def t_enum_group_create(
        *, create_model: TEnumGroupCreate,
        db: AsyncSession = Depends(TEnumGroup_Router.get_async_session)
):
    data_create = await DataService.create(
        db, db_model_class=TEnumGroup,
        create_model=create_model,
        response_class=TEnumGroupResponse
    )
    return ResponseUtil.success(message="创建成功", data=data_create)


@TEnumGroup_Router.get(
    path="/{primary_id}", auth_act="read", summary=f"获取 枚举分组表")
async def t_enum_group_read(
        *, primary_id: int,
        db: AsyncSession = Depends(TEnumGroup_Router.get_async_session)
):
    data_read = await DataService.read(
        db, primary_id, model_class=TEnumGroup,
        response_class=TEnumGroupResponse
    )
    return ResponseUtil.success(message="获取成功", data=data_read)


@TEnumGroup_Router.patch(
    path="/{primary_id}", auth_act="edit", summary=f"更新 枚举分组表")
async def t_enum_group_update(
        *, primary_id: int, update_model: TEnumGroupUpdate,
        db: AsyncSession = Depends(TEnumGroup_Router.get_async_session)
):
    data_update = await DataService.update(
        db, primary_id, model_class=TEnumGroup,
        update_model=update_model,
        response_class=TEnumGroupResponse
    )
    return ResponseUtil.success(message="更新成功", data=data_update)


@TEnumGroup_Router.delete(
    path="/{primary_id}", auth_act="edit", summary=f"删除 枚举分组表")
async def t_enum_group_delete(
        *, primary_id: int,
        db: AsyncSession = Depends(TEnumGroup_Router.get_async_session)
):
    await DataService.delete(db, primary_id, model_class=TEnumGroup)
    return ResponseUtil.success(message="删除成功")
