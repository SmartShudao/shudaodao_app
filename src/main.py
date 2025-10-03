#!/usr/bin/env python3
# -*- coding:utf-8 -*-
# @License  ：(C)Copyright 2025, 数道智融科技
# @Author   ：李锋
# @Software ：PyCharm
# @Date     ：2025/8/18 下午8:14
# @Desc     ：

from fastapi import FastAPI
from starlette.responses import FileResponse
from starlette.staticfiles import StaticFiles

from middleware import register_middlewares
from shudaodao_core import BaseApplication, CoreUtil, AppConfig, ResponseUtil


class Application(BaseApplication):
    """ 应用程序管理器 """

    def application_init(self, app: FastAPI):
        # 注册中间件
        register_middlewares(app)

        # 挂载首页
        @self.app.get("/", tags=["首页"], summary=AppConfig.webapp.page)
        async def root():
            if AppConfig.webapp.page:
                return FileResponse(CoreUtil.get_admin_path() / AppConfig.webapp.page, media_type="text/html")
            else:
                return ResponseUtil.success(message="未定义首页，请配置 AppConfig.webapp.page ")

    async def application_load(self):
        # 挂接静态资源
        self.app.mount("/", StaticFiles(directory=str(CoreUtil.get_admin_path()), html=True), name="static")

    async def application_unload(self):
        ...


# 创建应用实例
webapp = Application().app
