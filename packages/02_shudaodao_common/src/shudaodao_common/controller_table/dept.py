#!/usr/bin/env python3
# -*- coding:utf-8 -*-
# @License  ：(C)Copyright 2025, 数道智融科技
# @Author   ：李锋
# @Software ：PyCharm
# @Date     ：2025/8/29 下午1:58
# @Desc     ：

from shudaodao_core import AsyncSession, AuthRouter, Depends
from shudaodao_core import DataService, QueryRequest, ResponseUtil
from ..entity_table.dept import Dept, DeptCreate, DeptResponse, DeptUpdate

Dept_Router = AuthRouter(
    prefix="/v1/common", tags=["系统配置"],
    db_config_name="Common",
    default_role="shudaodao_common",
    auth_obj="shudaodao_common.dept"
)


@Dept_Router.post("/dept/query", auth_act="query")
async def dept_query(
        *, query: QueryRequest, db: AsyncSession = Depends(Dept_Router.get_async_session)
):
    data_query = await DataService.query(db, query, model_class=Dept)
    return ResponseUtil.success(message="查询成功", data=data_query)


@Dept_Router.post("/dept", auth_act="edit")
async def dept_create(
        *, create_model: DeptCreate,
        db: AsyncSession = Depends(Dept_Router.get_async_session)
):
    data_create = await DataService.create(
        db, db_model_class=Dept, create_model=create_model, response_class=DeptResponse
    )
    return ResponseUtil.success(message="创建成功", data=data_create)


@Dept_Router.get("/dept/{primary_id}", auth_act="read")
async def dept_read(
        *, primary_id: int,
        db: AsyncSession = Depends(Dept_Router.get_async_session)
):
    data_read = await DataService.read(
        db, primary_id, model_class=Dept, response_model=DeptResponse
    )
    return ResponseUtil.success(message="获取成功", data=data_read)


@Dept_Router.patch("/dept/{primary_id}", auth_act="edit")
async def dept_update(
        *, primary_id: int, model_update: DeptUpdate,
        db: AsyncSession = Depends(Dept_Router.get_async_session)
):
    data_update = await DataService.update(
        db, primary_id, model_class=Dept, update_model=model_update, response_model=DeptResponse
    )
    return ResponseUtil.success(message="更新成功", data=data_update)


@Dept_Router.delete("/dept/{primary_id}", auth_act="edit")
async def dept_delete(
        *, primary_id: int,
        db: AsyncSession = Depends(Dept_Router.get_async_session)
):
    await DataService.delete(db, primary_id, model_class=Dept)
    return ResponseUtil.success(message="删除成功")
