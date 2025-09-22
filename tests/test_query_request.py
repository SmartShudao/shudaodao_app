# === 使用示例 ===
from shudaodao_core import QueryRequest

if __name__ == "__main__":
    import json

    json_data1 = {
        "type": "AND",
        "conditions": [
            {"field": "A", "op": "=", "val": "someValueA"},
            {"field": "B", "op": "=", "val": "someValueB"}
        ],
        "orderby": [
            {"field": "value", "order": "desc"},
            {"field": "name", "order": "asc"}
        ]
    }
    # 示例数据
    # (A and B) or ( C and (D or E) )
    json_data2 = {
        "type": "OR",
        "conditions": [
            {
                "type": "AND",
                "conditions": [
                    {"field": "A", "op": "=", "val": "someValueA"},
                    {"field": "B", "op": "=", "val": "someValueB"}
                ]
            },
            {
                "type": "AND",
                "conditions": [
                    {"field": "C", "op": "=", "val": "someValueC"},
                    {
                        "type": "OR",
                        "conditions": [
                            {"field": "D", "op": "=", "val": "someValueD"},
                            {"field": "E", "op": "=", "val": "someValueE"}
                        ]
                    }
                ]
            }
        ],
        "orderby": [
            {"field": "value", "order": "desc"},
            {"field": "name", "order": "asc"}
        ],
        "page": 1,
        "size": 10,
        "paging": True
    }

    try:
        query = QueryRequest(**json_data1)
        print(json.dumps(query.model_dump(), indent=2))

        query = QueryRequest(**json_data2)
        print(json.dumps(query.model_dump(), indent=2))

    except Exception as e:
        print(f"❌ 解析失败: {e}")
