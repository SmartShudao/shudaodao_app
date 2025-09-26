
# 版本更新

## v0.1.2

### shudaodao 版本更新

  > pypi 上 版本 v0.1.27

  如果无法获取最新，请注释 shudaodao_app 工程 pyproject.toml 中
```toml
[[tool.uv.index]]
url = "https://mirrors.tuna.tsinghua.edu.cn/pypi/web/simple/"
default = true
```



### 开发环境变化
  1、增加组件 "pyjwt>=2.10.1", 用户产品使用授权

  2、优化了代码生成器

  3、更新的模版文件

### 后端API生成器
  增加了SQLModel 约束关系的生成

  生成 schema 目录 __init__.py 文件中多了配置管理

  优化 雪花算法ID，后端bigint ,前端 str

  优化 日期类字段的支持，前后端保持一致（但没有采用有时区的UTC，出于老库兼容考虑）
  
### 增加了产品使用授权功能
  config 目录 增加了2个文件

    1、许可文件：license.jwt
    2、公钥文件：public.pem

  目前是开发许可，**30天** 过期，定期更新

  


## v0.1.1
  > FastAPI 的路由，支持配置文件加载 
```yaml
  #路由配置
  routers:
    # name 是包名「可以直接写子包，但是要写全」，注意: 不是目录名
    - { name: "shudaodao_core", "prefix": "/api" }
    - { name: "shudaodao_common", "prefix": "/api", "tags": [ ] }
    - { name: "shudaodao_omni", "prefix": "/api", "tags": [ "AI 应用" ] }
    - { name: "shudaodao_generate.shudao_acm", "prefix": "/api" , "tags": [ "访问控制系统" ] }

```

# 开发环境管理 
## 首选 uv

    uv add shudaodao

# 注意事项

## 1. 资源 根目录
- 目录 web 标记为  **资源根目录**

## 2. 源代码 根目录
- 所有 src 目录 需要标记为 **源代码根目录**
  - src
  - packages/****/src

## 3. 默认目录
- 配置都在目录 **config** 
- 模型文件目录 **models**



