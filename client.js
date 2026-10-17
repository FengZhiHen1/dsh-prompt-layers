// Section settings page: one staged draft, one revision-fenced save.
// Copies DSH's SettingsForm shell and settings-form field geometry; this bundle
// must not require any Harness client package, so the markup and CSS are local.
window.__ModuleLoader__.load({
  id: "dsh-prompt-layers",
  factory(require) {
    const React = require("react");
    const h = React.createElement;
    const css = `
.dsh-pl{color:var(--dsw-alias-label-primary);font:inherit}
.dsh-pl *{box-sizing:border-box}
.dsh-pl .pl-form{display:flex;flex-direction:column;min-width:0}
.dsh-pl .pl-status{margin:0 0 12px;font-size:12px;line-height:1.5;color:var(--dsw-alias-label-tertiary)}
.dsh-pl .pl-field{display:flex;flex-direction:column;gap:6px;padding:12px 0;min-width:0}
.dsh-pl .pl-field+.pl-field{border-top:.5px solid var(--dsw-alias-border-l2)}
.dsh-pl .pl-labelRow{display:flex;flex-wrap:wrap;align-items:baseline;gap:8px}
.dsh-pl .pl-label{font-size:13px;font-weight:500;line-height:1.5;color:var(--dsw-alias-label-primary)}
.dsh-pl .pl-count{font-size:12px;line-height:1.5;color:var(--dsw-alias-label-secondary)}
.dsh-pl .pl-hint{margin:0;font-size:12px;line-height:1.5;color:var(--dsw-alias-label-tertiary);overflow-wrap:anywhere}
.dsh-pl .pl-invalid{margin:0;font-size:12px;line-height:1.5;color:var(--dsw-alias-state-error-primary)}
.dsh-pl .pl-controls{display:flex;flex-wrap:wrap;gap:8px;min-width:0}
.dsh-pl .pl-controls .pl-select{flex:1 1 180px;min-width:0}
.dsh-pl .pl-select{position:relative;display:block;min-width:0}
.dsh-pl .pl-select:after{content:'';position:absolute;right:13px;top:13px;width:6px;height:6px;border-bottom:1px solid var(--dsw-alias-label-tertiary);border-right:1px solid var(--dsw-alias-label-tertiary);transform:rotate(45deg);pointer-events:none}
.dsh-pl select,.dsh-pl input[type=text],.dsh-pl textarea{width:100%;border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-3);font-family:inherit;font-size:13px;line-height:1.5;color:var(--dsw-alias-label-primary)}
.dsh-pl select,.dsh-pl input[type=text]{height:34px;padding:0 12px}
.dsh-pl select{appearance:none;padding-right:32px}
.dsh-pl textarea{min-height:160px;padding:10px 12px;resize:vertical;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;line-height:1.6}
.dsh-pl select:disabled,.dsh-pl input[type=text]:disabled,.dsh-pl textarea:disabled{color:var(--dsw-alias-label-tertiary);cursor:default}
.dsh-pl .pl-rows{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.dsh-pl .pl-row{padding:12px 2px;border-bottom:.5px solid var(--dsw-alias-border-l2)}
.dsh-pl .pl-row:last-child{border-bottom:0}
.dsh-pl .pl-rowLine{display:flex;align-items:center;gap:16px;min-width:0}
.dsh-pl .pl-rowMain{display:flex;flex:1;flex-direction:column;gap:2px;min-width:0}
.dsh-pl .pl-rowOpen{display:inline-flex;align-items:center;justify-content:flex-start;gap:2px;max-width:100%;padding:0;border:0;background:none;color:inherit;font:inherit;text-align:left;cursor:pointer}
.dsh-pl .pl-rowOpen:hover .pl-rowId{text-decoration:underline;text-underline-offset:3px}
.dsh-pl .pl-rowId{font-size:13.5px;line-height:20px;font-weight:500;overflow-wrap:anywhere}
.dsh-pl .pl-rowDesc{display:-webkit-box;overflow:hidden;overflow-wrap:anywhere;font-size:13px;line-height:18px;color:var(--dsw-alias-label-tertiary);-webkit-box-orient:vertical;-webkit-line-clamp:1}
.dsh-pl .pl-rowState{flex:none;font-size:12.5px;line-height:18px;color:var(--dsw-alias-label-secondary);white-space:nowrap}
.dsh-pl .pl-rowMeta{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:0 0 4px}
.dsh-pl .pl-rowWarning{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:0 0 8px;font-size:12px;line-height:1.5;color:var(--dsw-alias-state-warn-primary);overflow-wrap:anywhere}
.dsh-pl .pl-linkButton{padding:0;border:0;background:none;color:var(--dsw-alias-state-business-primary);font:inherit;font-size:12px;line-height:18px;cursor:pointer;text-decoration:none}
.dsh-pl .pl-linkButton:hover{text-decoration:underline}
.dsh-pl .pl-scopeConfirm{display:flex;flex-direction:column;gap:6px;padding:8px 10px;border:.5px solid var(--dsw-alias-state-warn-primary);border-radius:var(--dsw-radius-md);background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 6%,transparent)}
.dsh-pl .pl-scopeGuidance{display:flex;flex-direction:column;gap:8px;align-items:flex-start;padding:0 24px}
.dsh-pl .pl-guide{display:flex;flex-direction:column;gap:3px;padding:8px 10px;border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1.6}
.dsh-pl .pl-guide p{margin:0}
.dsh-pl .pl-templateTarget{margin-top:2px;font-size:11px;line-height:17px;color:var(--dsw-alias-label-tertiary)}
.dsh-pl .pl-templateConfirm{grid-column:1/-1;display:flex;flex-direction:column;gap:6px;padding:8px 10px;border:.5px solid var(--dsw-alias-state-warn-primary);border-radius:var(--dsw-radius-md);background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 6%,transparent)}
.dsh-pl .pl-chev{flex:none;color:var(--dsw-alias-label-tertiary);transition:transform 160ms var(--ds-ease-in-out)}
.dsh-pl .pl-rowOpen[aria-expanded=true] .pl-chev{transform:rotate(90deg)}
.dsh-pl .pl-rowBody{display:flex;flex-direction:column;gap:0;padding:12px 0 4px 20px;min-width:0}
.dsh-pl .pl-rowBody .pl-field{padding:8px 0}
.dsh-pl .pl-actions{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:8px 0}
.dsh-pl .pl-button{display:inline-flex;align-items:center;justify-content:center;gap:4px;height:28px;padding:0 10px;border:.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-primary);font-family:inherit;font-size:12px;line-height:18px;cursor:pointer;transition:background var(--ds-transition-duration) var(--ds-ease-in-out)}
.dsh-pl .pl-button:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.dsh-pl .pl-button:disabled{opacity:.4;cursor:not-allowed}
.dsh-pl .pl-iconButton{display:inline-flex;flex:none;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer}
.dsh-pl .pl-iconButton:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsh-pl .pl-iconButtonDanger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary)}
.dsh-pl .pl-iconButton:disabled{opacity:.4;cursor:default}
.dsh-pl .pl-switch{display:inline-flex;align-items:flex-start;gap:10px;padding:4px 0;font-size:14px;line-height:20px;color:var(--dsw-alias-label-primary)}
.dsh-pl .pl-switchLabel{min-width:0}
.dsh-pl .pl-switchLabel small{display:block;font-size:12px;line-height:1.5;color:var(--dsw-alias-label-tertiary)}
.dsh-pl .pl-switchControl{box-sizing:border-box;position:relative;flex:0 0 auto;width:36px;height:20px;padding:2px;border:0;border-radius:999px;background:var(--dsw-alias-border-l3);cursor:pointer}
.dsh-pl .pl-switchControl[aria-checked=true]{background:var(--dsw-alias-brand-primary)}
.dsh-pl .pl-switchControl:disabled{cursor:default;opacity:.5}
.dsh-pl .pl-thumb{display:block;width:16px;height:16px;border-radius:50%;background:var(--dsw-alias-label-primary-foreground);transition:transform 120ms ease}
.dsh-pl .pl-switchControl[aria-checked=false] .pl-thumb{background:var(--dsw-alias-switch-thumb)}
.dsh-pl .pl-switchControl[aria-checked=true] .pl-thumb{transform:translateX(16px)}
.dsh-pl .pl-details{display:flex;flex-direction:column;gap:10px;padding:0;min-width:0}
.dsh-pl .pl-details>summary{cursor:pointer;font-size:13px;line-height:20px;color:var(--dsw-alias-label-secondary);list-style:none}
.dsh-pl .pl-details>summary::-webkit-details-marker{display:none}
.dsh-pl .pl-details>summary:hover{color:var(--dsw-alias-label-primary)}
.dsh-pl .pl-footer{display:flex;align-items:center;gap:8px;padding-top:16px}
.dsh-pl .pl-rowFooter{display:flex;justify-content:flex-end;padding:8px 0 0}
.dsh-pl .pl-failed{flex:1;min-width:0;margin:0;font-size:12px;line-height:1.5;color:var(--dsw-alias-label-error)}
.dsh-pl .pl-save{appearance:none;border:1px solid transparent;border-radius:var(--dsw-radius-md);padding:5px 14px;font:inherit;font-size:13px;line-height:1.5;cursor:pointer;background:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-layer-3)}
.dsh-pl .pl-save:disabled{opacity:.4;cursor:default}
.dsh-pl .pl-save:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
.dsh-pl :is(.pl-button,.pl-iconButton,.pl-linkButton,.pl-rowOpen,.pl-switchControl,.pl-dialogClose,.pl-templatePreview,.pl-primary,.pl-secondary,summary):focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}
.dsh-pl :is(select,input,textarea):focus-visible{outline:none;border-color:var(--dsw-alias-state-business-primary)}
.dsh-pl :is(input,textarea)[aria-invalid=true]{border-color:var(--dsw-alias-state-error-primary)}
.dsh-pl .pl-mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11.5px;line-height:16px;color:var(--dsw-alias-label-tertiary);overflow-wrap:anywhere}
.dsh-pl .pl-srOnly{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.dsh-pl pre{margin:0;max-height:280px;padding:10px 12px;overflow:auto;border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-2);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;line-height:1.6;color:var(--dsw-alias-label-primary);white-space:pre-wrap;overflow-wrap:anywhere}
.dsh-pl .pl-dialogLayer{position:fixed;inset:0;display:none;width:auto;height:auto;max-width:none;max-height:none;margin:0;padding:max(24px,var(--dsh-frame-overlay-top,24px)) 24px;border:0;background:transparent;box-shadow:none;color:var(--dsw-alias-label-primary);font:inherit}
.dsh-pl .pl-dialogLayer[open]{display:flex;align-items:center;justify-content:center}
.dsh-pl .pl-dialogLayer::backdrop{position:fixed;inset:var(--dsh-frame-chrome-top,0px) 0 0;background:var(--dsw-alias-bg-mask-1);backdrop-filter:var(--dsw-mask-blur);animation:plFade var(--ds-transition-duration) var(--ds-ease-in-out)}
.dsh-pl .pl-dialogLayer:focus{outline:none}
.dsh-pl .pl-dialog{display:flex;flex-direction:column;width:min(640px,100%);max-height:100%;min-height:0;border-radius:var(--dsw-radius-panel);background:var(--dsw-alias-bg-layer-2);box-shadow:var(--dsw-elevation-prominent);color:var(--dsw-alias-label-primary);font:inherit;overflow:hidden;--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);animation:plFade var(--ds-transition-duration) var(--ds-ease-in-out)}
.dsh-pl .pl-dialogHead{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:22px 14px 12px 24px}
.dsh-pl .pl-dialogTitle{min-width:0;margin:0;font-size:16px;line-height:24px;font-weight:500;color:var(--dsw-alias-label-primary);overflow-wrap:anywhere}
.dsh-pl .pl-dialogClose{flex:none;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer}
.dsh-pl .pl-dialogClose:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsh-pl .pl-dialogDesc{margin:0;padding:0 24px;font-size:14px;line-height:22px;color:var(--dsw-alias-label-primary)}
.dsh-pl .pl-dialogScope{margin:6px 0 0;padding:0 24px;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}
.dsh-pl .pl-dialogNotice{margin:8px 0 0;padding:0 24px;font-size:12px;line-height:1.5;color:var(--dsw-alias-state-warn-primary);overflow-wrap:anywhere}
.dsh-pl .pl-dialogNote{margin:8px 0 0;padding:0 24px;font-size:12px;line-height:1.5;color:var(--dsw-alias-label-tertiary);overflow-wrap:anywhere}
.dsh-pl .pl-dialogBody{display:flex;flex:1 1 auto;flex-direction:column;min-width:0;min-height:0;margin-top:20px;padding:0 24px;overflow:auto}
.dsh-pl .pl-dialogBody:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px}
.dsh-pl .pl-templateList{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.dsh-pl .pl-templateRow{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:start;gap:12px;padding:12px 8px;min-width:0}
.dsh-pl .pl-templateRow+.pl-templateRow{border-top:.5px solid var(--dsw-alias-border-l2)}
.dsh-pl .pl-templateMain{display:flex;flex-direction:column;min-width:0}
.dsh-pl .pl-templateTitle{font-size:14px;line-height:22px;font-weight:500;color:var(--dsw-alias-label-primary);overflow-wrap:anywhere}
.dsh-pl .pl-templateDesc{display:-webkit-box;margin:2px 0 0;overflow:hidden;overflow-wrap:anywhere;font-size:13px;line-height:20px;color:var(--dsw-alias-label-secondary);-webkit-box-orient:vertical;-webkit-line-clamp:2}
.dsh-pl .pl-templateTags{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.dsh-pl .pl-tag{display:inline-flex;align-items:center;border:.5px solid var(--dsw-alias-border-l4);border-radius:999px;corner-shape:round;padding:1px 8px;font-size:11px;line-height:17px;font-weight:500;white-space:nowrap;color:var(--dsw-alias-label-tertiary)}
.dsh-pl .pl-tag[data-tone=neutral]{border-color:transparent;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary)}
.dsh-pl .pl-tag[data-tone=success]{border-color:transparent;background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 10%,transparent);color:var(--dsw-alias-state-success-primary)}
.dsh-pl .pl-tag[data-tone=warning]{border-color:transparent;background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 12%,transparent);color:var(--dsw-alias-state-warn-primary)}
.dsh-pl .pl-templateActions{display:flex;flex:none;flex-direction:column;align-items:flex-end;gap:6px;min-width:64px}
.dsh-pl .pl-templatePreview{display:inline-flex;align-items:center;justify-content:center;min-height:28px;padding:5px 6px;border:0;border-radius:var(--dsw-radius-sm);background:none;color:var(--dsw-alias-label-tertiary);font:inherit;font-size:12px;line-height:18px;white-space:nowrap;cursor:pointer}
.dsh-pl .pl-templatePreview:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsh-pl .pl-templatePreview:active{background:var(--dsw-alias-interactive-bg-active)}
.dsh-pl .pl-dialogFoot{display:flex;align-items:center;justify-content:flex-end;padding:0 24px 24px}
.dsh-pl .pl-dialogActions{display:flex;flex:none;align-items:center;gap:8px;margin-left:auto}
.dsh-pl .pl-primary,.dsh-pl .pl-secondary{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;height:36px;padding:0 14px;border-radius:var(--dsw-radius-md);font:inherit;font-size:14px;line-height:22px;cursor:pointer}
.dsh-pl .pl-primary{border:0;background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground)}
.dsh-pl .pl-primary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover)}
.dsh-pl .pl-secondary{border:.5px solid var(--dsw-alias-border-l3);background:transparent;color:var(--dsw-alias-label-primary)}
.dsh-pl .pl-secondary:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.dsh-pl .pl-primary:disabled,.dsh-pl .pl-secondary:disabled{opacity:.4;cursor:not-allowed}
.dsh-pl .pl-previewMeta{display:flex;flex-wrap:wrap;align-items:center;gap:8px;min-width:0;margin:0 0 8px}
.dsh-pl .pl-previewBody{margin:0;padding:12px;max-height:none;overflow:visible;border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12.5px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere;tab-size:2}
.dsh-pl .pl-diffBlock{display:flex;flex-direction:column;gap:6px;margin:12px 0}
.dsh-pl .pl-inlineWarn{margin:0;font-size:12px;line-height:1.5;color:var(--dsw-alias-state-warn-primary);overflow-wrap:anywhere}
.dsh-pl .pl-inlineNote{margin:0;font-size:12px;line-height:1.5;color:var(--dsw-alias-label-tertiary);overflow-wrap:anywhere}
.dsh-pl .pl-diff{margin:0;padding:8px 10px;max-height:280px;overflow:auto;border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-3);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12.5px;line-height:1.5;color:var(--dsw-alias-label-secondary);white-space:pre-wrap;overflow-wrap:anywhere;tab-size:2}
.dsh-pl .pl-diffLine{display:block;padding:0 4px;border-radius:2px}
.dsh-pl .pl-diffLine[data-kind=add]{background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 12%,transparent);color:var(--dsw-alias-state-success-primary)}
.dsh-pl .pl-diffLine[data-kind=del]{background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 12%,transparent);color:var(--dsw-alias-state-error-primary)}
.dsh-pl .pl-diffLine[data-kind=same]{color:var(--dsw-alias-label-secondary)}
.dsh-pl .pl-replaceConfirm{display:flex;flex-direction:column;gap:6px;padding:8px 10px;border:.5px solid var(--dsw-alias-state-warn-primary);border-radius:var(--dsw-radius-md);background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 6%,transparent)}
.dsh-pl .pl-replaceActions{display:flex;flex-wrap:wrap;gap:8px}
@keyframes plFade{from{opacity:0}to{opacity:1}}
@media (prefers-reduced-motion:reduce){.dsh-pl .pl-chev,.dsh-pl .pl-dialogLayer[open],.dsh-pl .pl-dialogLayer::backdrop,.dsh-pl .pl-dialog{transition:none;animation:none}}
`;
    const words = {
      zh: {
        summary: "按全局、供应商或模型范围管理提示词 Section，并从内置模板添加。",
        scope: "适用范围",
        scopeHint: "全局层对全部请求生效；供应商与模型层只覆盖更具体的范围。",
        scopeSettings: "查看范围设置",
        scopeGuideOrder:
          "操作顺序：先选适用范围，再新建或从模板添加；本页的新增、编辑、删除和模板添加都写入当前范围，切换范围会丢弃草稿。",
        scopeGuideModel:
          "要限定到模型：适用范围选“模型” → 选择 provider/model → 再添加模板；模板添加不会另行询问模型。",
        sectionScope: "范围：{scope}",
        sectionModelRecommended:
          "此 Section 的模板推荐模型层；当前为 {scope}，保存后会影响该范围内的所有模型。要限定模型：将顶部适用范围改为“模型”，选择 provider/model，再重新添加；切换会丢弃当前草稿，已保存的全局 Section 不会自动迁移。",
        scopeSwitchConfirm:
          "切换范围到 {scope} 会丢弃当前草稿，并重新读取该范围。",
        scopeSwitchConfirmAction: "切换范围",
        cancel: "取消",
        provider: "供应商",
        model: "具体模型",
        global: "全局",
        choose: "请选择",
        sections: "提示词段",
        sectionsHint:
          "展开条目即可编辑；本次改动在保存前不会写入任何文件。",
        native: "原生 DSH 段",
        add: "新增 Section",
        templates: "从模板添加",
        templatesHint:
          "模板会立即作为当前范围的新 Section 加入草稿；保存后生效。",
        empty: "当前范围暂无 Section。可新建空白 Section，或从模板添加。",
        templateScopeLine: "加入范围：{scope}",
        templateAddedNotice: "已加入草稿：{title}；保存后生效。",
        templateAdded: "已添加",
        templateModified: "已添加 · 与当前模板不同",
        templateModifiedHint: "当前正文与当前模板不同；模板不会自动更新。",
        templateInherited: "继承层已有",
        templateRecommendedGlobal: "推荐全局",
        templateRecommendedModel: "推荐模型层",
        templateMainOnly: "仅主 Agent",
        templateDelegatedOnly: "仅子 Agent",
        templatePresetsOnly: "限定 Preset",
        templateNeedsPwsh: "需 PowerShell 能力",
        templatePwshUnknown: "需 PowerShell（条件不会匹配）",
        templatePwshUnknownHint:
          "宿主无法证明 Agent 的实际 shell 方言；带此条件的模板导入后不会自动匹配。可在 Section 编辑区清除 PowerShell 条件，或等待宿主提供方言能力。",
        templateScopeWarning:
          "部分模板推荐用于模型层；当前范围更宽，加入后会影响更多请求。要限定模型，请先切换到模型范围；切换会丢弃当前草稿。",
        templateScopeSteps:
          "操作顺序：1) 关闭弹层；2) 顶部“适用范围”选“模型”；3) 选择 provider 和 model；4) 重新打开模板弹层，此时“加入范围”会显示该模型。",
        templateScopeSettings: "设置模型范围",
        templateAddTarget: "加入：{scope}",
        templateModelConfirm:
          "此模板推荐模型层。仍然添加会把它写入{scope}，保存后影响该范围内的所有模型；要限定模型，请先设置模型范围。",
        templateModelConfirmAdd: "仍然添加",
        templateAdd: "添加",
        templatePreview: "查看正文",
        templatePreviewTitle: "模板正文",
        templatePreviewHint:
          "只读预览；正文为批准的原始 Markdown，不随界面语言翻译。加入草稿后可在 Section 编辑区修改。",
        templateDiffTitle: "当前正文与模板正文不同",
        templateDiffHint:
          "当前 → 模板；- 仅当前有，+ 仅模板有。替换只改正文，不改 ID、条件、启停和位置。",
        templateDiffTooLarge:
          "正文较长，未生成逐行差异；可查看模板正文，或直接替换。",
        templateReplace: "用模板正文替换当前正文",
        templateReplaceConfirm: "确认替换当前正文？只改草稿，保存后生效。",
        templateReplaceConfirmAction: "确认替换",
        templateReplaceCancel: "取消",
        templateReplacedNotice: "已用模板正文替换当前草稿；保存后生效。",
        templateBack: "返回列表",
        templateClose: "关闭",
        templateDone: "完成",
        templateNoTemplates: "没有可用模板。",
        templateListLabel: "模板列表",
        chooseTarget: "请选择供应商与模型后管理该范围的 Section。",
        loading: "正在读取…",
        unavailable: "当前无法读取此插件配置。请确认插件已启用并重新打开此页。",
        save: "保存",
        saving: "正在保存…",
        saveFailed:
          "保存未成功，改动已保留。配置可能已在别处修改，请刷新后核对并重试。",
        newSection: "新建",
        pendingRemove: "保存后移除",
        undoRemove: "撤销移除",
        discardNew: "放弃新增",
        deleteLocal: "删除此 Section",
        remove: "移除当前覆盖，恢复继承",
        inherited: "继承自",
        local: "当前范围定义",
        overridden: "当前范围已覆盖",
        content: "正文",
        contentHint: "Markdown 正文；将整体替换继承的正文。",
        contentRequired: "请填写正文。",
        id: "Section ID",
        idHint: "必须以 custom: 开头，保存后按此 ID 引用。",
        idInvalid: "ID 必须以 custom: 开头，且只含字母、数字、点、下划线与连字符。",
        position: "位置",
        default: "首次定义的默认位置",
        before: "放在…之前",
        after: "放在…之后",
        anchor: "锚点 Section ID",
        anchorHint: "前后插入需要一个已存在的 Section ID 作为锚点。",
        anchorRequired: "请填写锚点 Section ID。",
        enabled: "启用此 Section",
        conditions: "Agent 与工具条件",
        conditionsHint: "条件不匹配时该段不应用；未知工具能力不会按可用处理。",
        role: "Agent 角色",
        all: "全部主/子 Agent",
        main: "仅主 Agent",
        delegated: "仅子 Agent",
        presets: "限定 Preset（逗号分隔，留空为全部）",
        pwsh: "仅具备已证明的 PowerShell 能力时应用",
        managed: "明确允许修改此受管原生段",
        managedHint: "受管原生段必须显式授权，保存才会写入。",
        managedRequired: "请先勾选允许修改受管原生段。",
        history: "各层定义与差异",
        diagnostics: "诊断详情",
        blocked:
          "供应商与模型层目前仅供配置和预览；当前宿主尚不支持按最终请求路由应用。",
        emptyStatus: "未添加提示词",
        active: "配置已激活",
        lastValid: "候选无效，使用上次有效配置",
        fallback: "使用原生提示词",
      },
      en: {
        summary:
          "Manage prompt Sections across global, provider and model scopes, with built-in templates.",
        scope: "Applies to",
        scopeHint:
          "The global layer applies to every request; provider and model layers override narrower scopes.",
        scopeSettings: "View scope settings",
        scopeGuideOrder:
          "Order: choose the scope first, then create or add a template. Every create, edit, delete and template add on this page writes to that scope; switching scope discards the draft.",
        scopeGuideModel:
          "To limit to a model: choose Model under Applies to, choose provider/model, then add the template. Adding a template never asks for a model separately.",
        sectionScope: "Scope: {scope}",
        sectionModelRecommended:
          "This Section's template is recommended for the model layer; the current scope is {scope}, so it affects every model there. To limit it: set Applies to to Model at the top, choose a provider/model, and add it again; switching discards the current draft, and a saved global Section is not migrated automatically.",
        scopeSwitchConfirm:
          "Switch to {scope}? The current draft will be discarded and that scope reloaded.",
        scopeSwitchConfirmAction: "Switch scope",
        cancel: "Cancel",
        provider: "Provider",
        model: "Model",
        global: "Global",
        choose: "Choose",
        sections: "Prompt Sections",
        sectionsHint:
          "Expand an entry to edit it; nothing is written before you save.",
        native: "Native DSH Sections",
        add: "Add Section",
        templates: "Add from template",
        templatesHint:
          "Templates join the draft as new Sections in this scope immediately; save to apply.",
        empty: "No Sections in this scope. Add a blank Section or use a template.",
        templateScopeLine: "Target scope: {scope}",
        templateAddedNotice: "Added to the draft: {title}; save to apply.",
        templateAdded: "Added",
        templateModified: "Added · differs from current template",
        templateModifiedHint:
          "The current body differs from the current template; templates do not auto-update.",
        templateInherited: "Already inherited",
        templateRecommendedGlobal: "Recommended: global",
        templateRecommendedModel: "Recommended: model layer",
        templateMainOnly: "Main Agent only",
        templateDelegatedOnly: "Delegated only",
        templatePresetsOnly: "Preset-limited",
        templateNeedsPwsh: "Requires PowerShell",
        templatePwshUnknown: "Requires PowerShell (will not match)",
        templatePwshUnknownHint:
          "The host cannot prove the agent's actual shell dialect, so this conditional template will not match after it is added. Clear the PowerShell condition in the Section editor, or wait for host dialect support.",
        templateScopeWarning:
          "Some templates are recommended for the model layer; this scope is broader, so they affect more requests. To limit them to a model, switch scope first; switching discards the current draft.",
        templateScopeSteps:
          "Order: 1) close this dialog; 2) set Applies to to Model at the top; 3) choose provider and model; 4) reopen the template dialog; Add to shows that model.",
        templateScopeSettings: "Set model scope",
        templateAddTarget: "Adds to: {scope}",
        templateModelConfirm:
          "This template is recommended for the model layer. Adding it anyway writes to {scope} and, once saved, affects every model in that scope; set the model scope first to limit it.",
        templateModelConfirmAdd: "Add anyway",
        templateAdd: "Add",
        templatePreview: "View body",
        templatePreviewTitle: "Template body",
        templatePreviewHint:
          "Read-only preview; the body is the approved Markdown original and is not translated with the UI. Edit it in the Section editor after adding.",
        templateDiffTitle: "Current body differs from the template body",
        templateDiffHint:
          "Current → template; - only in current, + only in template. Replacing changes only the body, not the ID, conditions, enabled state, or position.",
        templateDiffTooLarge:
          "The body is too long for a line diff here; view the template body or replace directly.",
        templateReplace: "Replace current body with template body",
        templateReplaceConfirm:
          "Replace the current body? This edits the draft only; save to apply.",
        templateReplaceConfirmAction: "Replace body",
        templateReplaceCancel: "Cancel",
        templateReplacedNotice:
          "Current draft body replaced with the template body; save to apply.",
        templateBack: "Back to list",
        templateClose: "Close",
        templateDone: "Done",
        templateNoTemplates: "No templates available.",
        templateListLabel: "Template list",
        chooseTarget:
          "Choose a provider and model to manage Sections in that scope.",
        loading: "Loading…",
        unavailable:
          "Settings are unavailable. Confirm the plugin is enabled and reopen this page.",
        save: "Save",
        saving: "Saving…",
        saveFailed:
          "Save failed; your edits are retained. Settings may have changed elsewhere. Reopen this page, review the values and retry.",
        newSection: "New",
        pendingRemove: "Removed on save",
        undoRemove: "Undo removal",
        discardNew: "Discard new Section",
        deleteLocal: "Delete this Section",
        remove: "Remove override and inherit",
        inherited: "Inherited from",
        local: "Defined here",
        overridden: "Overridden here",
        content: "Content",
        contentHint: "Markdown body; replaces the inherited body wholesale.",
        contentRequired: "Enter the body text.",
        id: "Section ID",
        idHint: "Must start with custom:; later layers reference this ID.",
        idInvalid:
          "The ID must start with custom: and contain only letters, digits, dots, underscores and hyphens.",
        position: "Position",
        default: "First-definition default",
        before: "Before",
        after: "After",
        anchor: "Anchor Section ID",
        anchorHint:
          "An insertion before or after needs an existing Section ID as its anchor.",
        anchorRequired: "Enter the anchor Section ID.",
        enabled: "Enable this Section",
        conditions: "Agent and tool conditions",
        conditionsHint:
          "Unmatched conditions do not apply; unknown tool capabilities do not match.",
        role: "Agent role",
        all: "All main and delegated Agents",
        main: "Main only",
        delegated: "Delegated only",
        presets: "Presets (comma separated; empty means all)",
        pwsh: "Require proven PowerShell capability",
        managed: "Explicitly allow this managed native override",
        managedHint:
          "A managed native Section needs explicit permission before a save writes it.",
        managedRequired: "Allow the managed native override first.",
        history: "Layer definitions and differences",
        diagnostics: "Diagnostics",
        blocked:
          "Provider and model layers can be configured and previewed; this host cannot apply them after final routing.",
        emptyStatus: "No prompt layers",
        active: "Configuration active",
        lastValid: "Invalid candidate; using last valid configuration",
        fallback: "Using native prompt",
      },
    };
    const emptyFields = () => ({
      content: "",
      enabled: true,
      interpolate: false,
      position: "default",
      anchor: "",
      role: "",
      presets: "",
      powershell: false,
      managed: false,
    });
    const fieldsOf = (row) => ({
      content: row.content ?? "",
      enabled: row.enabled !== false,
      interpolate: row.interpolate === true,
      position:
        typeof row.position === "object" && row.position !== null
          ? row.position.before
            ? "before"
            : "after"
          : "default",
      anchor:
        typeof row.position === "object" && row.position !== null
          ? (row.position.before ?? row.position.after ?? "")
          : "",
      role: row.when?.agent?.role ?? "",
      presets: (row.when?.agent?.presets ?? []).join(", "),
      powershell: row.when?.tools?.powershell === true,
      managed: false,
    });
    const payloadOf = (kind, fields) => {
      const when = {};
      if (fields.role || fields.presets.trim()) {
        when.agent = {};
        if (fields.role) when.agent.role = fields.role;
        const presets = fields.presets
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean);
        if (presets.length) when.agent.presets = presets;
      }
      if (fields.powershell) when.tools = { powershell: true };
      return {
        content: fields.content,
        enabled: fields.enabled,
        interpolate: fields.interpolate,
        position:
          fields.position === "default"
            ? "default"
            : { [fields.position]: fields.anchor.trim() },
        ...(Object.keys(when).length ? { when } : {}),
        ...(kind === "native" ? { allowManagedOverride: fields.managed } : {}),
      };
    };
    const invalidKey = (change) => {
      if (change.remove) return "";
      if (
        change.kind === "custom" &&
        !/^custom:[A-Za-z0-9][A-Za-z0-9._-]*$/.test(change.id)
      )
        return "idInvalid";
      if (!change.fields.content.trim()) return "contentRequired";
      if (change.fields.position !== "default" && !change.fields.anchor.trim())
        return "anchorRequired";
      if (change.kind === "native" && !change.fields.managed)
        return "managedRequired";
      return "";
    };
    const sameFields = (left, right) =>
      JSON.stringify(left) === JSON.stringify(right);
    const targetKey = (target) =>
      `${target.scope}|${target.provider ?? ""}|${target.model ?? ""}`;
    const display = (id) => id.replace(/^custom:/, "");
    const chevron = () =>
      h(
        "svg",
        {
          width: 14,
          height: 14,
          viewBox: "0 0 16 16",
          fill: "none",
          "aria-hidden": "true",
          className: "pl-chev",
        },
        h("path", {
          d: "M6 12L9.29289 8.70711C9.68342 8.31658 9.68342 7.68342 9.29289 7.29289L6 4",
          stroke: "currentColor",
        }),
      );
    const closeIcon = () =>
      h(
        "svg",
        {
          width: 14,
          height: 14,
          viewBox: "0 0 16 16",
          fill: "none",
          "aria-hidden": "true",
        },
        h("path", {
          d: "M4 4l8 8M12 4l-8 8",
          stroke: "currentColor",
          strokeWidth: 1.2,
          strokeLinecap: "round",
        }),
      );
    const trashIcon = () =>
      h(
        "svg",
        {
          width: 14,
          height: 14,
          viewBox: "0 0 16 16",
          fill: "none",
          "aria-hidden": "true",
        },
        h("path", {
          d: "M3 4.5h10M6.2 4.5V3.2c0-.4.3-.7.7-.7h2.2c.4 0 .7.3.7.7v1.3M5.2 4.5l.5 8c0 .4.3.7.7.7h3.2c.4 0 .7-.3.7-.7l.5-8",
          stroke: "currentColor",
          strokeWidth: 1.2,
          strokeLinecap: "round",
          strokeLinejoin: "round",
        }),
      );
    const activeLocale = (locale) => {
      const snapshot =
        locale && typeof locale.getLocale === "function"
          ? locale.getLocale()
          : null;
      return typeof snapshot?.active === "string" ? snapshot.active : "zh";
    };
    const interpolate = (text, name, value) =>
      text.split(`{${name}}`).join(value);
    const normalizeBody = (text) =>
      String(text ?? "")
        .replace(/\r\n?/g, "\n")
        .replace(/\s+$/, "");
    const lineDiff = (before, after) => {
      const a = before ? before.split("\n") : [""];
      const b = after ? after.split("\n") : [""];
      if (a.length * b.length > 400000) return null;
      const dp = Array.from({ length: a.length + 1 }, () =>
        new Uint32Array(b.length + 1),
      );
      for (let i = a.length - 1; i >= 0; i--)
        for (let j = b.length - 1; j >= 0; j--)
          dp[i][j] =
            a[i] === b[j]
              ? dp[i + 1][j + 1] + 1
              : Math.max(dp[i + 1][j], dp[i][j + 1]);
      const out = [];
      let i = 0;
      let j = 0;
      while (i < a.length && j < b.length) {
        if (a[i] === b[j]) {
          out.push({ kind: "same", text: a[i] });
          i += 1;
          j += 1;
        } else if (dp[i + 1][j] >= dp[i][j + 1]) {
          out.push({ kind: "del", text: a[i] });
          i += 1;
        } else {
          out.push({ kind: "add", text: b[j] });
          j += 1;
        }
      }
      while (i < a.length) out.push({ kind: "del", text: a[i++] });
      while (j < b.length) out.push({ kind: "add", text: b[j++] });
      return out;
    };
    function Panel({ t, locale }) {
      const [phase, setPhase] = React.useState("loading");
      const [data, setData] = React.useState(null);
      const [target, setTarget] = React.useState({ scope: "global" });
      const [pendingTarget, setPendingTarget] = React.useState(null);
      const [staged, setStaged] = React.useState({});
      const [open, setOpen] = React.useState("");
      const [templatesOpen, setTemplatesOpen] = React.useState(false);
      const [previewId, setPreviewId] = React.useState("");
      const [replaceConfirm, setReplaceConfirm] = React.useState(false);
      const [replacedTemplateId, setReplacedTemplateId] = React.useState("");
      const [addedTemplateId, setAddedTemplateId] = React.useState("");
      const [confirmTemplateId, setConfirmTemplateId] = React.useState("");
      const [lang, setLang] = React.useState(() => activeLocale(locale));
      const [saving, setSaving] = React.useState(false);
      const [failed, setFailed] = React.useState(false);
      const generation = React.useRef(0);
      const dataRef = React.useRef(null);
      const targetRef = React.useRef(target);
      const serial = React.useRef(0);
      const dialogRef = React.useRef(null);
      const scopeSelectRef = React.useRef(null);
      const closeTemplatesRef = React.useRef(null);
      const templatesTriggerRef = React.useRef(null);
      const restoreFocusRef = React.useRef(false);
      const templatesDialogId = React.useId();
      const templatesTitleId = React.useId();
      const templatesDescId = React.useId();
      targetRef.current = target;
      const api = async (body) => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 15000);
        try {
          const response = await fetch("/api/prompt-layers", {
            method: "POST",
            credentials: "same-origin",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(body),
            signal: controller.signal,
          });
          const result = await response.json();
          if (!response.ok)
            throw new Error(result.error || `HTTP ${response.status}`);
          return result;
        } finally {
          clearTimeout(timer);
        }
      };
      const load = async (next) => {
        const request = ++generation.current;
        if (!dataRef.current) setPhase("loading");
        try {
          const result = await api({ action: "workspace", target: next });
          if (request !== generation.current) return;
          dataRef.current = result;
          setData(result);
          setPhase("ready");
        } catch (_failure) {
          if (request !== generation.current) return;
          setPhase(dataRef.current ? "ready" : "unavailable");
        }
      };
      React.useEffect(() => {
        load(targetRef.current);
        return () => {
          generation.current++;
        };
      }, []);
      React.useEffect(() => {
        if (!locale || typeof locale.subscribe !== "function") return;
        return locale.subscribe(() => setLang(activeLocale(locale)));
      }, [locale]);
      React.useEffect(() => {
        const dialog = dialogRef.current;
        if (!templatesOpen || dialog === null) return;
        if (typeof dialog.showModal === "function" && !dialog.open)
          dialog.showModal();
        const cancel = (event) => {
          event.preventDefault();
          closeTemplatesRef.current?.();
        };
        dialog.addEventListener("cancel", cancel);
        return () => {
          dialog.removeEventListener("cancel", cancel);
          if (dialog.open) dialog.close();
        };
      }, [templatesOpen]);
      React.useEffect(() => {
        if (templatesOpen || !restoreFocusRef.current) return;
        restoreFocusRef.current = false;
        templatesTriggerRef.current?.focus();
      }, [templatesOpen]);
      const scopeLabel = (value) =>
        value.scope === "global"
          ? t("global")
          : value.scope === "provider"
            ? `${t("provider")} · ${value.provider || t("choose")}`
            : `${value.provider || t("choose")} / ${value.model || t("choose")}`;
      const routes = data?.routes ?? [];
      const identities = data?.identities ?? [];
      const providers = [
        ...new Set(
          [...routes, ...identities].map((item) => item.provider).filter(Boolean),
        ),
      ];
      const models = [
        ...new Set(
          [...routes, ...identities]
            .filter((item) => item.provider === target.provider)
            .map((item) => item.model)
            .filter(Boolean),
        ),
      ];
      const isComplete = (value) =>
        value.scope === "global" ||
        (Boolean(value.provider) &&
          (value.scope !== "model" || Boolean(value.model)));
      const complete = isComplete(target);
      const usable = complete ? data : null;
      const sections = usable?.sections ?? [];
      const changeTarget = (next) => {
        setPendingTarget(null);
        setConfirmTemplateId("");
        if (targetKey(next) === targetKey(target)) return;
        setStaged({});
        setOpen("");
        setTemplatesOpen(false);
        setPreviewId("");
        setReplaceConfirm(false);
        setReplacedTemplateId("");
        setAddedTemplateId("");
        setFailed(false);
        setTarget(next);
        if (isComplete(next)) load(next);
      };
      const focusScope = () => {
        const node = scopeSelectRef.current;
        if (!node) return;
        node.scrollIntoView?.({ block: "center" });
        node.focus?.();
      };
      const rows = [
        ...sections.map((row) => ({
          key: row.id,
          id: row.id,
          kind: row.kind,
          row,
          isNew: false,
        })),
        ...Object.entries(staged)
          .filter(([, change]) => change.isNew)
          .map(([key, change]) => ({
            key,
            id: change.id,
            kind: "custom",
            row: null,
            isNew: true,
          })),
      ];
      const isChinese = String(lang).toLowerCase().startsWith("zh");
      const templateTitleOf = (template) =>
        (isChinese ? template.titleZh : template.title) ??
        template.title ??
        template.titleZh ??
        template.sectionId;
      const templateDescriptionOf = (template) =>
        (isChinese ? template.description : template.descriptionEn) ??
        template.description ??
        template.descriptionEn ??
        "";
      const templateEntryOf = (template) =>
        rows.find((entry) => entry.id === template.sectionId);
      const powershellUnknown =
        usable?.capabilities?.powershell !== "available";
      const templateTags = (template) => {
        const tags = [];
        if (template.recommendedScope === "global")
          tags.push(["outline", t("templateRecommendedGlobal")]);
        if (template.recommendedScope === "model")
          tags.push([
            target.scope === "model" ? "outline" : "warning",
            t("templateRecommendedModel"),
          ]);
        if (template.when?.agent?.role === "main")
          tags.push(["outline", t("templateMainOnly")]);
        if (template.when?.agent?.role === "delegated")
          tags.push(["outline", t("templateDelegatedOnly")]);
        if ((template.when?.agent?.presets?.length ?? 0) > 0)
          tags.push(["outline", t("templatePresetsOnly")]);
        if (template.when?.tools?.powershell === true)
          tags.push([
            powershellUnknown ? "warning" : "outline",
            t(powershellUnknown ? "templatePwshUnknown" : "templateNeedsPwsh"),
            powershellUnknown ? t("templatePwshUnknownHint") : undefined,
          ]);
        return tags;
      };
      const baseOf = (entry) =>
        entry.row
          ? fieldsOf(entry.row)
          : { ...emptyFields(), id: entry.id };
      const entryState = (entry) =>
        staged[entry.key] ?? {
          id: entry.id,
          kind: entry.row ? entry.kind : "custom",
          isNew: entry.isNew,
          fields: baseOf(entry),
        };
      const sectionFields = (entry) =>
        staged[entry.key]?.fields ?? baseOf(entry);
      const templateMatchesEntry = (entry, template) =>
        Boolean(entry) &&
        normalizeBody(sectionFields(entry)?.content) ===
          normalizeBody(template.content);
      const write = (entry, patch) => {
        setFailed(false);
        setStaged((current) => {
          const base = current[entry.key] ?? entryState(entry);
          return {
            ...current,
            [entry.key]: { ...base, ...patch, fields: base.fields },
          };
        });
      };
      const update = (entry, patch) => {
        setFailed(false);
        setStaged((current) => {
          const base = current[entry.key] ?? entryState(entry);
          return {
            ...current,
            [entry.key]: { ...base, fields: { ...base.fields, ...patch } },
          };
        });
      };
      const markRemove = (entry) => {
        setFailed(false);
        setStaged((current) => {
          const base = current[entry.key] ?? entryState(entry);
          return { ...current, [entry.key]: { ...base, remove: true } };
        });
      };
      const undoRemove = (entry) => {
        setFailed(false);
        setStaged((current) => {
          const next = { ...current };
          delete next[entry.key];
          return next;
        });
      };
      const takeId = (taken, candidate) => {
        if (!taken.has(candidate)) return candidate;
        let index = 2;
        while (taken.has(`${candidate}-${index}`)) index += 1;
        return `${candidate}-${index}`;
      };
      const addSection = () => {
        if (!usable || saving) return;
        setStaged((current) => {
          const taken = new Set([
            ...sections.map((row) => row.id),
            ...Object.values(current).map((change) => change.id),
          ]);
          const key = `draft:${++serial.current}`;
          return {
            ...current,
            [key]: {
              id: takeId(taken, "custom:new-guidance"),
              kind: "custom",
              isNew: true,
              fields: emptyFields(),
            },
          };
        });
        setFailed(false);
      };
      const addTemplate = (template) => {
        if (!usable || saving) return;
        setStaged((current) => {
          const taken = new Set([
            ...sections.map((row) => row.id),
            ...Object.values(current).map((change) => change.id),
          ]);
          if (taken.has(template.sectionId)) return current;
          const key = `draft:${++serial.current}`;
          return {
            ...current,
            [key]: {
              id: template.sectionId,
              kind: "custom",
              isNew: true,
              fields: {
                ...emptyFields(),
                content: template.content,
                role: template.when?.agent?.role ?? "",
                presets: (template.when?.agent?.presets ?? []).join(", "),
                powershell: template.when?.tools?.powershell === true,
              },
            },
          };
        });
        setAddedTemplateId(template.id);
        setFailed(false);
      };
      const openTemplates = () => {
        if (!usable || saving) return;
        setPreviewId("");
        setReplaceConfirm(false);
        setReplacedTemplateId("");
        setConfirmTemplateId("");
        setTemplatesOpen(true);
      };
      const closeTemplates = () => {
        restoreFocusRef.current = true;
        setTemplatesOpen(false);
        setPreviewId("");
        setReplaceConfirm(false);
        setReplacedTemplateId("");
        setConfirmTemplateId("");
      };
      closeTemplatesRef.current = closeTemplates;
      const goToScopeSettings = () => {
        closeTemplates();
        restoreFocusRef.current = false;
        setTimeout(focusScope, 0);
      };
      const addedTemplate = (usable?.templates ?? []).find(
        (template) =>
          template.id === addedTemplateId && templateEntryOf(template),
      );
      const addedNotice = addedTemplate
        ? interpolate(
            t("templateAddedNotice"),
            "title",
            templateTitleOf(addedTemplate),
          )
        : "";
      const previewTemplate =
        (usable?.templates ?? []).find(
          (template) => template.id === previewId,
        ) ?? null;
      const previewEntry = previewTemplate
        ? templateEntryOf(previewTemplate)
        : null;
      const previewEditable = Boolean(
        previewEntry &&
          !staged[previewEntry.key]?.remove &&
          (previewEntry.isNew || previewEntry.row?.local),
      );
      const previewBody = previewEditable
        ? (sectionFields(previewEntry)?.content ?? "")
        : "";
      const previewChanged =
        previewEditable &&
        normalizeBody(previewBody) !==
          normalizeBody(previewTemplate.content);
      const previewDiff = previewChanged
        ? lineDiff(
            normalizeBody(previewBody),
            normalizeBody(previewTemplate.content),
          )
        : [];
      const replacedNotice =
        previewTemplate !== null && replacedTemplateId === previewTemplate.id;
      const replaceCurrentBody = () => {
        if (!previewTemplate || !previewEditable) return;
        setStaged((current) => {
          const base = current[previewEntry.key] ?? entryState(previewEntry);
          return {
            ...current,
            [previewEntry.key]: {
              ...base,
              fields: { ...base.fields, content: previewTemplate.content },
            },
          };
        });
        setReplaceConfirm(false);
        setReplacedTemplateId(previewTemplate.id);
        setFailed(false);
      };
      const changed = Object.entries(staged).filter(([, change]) => {
        if (change.remove || change.isNew) return true;
        const row = sections.find((item) => item.id === change.id);
        return !row || !sameFields(change.fields, fieldsOf(row));
      });
      const dirty = changed.length > 0;
      const requestTarget = (next) => {
        if (targetKey(next) === targetKey(target)) return;
        if (dirty) {
          setPendingTarget(next);
          return;
        }
        changeTarget(next);
      };
      const keys = changed.map(([, change]) => `${change.kind}:${change.id}`);
      const invalid =
        keys.length !== new Set(keys).size ||
        changed.some(([, change]) => invalidKey(change) !== "");
      const save = async () => {
        if (!dirty || invalid || saving || !usable) return;
        setSaving(true);
        setFailed(false);
        try {
          const changes = changed.map(([, change]) => {
            if (change.remove)
              return { op: "remove", id: change.id, kind: change.kind };
            const fields = payloadOf(change.kind, change.fields);
            return {
              op: "save",
              id: change.id,
              kind: change.kind,
              fields,
              clearWhen: !fields.when,
            };
          });
          const result = await api({
            action: "commit",
            target,
            expectedRevision: usable.revision,
            changes,
          });
          if (targetKey(result.target ?? target) !== targetKey(targetRef.current))
            return;
          dataRef.current = result;
          setData(result);
          setStaged({});
          setOpen("");
          setAddedTemplateId("");
          setFailed(false);
        } catch (_failure) {
          setFailed(true);
        } finally {
          setSaving(false);
        }
      };
      const field = (label, control, hint, invalidText) =>
        h(
          "div",
          { className: "pl-field" },
          h("span", { className: "pl-label" }, label),
          control,
          hint && h("p", { className: "pl-hint" }, hint),
          invalidText && h("p", { className: "pl-invalid" }, invalidText),
        );
      const textField = (label, value, onChange, hint, invalidText) =>
        field(
          label,
          h("input", {
            type: "text",
            value,
            onChange: (event) => onChange(event.target.value),
            "aria-label": label,
            "aria-invalid": invalidText ? "true" : undefined,
          }),
          hint,
          invalidText,
        );
      const areaField = (label, value, onChange, hint, invalidText) =>
        field(
          label,
          h("textarea", {
            value,
            onChange: (event) => onChange(event.target.value),
            spellCheck: false,
            "aria-label": label,
            "aria-invalid": invalidText ? "true" : undefined,
          }),
          hint,
          invalidText,
        );
      const selectField = (label, value, onChange, options, hint) =>
        field(
          label,
          h(
            "span",
            { className: "pl-select" },
            h(
              "select",
              {
                value,
                onChange: (event) => onChange(event.target.value),
                "aria-label": label,
              },
              options.map(([key, text]) =>
                h("option", { key, value: key }, text),
              ),
            ),
          ),
          hint,
        );
      const switchField = (label, checked, onChange, hint, invalidText) =>
        h(
          "div",
          { className: "pl-switch" },
          h(
            "button",
            {
              type: "button",
              role: "switch",
              "aria-checked": checked,
              "aria-label": label,
              className: "pl-switchControl",
              onClick: () => onChange(!checked),
            },
            h("span", { className: "pl-thumb" }),
          ),
          h(
            "span",
            { className: "pl-switchLabel" },
            label,
            hint && h("small", null, hint),
            invalidText && h("small", { className: "pl-invalid" }, invalidText),
          ),
        );
      const rowView = (entry) => {
        const change = staged[entry.key];
        const removed = change?.remove === true;
        const fields = change?.fields ?? baseOf(entry);
        const expanded = open === entry.key;
        const invalidText = change ? invalidKey(change) : "";
        const relation = entry.isNew
          ? t("newSection")
          : removed
            ? t("pendingRemove")
            : entry.row.local
              ? t(entry.row.chain.length > 1 ? "overridden" : "local")
              : `${t("inherited")} ${entry.row.source.scope === "native" ? t("native") : t(entry.row.source.scope)}`;
        const canRemove =
          entry.isNew || (entry.row?.local === true && !removed);
        const removeTitle = entry.isNew
          ? t("discardNew")
          : entry.row.chain.length > 1 || entry.row.kind === "native"
            ? t("remove")
            : t("deleteLocal");
        const currentId = change?.id ?? entry.id;
        const modelTemplate = (usable?.templates ?? []).find(
          (template) =>
            template.sectionId === currentId &&
            template.recommendedScope === "model",
        );
        const modelRecommended = Boolean(
          modelTemplate && target.scope !== "model",
        );
        return h(
          "li",
          { key: entry.key, className: "pl-row" },
          h(
            "div",
            { className: "pl-rowLine" },
            h(
              "div",
              { className: "pl-rowMain" },
              h(
                "button",
                {
                  type: "button",
                  className: "pl-rowOpen",
                  "aria-expanded": expanded,
                  onClick: () => setOpen(expanded ? "" : entry.key),
                },
                h("span", { className: "pl-rowId" }, display(entry.id)),
                chevron(),
              ),
              h(
                "span",
                { className: "pl-rowDesc" },
                (fields.content || "").replace(/\s+/g, " ").slice(0, 160),
              ),
            ),
            h("span", { className: "pl-rowState" }, relation),
            canRemove &&
              h(
                "button",
                {
                  type: "button",
                  className: "pl-iconButton pl-iconButtonDanger",
                  title: removeTitle,
                  "aria-label": `${removeTitle}: ${display(change?.id ?? entry.id)}`,
                  onClick: () =>
                    entry.isNew ? undoRemove(entry) : markRemove(entry),
                },
                trashIcon(),
              ),
          ),
          expanded &&
            h(
              "div",
              { className: "pl-rowBody" },
              h(
                "div",
                { className: "pl-rowMeta" },
                h(
                  "span",
                  { className: "pl-tag", "data-tone": "outline" },
                  interpolate(t("sectionScope"), "scope", scopeLabel(target)),
                ),
                h(
                  "button",
                  {
                    type: "button",
                    className: "pl-linkButton",
                    onClick: focusScope,
                  },
                  t("scopeSettings"),
                ),
              ),
              modelRecommended &&
                h(
                  "div",
                  { className: "pl-rowWarning", role: "note" },
                  h(
                    "span",
                    null,
                    interpolate(
                      t("sectionModelRecommended"),
                      "scope",
                      scopeLabel(target),
                    ),
                  ),
                  h(
                    "button",
                    {
                      type: "button",
                      className: "pl-linkButton",
                      onClick: focusScope,
                    },
                    t("scopeSettings"),
                  ),
                ),
              entry.isNew &&
                textField(
                  t("id"),
                  change?.id ?? entry.id,
                  (value) => write(entry, { id: value }),
                  t("idHint"),
                  invalidText === "idInvalid" ? t("idInvalid") : "",
                ),
              areaField(
                t("content"),
                fields.content,
                (value) => update(entry, { content: value }),
                t("contentHint"),
                invalidText === "contentRequired" ? t("contentRequired") : "",
              ),
              selectField(
                t("position"),
                fields.position,
                (value) =>
                  update(entry, {
                    position: value,
                    ...(value === "default" ? { anchor: "" } : {}),
                  }),
                [
                  ["default", t("default")],
                  ["before", t("before")],
                  ["after", t("after")],
                ],
              ),
              fields.position !== "default" &&
                textField(
                  t("anchor"),
                  fields.anchor,
                  (value) => update(entry, { anchor: value }),
                  t("anchorHint"),
                  invalidText === "anchorRequired" ? t("anchorRequired") : "",
                ),
              switchField(t("enabled"), fields.enabled, (value) =>
                update(entry, { enabled: value }),
              ),
              h(
                "details",
                { className: "pl-details" },
                h("summary", null, t("conditions")),
                h("p", { className: "pl-hint" }, t("conditionsHint")),
                selectField(
                  t("role"),
                  fields.role,
                  (value) => update(entry, { role: value }),
                  [
                    ["", t("all")],
                    ["main", t("main")],
                    ["delegated", t("delegated")],
                  ],
                ),
                textField(t("presets"), fields.presets, (value) =>
                  update(entry, { presets: value }),
                ),
                switchField(t("pwsh"), fields.powershell, (value) =>
                  update(entry, { powershell: value }),
                ),
              ),
              entry.kind === "native" &&
                switchField(
                  t("managed"),
                  fields.managed,
                  (value) => update(entry, { managed: value }),
                  t("managedHint"),
                  invalidText === "managedRequired" ? t("managedRequired") : "",
                ),
              removed &&
                h(
                  "div",
                  { className: "pl-actions" },
                  h(
                    "button",
                    {
                      type: "button",
                      className: "pl-button",
                      onClick: () => undoRemove(entry),
                    },
                    t("undoRemove"),
                  ),
                ),
              (entry.row?.chain?.length ?? 0) > 0 &&
                h(
                  "details",
                  { className: "pl-details" },
                  h("summary", null, t("history")),
                  entry.row.chain.map((layer) =>
                    h(
                      "div",
                      { key: layer.path, className: "pl-details" },
                      h(
                        "span",
                        { className: "pl-mono" },
                        scopeLabel(layer.target),
                      ),
                      h("pre", null, JSON.stringify(layer.attributes, null, 2)),
                    ),
                  ),
                ),
              h(
                "div",
                { className: "pl-rowFooter" },
                h(
                  "button",
                  {
                    type: "button",
                    className: "pl-save",
                    disabled: !dirty || invalid || saving,
                    onClick: save,
                  },
                  t(saving ? "saving" : "save"),
                ),
              ),
            ),
        );
      };
      const statusKey =
        {
          empty: "emptyStatus",
          active: "active",
          "last-valid": "lastValid",
          "native-fallback": "fallback",
        }[usable?.status?.phase] ?? "emptyStatus";
      if (phase !== "ready")
        return h(
          "div",
          { className: "dsh-pl" },
          h("style", null, css),
          h(
            "p",
            { className: "pl-status", role: "status" },
            t(phase === "loading" ? "loading" : "unavailable"),
          ),
        );
      return h(
        "div",
        { className: "dsh-pl" },
        h("style", null, css),
        h(
          "div",
          { className: "pl-form" },
          h("p", { className: "pl-status", role: "status" }, t(statusKey)),
          h(
            "div",
            { className: "pl-field" },
            h("span", { className: "pl-label" }, t("scope")),
            h(
              "div",
              { className: "pl-controls" },
              h(
                "span",
                { className: "pl-select" },
                h(
                  "select",
                  {
                    value: target.scope,
                    "aria-label": t("scope"),
                    ref: scopeSelectRef,
                    onChange: (event) =>
                      requestTarget(
                        event.target.value === "global"
                          ? { scope: "global" }
                          : {
                              scope: event.target.value,
                              provider: providers[0] ?? "",
                              ...(event.target.value === "model"
                                ? { model: "" }
                                : {}),
                            },
                      ),
                  },
                  [
                    ["global", t("global")],
                    ["provider", t("provider")],
                    ["model", t("model")],
                  ].map(([key, text]) => h("option", { key, value: key }, text)),
                ),
              ),
              target.scope !== "global" &&
                h(
                  "span",
                  { className: "pl-select" },
                  h(
                    "select",
                    {
                      value: target.provider ?? "",
                      "aria-label": t("provider"),
                      onChange: (event) =>
                        requestTarget({
                          ...target,
                          provider: event.target.value,
                          ...(target.scope === "model" ? { model: "" } : {}),
                        }),
                    },
                    [
                      ["", t("choose")],
                      ...providers.map((value) => [value, value]),
                    ].map(([key, text]) => h("option", { key, value: key }, text)),
                  ),
                ),
              target.scope === "model" &&
                h(
                  "span",
                  { className: "pl-select" },
                  h(
                    "select",
                    {
                      value: target.model ?? "",
                      "aria-label": t("model"),
                      onChange: (event) =>
                        requestTarget({ ...target, model: event.target.value }),
                    },
                    [
                      ["", t("choose")],
                      ...models.map((value) => [value, value]),
                    ].map(([key, text]) => h("option", { key, value: key }, text)),
                  ),
                ),
            ),
            h("p", { className: "pl-hint" }, t("scopeHint")),
            h(
              "div",
              { className: "pl-guide" },
              h("p", null, t("scopeGuideOrder")),
              h("p", null, t("scopeGuideModel")),
            ),
            pendingTarget &&
              h(
                "div",
                { className: "pl-scopeConfirm", role: "alert" },
                h(
                  "p",
                  { className: "pl-inlineWarn" },
                  interpolate(
                    t("scopeSwitchConfirm"),
                    "scope",
                    scopeLabel(pendingTarget),
                  ),
                ),
                h(
                  "div",
                  { className: "pl-actions" },
                  h(
                    "button",
                    {
                      type: "button",
                      className: "pl-button",
                      onClick: () => setPendingTarget(null),
                    },
                    t("cancel"),
                  ),
                  h(
                    "button",
                    {
                      type: "button",
                      className: "pl-button",
                      onClick: () => changeTarget(pendingTarget),
                    },
                    t("scopeSwitchConfirmAction"),
                  ),
                ),
              ),
            usable?.capabilities?.modelLayers === false &&
              h("p", { className: "pl-hint" }, t("blocked")),
          ),
          h(
            "div",
            { className: "pl-field" },
            h(
              "div",
              { className: "pl-labelRow" },
              h("span", { className: "pl-label" }, t("sections")),
              h(
                "span",
                { className: "pl-tag", "data-tone": "outline" },
                interpolate(t("sectionScope"), "scope", scopeLabel(target)),
              ),
              h("span", { className: "pl-count" }, String(rows.length)),
            ),
            h(
              "ul",
              { className: "pl-rows" },
              rows.map((entry) => rowView(entry)),
            ),
            !complete && h("p", { className: "pl-hint" }, t("chooseTarget")),
            complete &&
              !rows.length &&
              h("p", { className: "pl-hint" }, t("empty")),
            h(
              "div",
              { className: "pl-actions" },
              h(
                "button",
                {
                  type: "button",
                  className: "pl-button",
                  disabled: !usable || saving,
                  onClick: addSection,
                },
                t("add"),
              ),
              h(
                "button",
                {
                  type: "button",
                  className: "pl-button",
                  ref: templatesTriggerRef,
                  disabled: !usable || saving,
                  "aria-haspopup": "dialog",
                  "aria-expanded": templatesOpen,
                  "aria-controls": templatesDialogId,
                  onClick: openTemplates,
                },
                t("templates"),
              ),
            ),
            h("p", { className: "pl-hint" }, t("sectionsHint")),
            !templatesOpen &&
              addedNotice &&
              h("p", { className: "pl-hint", role: "status" }, addedNotice),
          ),
          h(
            "div",
            { className: "pl-field" },
            h(
              "details",
              { className: "pl-details" },
              h("summary", null, t("diagnostics")),
              h(
                "pre",
                null,
                JSON.stringify(
                  {
                    status: usable?.status,
                    capabilities: usable?.capabilities,
                    observations: usable?.observations?.slice(-5),
                  },
                  null,
                  2,
                ),
              ),
            ),
          ),
          h(
            "div",
            { className: "pl-footer" },
            failed &&
              h(
                "p",
                { className: "pl-failed", role: "status" },
                t("saveFailed"),
              ),
            h(
              "button",
              {
                type: "button",
                className: "pl-save",
                disabled: !dirty || invalid || saving,
                onClick: save,
              },
              t(saving ? "saving" : "save"),
            ),
          ),
        ),
        templatesOpen &&
          usable &&
          h(
            "dialog",
            {
              id: templatesDialogId,
              ref: dialogRef,
              className: "pl-dialogLayer",
              "aria-labelledby": templatesTitleId,
              "aria-describedby": previewTemplate ? undefined : templatesDescId,
              "aria-modal": "true",
              onClick: (event) => {
                if (event.target === event.currentTarget) closeTemplates();
              },
            },
            h(
              "div",
              { className: "pl-dialog" },
              h(
                "div",
                { className: "pl-dialogHead" },
                h(
                  "h2",
                  { className: "pl-dialogTitle", id: templatesTitleId },
                  previewTemplate
                    ? `${t("templatePreviewTitle")} · ${templateTitleOf(previewTemplate)}`
                    : t("templates"),
                ),
                h(
                  "button",
                  {
                    type: "button",
                    className: "pl-dialogClose",
                    "aria-label": t("templateClose"),
                    onClick: closeTemplates,
                  },
                  closeIcon(),
                ),
              ),
              previewTemplate
                ? h(
                    "div",
                    {
                      className: "pl-dialogBody",
                      role: "region",
                      "aria-label": t("templatePreviewTitle"),
                      tabIndex: 0,
                    },
                    h(
                      "div",
                      { className: "pl-previewMeta" },
                      h(
                        "span",
                        { className: "pl-mono" },
                        previewTemplate.sectionId,
                      ),
                      previewTemplate.version &&
                        h(
                          "span",
                          { className: "pl-tag", "data-tone": "outline" },
                          `v${previewTemplate.version}`,
                        ),
                      templateTags(previewTemplate).map(([tone, label, title]) =>
                        h(
                          "span",
                          {
                            key: `${tone}:${label}`,
                            className: "pl-tag",
                            "data-tone": tone,
                            title,
                          },
                          label,
                        ),
                      ),
                    ),
                    h("p", { className: "pl-hint" }, t("templatePreviewHint")),
                    previewChanged &&
                      h(
                        "div",
                        { className: "pl-diffBlock" },
                        h(
                          "p",
                          { className: "pl-inlineWarn" },
                          t("templateDiffTitle"),
                        ),
                        h("p", { className: "pl-hint" }, t("templateDiffHint")),
                        previewDiff === null
                          ? h(
                              "p",
                              { className: "pl-hint" },
                              t("templateDiffTooLarge"),
                            )
                          : h(
                              "pre",
                              { className: "pl-diff" },
                              previewDiff.map((line, index) =>
                                h(
                                  "span",
                                  {
                                    key: index,
                                    className: "pl-diffLine",
                                    "data-kind": line.kind,
                                  },
                                  `${line.kind === "add" ? "+" : line.kind === "del" ? "-" : " "} ${line.text}`,
                                ),
                              ),
                            ),
                        replaceConfirm
                          ? h(
                              "div",
                              { className: "pl-replaceConfirm" },
                              h(
                                "p",
                                { className: "pl-inlineWarn" },
                                t("templateReplaceConfirm"),
                              ),
                              h(
                                "div",
                                { className: "pl-replaceActions" },
                                h(
                                  "button",
                                  {
                                    type: "button",
                                    className: "pl-button",
                                    onClick: () => setReplaceConfirm(false),
                                  },
                                  t("templateReplaceCancel"),
                                ),
                                h(
                                  "button",
                                  {
                                    type: "button",
                                    className: "pl-button",
                                    onClick: replaceCurrentBody,
                                  },
                                  t("templateReplaceConfirmAction"),
                                ),
                              ),
                            )
                          : h(
                              "div",
                              { className: "pl-replaceActions" },
                              h(
                                "button",
                                {
                                  type: "button",
                                  className: "pl-button",
                                  onClick: () => setReplaceConfirm(true),
                                },
                                t("templateReplace"),
                              ),
                            ),
                      ),
                    replacedNotice &&
                      h(
                        "p",
                        { className: "pl-inlineNote", role: "status" },
                        t("templateReplacedNotice"),
                      ),
                    h(
                      "pre",
                      { className: "pl-previewBody" },
                      previewTemplate.content,
                    ),
                  )
                : h(
                    React.Fragment,
                    null,
                    h(
                      "p",
                      { className: "pl-dialogDesc", id: templatesDescId },
                      t("templatesHint"),
                    ),
                    h(
                      "p",
                      { className: "pl-dialogScope" },
                      interpolate(
                        t("templateScopeLine"),
                        "scope",
                        scopeLabel(target),
                      ),
                    ),
                    target.scope !== "global" &&
                      usable?.capabilities?.modelLayers === false &&
                      h("p", { className: "pl-dialogNote" }, t("blocked")),
                    target.scope !== "model" &&
                      (usable?.templates ?? []).some(
                        (template) => template.recommendedScope === "model",
                      ) &&
                      h(
                        "div",
                        { className: "pl-scopeGuidance" },
                        h(
                          "p",
                          { className: "pl-inlineWarn", role: "note" },
                          t("templateScopeWarning"),
                        ),
                        h("p", { className: "pl-hint" }, t("templateScopeSteps")),
                        h(
                          "button",
                          {
                            type: "button",
                            className: "pl-button",
                            onClick: goToScopeSettings,
                          },
                          t("templateScopeSettings"),
                        ),
                      ),
                    h(
                      "div",
                      {
                        className: "pl-dialogBody",
                        role: "region",
                        "aria-label": t("templateListLabel"),
                        tabIndex: 0,
                      },
                      (usable.templates ?? []).length === 0
                        ? h(
                            "p",
                            { className: "pl-hint" },
                            t("templateNoTemplates"),
                          )
                        : h(
                            "ul",
                            { className: "pl-templateList" },
                          (usable.templates ?? []).map((template) => {
                            const entry = templateEntryOf(template);
                            const title = templateTitleOf(template);
                            const tags = templateTags(template);
                            const local = Boolean(
                              entry && (entry.isNew || entry.row?.local),
                            );
                            const modified =
                              local && !templateMatchesEntry(entry, template);
                            const needsScopeConfirm =
                              template.recommendedScope === "model" &&
                              target.scope !== "model";
                            const state = entry
                              ? local
                                ? modified
                                  ? [
                                      "warning",
                                      t("templateModified"),
                                      t("templateModifiedHint"),
                                    ]
                                  : ["success", t("templateAdded")]
                                : ["neutral", t("templateInherited")]
                              : null;
                            return h(
                              "li",
                              { key: template.id, className: "pl-templateRow" },
                              h(
                                "div",
                                { className: "pl-templateMain" },
                                h(
                                  "div",
                                  { className: "pl-templateTitle" },
                                  title,
                                ),
                                h(
                                  "p",
                                  { className: "pl-templateDesc" },
                                  templateDescriptionOf(template),
                                ),
                                tags.length > 0 &&
                                  h(
                                    "div",
                                    { className: "pl-templateTags" },
                                    tags.map(([tone, label, title]) =>
                                      h(
                                        "span",
                                        {
                                          key: `${tone}:${label}`,
                                          className: "pl-tag",
                                          "data-tone": tone,
                                          title,
                                        },
                                        label,
                                      ),
                                    ),
                                  ),
                                h(
                                  "p",
                                  { className: "pl-templateTarget" },
                                  interpolate(
                                    t("templateAddTarget"),
                                    "scope",
                                    scopeLabel(target),
                                  ),
                                ),
                              ),
                              h(
                                "div",
                                { className: "pl-templateActions" },
                                state
                                  ? h(
                                      "span",
                                      {
                                        className: "pl-tag",
                                        "data-tone": state[0],
                                        title: state[2],
                                      },
                                      state[1],
                                    )
                                  : h(
                                      "button",
                                      {
                                        type: "button",
                                        className: "pl-button",
                                        disabled: saving,
                                        "aria-label": `${t("templateAdd")}: ${title}`,
                                        onClick: () => {
                                          if (
                                            needsScopeConfirm &&
                                            confirmTemplateId !== template.id
                                          ) {
                                            setConfirmTemplateId(template.id);
                                            return;
                                          }
                                          setConfirmTemplateId("");
                                          addTemplate(template);
                                        },
                                      },
                                      t("templateAdd"),
                                    ),
                                h(
                                  "button",
                                  {
                                    type: "button",
                                    className: "pl-templatePreview",
                                    "aria-label": `${t("templatePreview")}: ${title}`,
                                    onClick: () => {
                                      setPreviewId(template.id);
                                      setReplaceConfirm(false);
                                      setReplacedTemplateId("");
                                    },
                                  },
                                  t("templatePreview"),
                                ),
                              ),
                              confirmTemplateId === template.id &&
                                h(
                                  "div",
                                  { className: "pl-templateConfirm", role: "alert" },
                                  h(
                                    "p",
                                    { className: "pl-inlineWarn" },
                                    interpolate(
                                      t("templateModelConfirm"),
                                      "scope",
                                      scopeLabel(target),
                                    ),
                                  ),
                                  h(
                                    "div",
                                    { className: "pl-actions" },
                                    h(
                                      "button",
                                      {
                                        type: "button",
                                        className: "pl-button",
                                        onClick: () => setConfirmTemplateId(""),
                                      },
                                      t("cancel"),
                                    ),
                                    h(
                                      "button",
                                      {
                                        type: "button",
                                        className: "pl-button",
                                        onClick: goToScopeSettings,
                                      },
                                      t("templateScopeSettings"),
                                    ),
                                    h(
                                      "button",
                                      {
                                        type: "button",
                                        className: "pl-button",
                                        onClick: () => {
                                          setConfirmTemplateId("");
                                          addTemplate(template);
                                        },
                                      },
                                      t("templateModelConfirmAdd"),
                                    ),
                                  ),
                                ),
                            );
                          }),
                        ),
                    ),
                  ),
              h(
                "p",
                { className: "pl-srOnly", role: "status" },
                addedNotice,
              ),
              h(
                "div",
                { className: "pl-dialogFoot" },
                h(
                  "div",
                  { className: "pl-dialogActions" },
                  previewTemplate &&
                    h(
                      "button",
                      {
                        type: "button",
                        className: "pl-secondary",
                        onClick: () => {
                          setPreviewId("");
                          setReplaceConfirm(false);
                          setReplacedTemplateId("");
                        },
                      },
                      t("templateBack"),
                    ),
                  h(
                    "button",
                    {
                      type: "button",
                      className: "pl-primary",
                      onClick: closeTemplates,
                    },
                    t(previewTemplate ? "templateClose" : "templateDone"),
                  ),
                ),
              ),
            ),
          ),
      );
    }
    return {
      inject: ["slots", "locale"],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register("dshPromptLayers", words));
        ctx.slots.inject("plugins.row.config", () =>
          ctx.slots.register(
            {
              name: "plugins.row.config",
              key: "dsh-prompt-layers#prompt-layers",
              locale: "dshPromptLayers",
            },
            ({ view, t }) =>
              view === "summary"
                ? t("summary")
                : view === "page"
                  ? h(Panel, { t, locale: ctx.locale })
                  : null,
          ),
        );
      },
    };
  },
});
