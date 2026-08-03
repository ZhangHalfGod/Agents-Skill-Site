# Playbook Pack · H2（Architect）

scheme: single-facade-mcp+hop-snapshot  
queried_via: agents-skill-remote  

## sources

- Agent `Architect` @ `docs/zh/agents/standard/Architect/index.md` (contentHash=0c7488c611693662)
- Skill `stage-gate-flow` @ `docs/zh/skills/custom/common/stage-gate-flow/index.md` (contentHash=03778f2e80391568)
- Skill `ai-code-boundary` @ `docs/zh/skills/custom/common/ai-code-boundary/index.md` (contentHash=f8e641bd8ab22698)

## 角色义务

1. 设计模块架构、接口与数据流
2. 评估网关层新增端点的安全影响（暴露面、注入风险、CSP 兼容）
3. 编写架构约束条款
4. 对网关层代码强制登记红色记录并记录审查结论
5. 执行架构合规性检查表
6. 发现问题即输出整改项

## 出门清单

- [x] 当前阶段输入/输出/审核状态已标明
- [x] 上一阶段 H1 已通过
- [x] 网关层新增端点已登记红色记录（见交付物 §4）
- [ ] 本阶段 Lesson：无新教训
- [ ] 部署——不涉及
- [x] 交付物已落盘
- [x] mcp-resolve-h2.yaml 已落盘
- [x] playbook-pack-h2.md 已落盘
- [x] 文件落盘后自查存在

## 硬禁区

1. 禁止修改业务仓任何文件（H3 才允许）
2. 禁止调用飞书工具
3. 禁止 npm install / rebuild / git push
4. 禁止写 key-token 进文件
5. 禁止改 openapiGenerator.js（不加 tags）
6. 禁止改 server/index.js CSP
7. 禁止改现有业务路由
8. 禁止越权产出其他角色交付物
9. UTF-8

## 给下一跳（DevLead / H3）的执行纪律

1. HTML 独立文件放 `server/views/swagger-ui.html`（不与路由代码混在一起）
2. 路由用 `res.sendFile()` + ES module __dirname 推导（`import.meta.url` → `fileURLToPath`）
3. 文件不存在时路由应有 try/catch 降级（返回 500 text）
4. HTML 内 fetch 带错误处理（.catch 显示"加载失败，请确认 extern-api 已启动"）
5. 分组标签严格按本文 mapping 表，不自由发挥
6. 方法徽章颜色对齐：GET 绿 / POST 蓝 / PUT 橙 / DELETE 红 / PATCH 紫
