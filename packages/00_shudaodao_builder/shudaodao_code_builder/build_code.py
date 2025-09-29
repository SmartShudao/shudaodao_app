#!/usr/bin/env python3
# -*- coding:utf-8 -*-

from shudaodao_core import GeneratorService, GeneratorConfig

if __name__ == "__main__":
    # --------------------------------------------
    #           生成器 配置
    # --------------------------------------------
    config = GeneratorConfig(
        # 数据库 连接
        db_url="postgresql+psycopg2://postgres:postgres@localhost:5432/postgres",

        # 如果数据库不支持 schema 时，设置default_schema
        # default_schema_name="shudaodao_aaa",

        # 数据库连接名称    来自 xxx.yaml - storage - database - name: Core Common Generate 定义
        database_engine_name="Generate",

        # 输出目录: 默认: {project_root}/src/shudaodao_generate
        # output_path=None
    )
    # --------------------------------------------
    #           生成器 用法
    # 1、生成 table     <- generator_table generator_view
    # 2、生成 schema    <- generator_schema
    # 3、生成 database  <- generator_all
    # --------------------------------------------
    builder = GeneratorService(config)
    # builder.generator_table(table_name="number", schema_name="shudao_acm")
    # builder.generator_view(view_name="v_donelist", schema_name="shudao_bpm")
    # builder.generator_schema(schema_name="shudao_acm")
    # builder.generator_schema(schema_name="shudao_admin")
    # builder.generator_schema(schema_name="shudao_bpm")
    # builder.generator_schema(schema_name="shudaodao_core")
    builder.generator_all()
