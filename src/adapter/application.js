// application — shared file editing, explicit template import, and preview.
// Boundary: no model-facing tools; Agents edit the same YAML and Markdown files.
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { parseDocument, stringify } from "yaml";
import { composeLayers, validateDocuments } from "../core/layers.js";
import {
  documentsForTarget,
  sectionWorkspace,
  validateTarget,
} from "../core/section-editor.js";

const digest = (value) =>
  createHash("sha256").update(value).digest("hex").slice(0, 20);

/** Load versioned, inert package templates from the published resource directory. */
export async function loadTemplates() {
  const root = new URL("../../templates/", import.meta.url);
  const catalog = JSON.parse(
    await readFile(new URL("catalog.json", root), "utf8"),
  );
  return Promise.all(
    catalog.map(async (item) => ({
      ...item,
      content: await readFile(new URL(item.file, root), "utf8"),
    })),
  );
}

/** Application operations used by the authenticated UI and file workflow. */
export class PromptLayersApplication {
  constructor(
    files,
    runtime,
    parse,
    templates,
    routes = async () => [],
    capabilities = { modelLayers: true, powershell: "unknown" },
  ) {
    this.files = files;
    this.runtime = runtime;
    this.parse = parse;
    this.templates = templates;
    this.routes = routes;
    this.capabilitySource = capabilities;
    this.busy = false;
  }

  /** Read the host-provided capability surface for this page. */
  capabilityFacts() {
    const value =
      typeof this.capabilitySource === "function"
        ? this.capabilitySource()
        : this.capabilitySource;
    return { ...value };
  }

  /** Return current disk and activation status without persisting prompt text. */
  async view() {
    let disk;
    try {
      disk = await this.files.load();
    } catch (error) {
      return {
        status: this.runtime.status,
        files: await this.files.listFiles(),
        templates: this.templates,
        routes: await this.routes(),
        error: error.message,
        capabilities: this.capabilityFacts(),
        ...this.paths(),
      };
    }
    return {
      status: this.runtime.status,
      revision: disk.revision,
      files: disk.files,
      templates: this.templates,
      routes: await this.routes(),
      observations: this.runtime.observations,
      capabilities: this.capabilityFacts(),
      ...this.paths(),
    };
  }

  paths() {
    return {
      guidePath: fileURLToPath(
        new URL("../../templates/AGENTS.md", import.meta.url),
      ),
      rootPath: this.files.root,
      schemaPath: fileURLToPath(
        new URL("../../prompt-layers.schema.json", import.meta.url),
      ),
    };
  }

  /** Serialize UI writes; disk revision checks also protect against external editors. */
  async execute(request) {
    if (!request || typeof request !== "object" || Array.isArray(request))
      throw new Error("Expected an operation object");
    if (this.busy)
      throw new Error("Another configuration operation is in progress");
    this.busy = true;
    try {
      switch (request.action) {
        case "save": {
          if (
            typeof request.text !== "string" ||
            typeof request.path !== "string"
          )
            throw new Error("save requires path and text");
          if (request.path.endsWith(".yaml"))
            this.parse(request.text, request.path);
          await this.files.save(
            request.path,
            request.text,
            request.expectedRevision,
          );
          await this.runtime.reload();
          return this.view();
        }
        case "reload":
          await this.runtime.reload();
          return this.view();
        case "import":
          await this.importTemplates(request);
          await this.runtime.reload();
          return this.view();
        case "preview":
          return this.preview(request);
        case "workspace":
          return this.workspace(request.target);
        case "section-save":
          await this.saveSection(request);
          await this.runtime.reload();
          return this.workspace(request.target);
        case "section-remove":
          await this.removeSection(request);
          await this.runtime.reload();
          return this.workspace(request.target);
        case "commit":
          await this.commit(request);
          await this.runtime.reload();
          return this.workspace(request.target);
        default:
          throw new Error("Unknown operation");
      }
    } finally {
      this.busy = false;
    }
  }

  /** Return the selected editing scope without filtering out disabled Sections. */
  async workspace(target) {
    validateTarget(target);
    const view = await this.view();
    if (view.error) return { ...view, target, sections: [] };
    const disk = await this.files.load();
    const observed = [...this.runtime.catalogs.values()].at(-1);
    const sections = sectionWorkspace(
      disk.documents,
      observed?.sections ?? [],
      target,
    );
    const identities = disk.documents.map(({ data }) => ({
      scope: data.scope,
      provider: data.provider,
      model: data.model,
    }));
    return { ...view, revision: disk.revision, files: disk.files, target, sections, identities };
  }

  /** Resolve one target's document node inside a loaded snapshot. */
  documentFor(disk, target) {
    const existing = disk.documents.find(
      ({ data }) =>
        data.scope === target.scope &&
        data.provider === target.provider &&
        data.model === target.model,
    );
    const identity = { apiVersion: "prompt-layers/v1", ...target };
    const path =
      existing?.path ??
      (target.scope === "global"
        ? "global.yaml"
        : `${target.scope === "model" ? "models" : "providers"}/${digest(JSON.stringify(identity))}.yaml`);
    const file = disk.files.find((item) => item.path === path);
    const yaml = parseDocument(file?.text ?? stringify(identity));
    return { path, file, yaml };
  }

