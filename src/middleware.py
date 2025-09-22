#!/usr/bin/env python3
# -*- coding:utf-8 -*-
# @License  ：(C)Copyright 2025, 数道智融科技
# @Author   ：李锋
# @Software ：PyCharm
# @Date     ：2025/8/27 上午1:37
# @Desc     ：

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware


def register_middlewares(app: FastAPI):
    """全局中间件处理"""

    # 加载 压缩中间件 GZip Middleware  todo: gzip 压缩会导致 流式请求失败，先注释掉以后处理
    # _add_middleware_gzip(app)

    # 加载 跨域中间件 CORS Middleware
    _add_middleware_cors(app)


def _add_middleware_gzip(app: FastAPI):
    app.add_middleware(
        GZipMiddleware,  # type: ignore
        minimum_size=1000,
        compresslevel=9)


def _add_middleware_cors(app: FastAPI):
    app.add_middleware(
        CORSMiddleware,  # type: ignore
        allow_origins=["*"],  # 允许所有源
        allow_credentials=True,
        allow_methods=["*"],  # 允许所有方法
        allow_headers=["*"],  # 允许所有头
    )
