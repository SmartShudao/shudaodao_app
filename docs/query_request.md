# 复杂查询接口

## 1、前端输入 json

### 1.1 字段说明

> 查询条件： A = someValueA or B = someValueB

```
{
    "fields": ["A","B","C","D"],
    "type": "or",
    "conditions": [
        {"field": "A", "op": "=", "val": "someValueA"},
        {"field": "B", "op": "=", "val": "someValueB"}
    ],
    "page": 1,
    "size": 10,
    "orderby": [
        {"field": "A", "order": "desc"},
        {"field": "B", "order": "asc"}
    ],
    "paging": true
}
```

| 属性         | 说明    |        值类型        | 描述          |
|------------|-------|:-----------------:|-------------|
| type       | 逻辑运算  |    空, and, or     |             |
| conditions | 查询条件集 | 集合(field+op+val)  | 1.3 运算符和值类型 |
| page       | 起始位置  |    空,int(>=1)     |             |
| limit      | 返回数量  | null,int(>0 <100) |             |
| orderby    | 排序字段集 |  集合(field+order)  |             |     
| paging    | 返回类型  |    true,false     |分页/列表             |       


### 1.2 逻辑运算符

| 逻辑运算符 | 描述 | 值类型        |
|-------|----|------------|
| and   | 与  | conditions |
| or    | 或  | conditions |

### 1.3 运算符和值类型

| 运算符         | 描述           | 值类型                     |
|-------------|--------------|-------------------------|
| =           | 等于           | str, int, float, bool   |
| !=          | 不等于          | str, int, float, bool   |
| \>          | 大于           | int, float, date        |
| <           | 小于           | int, float, date        |
| >=          | 大于等于         | int, float, date        |
| <=          | 小于等于         | int, float, date        |    
| like        | 匹配模式 （区分大小写） | str % 匹配任意多个字符，_ 匹配一个字符 |    
| ilike       | 匹配模式（不区分大小写） | str	% 匹配任意多个字符，_ 匹配一个字符 |    
| in          | 在集合中         | List[str], List[int]    |    
| not_in      | 不在集合中        | List[str], List[int]    |    
| is_null     | 为 NULL       | -                       |    
| is_not_null | 不为 NULL      | -                       |    

### 1.4 嵌套写法

> 查询条件： (A and B) or (C and (D or E) )

```
{
    "fields": ["A","B","D"],
    "type": "or",
    "conditions": [
        {
            "type": "and",
            "conditions": [
                {"field": "A", "op": "=", "val": "someValueA"},
                {"field": "B", "op": "=", "val": "someValueB"}
            ]
        },
        {
            "type": "and",
            "conditions": [
                {"field": "C", "op": "=", "val": "someValueC"},
                {
                    "type": "or",
                    "conditions": [
                        {"field": "D", "op": "=", "val": "someValueD"},
                        {"field": "E", "op": "=", "val": "someValueE"}
                    ]
                }
            ]
        }
    ],
    "page": 1,
    "size": 10,
    "orderby": [
        {"field": "A", "order": "desc"},
        {"field": "B", "order": "asc"}
    ]
}
```

## 2. 后端接口

```
@User_Router.get("/user")
async def user_query(*, db: Session = Depends(get_session), query: QueryRequest):
    return CRUDService.query(db, query, model_class=User)
```

## 3. 接口输出 json

```
{
  "success": true,
  "code": 200,
  "name": "list",
  "message": "查询成功",
  "data": [
    {"field_A": "someValueA","field_B": "someValueB","field_D": "someValueD" },
    {"field_A": "someValueA","field_B": "someValueB","field_D": "someValueD" },
    {"field_A": "someValueA","field_B": "someValueB","field_D": "someValueD" },
    {"field_A": "someValueA","field_B": "someValueB","field_D": "someValueD" },
    {"field_A": "someValueA","field_B": "someValueB","field_D": "someValueD" }
  ]
}

```