  async editingDocument(request) {
    validateTarget(request.target);
    const disk = await this.files.load();
    if (disk.revision !== request.expectedRevision)
      throw new Error("REVISION_CONFLICT: refresh before editing a Section");
    return { disk, ...this.documentFor(disk, request.target) };
  }

  /** Validate, hydrate and save one edited document against its original revision. */
  async writeDocument(disk, path, file, text, target) {
    const parsed = this.parse(text, path);
    for (const section of [
      ...(parsed.sections ?? []),
      ...Object.values(parsed.existing ?? {}),
    ]) {
      if (section.contentFile)
        section.content = (await this.files.read(section.contentFile))?.text;
    }
    const candidate = disk.documents
      .filter((document) => document.path !== path)
      .concat({ path, data: parsed });
    validateDocuments(candidate);
    const native = [...this.runtime.catalogs.values()].at(-1)?.sections ?? [];
    if (native.length)
      for (const role of ["main", "delegated"]) {
        composeLayers(documentsForTarget(candidate, target), native, {
          ...target,
          role,
          powershell: false,
        });
      }
    await this.files.save(path, text, file?.revision ?? null);
  }

  /** Merge one Section definition into the target document node. */
  applySectionSave(yaml, path, request) {
    if (
      typeof request.id !== "string" ||
      !request.id.length ||
      !["custom", "native"].includes(request.kind)
    )
      throw new Error("Valid Section ID and kind are required");
    const allowed = [
      "content",
      "enabled",
      "position",
      "interpolate",
      "when",
      "allowManagedOverride",
    ];
    if (
      !request.fields ||
      typeof request.fields !== "object" ||
      Array.isArray(request.fields) ||
      Object.keys(request.fields).some((key) => !allowed.includes(key))
    )
      throw new Error("Invalid Section fields");
    const isExisting = request.kind === "native";
    if (!isExisting && !request.id.startsWith("custom:"))
      throw new Error("Custom Section IDs must start with custom:");
    const data = this.parse(yaml.toString(), path);
    if (isExisting) {
      const value = {
        ...(data.existing?.[request.id] ?? {}),
        ...request.fields,
      };
      if (request.clearWhen) value.when = {};
      if ("content" in request.fields) delete value.contentFile;
      yaml.setIn(["existing", request.id], value);
    } else {
      const current = data.sections ?? [];
      const index = current.findIndex((item) => item.id === request.id);
      const value = {
        ...(current[index] ?? { id: request.id }),
        ...request.fields,
      };
      if (request.clearWhen) value.when = {};
      if ("content" in request.fields) delete value.contentFile;
      if (index < 0) {
        if (!yaml.has("sections")) yaml.set("sections", yaml.createNode([]));
        yaml.addIn(["sections"], value);
      } else yaml.setIn(["sections", index], yaml.createNode(value));
    }
  }

  /** Drop one local declaration so lower layers become visible again. */
  applySectionRemove(yaml, path, request) {
    if (
      typeof request.id !== "string" ||
      !["custom", "native"].includes(request.kind)
    )
      throw new Error("Invalid Section identity");
    const data = this.parse(yaml.toString(), path);
    if (request.kind === "native") {
      if (!yaml.hasIn(["existing", request.id]))
        throw new Error("No current-scope definition exists");
      yaml.deleteIn(["existing", request.id]);
    } else {
      const index = (data.sections ?? []).findIndex(
        (section) => section.id === request.id,
      );
      if (index < 0) throw new Error("No current-scope definition exists");
      yaml.deleteIn(["sections", index]);
    }
  }

  /** Save a current-scope definition; inherited Markdown remains unchanged. */
  async saveSection(request) {
    const { disk, path, file, yaml } = await this.editingDocument(request);
    this.applySectionSave(yaml, path, request);
    await this.writeDocument(disk, path, file, yaml.toString(), request.target);
  }

  /** Remove the local declaration and let lower layers become visible again. */
  async removeSection(request) {
    const { disk, path, file, yaml } = await this.editingDocument(request);
    this.applySectionRemove(yaml, path, request);
    await this.writeDocument(disk, path, file, yaml.toString(), request.target);
  }

  /** Write every staged Section change in one revision-fenced document save. */
  async commit(request) {
    validateTarget(request.target);
    if (
      !Array.isArray(request.changes) ||
      request.changes.length === 0 ||
      request.changes.length > 64
    )
      throw new Error("Select 1–64 Section changes");
    const disk = await this.files.load();
    if (disk.revision !== request.expectedRevision)
      throw new Error("REVISION_CONFLICT: refresh before saving");
    const { path, file, yaml } = this.documentFor(disk, request.target);
    const seen = new Set();
    for (const change of request.changes) {
      if (!change || typeof change !== "object" || Array.isArray(change))
        throw new Error("Invalid Section change");
      const key = `${change.kind}:${change.id}`;
      if (seen.has(key)) throw new Error("Duplicate Section change");
      seen.add(key);
      if (change.op === "remove") this.applySectionRemove(yaml, path, change);
      else if (change.op === "save") this.applySectionSave(yaml, path, change);
      else throw new Error("Unknown Section change");
    }
    await this.writeDocument(disk, path, file, yaml.toString(), request.target);
  }

