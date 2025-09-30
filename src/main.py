#!/usr/bin/env python3
# -*- coding:utf-8 -*-
# @License  ：(C)Copyright 2025, 数道智融科技
# @Author   ：李锋
# @Software ：PyCharm
# @Date     ：2025/8/18 下午8:14
# @Desc     ：
from fastapi import FastAPI, APIRouter
from starlette.responses import FileResponse
from starlette.staticfiles import StaticFiles

from middleware import register_middlewares
from shudaodao_core import BaseApplication, CoreUtil
from shudaodao_core.config.app_config import AppConfig
from shudaodao_core.utils.response_utils import ResponseUtil


class Application(BaseApplication):
    """ 应用程序管理器 """

    # 首页 路由
    home_page = APIRouter(
        prefix="",
        tags=["首页"],
    )

    # 挂载首页
    @home_page.get("/", summary=AppConfig.webapp.page)
    async def root(self):
        if AppConfig.webapp.page:
            return FileResponse(CoreUtil.get_admin_path() / AppConfig.webapp.page, media_type="text/html")
        else:
            return ResponseUtil.success(message="未定义首页，请配置 AppConfig.webapp.page ")

    def application_init(self, app: FastAPI):
        # 挂载首页
        app.include_router(self.home_page)
        # 挂载静态文件
        app.mount("/", StaticFiles(directory=str(CoreUtil.get_admin_path()), html=True), name="static")
        # 注册中间件
        register_middlewares(app)

    async def application_load(self):
        ...

    async def application_unload(self):
        ...


# 创建应用实例
webapp = Application().app
