# dsh-prompt-layers 文档入口

本目录拥有当前产品需求、实现边界与验证记录。2026-10-17 按已确认的 dsh-prompt-layers 设计重构旧 dsh-method-principles；旧决策保留其历史名称和效力范围，不作为新接口定义。

| 文档 | 权威范围 |
| --- | --- |
| 需求.md | 产品目标与验收要求 |
| 技术栈设计.md | 运行时与依赖、宿主兼容门槛 |
| 项目结构设计.md | 模块职责、依赖方向 |
| technical-details/提示词段机制.md | 文件、继承、排序、快照与观察语义 |
| technical-details/部署.md | 本次验证与部署证据 |
| technical-details/界面与编辑工作区.md | SettingsForm 形态、适用范围导航、草稿与一次保存 |
| decisions/DSR-006-声明式分层重构.md | 更名映射、旧接口撤销、宿主门槛决策（模型层部分由 DSR-007 取代） |
| decisions/DSR-007-模型层声明路由激活.md | 模型层按声明路由激活、pwsh 工具判定、主统筹 global |
| TODO.md | 唯一未完成清单 |

七份批准正文的发行权威为 templates/*.md，模板来源和版本见该目录索引。开发不能依赖管理仓库被忽略的 references/ 作为安装后必需资源。