  async preview(request) {
    const disk = await this.files.load();
    validateDocuments(disk.documents);
    const facts = {
      provider: request.provider,
      model: request.model,
      preset: request.preset,
      role: request.role,
    };
    const observed = [...this.runtime.catalogs.values()].find(
      (item) => !request.preset || item.facts.preset === request.preset,
    );
    if (!observed)
      return {
        kind: "preview",
        sections: [],
        index: [],
        reason:
          "No observed native scope is available; run an Agent step first",
      };
    const result = composeLayers(disk.documents, observed.sections, {
      ...observed.facts,
      ...facts,
    });
    return {
      kind: "preview",
      ...result,
      reason:
        "Static preview only; provider/model activation is blocked on this runtime",
    };
  }

  async importTemplates(request) {
    if (
      !Array.isArray(request.templateIds) ||
      request.templateIds.length < 1 ||
      request.templateIds.length > 7 ||
      !Array.isArray(request.targets) ||
      request.targets.length < 1 ||
      request.targets.length > 32
    ) {
      throw new Error("Select 1–7 templates and 1–32 explicit targets");
    }
    const chosen = request.templateIds.map((id) => {
      const found = this.templates.find((item) => item.id === id);
      if (!found) throw new Error("Unknown template ID");
      return found;
    });
    if (new Set(request.templateIds).size !== chosen.length)
      throw new Error("Duplicate template selection");
    const disk = await this.files.load();
    if (disk.revision !== request.expectedRevision)
      throw new Error(
        "REVISION_CONFLICT: refresh the changed configuration before importing",
      );
    const plans = [];
    const contentPlans = new Map();
    const documents = structuredClone(disk.documents);
    for (const target of request.targets) {
      if (
        !target ||
        typeof target !== "object" ||
        Array.isArray(target) ||
        Object.keys(target).some(
          (key) => !["scope", "provider", "model"].includes(key),
        )
      )
        throw new Error("Invalid import target");
      const identity = {
        apiVersion: "prompt-layers/v1",
        scope: target.scope,
        ...(target.scope === "global" ? {} : { provider: target.provider }),
        ...(target.scope === "model" ? { model: target.model } : {}),
      };
      this.parse(
        JSON.stringify({ ...target, apiVersion: "prompt-layers/v1" }),
        "import target",
      );
      this.parse(stringify(identity), "import target");
      const existing = documents.find(
        (document) =>
          document.data.scope === target.scope &&
          document.data.provider === identity.provider &&
          document.data.model === identity.model,
      );
      const path =
        existing?.path ??
        (target.scope === "global"
          ? "global.yaml"
          : `${target.scope === "model" ? "models" : "providers"}/${digest(JSON.stringify(identity))}.yaml`);
      if (plans.some((plan) => plan.path === path))
        throw new Error("Duplicate import target");
      const original = disk.files.find((file) => file.path === path);
      const data = original ? this.parse(original.text, path) : identity;
      data.sections ??= [];
      for (const template of chosen) {
        if (
          data.sections.some((section) => section.id === template.sectionId) ||
          data.existing?.[template.sectionId]
        ) {
          throw new Error(
            `${path}: template Section already exists: ${template.sectionId}; edit it or inspect the difference before importing`,
          );
        }
        const contentPath = `content/${template.file}`;
        const content = await this.files.read(contentPath);
        if (content && content.text !== template.content)
          throw new Error(
            `${contentPath}: local content differs; import will not overwrite it`,
          );
        if (!content) contentPlans.set(contentPath, template.content);
        data.sections.push({
          id: template.sectionId,
          contentFile: contentPath,
          ...(template.position ? { position: template.position } : {}),
          ...(template.when ? { when: template.when } : {}),
        });
      }
      const resolved = structuredClone(data);
      for (const section of resolved.sections)
        if (section.contentFile) {
          const template = chosen.find(
            (item) => `content/${item.file}` === section.contentFile,
          );
          section.content =
            template?.content ??
            (await this.files.read(section.contentFile))?.text;
        }
      if (existing) existing.data = resolved;
      else documents.push({ path, data: resolved });
      let text = stringify(data);
      if (original) {
        const yaml = parseDocument(original.text);
        if (yaml.has("sections")) {
          const additions = data.sections.slice(
            data.sections.length - chosen.length,
          );
          for (const addition of additions) yaml.addIn(["sections"], addition);
        } else yaml.set("sections", data.sections);
        text = yaml.toString();
      }
      plans.push({ path, text, revision: original?.revision ?? null });
    }
    validateDocuments(documents);
    // Preflight every conflict before writing; Markdown precedes referring YAML.
    for (const [path, text] of contentPlans)
      await this.files.save(path, text, null);
    for (const plan of plans)
      await this.files.save(plan.path, plan.text, plan.revision);
  }
}