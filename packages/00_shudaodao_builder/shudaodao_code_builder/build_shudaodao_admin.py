#!/usr/bin/env python3
# -*- coding:utf-8 -*-
# @License  ：(C)Copyright 2025, 数道智融科技
# @Author   ：李锋
# @Software ：PyCharm
# @Date     ：2025/10/1 下午7:53
# @Desc     ：

from shudaodao_core import GeneratorService, GeneratorConfig

if __name__ == "__main__":
    """ 代码生成环境默认 postgres  """

    # 生成器 配置
    config = GeneratorConfig(
        # 数据库连接名称 .yaml - storage - database - name: Shudaodao_Admin 定义
        database_engine_name="Shudaodao_Admin",
        # 输出目录: 默认: {project_root}/src/shudaodao_generate
        output_path="packages/01_shudaodao_admin/src"
    )

    builder = GeneratorService(config)
    # 生成 schema
    builder.generator_schema("shudaodao_admin")
