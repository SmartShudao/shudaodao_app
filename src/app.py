#!/usr/bin/env python3
# -*- coding:utf-8 -*-
# @License  ：(C)Copyright 2025, 数道智融科技
# @Author   ：李锋
# @Software ：PyCharm
# @Date     ：2025/8/18 下午8:14
# @Desc     ：

import uvicorn

from shudaodao_core import AppConfig

if __name__ == "__main__":
    uvicorn.run(
        app="main:webapp",
        host=AppConfig.webapp.host,
        port=AppConfig.webapp.port,
        workers=1 if AppConfig.webapp.reload else AppConfig.webapp.workers,  # reload = true 设置 workers = 1
        reload=AppConfig.webapp.reload,  # reload = true 一般开发阶段使用
        # reload = false 移除 监视目录
        reload_dirs=["../config", "../src", "../packages"] if AppConfig.webapp.reload else None
    )
