[request_definition]        # 请求格式：主体, 对象, 操作
r = sub, obj, act

[policy_definition]         # 策略格式：谁, 能访问什么, 做什么操作
p = sub, obj, act

[role_definition]           # 角色继承关系：用户 ↔ 角色
g = _, _

[policy_effect]             # 策略效果：只要有一条允许就放行
e = some(where (p.eft == allow))

[matchers]                  # 匹配器：判断请求是否匹配策略
m = g(r.sub, p.sub) && r.obj == p.obj && r.act == p.act || r.sub == "root"



