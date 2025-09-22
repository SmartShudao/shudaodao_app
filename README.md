
# 版本更新
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



