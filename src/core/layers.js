const SCOPE_RANK = Object.freeze({ global: 0, provider: 1, model: 2 })
const SECTION_FIELDS = Object.freeze(['id', 'content', 'contentFile', 'enabled', 'position', 'interpolate', 'when'])
const EXISTING_FIELDS = Object.freeze(['content', 'contentFile', 'enabled', 'position', 'interpolate', 'when', 'allowManagedOverride'])
const POSITION_KEYS = Object.freeze(['before', 'after'])

/**
 * Validate a set of structurally parsed layer documents and cross-document invariants.
 * @param {Array<{path: string, data: object}>} documents - parsed layer documents.
 * @returns {{routes: Array<{key: string, path: string}>, definitions: Array<{id: string, path: string, scope: string, index: number}>, sectionDeclarations: Array<object>, documents: Array<object>}} structural index for callers.
 * @throws {Error} when a document or its inherited definitions are invalid.
 */
export function validateDocuments(documents) {
  if (!Array.isArray(documents)) throw new Error('documents: expected an array')

  const routes = new Map()
  const definitions = new Map()
  const globalDefinitions = new Map()
  const providerDefinitions = new Map()
  const modelDefinitions = new Map()
  const sectionDeclarations = []
  const indexed = []

  const orderedDocuments = [...documents].sort((left, right) => {
    const leftScope = left?.data?.scope
    const rightScope = right?.data?.scope
    return (SCOPE_RANK[leftScope] ?? Number.MAX_SAFE_INTEGER) - (SCOPE_RANK[rightScope] ?? Number.MAX_SAFE_INTEGER)
  })
  for (const [documentIndex, document] of orderedDocuments.entries()) {
    const path = document?.path
    const data = document?.data
    if (typeof path !== 'string' || path.length === 0) throw new Error(`documents[${documentIndex}]: missing file path`)
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error(`${path}: expected a parsed document object`)

    const routeKey = scopeKey(data, path)
    if (routes.has(routeKey)) {
      const previous = routes.get(routeKey)
      throw new Error(`${path}: duplicate ${data.scope} scope tuple also declared by ${previous}`)
    }
    routes.set(routeKey, path)

    if (data.scope === 'global') {
      if (hasOwn(data, 'provider') || hasOwn(data, 'model')) throw new Error(`${path}: global scope cannot declare provider or model`)
    } else if (data.scope === 'provider') {
      requireNonEmptyString(data.provider, path, 'provider')
      if (hasOwn(data, 'model')) throw new Error(`${path}: provider scope cannot declare model`)
    } else if (data.scope === 'model') {
      requireNonEmptyString(data.provider, path, 'provider')
      requireNonEmptyString(data.model, path, 'model')
    } else {
      throw new Error(`${path}: unsupported scope ${String(data.scope)}`)
    }

    const fileIds = new Set()
    const items = data.sections ?? []
    if (!Array.isArray(items)) throw new Error(`${path}: sections must be an array`)
    for (const [listIndex, section] of items.entries()) {
      const id = section?.id
      requireCustomId(id, path)
      if (fileIds.has(id)) throw new Error(`${path}: duplicate section id ${id}`)
      fileIds.add(id)
      validateFields(section, SECTION_FIELDS, path, id)
      sectionDeclarations.push({ path, id, scope: data.scope, listIndex, when: section.when })
      const scopeDefinitions = definitionsForScope(data, globalDefinitions, providerDefinitions, modelDefinitions)
      const definitionKey = definitionKeyFor(data, id)
      if (!scopeDefinitions.has(definitionKey)) {
        if (!hasContent(section) && !hasInheritedDefinition(data, id, globalDefinitions, providerDefinitions)) {
          throw new Error(`${path}: section ${id} first definition requires content or contentFile, even when disabled`)
        }
        scopeDefinitions.set(definitionKey, { path, scope: data.scope, index: listIndex })
      }
      if (hasOwn(section, 'contentFile') && !hasOwn(section, 'content')) throw new Error(`${path}: section ${id} contentFile has no resolved content value`)
      if (!definitions.has(id)) definitions.set(id, { path, scope: data.scope, index: listIndex })
      if (hasContent(section) && !validContent(section)) throw new Error(`${path}: section ${id} resolved content must be non-empty text`)
    }

    const existing = data.existing ?? {}
    if (!existing || typeof existing !== 'object' || Array.isArray(existing)) throw new Error(`${path}: existing must be an object`)
    for (const [id, attributes] of Object.entries(existing)) {
      if (id.startsWith('custom:')) throw new Error(`${path}: existing ${id} uses the custom namespace`)
      if (fileIds.has(id)) throw new Error(`${path}: section ${id} conflicts with existing entry in the same file`)
      validateFields(attributes, EXISTING_FIELDS, path, id)
      if (hasOwn(attributes, 'contentFile') && !hasOwn(attributes, 'content')) throw new Error(`${path}: existing ${id} contentFile has no resolved content value`)
      if (hasContent(attributes) && !validContent(attributes)) throw new Error(`${path}: existing ${id} content must be non-empty text`)
      if (attributes.allowManagedOverride !== undefined && attributes.allowManagedOverride !== true) {
        throw new Error(`${path}: existing ${id} allowManagedOverride must be true when declared`)
      }
    }
    indexed.push({ path, scope: data.scope, provider: data.provider, model: data.model, sectionIds: [...fileIds], existingIds: Object.keys(existing) })
  }

  return {
    routes: [...routes].map(([key, path]) => ({ key, path })),
    definitions: [...definitions].map(([id, definition]) => ({ id, ...definition })),
    sectionDeclarations,
    documents: indexed,
  }
}

