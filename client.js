// Section workspace: scope navigation, inline edits, explicit template import.
// Native control geometry follows DSH settings-form and Button primitives.
window.__ModuleLoader__.load({
  id: "dsh-prompt-layers",
  factory(require) {
    const React = require("react");
    const h = React.createElement;
    const css = `
.dsh-pl{display:flex;flex-direction:column;gap:32px;min-width:0;color:var(--dsw-alias-label-primary);font:inherit}
.dsh-pl *{box-sizing:border-box}
.dsh-pl .group{display:flex;flex-direction:column;gap:12px;min-width:0}
.dsh-pl .groupHead{display:flex;align-items:baseline;gap:10px;min-width:0}
.dsh-pl .groupTitle{margin:0;font-size:14px;line-height:20px;font-weight:500}
.dsh-pl .count{flex:none;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
.dsh-pl p{margin:0}
.dsh-pl .hint{margin:0;font-size:12px;line-height:1.5;color:var(--dsw-alias-label-tertiary);overflow-wrap:anywhere}
.dsh-pl .muted{margin:0;font-size:13px;line-height:20px;color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}
.dsh-pl .status{margin:0;font-size:13px;line-height:20px;color:var(--dsw-alias-label-tertiary)}
.dsh-pl .error{margin:0;font-size:12px;line-height:1.5;color:var(--dsw-alias-state-error-primary);overflow-wrap:anywhere}
.dsh-pl .actions{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
.dsh-pl .bar{justify-content:space-between}
.dsh-pl .rows{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.dsh-pl .row{padding:12px 2px;border-bottom:.5px solid var(--dsw-alias-border-l2)}
.dsh-pl .row:last-child{border-bottom:0}
.dsh-pl .rowLine{display:flex;align-items:center;gap:16px;min-width:0}
.dsh-pl .rowMain{display:flex;flex:1;flex-direction:column;gap:2px;min-width:0}
.dsh-pl .rowOpen{display:inline-flex;align-items:center;justify-content:flex-start;gap:2px;max-width:100%;padding:0;border:0;background:none;color:inherit;font:inherit;text-align:left;cursor:pointer}
.dsh-pl .rowOpen:hover .rowId{text-decoration:underline;text-underline-offset:3px}
.dsh-pl .rowOpen:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}
.dsh-pl .rowId{font-size:13.5px;line-height:20px;font-weight:500;overflow-wrap:anywhere}
.dsh-pl .rowDesc{display:-webkit-box;overflow:hidden;overflow-wrap:anywhere;font-size:13px;line-height:18px;color:var(--dsw-alias-label-tertiary);-webkit-box-orient:vertical;-webkit-line-clamp:1}
.dsh-pl .rowState{flex:none;font-size:12.5px;line-height:18px;color:var(--dsw-alias-label-secondary);white-space:nowrap}
.dsh-pl .chev{flex:none;color:var(--dsw-alias-label-tertiary);transition:transform 160ms var(--ds-ease-in-out)}
.dsh-pl .rowOpen[aria-expanded=true] .chev{transform:rotate(90deg)}
.dsh-pl .rowBody{display:flex;flex-direction:column;gap:12px;padding:12px 0 4px 20px;min-width:0}
.dsh-pl .mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11.5px;line-height:16px;color:var(--dsw-alias-label-tertiary);overflow-wrap:anywhere}
.dsh-pl pre{margin:0;max-height:280px;padding:10px 12px;overflow:auto;border:.5px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-bg-layer-1);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;line-height:1.6;color:var(--dsw-alias-label-primary);white-space:pre-wrap;overflow-wrap:anywhere}
.dsh-pl .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr));gap:16px}
.dsh-pl .grid .field{padding:0}
.dsh-pl .grid .field + .field{border-top:0}
.dsh-pl .field{display:flex;flex-direction:column;gap:6px;padding:12px 0;min-width:0;font-size:13px;font-weight:500;line-height:1.5;color:var(--dsw-alias-label-primary)}
.dsh-pl .field + .field{border-top:.5px solid var(--dsw-alias-border-l2)}
.dsh-pl .select{position:relative;display:block;min-width:0}
.dsh-pl .select:after{content:'';position:absolute;right:13px;top:13px;width:6px;height:6px;border-bottom:1px solid var(--dsw-alias-label-tertiary);border-right:1px solid var(--dsw-alias-label-tertiary);transform:rotate(45deg);pointer-events:none}
.dsh-pl input[type=text],.dsh-pl select,.dsh-pl textarea{width:100%;border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-3);font-family:inherit;font-size:13px;line-height:1.5;font-weight:400;color:var(--dsw-alias-label-primary)}
.dsh-pl input[type=text],.dsh-pl select{height:34px;padding:0 12px}
.dsh-pl select{appearance:none;padding-right:32px}
.dsh-pl input[type=text]:focus-visible,.dsh-pl select:focus-visible,.dsh-pl textarea:focus-visible{outline:none;border-color:var(--dsw-alias-state-business-primary)}
.dsh-pl textarea{min-height:200px;padding:10px 12px;resize:vertical;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;line-height:1.6}
.dsh-pl .btn{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;gap:4px;border:none;border-radius:var(--dsw-radius-md);cursor:pointer;font-family:inherit;font-size:14px;line-height:22px;color:var(--dsw-alias-label-primary);background:transparent;padding:0 14px}
.dsh-pl .btn:disabled{cursor:not-allowed;opacity:.4}
.dsh-pl .btn.md{height:36px}
.dsh-pl .btn.sm{height:28px;font-size:12px;line-height:18px;padding:0 10px;border-radius:var(--dsw-radius-sm)}
.dsh-pl .btn.primary{background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground)}
.dsh-pl .btn.primary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover)}
.dsh-pl .btn.ghost:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.dsh-pl .btn.ghost:active:not(:disabled){background:var(--dsw-alias-interactive-bg-active)}
.dsh-pl .btn.outline{border:.5px solid var(--dsw-alias-border-l3)}
.dsh-pl .btn.outline:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.dsh-pl .btn .icon{display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px}
.dsh-pl .check{display:inline-flex;align-items:center;gap:6px;font-size:14px;line-height:20px;font-weight:400;color:var(--dsw-alias-label-primary);cursor:pointer}
.dsh-pl .check input{flex:0 0 auto;width:16px;height:16px;margin:0;accent-color:var(--dsw-alias-brand-primary);cursor:inherit}
.dsh-pl .check input:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}
.dsh-pl .check:has(input:disabled){cursor:default;opacity:.5}
.dsh-pl .check small{display:block;font-size:12px;line-height:1.5;color:var(--dsw-alias-label-tertiary)}
.dsh-pl details{display:flex;flex-direction:column;gap:10px}
.dsh-pl summary{display:inline-flex;align-items:center;gap:4px;padding:0;font-size:13px;line-height:20px;color:var(--dsw-alias-label-secondary);cursor:pointer;list-style:none}
.dsh-pl summary::-webkit-details-marker{display:none}
.dsh-pl summary:before{content:'';flex:none;width:5px;height:5px;border-right:1px solid currentColor;border-bottom:1px solid currentColor;transform:rotate(-45deg);transition:transform 160ms var(--ds-ease-in-out)}
.dsh-pl details[open]>summary:before{transform:rotate(45deg)}
.dsh-pl summary:hover{color:var(--dsw-alias-label-primary)}
.dsh-pl dialog{padding:0 0 24px;overflow:hidden;border:0;border-radius:var(--dsw-radius-panel);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);box-shadow:var(--dsw-elevation-prominent)}
.dsh-pl dialog[open]{display:flex;flex-direction:column;gap:20px;width:min(720px,100%);max-height:min(800px,100%)}
.dsh-pl dialog::backdrop{background:var(--dsw-alias-bg-mask-1);backdrop-filter:var(--dsw-mask-blur)}
.dsh-pl .dialogHeader{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:22px 14px 12px 24px}
.dsh-pl .dialogTitle{margin:0;font-size:16px;line-height:24px;font-weight:500}
.dsh-pl .dialogBody{display:flex;flex:1 1 auto;flex-direction:column;gap:12px;min-width:0;min-height:0;padding:0 24px;overflow:auto}
.dsh-pl .dialogFooter{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:0 24px}
.dsh-pl .close{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border:none;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer}
.dsh-pl .close:hover{background:var(--dsw-alias-interactive-bg-hover)}
@media (prefers-reduced-motion:reduce){.dsh-pl .chev{transition:none}}
`;
    const words = {
      zh: {
        global: "全局",
        provider: "供应商",
        model: "具体模型",
        scope: "查看范围",
        choose: "请选择",
        sections: "提示词段",
        native: "原生 DSH 段",
        add: "新增 Section",
        templates: "从模板导入",
        refresh: "刷新",
        loading: "正在读取…",
        retry: "重试",
        empty: "当前范围暂无自定义 Section。可新增或从模板导入。",
        inherited: "继承自",
        local: "当前范围定义",
        overridden: "当前范围已覆盖",
        enabled: "启用",
        disabled: "已禁用",
        edit: "编辑正文",
        override: "在当前范围覆盖",
        editSource: "编辑来源",
        remove: "移除当前覆盖，恢复继承",
        delete: "删除当前定义",
        save: "保存",
        cancel: "取消",
        content: "正文",
        id: "Section ID",
        conditions: "Agent 与工具条件",
        role: "Agent 角色",
        all: "全部主/子 Agent",
        main: "仅主 Agent",
        delegated: "仅子 Agent",
        presets: "限定 Preset（逗号分隔，留空为全部）",
        pwsh: "仅具备已证明的 PowerShell 能力时应用",
        position: "位置",
        default: "首次定义的默认位置",
        before: "放在…之前",
        after: "放在…之后",
        anchor: "锚点 Section ID",
        managed: "明确允许修改此受管原生段",
        compare: "查看保存前后对照",
        current: "当前有效正文",
        proposed: "保存后的正文",
        expand: "放大编辑",
        close: "关闭",
        history: "各层定义与差异",
        advanced: "高级：YAML / Markdown 原文",
        selectFile: "文件",
        raw: "原文编辑",
        import: "导入到当前范围",
        copy: "复制装配任务给 Agent",
        diagnostics: "诊断详情",
        conflict: "文件已被其他编辑者修改，草稿已保留。请刷新并对照后合并。",
        saved: "已保存。实际应用状态请查看顶部反馈。",
        blocked:
          "供应商与模型层目前仅供配置和预览；当前宿主尚不支持按最终请求路由应用。",
        emptyStatus: "未添加提示词",
        active: "配置已激活",
        lastValid: "候选无效，使用上次有效配置",
        fallback: "使用原生提示词",
        target: "保存到",
        summary: "有效正文预览",
        copied: "装配任务已复制",
        nativeHint: "原生段来自最近观察到的 Agent，实际内容可能随 Agent 变化。",
        unsaved: "当前编辑尚未保存，请先保存或取消再切换范围。",
        customName: "custom:my-guidance",
        noTemplates: "暂无模板",
        conditionsHint: "条件不匹配时该段不应用；未知工具能力不会按可用处理。",
      },
      en: {
        global: "Global",
        provider: "Provider",
        model: "Model",
        scope: "Scope",
        choose: "Choose",
        sections: "Prompt Sections",
        native: "Native DSH Sections",
        add: "Add Section",
        templates: "Import templates",
        refresh: "Refresh",
        loading: "Loading…",
        retry: "Retry",
        empty:
          "No custom Sections in this scope. Add one or import a template.",
        inherited: "Inherited from",
        local: "Defined here",
        overridden: "Overridden here",
        enabled: "Enabled",
        disabled: "Disabled",
        edit: "Edit content",
        override: "Override in this scope",
        editSource: "Edit source",
        remove: "Remove override and inherit",
        delete: "Delete local definition",
        save: "Save",
        cancel: "Cancel",
        content: "Content",
        id: "Section ID",
        conditions: "Agent and tool conditions",
        role: "Agent role",
        all: "All main and delegated Agents",
        main: "Main only",
        delegated: "Delegated only",
        presets: "Presets (comma separated; empty means all)",
        pwsh: "Require proven PowerShell capability",
        position: "Position",
        default: "First-definition default",
        before: "Before",
        after: "After",
        anchor: "Anchor Section ID",
        managed: "Explicitly allow this managed native override",
        compare: "Compare before saving",
        current: "Current effective content",
        proposed: "Proposed content",
        expand: "Expand editor",
        close: "Close",
        history: "Layer definitions and differences",
        advanced: "Advanced: YAML / Markdown source",
        selectFile: "File",
        raw: "Source editor",
        import: "Import into this scope",
        copy: "Copy assembly task",
        diagnostics: "Diagnostics",
        conflict:
          "The file changed externally. Your draft was kept; refresh and merge.",
        saved: "Saved. Check activation status above.",
        blocked:
          "Provider/model layers can be configured and previewed; this host cannot apply them after final routing.",
        emptyStatus: "No prompt layers",
        active: "Configuration active",
        lastValid: "Invalid candidate; using last valid configuration",
        fallback: "Using native prompt",
        target: "Save to",
        summary: "Effective content",
        copied: "Assembly task copied",
        nativeHint:
          "Native Sections come from a recently observed Agent and may vary by Agent.",
        unsaved: "Save or cancel the current edit before changing scope.",
        customName: "custom:my-guidance",
        noTemplates: "No templates",
        conditionsHint:
          "Unmatched conditions do not apply; unknown tool capabilities do not match.",
      },
    };
    function Panel({ t }) {
      const [data, setData] = React.useState(null),
        [target, setTarget] = React.useState({ scope: "global" });
      const [error, setError] = React.useState(""),
        [notice, setNotice] = React.useState(""),
        [busy, setBusy] = React.useState(false);
      const [open, setOpen] = React.useState(""),
        [edit, setEdit] = React.useState(null),
        [compare, setCompare] = React.useState(false);
      const [showTemplates, setShowTemplates] = React.useState(false),
        [chosen, setChosen] = React.useState([]);
      const [rawPath, setRawPath] = React.useState(""),
        [rawDraft, setRawDraft] = React.useState(null);
      const lock = React.useRef(false),
        generation = React.useRef(0),
        dialog = React.useRef(null);
      const targetRef = React.useRef(target);
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
          if (!response.ok) {
            const failure = new Error(
              result.error || `HTTP ${response.status}`,
            );
            failure.status = response.status;
            throw failure;
          }
          return result;
        } finally {
          clearTimeout(timer);
        }
      };
      const load = async (next) => {
        const request = ++generation.current;
        setBusy(true);
        setError("");
        try {
          const result = await api({ action: "workspace", target: next });
          if (request === generation.current) {
            setData(result);
            if (result.error) setError(result.error);
          }
        } catch (failure) {
          if (request === generation.current) setError(failure.message);
        } finally {
          if (request === generation.current) setBusy(false);
        }
      };
      React.useEffect(() => {
        load(targetRef.current);
        return () => {
          generation.current++;
        };
      }, []);
      const perform = async (body, after) => {
        if (lock.current) return;
        lock.current = true;
        setBusy(true);
        setError("");
        setNotice("");
        try {
          const result = await api(body);
          if (result.target) {
            if (
              JSON.stringify(result.target) ===
              JSON.stringify(targetRef.current)
            )
              setData(result);
            else await load(targetRef.current);
          } else await load(targetRef.current);
          if (after) after();
          setNotice(t("saved"));
        } catch (failure) {
          setError(failure.status === 409 ? t("conflict") : failure.message);
        } finally {
          lock.current = false;
          setBusy(false);
        }
      };
      const changeTarget = (next) => {
        if (edit || rawDraft !== null) {
          setError(t("unsaved"));
          return;
        }
        setTarget(next);
        setOpen("");
        if (
          (next.scope !== "global" && !next.provider) ||
          (next.scope === "model" && !next.model)
        ) {
          setData((current) =>
            current ? { ...current, sections: [] } : current,
          );
          return;
        }
        load(next);
      };
      const routes = data?.routes ?? [];
      const identities = data?.identities ?? [];
      const providers = [
        ...new Set(
          [...routes, ...identities]
            .map((item) => item.provider)
            .filter(Boolean),
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
      const sections = data?.sections ?? [];
      const labelScope = (value) =>
        value.scope === "global"
          ? t("global")
          : value.scope === "provider"
            ? `${t("provider")} · ${value.provider}`
            : `${value.provider} / ${value.model}`;
      const begin = (row, destination = target) => {
        if (edit) { setError(t("unsaved")); return; }
        if (JSON.stringify(destination) !== JSON.stringify(target)) {
          const layer = row.chain.find(item => JSON.stringify(item.target) === JSON.stringify(destination));
          if (layer) row = { ...row, ...layer.effective };
        }
        setOpen(row.id);
        setCompare(false);
        setEdit({
          id: row.id,
          kind: row.kind,
          interpolate: row.interpolate === true,
          target: destination,
          content: row.content ?? "",
          enabled: row.enabled !== false,
          role: row.when?.agent?.role ?? "",
          presets: (row.when?.agent?.presets ?? []).join(", "),
          powershell: row.when?.tools?.powershell === true,
          position:
            typeof row.position === "object"
              ? row.position.before
                ? "before"
                : "after"
              : "default",
          anchor:
            typeof row.position === "object"
              ? (row.position.before ?? row.position.after)
              : "",
          managed: false,
        });
      };
      const setField = (key, value) =>
        setEdit((current) => ({ ...current, [key]: value }));
      const button = (key, onClick, options = {}) =>
        h(
          "button",
          {
            type: "button",
            onClick,
            disabled: busy || options.disabled,
            className: `btn ${options.variant ?? (options.primary ? "primary" : "outline")} ${options.size ?? "md"}`,
            ...options.props,
          },
          t(key),
        );
      const select = (label, value, onChange, options, disabled = false) =>
        h(
          "label",
          { className: "field" },
          label,
          h(
            "span",
            { className: "select" },
            h(
              "select",
              {
                value,
                onChange: (event) => onChange(event.target.value),
                disabled,
              },
              options.map(([key, text]) =>
                h("option", { key, value: key }, text),
              ),
            ),
          ),
        );
      const text = (label, value, onChange, props = {}) =>
        h(
          "label",
          { className: "field" },
          label,
          h("input", {
            type: "text",
            value,
            onChange: (event) => onChange(event.target.value),
            ...props,
          }),
        );
      const check = (label, checked, onChange) =>
        h(
          "label",
          { className: "check" },
          h("input", {
            type: "checkbox",
            checked,
            onChange: (event) => onChange(event.target.checked),
          }),
          h("span", null, label),
        );
      const saveEdit = () => {
        const when = {};
        if (edit.role || edit.presets.trim())
          when.agent = {
            ...(edit.role ? { role: edit.role } : {}),
            ...(edit.presets.trim()
              ? {
                  presets: edit.presets
                    .split(",")
                    .map((value) => value.trim())
                    .filter(Boolean),
                }
              : {}),
          };
        if (edit.powershell) when.tools = { powershell: true };
        perform(
          {
            action: "section-save",
            target: edit.target,
            id: edit.id,
            kind: edit.kind,
            expectedRevision: data.revision,
            clearWhen: !Object.keys(when).length,
            fields: {
              content: edit.content,
              enabled: edit.enabled,
              position:
                edit.position === "default"
                  ? "default"
                  : { [edit.position]: edit.anchor },
              interpolate: edit.interpolate,
              ...(Object.keys(when).length ? { when } : {}),
              ...(edit.kind === "native"
                ? { allowManagedOverride: edit.managed }
                : {}),
            },
          },
          () => setEdit(null),
        );
      };
      const editor = (row) =>
        h(
          "div",
          { className: "rowBody" },
          h(
            "span",
            { className: "mono" },
            `${t("target")}: ${labelScope(edit.target)}`,
          ),
          !row.chain?.length &&
            row.kind === "custom" &&
            text(t("id"), edit.id, (value) => setField("id", value)),
          h(
            "label",
            { className: "field" },
            t("content"),
            h("textarea", {
              value: edit.content,
              onChange: (event) => setField("content", event.target.value),
              spellCheck: false,
            }),
          ),
          h(
            "div",
            { className: "actions" },
            button("expand", () => dialog.current.showModal(), { size: "sm" }),
            check(t("enabled"), edit.enabled, (value) =>
              setField("enabled", value),
            ),
          ),
          h(
            "div",
            { className: "grid" },
            select(
              t("position"),
              edit.position,
              (value) => setField("position", value),
              [
                ["default", t("default")],
                ["before", t("before")],
                ["after", t("after")],
              ],
            ),
            edit.position !== "default" &&
              text(t("anchor"), edit.anchor, (value) =>
                setField("anchor", value),
              ),
          ),
          h(
            "details",
            { className: "condition" },
            h("summary", null, t("conditions")),
            h("p", { className: "hint" }, t("conditionsHint")),
            select(t("role"), edit.role, (value) => setField("role", value), [
              ["", t("all")],
              ["main", t("main")],
              ["delegated", t("delegated")],
            ]),
            text(t("presets"), edit.presets, (value) =>
              setField("presets", value),
            ),
            check(t("pwsh"), edit.powershell, (value) =>
              setField("powershell", value),
            ),
          ),
          edit.kind === "native" &&
            check(t("managed"), edit.managed, (value) =>
              setField("managed", value),
            ),
          h(
            "details",
            null,
            h("summary", { onClick: () => setCompare(!compare) }, t("compare")),
            h(
              "div",
              { className: "grid" },
              h("div", null, t("current"), h("pre", null, row.content)),
              h("div", null, t("proposed"), h("pre", null, edit.content)),
            ),
          ),
          h(
            "div",
            { className: "actions" },
            button("save", saveEdit, {
              primary: true,
              disabled:
                !edit.content.trim() ||
                (edit.kind === "native" && !edit.managed),
            }),
            button("cancel", () => setEdit(null)),
          ),
        );
      const chevron = () =>
        h(
          "svg",
          {
            width: 14,
            height: 14,
            viewBox: "0 0 16 16",
            fill: "none",
            "aria-hidden": "true",
            className: "chev",
          },
          h("path", {
            d: "M6 12L9.29289 8.70711C9.68342 8.31658 9.68342 7.68342 9.29289 7.29289L6 4",
            stroke: "currentColor",
          }),
        );
      const rowView = (row) =>
        h(
          "li",
          { className: "row", key: row.id },
          h(
            "div",
            { className: "rowLine" },
            h(
              "div",
              { className: "rowMain" },
              h(
                "button",
                {
                  type: "button",
                  className: "rowOpen",
                  "aria-expanded": open === row.id,
                  onClick: () => setOpen(open === row.id ? "" : row.id),
                },
                h("span", { className: "rowId" }, row.id.replace(/^custom:/, "")),
                chevron(),
              ),
              h(
                "span",
                { className: "rowDesc" },
                (row.content ?? "").replace(/\s+/g, " ").slice(0, 160),
              ),
            ),
            h(
              "span",
              { className: "rowState" },
              `${row.local ? t(row.chain.length > 1 ? "overridden" : "local") : `${t("inherited")} ${row.source.scope === "native" ? t("native") : t(row.source.scope)}`} · ${t(row.enabled ? "enabled" : "disabled")}`,
            ),
          ),
          open === row.id &&
            (edit?.id === row.id
              ? editor(row)
              : h(
                  "div",
                  { className: "rowBody" },
                  h("span", { className: "mono" }, row.id),
                  h("pre", null, row.content),
                  h(
                    "div",
                    { className: "actions" },
                    button(row.local ? "edit" : "override", () => begin(row), {
                      size: "sm",
                    }),
                    row.chain.length > 0 &&
                      !row.local &&
                      button(
                        "editSource",
                        () => begin(row, row.chain.at(-1).target),
                        { size: "sm", variant: "ghost" },
                      ),
                    row.local &&
                      button(
                        row.chain.length > 1 || row.kind === "native"
                          ? "remove"
                          : "delete",
                        () =>
                          perform({
                            action: "section-remove",
                            target,
                            id: row.id,
                            kind: row.kind,
                            expectedRevision: data.revision,
                          }),
                        { size: "sm" },
                      ),
                  ),
                  row.chain.length > 0 &&
                    h(
                      "details",
                      null,
                      h("summary", null, t("history")),
                      row.chain.map((layer) =>
                        h(
                          "div",
                          { key: layer.path, className: "group" },
                          h(
                            "span",
                            { className: "mono" },
                            labelScope(layer.target),
                          ),
                          h(
                            "pre",
                            null,
                            JSON.stringify(layer.attributes, null, 2),
                          ),
                        ),
                      ),
                    ),
                )),
        );
      const file = data?.files?.find((item) => item.path === rawPath);
      const statusKey =
        {
          empty: "emptyStatus",
          active: "active",
          "last-valid": "lastValid",
          "native-fallback": "fallback",
        }[data?.status?.phase] ?? "loading";
      const newRow = {
        id: "custom:new-guidance",
        kind: "custom",
        content: "",
        enabled: true,
        position: "default",
        source: { scope: target.scope },
        chain: [],
      };
      return h(
        "div",
        { className: "dsh-pl" },
        h("style", null, css),
        h(
          "div",
          { className: "group" },
          h(
            "div",
            { className: "actions bar" },
            h("span", { className: "status", role: "status" }, t(statusKey)),
            button("refresh", () => load(target), {
              size: "sm",
              variant: "ghost",
            }),
          ),
          data?.capabilities?.modelLayers === false &&
            h("p", { className: "hint" }, t("blocked")),
          error &&
            h(
              "div",
              { className: "actions" },
              h("p", { className: "error", role: "alert" }, error),
              button("retry", () => load(target), { size: "sm" }),
            ),
          notice && h("p", { className: "hint", role: "status" }, notice),
          h(
            "div",
            { className: "grid" },
            select(
              t("scope"),
              target.scope,
              (scope) =>
                changeTarget(
                  scope === "global"
                    ? { scope }
                    : {
                        scope,
                        provider: providers[0] ?? "",
                        ...(scope === "model" ? { model: "" } : {}),
                      },
                ),
              [
                ["global", t("global")],
                ["provider", t("provider")],
                ["model", t("model")],
              ],
            ),
            target.scope !== "global" &&
              select(
                t("provider"),
                target.provider ?? "",
                (provider) =>
                  changeTarget({
                    ...target,
                    provider,
                    ...(target.scope === "model" ? { model: "" } : {}),
                  }),
                [
                  ["", t("choose")],
                  ...providers.map((value) => [value, value]),
                ],
              ),
            target.scope === "model" &&
              select(
                t("model"),
                target.model ?? "",
                (model) => changeTarget({ ...target, model }),
                [["", t("choose")], ...models.map((value) => [value, value])],
              ),
          ),
          h(
            "div",
            { className: "actions" },
            button("add", () => begin(newRow), {
              primary: true,
              disabled:
                !data?.revision ||
                (target.scope !== "global" && !target.provider) ||
                (target.scope === "model" && !target.model),
            }),
            button("templates", () => setShowTemplates(!showTemplates), {
              disabled:
                !data?.revision ||
                (target.scope !== "global" && !target.provider) ||
                (target.scope === "model" && !target.model),
            }),
            button("copy", async () => {
              try {
                await navigator.clipboard.writeText(
                  `Read ${data.guidePath}. Configuration: ${data.rootPath}. Schema: ${data.schemaPath}. Discuss explicit templates and exact targets with me before writing.`,
                );
                setNotice(t("copied"));
              } catch (failure) {
                setError(failure.message);
              }
            }),
          ),
        ),
        data &&
          h(
            "div",
            { className: "group" },
            h(
              "div",
              { className: "groupHead" },
              h("h3", { className: "groupTitle" }, t("sections")),
              h(
                "span",
                { className: "count" },
                String(sections.filter((row) => row.kind === "custom").length),
              ),
            ),
            edit &&
              !sections.some((row) => row.id === edit.id) &&
              editor(newRow),
            !sections.some((row) => row.kind === "custom") &&
              h("p", { className: "muted" }, t("empty")),
            h(
              "ul",
              { className: "rows" },
              sections.filter((row) => row.kind === "custom").map(rowView),
            ),
            h(
              "details",
              null,
              h(
                "summary",
                null,
                `${t("native")} (${sections.filter((row) => row.kind === "native").length})`,
              ),
              h("p", { className: "hint" }, t("nativeHint")),
              h(
                "ul",
                { className: "rows" },
                sections.filter((row) => row.kind === "native").map(rowView),
              ),
            ),
          ),
        showTemplates &&
          h(
            "div",
            { className: "group" },
            h(
              "div",
              { className: "groupHead" },
              h("h3", { className: "groupTitle" }, t("templates")),
              h("span", { className: "count" }, labelScope(target)),
            ),
            h(
              "ul",
              { className: "rows" },
              (data?.templates ?? []).map((template) =>
                h(
                  "li",
                  { className: "row", key: template.id },
                  h(
                    "div",
                    { className: "rowLine" },
                    h(
                      "div",
                      { className: "rowMain" },
                      h(
                        "label",
                        { className: "check" },
                        h("input", {
                          type: "checkbox",
                          checked: chosen.includes(template.id),
                          onChange: (event) =>
                            setChosen((current) =>
                              event.target.checked
                                ? [...current, template.id]
                                : current.filter((id) => id !== template.id),
                            ),
                        }),
                        h(
                          "span",
                          null,
                          template.title,
                          h("small", null, template.description),
                        ),
                      ),
                      h(
                        "details",
                        null,
                        h("summary", null, t("content")),
                        h("pre", null, template.content),
                      ),
                    ),
                  ),
                ),
              ),
            ),
            h(
              "div",
              { className: "actions" },
              button(
                "import",
                () =>
                  perform(
                    {
                      action: "import",
                      templateIds: chosen,
                      targets: [target],
                      expectedRevision: data.revision,
                    },
                    () => {
                      setChosen([]);
                      setShowTemplates(false);
                    },
                  ),
                { primary: true, disabled: !chosen.length },
              ),
            ),
          ),
        h(
          "div",
          { className: "group" },
          h(
            "details",
            null,
            h("summary", null, t("advanced")),
            select(
              t("selectFile"),
              rawPath,
              (value) => {
                if (rawDraft !== null) {
                  setError(t("unsaved"));
                  return;
                }
                setRawPath(value);
              },
              [
                ["", t("choose")],
                ...(data?.files ?? []).map((item) => [item.path, item.path]),
              ],
            ),
            file &&
              h(
                React.Fragment,
                null,
                h(
                  "label",
                  { className: "field" },
                  t("raw"),
                  h("textarea", {
                    value: rawDraft ?? file.text,
                    onChange: (event) => setRawDraft(event.target.value),
                    spellCheck: false,
                  }),
                ),
                h(
                  "div",
                  { className: "actions" },
                  button(
                    "save",
                    () =>
                      perform(
                        {
                          action: "save",
                          path: file.path,
                          text: rawDraft,
                          expectedRevision: file.revision,
                        },
                        () => setRawDraft(null),
                      ),
                    { primary: true, disabled: rawDraft === null },
                  ),
                  button("cancel", () => setRawDraft(null)),
                ),
              ),
          ),
        ),
        h(
          "div",
          { className: "group" },
          h(
            "details",
            null,
            h("summary", null, t("diagnostics")),
            h(
              "pre",
              null,
              JSON.stringify(
                {
                  status: data?.status,
                  capabilities: data?.capabilities,
                  observations: data?.observations?.slice(-5),
                },
                null,
                2,
              ),
            ),
          ),
        ),
        h(
          "dialog",
          { ref: dialog, onCancel: () => undefined },
          h(
            "div",
            { className: "dialogHeader" },
            h("h2", { className: "dialogTitle" }, t("content")),
            h(
              "button",
              {
                type: "button",
                className: "close",
                "aria-label": t("close"),
                onClick: () => dialog.current.close(),
              },
              h(
                "svg",
                {
                  width: 14,
                  height: 14,
                  viewBox: "0 0 16 16",
                  fill: "none",
                  "aria-hidden": "true",
                },
                h("path", { d: "M2.5 2.5L13.5 13.5", stroke: "currentColor" }),
                h("path", { d: "M13.5 2.5L2.5 13.5", stroke: "currentColor" }),
              ),
            ),
          ),
          h(
            "div",
            { className: "dialogBody" },
            h("textarea", {
              value: edit?.content ?? "",
              onChange: (event) => setField("content", event.target.value),
              spellCheck: false,
            }),
          ),
          h(
            "div",
            { className: "dialogFooter" },
            button("cancel", () => dialog.current.close()),
            button("close", () => dialog.current.close(), { primary: true }),
          ),
        ),
      );
    }
    return {
      inject: ["slots", "locale"],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register("dshPromptLayers", words));
        ctx.slots.inject("plugins.bundle.config", () =>
          ctx.slots.register(
            {
              name: "plugins.bundle.config",
              key: "dsh-prompt-layers",
              locale: "dshPromptLayers",
            },
            ({ view, t }) => (view === "page" ? h(Panel, { t }) : null),
          ),
        );
      },
    };
  },
});