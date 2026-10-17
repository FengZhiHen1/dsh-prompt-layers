# 内置提示词模板

随 `dsh-method-principles` 发行的七份可选 System Prompt 模板正文。**安装插件不会自动导入或启用**任何一份：正文只有被显式导入到 `$DSH_HOME/prompt-layers/` 的声明式 YAML/Markdown 后才生效，导入后由该配置（不是本目录）成为运行时权威。

装配流程与硬约束见同目录 `AGENTS.md`；模板以机器可读的 `catalog.json` 为索引，正文文件是本目录下的 `*.md`。

## 模板一览

| 文件 | Section ID | 推荐作用域 | 条件 | 批准来源 |
|---|---|---|---|---|
| `evidence-discipline.md` | `custom:evidence-discipline` | global | 无（全部主/子 Agent） | `04_内置模板导入契约与原则草案.md` §3（2026-10-17） |
| `anti-unwarranted-defense.md` | `custom:anti-unwarranted-defense` | global | 无（全部主/子 Agent） | `05_反无依据防御提示词候选.md` §2（2026-10-16） |
| `technical-communication.md` | `custom:technical-communication` | global | 无（按输出体裁自限） | `06_技术语言规范研究与候选.md` §9（2026-10-16） |
| `flash-execution-core.md` | `custom:flash-execution-core` | model | 无 Agent 角色限制（主/子均适用） | `11_Flash主子Agent分层提示词候选.md` §2（2026-10-17） |
| `flash-main-coordination.md` | `custom:flash-main-coordination` | model | `when.agent.role: main` | `11_Flash主子Agent分层提示词候选.md` §3（2026-10-17） |
| `pwsh-guidance.md` | `custom:pwsh-guidance` | global | `when.tools.powershell: true` | `15_PowerShell补充提示词精简稿与对照验收.md` §2（469 词，2026-10-17） |
| `credential-aware-automation.md` | `custom:credential-aware-automation` | global | 无（全部主/子 Agent） | `19_凭证上下文实测复盘与最小化优化方案.md` §3（2026-10-17） |

来源文件位于本机设计资料库 `references/dsh-prompt-layers/`（相对本仓库根为 `../../references/dsh-prompt-layers/`）。该目录被 git 忽略、不随包发布，因此**逐字正文以本目录的 `*.md` 为发行来源**，资料库只作溯源与审批记录。

## 批准状态

- **正文**：七份均由用户逐字批准，本目录内容与批准原文逐字一致（2026-10-17 复核，字级比对通过）。文件本身无任何新增规则、无前后解释性文字。
- **未完成**：插件实现（YAML 解析、三层合成、热重载、UI 导入流程）；`when.agent` / `when.tools` 的 Schema 与宿主匹配能力（`prompt-layers.schema.json` 当前不含 `when`，属待升级项）；目标 DSH 版本的真实请求注入核验；DeepSeek v4.1 Flash 等模型的行为 A/B。
- `catalog.json` 的 `sectionId`、`version`、`recommendedScope`、`when` 是**导入元数据与推荐值**，不属于正文批准范围；`builtin:evidence-discipline`、`builtin:anti-unwarranted-defense`、`builtin:technical-communication` 沿用设计资料库给出的发行 ID，其余按同一命名规则派生。

## 不作为发行正文的历史材料

以下保留在设计资料库中，仅供对照与 A/B，不随本目录发行：`14_PowerShell实测与社区调研及提示词候选.md` §4（PowerShell 785 词长版）、`09_Flash工程执行规范完整初稿.md`（Flash 单段早期初稿）、`17_凭证安全加固与SecretHandling提示词候选.md` §4/§8 与 `18_凭证安全与自动化执行的兼容性设计研讨.md` §6.2（凭证段的禁令式与 130 词早期候选）。

## 与其他插件的关系

与 `dsh-guardrails` 及任何安全插件均无依赖：本目录的模板不要求其存在，不读取其状态，也不声称提供强制拦截。`pwsh-guidance.md` 的条件只看目标 Agent 是否真的具备 PowerShell 执行能力，不看是否装有其他插件。