/**
 * Compose native sections and matching global/provider/model layers into an ordered result.
 * @param {Array<{path: string, data: object}>} documents - validated parsed layer documents.
 * @param {Array<{name: string, text: string, interpolate?: boolean, managed?: boolean}>} nativeSections - native section sequence.
 * @param {{provider?: string, model?: string, preset?: string, role?: 'main'|'delegated', powershell?: boolean}} facts - observed request facts.
 * @returns {{sections: Array<{name: string, text: string, interpolate: boolean}>, index: Array<object>}} composed sections and structural index.
 * @throws {Error} when inputs, managed overrides, or strict anchor constraints are invalid.
 */
export function composeLayers(documents, nativeSections, facts) {
  const index = validateDocuments(documents)
  if (!Array.isArray(nativeSections)) throw new Error('nativeSections: expected an array')
  if (!facts || typeof facts !== 'object' || Array.isArray(facts)) throw new Error('facts: expected an object')
  validateFacts(facts)

  const nativeByName = new Map()
  for (const [nativeIndex, section] of nativeSections.entries()) {
    if (!section || typeof section !== 'object' || Array.isArray(section)) throw new Error(`nativeSections[${nativeIndex}]: expected an object`)
    requireNonEmptyString(section.name, `nativeSections[${nativeIndex}]`, 'name')
    if (typeof section.text !== 'string') throw new Error(`native section ${section.name}: text must be a string`)
    if (nativeByName.has(section.name)) throw new Error(`native section ${section.name}: duplicate native name`)
    nativeByName.set(section.name, { ...section, baseIndex: nativeIndex })
  }

  const selected = selectDocuments(documents, facts)
  const custom = new Map()
  const existing = new Map()
  for (const document of selected) {
    const { path, data } = document
    for (const declaration of data.sections ?? []) {
      if (nativeByName.has(declaration.id)) throw new Error(`${path}: custom section ${declaration.id} conflicts with an existing native section`)
      const node = custom.get(declaration.id)
      const target = node ?? createCustomNode(data.scope, path, declaration.id, data.sections.indexOf(declaration))
      applyAttributes(target, declaration, path, declaration.id, true)
      target.sources.push({ path, scope: data.scope })
      custom.set(declaration.id, target)
    }
    for (const [id, attributes] of Object.entries(data.existing ?? {})) {
      const native = nativeByName.get(id)
      if (!native) throw new Error(`${path}: existing ${id} does not name a native section in this request scope`)
      if (native.managed && hasChanges(attributes) && attributes.allowManagedOverride !== true) {
        throw new Error(`${path}: existing ${id} is managed; modifications require allowManagedOverride: true`)
      }
      const node = existing.get(id) ?? createNativeNode(native)
      applyAttributes(node, attributes, path, id, false)
      node.sources.push({ path, scope: data.scope })
      existing.set(id, node)
    }
  }

  const nodes = [
    ...nativeSections.map((section, baseIndex) => {
      const overridden = existing.get(section.name)
      if (overridden) {
        overridden.baseIndex = baseIndex
        return nodeMatches(overridden, facts) ? overridden : createNativeNode({ ...section, baseIndex })
      }
      return createNativeNode({ ...section, baseIndex })
    }),
    ...[...custom.values()].sort(compareBase),
  ]
  const allByName = new Map(nodes.map(node => [node.name, node]))
  for (const node of nodes) {
    if (!node.enabled || !nodeMatches(node, facts)) continue
    if (!node.position || node.position === 'default') continue
    const [direction, anchor] = Object.entries(node.position)[0]
    if (anchor === node.name) throw nodeError(node, `cannot anchor to itself (${anchor})`)
    const anchorNode = allByName.get(anchor)
    if (!anchorNode) throw nodeError(node, `anchor ${anchor} is missing or not valid for this request scope`)
    if (!anchorNode.enabled) throw nodeError(node, `anchor ${anchor} is disabled for this request scope`)
    if (anchorNode.when !== undefined) throw nodeError(node, `anchor ${anchor} is conditional and cannot be proven present for this request`)
    node.anchor = anchor
    node.direction = direction
  }

  const activeNodes = nodes.filter(node => node.enabled && nodeMatches(node, facts))
  const ordered = expandAnchorTree(activeNodes)
  const sections = ordered.map(node => ({
    name: node.name,
    text: node.text,
    interpolate: node.interpolate,
  }))
  const resultIndex = ordered.map((node, position) => ({
    name: node.name,
    kind: node.kind,
    enabled: node.enabled,
    position: node.position ?? 'default',
    source: node.sources.at(-1) ?? { scope: 'native' },
    firstDefinition: node.kind === 'custom' ? { scope: node.firstScope, listIndex: node.listIndex } : { scope: 'native', listIndex: node.baseIndex },
    matched: nodeMatches(node, facts),
    finalIndex: position,
  }))
  return { sections, index: resultIndex }
}

