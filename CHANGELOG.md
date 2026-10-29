# Changelog

## 0.1.2 — 2026-10-28

- 修复模型层按“Agent 创建时的应用默认模型”而不是会话实际路由匹配：`assemblyFacts` 改为读取 `system-prompt/assemble` waterfall 之后的 `provider`/`model` 变量（会话模型选择已在该 waterfall 内覆写），仅在装配未声明路由时回退 `agent.options`。修掉 `gpt-6.1-sol` 会话命中弱模型段、`deepseek-v4.1-flash` 会话命中 sol 段的镜像错配。详见 `docs/decisions/DSR-008`。

## 0.1.1 — 2026-10-22

- 修复 live 根会话未显式写入 `delegationDepth` 时 `role: main` 条件不命中：按宿主 `delegationDepthOf()` 的 0 语义判定主 Agent，使 `sol-main-delegation` 等主 Agent 模型层恢复插入。

## 0.1.0 — 2026-10-18

- 将版本线从 0.2.0 重置为 0.1.0；旧 0.2.0 开发线未发布、无 tag、无外部版本消费者，按 `knowledge/v0.2.1-rc.2/05-插件工程约定.md` 的版本重置规则冻结为历史。
- 添加原创的 `icon.svg`，通过 `./icon` 导出，供 Plugins 页展示。
- 既有：声明式系统提示词分层、显式模板导入、模型层按声明路由激活、主统筹限定弱模型、PowerShell 工具条件与模板默认锚定。

## 0.2.0 — Unreleased development line (frozen)

- 2026-10-17 开发线；未发布、无 tag、无外部版本消费者，已被 0.1.0 版本线重置取代，仅作历史。
