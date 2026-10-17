// Section workspace: scope navigation, inline edits, explicit template import.
// Native control geometry follows DSH settings-form and Button primitives.
window.__ModuleLoader__.load({
  id: "dsh-prompt-layers",
  factory(require) {
    const React = require("react");
    const h = React.createElement;
    const css = `
.dsh-pl{font:inherit;font-size:13px;line-height:1.5;color:var(--dsw-alias-label-primary);min-width:0}.dsh-pl *{box-sizing:border-box}.dsh-pl section{padding:16px 0}.dsh-pl section+section,.dsh-pl article+article{border-top:.5px solid var(--dsw-alias-border-l2)}.dsh-pl h3{font-size:13px;font-weight:600;margin:0 0 10px}.dsh-pl p{margin:6px 0}.dsh-pl .muted{color:var(--dsw-alias-label-secondary);font-size:12px}.dsh-pl .hint{color:var(--dsw-alias-label-tertiary);font-size:12px}.dsh-pl .actions{display:flex;flex-wrap:wrap;align-items:center;gap:8px}.dsh-pl .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr));gap:12px}.dsh-pl label.field{display:flex;flex-direction:column;gap:6px;padding:8px 0;font-size:13px;font-weight:500}.dsh-pl input[type=text],.dsh-pl textarea,.dsh-pl .select{border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-3);color:inherit;font:inherit}.dsh-pl input[type=text]{height:34px;padding:0 12px;min-width:0}.dsh-pl .select{position:relative;min-width:0}.dsh-pl .select:after{content:'';position:absolute;right:13px;top:12px;width:7px;height:7px;border-bottom:1px solid currentColor;border-right:1px solid currentColor;transform:rotate(45deg);pointer-events:none}.dsh-pl select{appearance:none;width:100%;height:34px;padding:0 32px 0 12px;border:0;background:transparent;color:inherit;font:inherit}.dsh-pl textarea{width:100%;min-height:240px;padding:10px 12px;resize:vertical;font:12px/1.6 monospace}.dsh-pl button{display:inline-flex;align-items:center;justify-content:center;gap:4px;height:28px;padding:0 10px;border:.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-sm);color:inherit;background:transparent;font-family:inherit;font-size:12px;line-height:18px;cursor:pointer}.dsh-pl button:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}.dsh-pl button.primary{background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground);border-color:transparent}.dsh-pl button.primary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover)}.dsh-pl button:disabled{opacity:.4;cursor:not-allowed}.dsh-pl :is(button,input,select,textarea,summary):focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}.dsh-pl input[type=checkbox]{accent-color:var(--dsw-alias-brand-primary)}.dsh-pl article{padding:12px 0}.dsh-pl .row{display:flex;align-items:center;gap:12px}.dsh-pl .row>button{flex:1;height:auto;min-height:44px;text-align:left;justify-content:flex-start;border:0;padding:0}.dsh-pl .row strong{font-weight:500}.dsh-pl .summary{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:70ch}.dsh-pl .edit{padding:12px 0 0 20px}.dsh-pl pre{white-space:pre-wrap;overflow-wrap:anywhere;max-height:360px;overflow:auto;padding:12px;background:var(--dsw-alias-bg-layer-2);font:12px/1.6 monospace}.dsh-pl summary{cursor:pointer;font-size:12px;color:var(--dsw-alias-label-secondary)}.dsh-pl [role=alert]{color:var(--dsw-alias-state-error-primary)}.dsh-pl [role=status]{font-size:12px}.dsh-pl .badge{font-size:11px;color:var(--dsw-alias-label-secondary);padding:2px 7px;border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-sm)}.dsh-pl dialog{width:min(1000px,90vw);border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-xl);padding:20px;background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-primary)}.dsh-pl dialog textarea{height:65vh}.dsh-pl .check{display:flex;align-items:flex-start;gap:8px;padding:8px 0}.dsh-pl .check span{flex:1}.dsh-pl .check small{display:block;font-weight:400}.dsh-pl .bar{justify-content:space-between}.dsh-pl .condition{padding:12px 0;border-top:.5px solid var(--dsw-alias-border-l2)}@media(max-width:520px){.dsh-pl .edit{padding-left:0}.dsh-pl .row{gap:6px}.dsh-pl .summary{max-width:40ch}}
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
            className: options.primary ? "primary" : undefined,
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
          { className: "edit" },
          h(
            "p",
            { className: "muted" },
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
            button("expand", () => dialog.current.showModal()),
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
      const rowView = (row) =>
        h(
          "article",
          { key: row.id },
          h(
            "div",
            { className: "row" },
            h(
              "button",
              {
                type: "button",
                "aria-expanded": open === row.id,
                onClick: () => setOpen(open === row.id ? "" : row.id),
              },
              h(
                "span",
                null,
                h(
                  "strong",
                  null,
                  `${open === row.id ? "⌄" : "›"} ${row.id.replace(/^custom:/, "")}`,
                ),
                h(
                  "div",
                  { className: "hint" },
                  row.local
                    ? t(row.chain.length > 1 ? "overridden" : "local")
                    : `${t("inherited")} ${row.source.scope === "native" ? t("native") : t(row.source.scope)}`,
                ),
                h(
                  "div",
                  { className: "muted summary" },
                  (row.content ?? "").replace(/\s+/g, " ").slice(0, 140),
                ),
              ),
            ),
            h(
              "span",
              { className: "badge" },
              t(row.enabled ? "enabled" : "disabled"),
            ),
          ),
          open === row.id &&
            (edit?.id === row.id
              ? editor(row)
              : h(
                  "div",
                  { className: "edit" },
                  h("pre", null, row.content),
                  h(
                    "div",
                    { className: "actions" },
                    button(row.local ? "edit" : "override", () => begin(row)),
                    row.chain.length > 0 &&
                      !row.local &&
                      button("editSource", () =>
                        begin(row, row.chain.at(-1).target),
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
                          { key: layer.path },
                          h(
                            "p",
                            { className: "muted" },
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
          "section",
          null,
          h(
            "div",
            { className: "actions bar" },
            h("span", { role: "status" }, t(statusKey)),
            button("refresh", () => load(target)),
          ),
          data?.capabilities?.modelLayers === false &&
            h("p", { className: "hint" }, t("blocked")),
          error &&
            h(
              "div",
              { role: "alert" },
              error,
              " ",
              button("retry", () => load(target)),
            ),
          notice && h("p", { role: "status" }, notice),
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
            "section",
            null,
            h("h3", null, t("sections")),
            edit &&
              !sections.some((row) => row.id === edit.id) &&
              editor(newRow),
            !sections.some((row) => row.kind === "custom") &&
              h("p", { className: "muted" }, t("empty")),
            sections.filter((row) => row.kind === "custom").map(rowView),
            h(
              "details",
              null,
              h(
                "summary",
                null,
                `${t("native")} (${sections.filter((row) => row.kind === "native").length})`,
              ),
              h("p", { className: "hint" }, t("nativeHint")),
              sections.filter((row) => row.kind === "native").map(rowView),
            ),
          ),
        showTemplates &&
          h(
            "section",
            null,
            h("h3", null, t("templates")),
            h(
              "p",
              { className: "muted" },
              `${t("target")}: ${labelScope(target)}`,
            ),
            (data?.templates ?? []).map((template) =>
              h(
                "article",
                { key: template.id },
                check(template.title, chosen.includes(template.id), (checked) =>
                  setChosen((current) =>
                    checked
                      ? [...current, template.id]
                      : current.filter((id) => id !== template.id),
                  ),
                ),
                h("p", { className: "muted" }, template.description),
                h(
                  "details",
                  null,
                  h("summary", null, t("content")),
                  h("pre", null, template.content),
                ),
              ),
            ),
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
        h(
          "section",
          null,
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
          "section",
          null,
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
            "label",
            { className: "field" },
            t("content"),
            h("textarea", {
              value: edit?.content ?? "",
              onChange: (event) => setField("content", event.target.value),
            }),
          ),
          button("close", () => dialog.current.close()),
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
