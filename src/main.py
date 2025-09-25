#!/usr/bin/env python3
# -*- coding:utf-8 -*-
# @License  ：(C)Copyright 2025, 数道智融科技
# @Author   ：李锋
# @Software ：PyCharm
# @Date     ：2025/8/18 下午8:14
# @Desc     ：

from starlette.staticfiles import StaticFiles

from middleware import register_middlewares
from shudaodao_core import BaseApplication, CoreUtil


class Application(BaseApplication):

    def application_unload(self):
        ...

    def application_onload(self):
        # 注册中间件
        register_middlewares(self.app)


# 创建应用实例
webapp = Application().app
# 挂载静态文件
webapp.mount("/", StaticFiles(directory=str(CoreUtil.get_admin_path()), html=True), name="static")
