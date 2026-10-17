# 未完成事项

- 宿主支持：最终模型路由后、system 消息提交前的正式 Section 重组接口；通过晚改路由、重试、主子不同模型、压缩恢复门禁后解锁 provider/model 激活。当前阻断，不能发布完整 V1。
- PowerShell：取得当前 Agent 实际 shell 后端方言的可信公开能力，再开放 when.tools.powershell 实际匹配；当前 unknown，不根据 OS/工具名推断。
- 真实请求与 UI：模板选择器已改为逐条直达的原生弹层，并补齐 catalog 双语显示字段；设置页已从 `plugins.bundle.config` 改为 `plugins.row.config`（key `dsh-prompt-layers#prompt-layers`），删除动作改为行右侧垃圾桶图标并按新增、已保存本地定义、覆盖/原生段区分文案；client.js 与应用/客户端测试在本机通过。test 已重启（当前 pid 169572，http://127.0.0.1:3082），Host 已读取新的 catalog 双语字段；本轮 UI 修订为 client-only，刷新页面加载。待用户走查：插件详情 → prompt-layers 行 Configure → Section 页；模板添加/预览/关闭；已修改标签、逐行 diff 与确认替换；范围标签、模型层推荐警告、切换范围确认、模板“设置模型范围”入口；PowerShell 条件标签“条件不会匹配”与悬停说明；保存行删除、新增行放弃、覆盖恢复继承；明暗主题；并补齐真实请求、停用重启用与 Console 证据。当前只比较当前正文与当前模板，不记录来源/版本，无法区分用户编辑与模板升级（C 未做）。
- 模型行为 A/B：固定任务、路由、工具与仓库状态，比较任务完成率、无理由拒绝、命令错误、脚本残留、合成秘密暴露和成本；正文批准不等于效果通过。
- cloud-devhost 应用：声明已切换为 `dsh-prompt-layers@github:FengZhiHen1/dsh-prompt-layers`，但尚未在云主机实际应用；应用与回滚需单独授权后按该仓库 playbook 执行，仓库内声明通过不等于云端已安装。