function definitionsForScope(data, globalDefinitions, providerDefinitions, modelDefinitions) {
  switch (data.scope) {
    case 'global': return globalDefinitions
    case 'provider': return providerDefinitions
    case 'model': return modelDefinitions
    default: throw new Error(`unsupported scope ${String(data.scope)}`)
  }
}

function definitionKeyFor(data, id) {
  if (data.scope === 'global') return id
  if (data.scope === 'provider') return `${data.provider}\u0000${id}`
  if (data.scope === 'model') return `${data.provider}\u0000${data.model}\u0000${id}`
  throw new Error(`unsupported scope ${String(data.scope)}`)
}

function hasInheritedDefinition(data, id, globalDefinitions, providerDefinitions) {
  if (data.scope === 'provider') return globalDefinitions.has(id)
  if (data.scope === 'model') {
    return globalDefinitions.has(id) || providerDefinitions.has(`${data.provider}\u0000${id}`)
  }
  return false
}

function scopeKey(data, path) {
  if (data.scope === 'global') return 'global'
  if (data.scope === 'provider') return `provider:${requireNonEmptyString(data.provider, path, 'provider')}`
  if (data.scope === 'model') return `model:${requireNonEmptyString(data.provider, path, 'provider')}\u0000${requireNonEmptyString(data.model, path, 'model')}`
  return `${String(data.scope)}:${String(data.provider)}:${String(data.model)}`
}

function selectDocuments(documents, facts) {
  return documents.filter(({ data }) => data.scope === 'global'
    || (data.scope === 'provider' && facts.provider !== undefined && data.provider === facts.provider)
    || (data.scope === 'model' && facts.provider !== undefined && facts.model !== undefined && data.provider === facts.provider && data.model === facts.model))
    .sort((left, right) => SCOPE_RANK[left.data.scope] - SCOPE_RANK[right.data.scope])
}

