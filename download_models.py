#!/usr/bin/env python3
# -*- coding:utf-8 -*-
# @License  ：(C)Copyright 2025, 数道智融科技
# @Author   ：李锋
# @Software ：PyCharm
# @Date     ：2025/8/28 上午2:11
# @Desc     ：
from pathlib import Path

from modelscope import snapshot_download

# 需要缓存模型清单
models_list = [
    'Qwen/Qwen3-0.6B',
    'Qwen/Qwen3-Embedding-0.6B',
]

# 缓存模型到Models目录
for model in models_list:
    snapshot_download(model, cache_dir=Path(__file__).parent / 'models')
