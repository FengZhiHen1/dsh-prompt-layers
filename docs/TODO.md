# 未完成事项

- 宿主支持：最终模型路由后、system 消息提交前的正式 Section 重组接口；通过晚改路由、重试、主子不同模型、压缩恢复门禁后解锁 provider/model 激活。当前阻断，不能发布完整 V1。
- PowerShell：取得当前 Agent 实际 shell 后端方言的可信公开能力，再开放 when.tools.powershell 实际匹配；当前 unknown，不根据 OS/工具名推断。
- 真实请求与 UI：模板选择器已改为逐条直达的原生弹层，并补齐 catalog 双语显示字段；client.js 与应用/客户端测试在本机通过。运行中的 test 宿主早于 catalog 改写启动（进程 18:55、catalog 21:21），新的标题/说明需重启 test 后由 Host 重新读取；`install_bundle` 返回 already-installed，未重启实例。待用户刷新后先操作模板添加/预览/关闭与明暗主题，重启后再核对双语元数据，并补齐真实请求、停用重启用与 Console 证据。
- 模型行为 A/B：固定任务、路由、工具与仓库状态，比较任务完成率、无理由拒绝、命令错误、脚本残留、合成秘密暴露和成本；正文批准不等于效果通过。
- cloud-devhost 应用：声明已切换为 `dsh-prompt-layers@github:FengZhiHen1/dsh-prompt-layers`，但尚未在云主机实际应用；应用与回滚需单独授权后按该仓库 playbook 执行，仓库内声明通过不等于云端已安装。