function createCustomNode(scope, path, id, listIndex) {
  return {
    name: id,
    kind: 'custom',
    text: '',
    interpolate: false,
    enabled: true,
    position: 'default',
    when: undefined,
    firstScope: scope,
    listIndex,
    sources: [],
    originPath: path,
    originId: id,
  }
}

function createNativeNode(section) {
  return {
    name: section.name,
    kind: 'native',
    text: section.text,
    interpolate: section.interpolate,
    enabled: true,
    position: 'default',
    when: undefined,
    managed: section.managed === true,
    baseIndex: section.baseIndex,
    sources: [],
    originPath: `native:${section.name}`,
    originId: section.name,
  }
}

function applyAttributes(node, attributes, path, id, isCustom) {
  if (hasOwn(attributes, 'content')) node.text = attributes.content
  else if (hasOwn(attributes, 'contentFile')) node.text = attributes.contentFile
  if (hasOwn(attributes, 'enabled')) node.enabled = attributes.enabled
  if (hasOwn(attributes, 'position')) node.position = attributes.position
  if (hasOwn(attributes, 'interpolate')) node.interpolate = attributes.interpolate
  if (hasOwn(attributes, 'when')) node.when = Object.keys(attributes.when).length === 0 ? undefined : attributes.when
  if (isCustom && typeof node.text !== 'string') throw new Error(`${path}: ${id} has no resolved string content`)
}

function hasChanges(attributes) {
  return Object.keys(attributes).some(key => key !== 'allowManagedOverride')
}

function hasContent(attributes) {
  return hasOwn(attributes, 'content') || hasOwn(attributes, 'contentFile')
}

function validContent(attributes) {
  if (hasOwn(attributes, 'content')) return typeof attributes.content === 'string' && attributes.content.trim().length > 0
  return typeof attributes.contentFile === 'string' && attributes.contentFile.length > 0
}

