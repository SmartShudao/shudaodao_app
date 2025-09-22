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
        # 鉴权用的角色(默认 schema_name)
        output_auth_role_name=None,
        # 实体模型: 是否输出 schema 标签
        output_schema_to_entity=True,
        # router_path : 一般不用设置，默认用 schema，如果数据库不支持 schema 建议设置
        # output_router_path="shudaodao_aaa",
        # 数据库连接名称    来自 xxx.yaml - storage - database - name: Core Common Generate 定义
        output_db_engine_name="Generate",
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
    builder.generator_schema(schema_name="shudao_acm")
    builder.generator_schema(schema_name="shudao_bpm")
    builder.generator_schema(schema_name="shudao_admin")
    # builder.generator_all()
