---
title: "AI 代码生成范围清单"
description: 只读同步自 standards；请改源文件后执行 npm run sync
---

::: info Source of Truth
本页由 `npm run sync` 从 `standards/common/agents/standard/ProductManager/AI代码生成范围清单.md` 同步生成，**请勿手改**。本站不执行模型推理。
:::

# AI 代码生成范围清单

## 一、模板（可复用骨架）

### 模块信息
- 模块名：
- 版本：
- 负责人：

### 背景与目标
- 现状：
- 目标：
- 迁移约束：

### 功能点（优先级）

#### P0
1.
2.

#### P1
1.

#### P2
1.

### AI 可生成范围
-

### 禁止 AI 生成范围
-

### 核心模块红色记录（触发点）
-

### 验收标准（Given-When-Then）
-

## 二、v2 实战示例（可替换）

> 以下示例基于“Management API v2 目录分层迁移”场景，仅作参考，落地时请替换为当前需求内容。

### 模块信息
- 模块名：Management API v2 目录分层迁移
- 版本：V1.0（迁移第一阶段）
- 负责人：ProductManager / Architect / DevLead 联合评审

### 背景与目标
- 现状：`/v2` 发现页仅包含三条入口，业务 API 主要在 `:8088/v2`（shttpd）侧。
- 目标：在 `:8080` 的发现页新增同级目录 `/v2/home`、`/v2/system`，提供按 method 分组的迁移目录，逐步承接 `:8088/v2` 的存量 API。
- 迁移约束：迁移期间 `http://<ip>:8088/v2` 必须保持可用，待模块迁移完成后再评估下线。

### 功能点（优先级）

#### P0
1. `GET /v2` 返回入口项：`/v2/home`、`/v2/system`、`/v2/other`，并保留原有三项（含 `:8088/v2`）。
2. `GET /v2/home` 从 `8088:/v2` 动态筛选并返回 `/v2/signal/*` 条目（`Link`）。
3. `GET /v2/system` 从 `8088:/v2` 动态筛选并返回 `/v2/network/*` + `/v2/system/*` + `/v2/information*` 条目（`Link`）。
4. `GET /v2/other` 从 `8088:/v2` 动态筛选并返回排除 signal/network/system/information 后的剩余条目。
5. `/v2/signal/*` 在 8080 侧通过通配代理转发到 8088 同路径（GET/POST）。
6. 8080 侧引入路由池原始 JSON 的 TTL 缓存（当前 2 秒）以减少重复抓取。

#### P1
1. 增加动态筛选参数能力（如按模块、方向、方法过滤）。
2. Nginx 与业务文档同步为“双栈并行迁移态”口径（8080 目录/筛选层 + 8088 存量层）。

#### P2
1. 建立目录化迁移规则（先挂目录，再迁移实现，最终下线旧入口）。
2. 扩展 home/system 条目覆盖更多 flow/network/ptp/system 模块。

### AI 可生成范围
- 目录接口 JSON 结构定义与序列化代码。
- 8080 路由分发扩展（`api_router.h`）的常规分支逻辑。
- 文档改写与迁移说明（架构文档、交互文档、Nginx 分析文档）。
- `.claude` 与 `.cursor/rules` 中的流程规范条目补充。

### 禁止 AI 生成范围
- 不得擅自下线、删除、禁用 `:8088/v2` 现网入口。
- 不得修改硬件控制链路（PCIe、FPGA、共享内存逻辑）实现细节。
- 不得引入未经评审的第三方网络依赖或动态脚本执行机制。

### 核心模块红色记录（触发点）
- 网关与协议分发相关（Nginx `/v2` 路由、8080 与 8088 边界）属于网关层，需记录变更目的、风险、回滚方案。
- 若后续将业务接口从 8088 真正迁移为 8080 直连实现，需追加接口契约变更红色记录。

### 验收标准（Given-When-Then）
- Given 服务启动且 Nginx 生效，When 请求 `GET /v2`，Then 返回 JSON 中包含 `/v2/home`、`/v2/system` 且保留 `:8088/v2`。
- Given 请求 `GET /v2/home`，When 解析返回列表，Then 仅包含 `/v2/signal/*` 条目。
- Given 请求 `GET /v2/system`，When 解析返回列表，Then 仅包含 `/v2/network/*`、`/v2/system/*` 与 `/v2/information*` 条目。
- Given 请求 `GET /v2/other`，When 解析返回列表，Then 不包含 `/v2/signal/*`、`/v2/network/*`、`/v2/system/*`、`/v2/information*` 条目。
- Given 请求 `GET http://<ip>:8088/v2`，When 迁移进行中，Then 接口正常返回，不出现中断。
- Given 阅读三份文档，When 核对端口与路径说明，Then 无“8088 已下线”误导描述。