function validateFields(value, allowed, path, id) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${path}: ${id} attributes must be an object`)
  const unknown = Object.keys(value).find(key => !allowed.includes(key))
  if (unknown) throw new Error(`${path}: ${id} has unsupported field ${unknown}`)
  if (value.enabled !== undefined && typeof value.enabled !== 'boolean') throw new Error(`${path}: ${id} enabled must be boolean`)
  if (value.interpolate !== undefined && typeof value.interpolate !== 'boolean') throw new Error(`${path}: ${id} interpolate must be boolean`)
  if (value.position !== undefined) validatePosition(value.position, path, id)
  if (value.when !== undefined) validateWhen(value.when, path, id)
}

function validatePosition(position, path, id) {
  if (position === 'default') return
  if (!position || typeof position !== 'object' || Array.isArray(position)) throw new Error(`${path}: ${id} position must be default, before, or after`)
  const keys = Object.keys(position)
  if (keys.length !== 1 || !POSITION_KEYS.includes(keys[0]) || typeof position[keys[0]] !== 'string' || position[keys[0]].length === 0) {
    throw new Error(`${path}: ${id} position must contain exactly one non-empty before/after anchor`)
  }
}

function validateWhen(when, path, id) {
  if (!when || typeof when !== 'object' || Array.isArray(when)) throw new Error(`${path}: ${id} when must be an object`)
  for (const key of Object.keys(when)) if (key !== 'agent' && key !== 'tools') throw new Error(`${path}: ${id} when has unsupported field ${key}`)
  if (when.agent !== undefined) {
    const agent = when.agent
    if (!agent || typeof agent !== 'object' || Array.isArray(agent)) throw new Error(`${path}: ${id} when.agent must be an object`)
    for (const key of Object.keys(agent)) if (key !== 'presets' && key !== 'role') throw new Error(`${path}: ${id} when.agent has unsupported field ${key}`)
    if (agent.presets !== undefined && (!Array.isArray(agent.presets) || agent.presets.some(preset => typeof preset !== 'string' || preset.length === 0))) {
      throw new Error(`${path}: ${id} when.agent.presets must be non-empty strings`)
    }
    if (agent.role !== undefined && !['main', 'delegated'].includes(agent.role)) throw new Error(`${path}: ${id} when.agent.role must be main or delegated`)
  }
  if (when.tools !== undefined) {
    const tools = when.tools
    if (!tools || typeof tools !== 'object' || Array.isArray(tools)) throw new Error(`${path}: ${id} when.tools must be an object`)
    for (const key of Object.keys(tools)) if (key !== 'powershell') throw new Error(`${path}: ${id} when.tools has unsupported field ${key}`)
    if (tools.powershell !== undefined && typeof tools.powershell !== 'boolean') throw new Error(`${path}: ${id} when.tools.powershell must be boolean`)
  }
}

function validateFacts(facts) {
  for (const key of ['provider', 'model', 'preset']) {
    if (facts[key] !== undefined && typeof facts[key] !== 'string') throw new Error(`facts.${key}: expected a string when known`)
  }
  if (facts.role !== undefined && !['main', 'delegated'].includes(facts.role)) throw new Error('facts.role: expected main or delegated when known')
  if (facts.powershell !== undefined && typeof facts.powershell !== 'boolean') throw new Error('facts.powershell: expected a boolean when known')
}

function nodeMatches(node, facts) {
  return whenMatches(node.when, facts)
}

function whenMatches(when, facts) {
  if (when === undefined) return true
  const agent = when.agent
  if (agent !== undefined) {
    if (agent.presets !== undefined && (facts.preset === undefined || !agent.presets.includes(facts.preset))) return false
    if (agent.role !== undefined && (facts.role === undefined || agent.role !== facts.role)) return false
  }
  const tools = when.tools
  if (tools?.powershell !== undefined && (facts.powershell === undefined || tools.powershell !== facts.powershell)) return false
  return true
}

function expandAnchorTree(nodes) {
  const children = new Map(nodes.map(node => [node.name, { before: [], after: [] }]))
  const roots = []
  const byName = new Map(nodes.map(node => [node.name, node]))
  for (const node of nodes) {
    if (node.anchor === undefined) roots.push(node)
    else {
      const bucket = children.get(node.anchor)?.[node.direction]
      if (!bucket) throw nodeError(node, `anchor ${node.anchor} is unavailable`)
      bucket.push(node)
    }
  }
  const sort = (list) => list.sort(compareBase)
  for (const value of children.values()) {
    sort(value.before)
    sort(value.after)
  }
  sort(roots)

  const visiting = new Set()
  const visited = new Set()
  const ordered = []
  const emit = node => {
    if (visiting.has(node.name)) throw nodeError(node, 'position reference cycle detected')
    if (visited.has(node.name)) return
    visiting.add(node.name)
    for (const child of children.get(node.name).before) emit(child)
    ordered.push(node)
    for (const child of children.get(node.name).after) emit(child)
    visiting.delete(node.name)
    visited.add(node.name)
  }
  for (const root of roots) emit(root)
  if (visited.size !== nodes.length) {
    const cycleNode = nodes.find(node => !visited.has(node.name))
    throw nodeError(cycleNode, 'position reference cycle detected')
  }
  return ordered
}

function compareBase(left, right) {
  const leftRank = left.kind === 'native' ? -1 : SCOPE_RANK[left.firstScope]
  const rightRank = right.kind === 'native' ? -1 : SCOPE_RANK[right.firstScope]
  const leftIndex = left.kind === 'native' ? left.baseIndex : left.listIndex
  const rightIndex = right.kind === 'native' ? right.baseIndex : right.listIndex
  return leftRank - rightRank || leftIndex - rightIndex || left.name.localeCompare(right.name)
}

function nodeError(node, reason) {
  return new Error(`${node.originPath}: section ${node.originId} ${reason}`)
}

function requireCustomId(id, path) {
  requireNonEmptyString(id, path, 'section id')
  if (!id.startsWith('custom:') || !/^custom:[A-Za-z0-9][A-Za-z0-9._-]*$/.test(id)) {
    throw new Error(`${path}: section ${id} must use the custom: namespace and a safe non-empty identifier`)
  }
}

function requireNonEmptyString(value, path, field) {
  if (typeof value !== 'string' || value.length === 0) throw new Error(`${path}: ${field} must be a non-empty string`)
  return value
}

function hasOwn(value, key) {
  return Object.prototype.hasOwnProperty.call(value, key)
}
