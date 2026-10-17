# templates/ — 内置提示词模板装配指南（给执行装配的 Agent）

本目录是 `dsh-prompt-layers` 随包发行的**可选模板资源**，不是运行时配置权威。正文只在用户显式导入后才进入实际系统提示词；未导入时安装本插件不产生任何模板 Section。

## 先读这些（顺序固定）

1. `catalog.json`：模板索引。每项含 `id`、`version`、`title`、`titleZh`、`description`、`descriptionEn`、`file`、`sectionId`、`recommendedScope`，部分含 `when`；`titleZh` / `descriptionEn` 只供 Web UI 双语显示，不参与装配。**只按本文件取元数据，不要自己发明模板 ID 或 sectionId。**
2. 目标 DSH 环境里的 `prompt-layers.schema.json`（`$id: urn:dsh-prompt-layers:schema:v1`）：确认当前版本实际支持哪些字段。
3. 用户已有的 `$DSH_HOME/prompt-layers/` 下 YAML 与 `content/*.md`：确认已有什么、哪些正文被用户改过。

若第 2 步拿不到该 Schema，或 Schema 里没有 `when` 定义，说明当前宿主能力缺口：此时**不得**把 `catalog.json` 的 `when` 原样写进用户配置，也不得声称条件已生效。按 `status.json` 能表达的 `unknown` 语义如实报告。

## 硬约束

- **不自动启用。** 未经用户在本次对话中明确选择「导入哪个模板 + 目标作用域 + 目标路由」，不写任何 YAML。
- **正文不进代码、不经改写。** `templates/*.md` 是已批准正文的唯一来源，逐字使用；不缩写、不合并、不追加新规则。要改正文属于版本变更，须走审计与版本升级，不能在装配任务里顺手改。
- **`when` 是推荐条件，不是当前已实现能力的证明。** `when.agent.role: main`（Flash 主统筹）与 `when.tools.powershell: true`（PowerShell）都要求目标宿主已实现对应匹配；未实现时如实说明，不生成会被静默忽略的伪配置。
- **本插件与 `dsh-guardrails` 完全独立。** 不把它的安装状态、拒绝记录或 API 当作导入条件、匹配条件或健康检查项，也不在配置里声明依赖它。
- **不越权。** 不请求扩大自身权限，不绕过宿主审批与文件权限，不写 `$DSH_HOME/AGENTS.md` 或业务项目的全局指令。

## 装配步骤

1. **确认精确目标。** 与用户确认：模板 `id`、目标 `provider`/`model` 精确 ID（以宿主实际配置的路由为准，不按模型名是否含 `flash` 推断强弱，也不按 UI 显示名猜 preset）、作用域（`global` / `provider` / `model`）、Agent 角色（主 Agent / 子 Agent / 两者）。`recommendedScope` 只是建议，冲突时以用户选择为准并说明差别。
2. **读现有配置与正文。** 列出将新增或改动的 `sectionId`、目标 YAML 文件、以及要写入的 `content/*.md` 路径。若同 `sectionId` 已存在、或同一模板已导入过，先给出差异与冲突说明，等用户确认再动；**不得静默覆盖用户已编辑的正文**。
3. **先写正文，最后写 YAML。** 顺序是：先写 `content/<name>.md`（内容为 `templates/<file>` 的逐字正文），再写引用它的 YAML 条目。这样中间态不会出现「YAML 引用了不存在的正文」，也不会短暂激活空 Section。
4. **写最小 YAML 增量。** 只新增或修改本次确认的 `sections` 条目，保留文件里其它条目、注释与既有排序锚点；`contentFile` 路径相对 `prompt-layers/` 根，只用正斜杠，形如 `content/credential-aware-automation.md`。
5. **读取生成的校验反馈。** 写入后读 `generated/status.json`（候选是否有效、错误在哪个文件/字段/ID、当前有效快照、是否原生回退）与 `generated/sections-index.json`（各路由下有效 Section、来源层、启用状态、预计顺序）。有 Schema/语义错误就按报错修，不要靠猜；`generated/` 是只读派生信息，永不手改。
6. **区分「已保存 / 已校验 / 实际已发送」。** 配置合法、热重载成功、索引里的预计顺序，都**不等于**该次真实请求已经带上这段提示词。要让用户看到真实生效，需要在一次真实模型步骤后核对；做不到就明确说「已导入并校验，尚未验证该次请求实际生效」。`complete: true` 或下游覆盖存在时，如实报告普通 Section 被抑制。

## 报告口径

- 报「做了什么」：改了哪些文件、新增哪些 `sectionId`、目标路由、正文字节/词数与 `templates/<file>` 一致。
- 报「验证了什么」：`status.json` 的实际状态、有无错误、是否发生回退。
- 报「没验证什么」：真实请求是否已应用、条件匹配是否按预期命中、模型行为是否改善。
- 不把模板正文、用户提示词全文或任何密钥粘贴进回复与日志。

## 目录内容

- `catalog.json`：模板索引与导入元数据。
- `*.md`：七份已批准正文，均为纯文本 System Prompt 段，`{{...}}` 会按字面量处理（不启用插值）。
- `README.md`：导航，含各模板的来源与批准状态。
