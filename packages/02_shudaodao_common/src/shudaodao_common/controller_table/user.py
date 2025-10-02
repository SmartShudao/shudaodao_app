#!/usr/bin/env python3
# -*- coding:utf-8 -*-
# @License  ：(C)Copyright 2025, 数道智融科技
# @Author   ：李锋
# @Software ：PyCharm
# @Date     ：2025/8/28 下午9:32
# @Desc     ：

from shudaodao_core import AsyncSession, AuthRouter, Depends
from shudaodao_core import AuthService, DataService, QueryRequest, ResponseUtil

from ..entity_table.user import User, UserCreate, UserResponse, UserUpdate

User_Router = AuthRouter(
    prefix="/v1/common", tags=["系统配置"],
    db_config_name="Common",
    default_role="shudaodao_common",
    auth_obj="shudaodao_common.t_user"

)


@User_Router.post(path="/user/query", auth_act="query", summary="检索用户")
async def user_query(*, query: QueryRequest,
                     db: AsyncSession = Depends(User_Router.get_async_session)):
    query_model = await DataService.query(
        db, query, model_class=User,
        response_class=UserResponse
    ),
    return ResponseUtil.success(data=query_model, message="查询成功")


@User_Router.post(path="/user", auth_act="edit", summary="创建用户")
async def user_create(
        *, create_model: UserCreate,
        db: AsyncSession = Depends(User_Router.get_async_session)):
    create_model.password = AuthService.hash_password(create_model.password)
    response_model = await DataService.create(
        db, db_model_class=User,
        create_model=create_model,
        response_class=UserResponse
    )
    return ResponseUtil.success(data=response_model, message="创建成功")


@User_Router.get(path="/user/{primary_id}", summary="获取用户")
async def user_read(*, primary_id: int,
                    db: AsyncSession = Depends(User_Router.get_async_session)):
    response_model = await DataService.read(
        db, primary_id, model_class=User,
        response_class=UserResponse
    )
    return ResponseUtil.success(data=response_model, message="获取成功")


@User_Router.patch(path="/user/{primary_id}", summary="更新用户")
async def user_update(*, primary_id: int, update_model: UserUpdate,
                      db: AsyncSession = Depends(User_Router.get_async_session)):
    response_model = await DataService.update(
        db, primary_id, model_class=User,
        update_model=update_model,
        response_class=UserResponse
    )
    return ResponseUtil.success(data=response_model, message="更新成功")


@User_Router.delete(path="/user/{primary_id}", summary="删除用户")
async def user_delete(*, primary_id: int,
                      db: AsyncSession = Depends(User_Router.get_async_session)):
    await DataService.delete(db, primary_id, model_class=User)
    return ResponseUtil.success(message="删除成功")
