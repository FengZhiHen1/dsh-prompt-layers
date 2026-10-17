// section-editor — scope selection and editable inheritance views.
// Boundary: native sections are read-only until an explicit override is saved.

/** Select exactly the inheritance chain visible at a chosen editing scope. */
export function documentsForTarget(documents, target) {
  validateTarget(target);
  const ranks = { global: 0, provider: 1, model: 2 };
  return documents
    .filter(
      ({ data }) =>
        data.scope === "global" ||
        (target.scope !== "global" &&
          data.scope === "provider" &&
          data.provider === target.provider) ||
        (target.scope === "model" &&
          data.scope === "model" &&
          data.provider === target.provider &&
          data.model === target.model),
    )
    .sort((left, right) => ranks[left.data.scope] - ranks[right.data.scope]);
}

/** Validate scope identity without accepting a model under a global target. */
export function validateTarget(target) {
  if (!target || typeof target !== "object" || Array.isArray(target))
    throw new Error("Expected a target scope");
  if (
    !["global", "provider", "model"].includes(target.scope) ||
    Object.keys(target).some(
      (key) => !["scope", "provider", "model"].includes(key),
    )
  )
    throw new Error("Invalid target scope");
  const validId = (value) =>
    typeof value === "string" && value.trim().length > 0 && value.length <= 256;
  if (
    (target.scope === "global" &&
      (target.provider !== undefined || target.model !== undefined)) ||
    (target.scope !== "global" && !validId(target.provider)) ||
    (target.scope === "provider" && target.model !== undefined) ||
    (target.scope === "model" && !validId(target.model))
  )
    throw new Error("Invalid scope identity");
  return target;
}

/** Build one row per Section including disabled rows, conditions and source history. */
export function sectionWorkspace(documents, nativeSections, target) {
  const rows = new Map(
    nativeSections.map((section) => [
      section.name,
      {
        id: section.name,
        kind: "native",
        content: section.text,
        enabled: true,
        interpolate: section.interpolate !== false,
        position: "default",
        source: { scope: "native" },
        chain: [],
      },
    ]),
  );
  for (const { path, data } of documentsForTarget(documents, target)) {
    const declarations = [
      ...(data.sections ?? []).map((section) => ({
        ...section,
        kind: "custom",
      })),
      ...Object.entries(data.existing ?? {}).map(([id, section]) => ({
        ...section,
        id,
        kind: "native",
      })),
    ];
    for (const section of declarations) {
      const row = rows.get(section.id) ?? {
        id: section.id,
        kind: section.kind,
        enabled: true,
        interpolate: false,
        position: "default",
        chain: [],
      };
      const { id, kind, ...attributes } = section;
      Object.assign(row, attributes);
      row.chain.push({
        target: {
          scope: data.scope,
          ...(data.provider === undefined ? {} : { provider: data.provider }),
          ...(data.model === undefined ? {} : { model: data.model }),
        },
        path,
        attributes,
        effective: Object.fromEntries(Object.entries(row).filter(([key]) => !['chain', 'source', 'local'].includes(key))),
      });
      row.source = { scope: data.scope, path };
      row.local = data.scope === target.scope;
      rows.set(id, row);
    }
  }
  return [...rows.values()];
}
