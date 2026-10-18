# dsh-prompt-layers

以 YAML/Markdown 管理 DSH 系统提示词 Section。Web UI 与 Agent 编辑同一份文件；七份版本化模板只有显式导入后才生效。

当前为 0.2.0 开发版本，集成目标为 DSH 0.2.1-rc.2（已验证兼容 0.2.0-rc.2）。**provider/model 层按 Agent 在系统提示词组装时声明的 provider/model 激活**；该路由与宿主的 `{{provider}}`/`{{model}}` 变量同源。宿主在组装之后还有 `agent/request` 请求级路由环节，若该环节覆盖声明模型，模型层不会随之重建；这是已知边界，不按显示名或旧模型猜测。PowerShell 条件按该 Agent 可见的 `pwsh` 工具判定；未注册该工具时不匹配。真实请求注入与模型行为 A/B 仍需单独验证，不能仅凭配置激活视为完整 V1 通过。

## 配置

默认根目录为 `$DSH_HOME/prompt-layers/`，缺失目录等同空配置。宿主行只放轻量配置：

```yaml
- id: prompt-layers
  config:
    directory: ''            # 空值使用 DSH_HOME/prompt-layers
    pollIntervalMs: 1000
```

规则文件布局：`global.yaml`、`providers/*.yaml`、`models/*.yaml`、`content/**/*.md`。文件名不参与路由匹配，provider/model 必须在文件内显式声明。结构规范随包发行于 `prompt-layers.schema.json`。

```yaml
apiVersion: prompt-layers/v1
scope: global
sections:
  - id: custom:my-guidance
    contentFile: content/my-guidance.md
    interpolate: false
    when:
      agent:
        role: main
```

自定义 Section 默认启用，默认关闭插值。三层合成顺序是 global → provider → 精确 model；同 ID 未声明字段继承，正文整体替换，`when` 整体替换。`position: default` 回首次定义的位置；`before`/`after` 锚点缺失、禁用或循环都拒绝。`existing` 精确覆盖宿主已有段，受管段修改要求 `allowManagedOverride: true`。动态上下文、工具 Schema 和权限不在修改范围内。

文件热加载会验证完整候选集；坏 YAML、损坏 Markdown、越界路径或语义错误保留整套进程内旧快照。重启无有效配置则回退原生，不保存跨重启缓存。`generated/status.json` 和 `generated/sections-index.json` 是派生状态，不反向加载；它们不包含提示词正文。

## 模板与界面

插件详情页先展示插件描述与 `prompt-layers` 行，点击该行 Configure 进入 Section 工作区；工作区采用官方 SettingsForm 形态：适用范围字段选择全局／供应商／模型，Section 列表内联展开编辑，Sections 标题和展开区顶部重复显示当前范围，范围标签旁的 info 收“先选范围、再新建或添加模板”的操作说明，字段行只留短提示；切换范围若有草稿先就地确认再丢弃；所有改动先进入草稿，保存键一次 revision 围栏提交；未修改、非法或保存中时保存禁用，成功不额外播报，失败保留草稿。可删除/移除的行在行右侧使用垃圾桶图标，按新增、已保存本地定义、覆盖/原生段分别执行放弃新增、删除此 Section、移除覆盖并恢复继承；删除在保存时写入，保存前显示"保存后移除"并可撤销。模板在独立弹层中逐条直接加入草稿，已存在或已继承的模板不重复添加；标题与说明按界面语言切换，正文预览保持批准原文；已添加但正文与当前模板不同时显示差异标签，可在预览中查看逐行 diff 并经确认用模板正文替换（只改正文）；推荐模型层的模板在更宽范围下会警告，模板行显示加入目标，第一次添加先确认是否仍然加入，并可从模板弹层或 Section 行回到范围设置；模板源与已导入正文不联动，当前也不追踪导入版本；长说明、模板标签和状态提示收进标签旁的 info 展开器，不再使用 hover title；PowerShell 条件在宿主未检测到该 Agent 可见的 `pwsh` 工具时明确显示“条件不会匹配”，info 说明可在编辑区清除条件；关闭弹层不提交。诊断折叠区保留状态哈希与观察。模板索引与装配指南位于 `templates/`。更新插件不会覆盖已导入的用户正文，不修改工作区或 HOME 的 AGENTS。

模板包括证据纪律、反无依据复杂化、技术沟通、Flash 共享执行核心、Flash 主 Agent 统筹、PowerShell 专项和凭证感知自动化；`catalog.json` 提供中文标题与英文说明供界面显示，正文保持批准原文。主统筹推荐 model 作用域，只在弱模型范围内对主 Agent 生效；共享核心建议按用户选择的精确模型匹配。模板不依赖 Guardrails，也不提供秘密库、输出脱敏或权限隔离。

保存结果（成功静默、失败保留草稿）、候选激活、装配预览、系统消息提交分别呈现。模型层按声明路由进入装配；请求级覆盖不会触发已渲染文本重建，须在验收中单列。`complete:true` 可在 waterfall 后抑制普通 Section；不能把预览成功当成模型已经使用。实际模型行为改善仍需独立 A/B 验证。

## 更名与旧安装

本包由 `dsh-method-principles` 重构而来，旧的 `Config.text`、`Config.routes` 和 `deployment:method-principles` 段已撤销。不会自动导入旧文案，也不会编辑已安装环境。旧安装应先检查真实配置，再显式导入所需模板；不要同时启用旧包，以免重复注入。旧实现与验证记录可从 Git 历史和历史决策查阅。

本地目录、包名与 Git 远端均为 `dsh-prompt-layers`（`FengZhiHen1/dsh-prompt-layers`）。旧远端地址由 GitHub 重定向到新名；引用本包的外部声明应改用新地址与新包名。

## 开发与验证

```powershell
pnpm install --ignore-scripts
pnpm check
node ../../tools/plugin-layering-check.mjs .
```

纯逻辑和文件测试使用 Node 内置测试器，无构建步骤。真实运行时测试须设置 `DSH_RUNTIME_DIR` 为目标版本根目录；缺失时明确跳过。安装到 test、完整实例请求验证、浏览器走查和稳定发布是不同门禁，记录归 `docs/`，未验项集中于 `docs/TODO.md`。

许可证：MIT。
