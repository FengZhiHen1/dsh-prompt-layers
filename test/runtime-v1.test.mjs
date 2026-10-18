// runtime-v1 — independent gate against an installed DSH 0.2.x runtime.
// Contract under test (black box, no private host access):
//   1. PromptLayersRuntime applies provider/model candidates to the Agent route visible at
//      assembly and keeps the previous complete snapshot when a candidate is invalid.
//   2. The real SystemPrompt registry accepts the Host composition: order, interpolate:false,
//      complete suppression, native multi-complete failure, and dispose rollback.
//   3. The Host wiring (injected connection stub, empty or stubbed preset roster) exposes
//      activation status and records committed vs suppressed-or-changed from real session events.
//   4. Late request routing cannot rebuild the prompt: the model layer follows the declared
//      route, and the installed agent-loop source order is asserted instead of booting a full
//      agent stack. A request-level route override remains a documented limitation.
// Everything writable stays under <repo>/tmp/prompt-layers-runtime-v1 and is removed afterwards.
import { after, test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import * as hostPlugin from '../src/adapter/host.js'
import { PromptLayersRuntime } from '../src/adapter/runtime.js'
import { composeLayers } from '../src/core/layers.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = resolve(HERE, '..')
const TMP = resolve(REPO, 'tmp', 'prompt-layers-runtime-v1')
/** Verified contract generations; the anchors below were re-read on each. */
const GENERATIONS = ['0.2.1-rc.2', '0.2.0-rc.2']

after(() => {
  rmSync(TMP, { recursive: true, force: true })
})

/** Read one installed package's directory below a runtime root, bounded to the pnpm store. */
function findPackage(root, name) {
  const direct = [join(root, 'node_modules', name), join(root, 'node_modules', '.pnpm', 'node_modules', name)]
  for (const candidate of direct) if (existsSync(join(candidate, 'package.json'))) return candidate
  const store = join(root, 'node_modules', '.pnpm')
  if (!existsSync(store)) return undefined
  let scanned = 0
  for (const entry of readdirSync(store, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    if (++scanned > 512) break
    const candidate = join(store, entry.name, 'node_modules', name)
    if (existsSync(join(candidate, 'package.json'))) return candidate
  }
  return undefined
}

/** Resolve one package directory's ESM entry from its published exports. */
function entryOf(directory) {
  const manifest = JSON.parse(readFileSync(join(directory, 'package.json'), 'utf8'))
  const exported = manifest.exports?.['.']
  const relative = typeof exported === 'string'
    ? exported
    : exported?.default ?? exported?.import ?? exported?.node ?? manifest.main ?? 'lib/index.js'
  return join(directory, relative)
}

/** Load the installed runtime packages, or explain why this gate cannot run. */
const runtime = await (async () => {
  const configured = process.env.DSH_RUNTIME_DIR
  if (!configured) return { ok: false, reason: `set DSH_RUNTIME_DIR to an installed ${GENERATIONS[0]} runtime root` }
  const root = resolve(configured)
  if (!existsSync(root)) return { ok: false, reason: `DSH_RUNTIME_DIR does not exist: ${root}` }
  try {
    const cordis = findPackage(root, '@deepseek-ai/cordis')
    const systemPrompt = findPackage(root, '@deepseek-ai/dsh-system-prompt')
    if (!cordis || !systemPrompt) {
      return { ok: false, reason: 'no @deepseek-ai/cordis or @deepseek-ai/dsh-system-prompt under node_modules/.pnpm' }
    }
    const versions = JSON.parse(readFileSync(join(systemPrompt, 'package.json'), 'utf8')).version
    if (!GENERATIONS.includes(versions)) return { ok: false, reason: `runtime is ${versions}, this gate targets ${GENERATIONS.join(' or ')}` }
    const agentLoop = findPackage(root, '@deepseek-ai/dsh-agent-loop')
    return {
      ok: true,
      root,
      cordis: await import(pathToFileURL(entryOf(cordis)).href),
      systemPrompt: await import(pathToFileURL(entryOf(systemPrompt)).href),
      agentLoopEntry: agentLoop === undefined ? undefined : entryOf(agentLoop),
      version: versions,
    }
  } catch (error) {
    return { ok: false, reason: `runtime load failed: ${error.message}` }
  }
})()

const skip = runtime.ok ? false : runtime.reason

/** Write one scenario directory with template files; never touches production paths. */
function fixture(name, files) {
  const directory = join(TMP, name)
  rmSync(directory, { recursive: true, force: true })
  for (const [relative, text] of Object.entries(files)) {
    const target = join(directory, relative)
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, text)
  }
  mkdirSync(directory, { recursive: true })
  return directory
}

/** A plugin row that publishes one stub Service for the Host's inject list. */
const stubService = (name, value) => ({ name: `stub:${name}`, apply: (ctx) => { ctx.provide(name, value) } })

/** Minimal Agent identity the Host reads: id, session header, options, and scoped context. */
function fakeAgent(id, { header = {}, options = {} } = {}) {
  return { id, session: { id, header: { id, ...header } }, ctx: {}, options }
}

/**
 * Boot one real Cordis context with the real SystemPrompt registry, stub Host services,
 * and the plugin under test. The fixture directory is the only writable state.
 */
async function hostHarness(name, files, options = {}) {
  const directory = fixture(name, files)
  const routes = []
  const state = { preset: options.preset, tools: options.tools ?? {} }
  const ctx = new (runtime.cordis.Context)()
  try {
    await ctx.plugin(runtime.systemPrompt.default, {
      personaPrefix: 'PERSONA-PREFIX',
      personaSuffix: 'PERSONA-SUFFIX',
    })
    ctx.systemPrompt.variable('model', () => 'stub-model')
    await ctx.plugin(stubService('connection', {
      fetch: {
        register: (route) => {
          routes.push(route)
          return () => { routes.splice(routes.indexOf(route), 1) }
        },
      },
    }))
    await ctx.plugin(stubService('agentPresets', {
      list: async () => options.roster ?? [],
      acquireScope: async (id) => ({
        key: { presetScope: id },
        [Symbol.asyncDispose]: async () => {},
      }),
      composedPreset: () => state.preset,
    }))
    await ctx.plugin(stubService('tools', {
      get: (toolName) => state.tools[toolName],
    }))
    await ctx.plugin(hostPlugin, { directory, pollIntervalMs: 30000 })
    const view = async () => {
      const route = routes.find(candidate => candidate.path === '/api/prompt-layers')
      assert.ok(route, 'the Host registered its configuration route')
      const response = await route.fetch(new Request('http://localhost/api/prompt-layers'))
      return response.json()
    }
    return { ctx, directory, view, state }
  } catch (error) {
    await ctx.fiber.dispose()
    throw error
  }
}

const GLOBAL_LAYERS = [
  'apiVersion: prompt-layers/v1',
  'scope: global',
  'sections:',
  '  - id: custom:literal',
  "    content: 'LITERAL {{model}} KEEP'",
  '    position:',
  '      after: harness:identity',
  '    interpolate: false',
  '  - id: custom:interpolated',
  "    content: 'ON {{model}}'",
  '    position:',
  '      after: custom:literal',
  '    interpolate: true',
  '',
].join('\n')

const PROVIDER_LAYER = [
  'apiVersion: prompt-layers/v1',
  'scope: provider',
  'provider: proxy-a',
  'sections:',
  '  - id: custom:provider-only',
  '    content: PROVIDER ONLY',
  '',
].join('\n')

const sectionNames = (assembly) => assembly.sections.map((section) => section.name)

// ---------------------------------------------------------------- pure runtime

test('runtime applies declared-route providers and models, retaining the last valid snapshot on failure', async () => {
  let candidate = {
    revision: 'rev-provider',
    documents: [{ path: 'providers/proxy-a.yaml', data: { apiVersion: 'prompt-layers/v1', scope: 'provider', provider: 'proxy-a', sections: [{ id: 'custom:p', content: 'P' }] } }],
  }
  const files = { load: async () => candidate, generated: async () => {} }
  const owner = new PromptLayersRuntime(files, { now: () => '2026-10-17T00:00:00.000Z' })
  const native = { sections: [{ name: 'harness:identity', text: 'IDENTITY' }], contexts: [], tools: [], variables: {} }

  await owner.reload()
  assert.equal(owner.status.phase, 'active')
  assert.equal(owner.status.modelLayers, 'declared-route')
  assert.equal(owner.snapshot.revision, 'rev-provider')
  assert.deepEqual(owner.assemble(native, { provider: 'proxy-a' }).sections.map(section => section.name), ['harness:identity', 'custom:p'])
  assert.deepEqual(owner.assemble(native, { provider: 'proxy-b' }).sections.map(section => section.name), ['harness:identity'])

  candidate = {
    revision: 'rev-model',
    documents: [
      { path: 'global.yaml', data: { apiVersion: 'prompt-layers/v1', scope: 'global', sections: [{ id: 'custom:g', content: 'GLOBAL' }] } },
      { path: 'providers/proxy-a/models/model-x.yaml', data: { apiVersion: 'prompt-layers/v1', scope: 'model', provider: 'proxy-a', model: 'model-x', sections: [{ id: 'custom:m', content: 'MODEL' }] } },
    ],
  }
  await owner.reload()
  assert.equal(owner.status.phase, 'active')
  assert.equal(owner.status.activeRevision, 'rev-model')
  assert.deepEqual(owner.assemble(native, { provider: 'proxy-a', model: 'model-x' }).sections.map(section => section.name), ['harness:identity', 'custom:g', 'custom:m'])
  assert.deepEqual(owner.assemble(native, { provider: 'proxy-a', model: 'model-y' }).sections.map(section => section.name), ['harness:identity', 'custom:g'])

  candidate = {
    revision: 'rev-invalid',
    documents: [
      { path: 'global.yaml', data: { apiVersion: 'prompt-layers/v1', scope: 'global', sections: [{ id: 'custom:dup', content: 'ONE' }] } },
      { path: 'duplicate.yaml', data: { apiVersion: 'prompt-layers/v1', scope: 'global', sections: [{ id: 'custom:dup', content: 'TWO' }] } },
    ],
  }
  await owner.reload()
  assert.equal(owner.status.phase, 'last-valid')
  assert.equal(owner.status.activeRevision, 'rev-model')
  assert.match(owner.status.reason, /duplicate/)
  assert.deepEqual(owner.assemble(native, { provider: 'proxy-a', model: 'model-x' }).sections.map(section => section.name), ['harness:identity', 'custom:g', 'custom:m'])

  owner.dispose()
  assert.equal(owner.status.phase, 'disabled')
  assert.equal(owner.assemble(native, {}), native)
})

test('core rejects a managed native override unless allowManagedOverride is declared', () => {
  const documents = [{
    path: 'global.yaml',
    data: { apiVersion: 'prompt-layers/v1', scope: 'global', existing: { 'deployment:persona-prefix': { content: 'OVERRIDDEN' } } },
  }]
  const native = [{ name: 'deployment:persona-prefix', text: 'NATIVE', managed: true }]
  assert.throws(() => composeLayers(documents, native, {}), /managed/)
  const allowed = [{
    path: 'global.yaml',
    data: {
      apiVersion: 'prompt-layers/v1',
      scope: 'global',
      existing: { 'deployment:persona-prefix': { content: 'OVERRIDDEN', allowManagedOverride: true } },
    },
  }]
  assert.equal(composeLayers(allowed, native, {}).sections[0].text, 'OVERRIDDEN')
})

// ------------------------------------------------------- real SystemPrompt registry

test('real assembly accepts Host layers: position, interpolate:false, and variable interpolation', { skip }, async () => {
  const harness = await hostHarness('compose', { 'global.yaml': GLOBAL_LAYERS })
  try {
    const agent = fakeAgent('agent-compose')
    const assembly = await harness.ctx.systemPrompt.assemble({ agent, scope: agent })
    assert.deepEqual(sectionNames(assembly), [
      'harness:identity',
      'custom:literal',
      'custom:interpolated',
      'deployment:persona-prefix',
      'deployment:persona-suffix',
    ])
    assert.equal(assembly.sections.find((section) => section.name === 'custom:literal').interpolate, false)
    const rendered = runtime.systemPrompt.renderPrompt(assembly)
    assert.match(rendered, /LITERAL \{\{model\}\} KEEP/)
    assert.match(rendered, /ON stub-model/)

    // The same rendered text committed as a session system message is observed as committed.
    harness.ctx.emit('session/event', { id: agent.id }, {
      type: 'system/message',
      data: { message: { content: [{ type: 'text', text: rendered }] } },
    })
    const view = await harness.view()
    assert.equal(view.status.phase, 'active')
    assert.equal(view.status.modelLayers, 'declared-route')
    assert.equal(view.capabilities.modelLayers, true)
    assert.ok(view.observations.some((entry) => entry.phase === 'committed'), JSON.stringify(view.observations))
  } finally {
    await harness.ctx.fiber.dispose()
  }
})

test('Agent identity facts select preset and main/delegated sections', { skip }, async () => {
  const harness = await hostHarness('identity', {
    'global.yaml': [
      'apiVersion: prompt-layers/v1',
      'scope: global',
      'sections:',
      '  - id: custom:main-only',
      '    content: MAIN ONLY',
      '    when:',
      '      agent:',
      '        role: main',
      '  - id: custom:delegated',
      '    content: DELEGATED ONLY',
      '    when:',
      '      agent:',
      '        role: delegated',
      '        presets: [stub-preset]',
      '',
    ].join('\n'),
  }, { preset: 'stub-preset' })
  try {
    const main = fakeAgent('agent-main', { options: { subagentDepth: 0 } })
    const mainAssembly = await harness.ctx.systemPrompt.assemble({ agent: main, scope: main })
    assert.ok(sectionNames(mainAssembly).includes('custom:main-only'))
    assert.ok(!sectionNames(mainAssembly).includes('custom:delegated'))

    const delegated = fakeAgent('agent-delegated', { header: { origin: 'subagent', delegationDepth: 1 } })
    const delegatedAssembly = await harness.ctx.systemPrompt.assemble({ agent: delegated, scope: delegated })
    assert.ok(sectionNames(delegatedAssembly).includes('custom:delegated'))
    assert.ok(!sectionNames(delegatedAssembly).includes('custom:main-only'))
  } finally {
    await harness.ctx.fiber.dispose()
  }
})

test('a real complete section wins over the composed layers and is observed as suppressed-or-changed', { skip }, async () => {
  const harness = await hostHarness('complete', { 'global.yaml': GLOBAL_LAYERS })
  try {
    harness.ctx.systemPrompt.section({ name: 'test:complete', order: 500, text: 'EXACT ONLY', complete: true })
    const agent = fakeAgent('agent-complete')
    const assembly = await harness.ctx.systemPrompt.assemble({ agent, scope: agent })
    assert.deepEqual(sectionNames(assembly), ['test:complete'])

    harness.ctx.emit('session/event', { id: agent.id }, {
      type: 'system/message',
      data: { message: { content: [{ type: 'text', text: 'EXACT ONLY' }] } },
    })
    const view = await harness.view()
    assert.ok(
      view.observations.some((entry) => entry.phase === 'suppressed-or-changed'),
      JSON.stringify(view.observations),
    )
  } finally {
    await harness.ctx.fiber.dispose()
  }
})

test('two complete sections fail natively and the Host does not mask the failure', { skip }, async () => {
  const harness = await hostHarness('multi-complete', { 'global.yaml': GLOBAL_LAYERS })
  try {
    harness.ctx.systemPrompt.section({ name: 'test:complete-a', order: 500, text: 'A', complete: true })
    harness.ctx.systemPrompt.section({ name: 'test:complete-b', order: 501, text: 'B', complete: true })
    const agent = fakeAgent('agent-multi')
    await assert.rejects(
      harness.ctx.systemPrompt.assemble({ agent, scope: agent }),
      /multiple complete prompt sections are active/,
    )
  } finally {
    await harness.ctx.fiber.dispose()
  }
})

test('a later prepended listener can replace sections and the commit observation reports it', { skip }, async () => {
  const harness = await hostHarness('outer-listener', { 'global.yaml': GLOBAL_LAYERS })
  try {
    harness.ctx.on('system-prompt/assemble', async (_assembly, _context, next) => {
      const result = await next()
      return { ...result, sections: result.sections.filter((section) => section.name !== 'custom:literal') }
    }, { prepend: true })
    const agent = fakeAgent('agent-outer')
    const assembly = await harness.ctx.systemPrompt.assemble({ agent, scope: agent })
    assert.ok(!sectionNames(assembly).includes('custom:literal'))
    assert.ok(sectionNames(assembly).includes('custom:interpolated'))

    harness.ctx.emit('session/event', { id: agent.id }, {
      type: 'system/message',
      data: { message: { content: [{ type: 'text', text: runtime.systemPrompt.renderPrompt(assembly) }] } },
    })
    const view = await harness.view()
    assert.ok(
      view.observations.some((entry) => entry.phase === 'suppressed-or-changed'),
      JSON.stringify(view.observations),
    )
  } finally {
    await harness.ctx.fiber.dispose()
  }
})

test('dispose removes every Host layer and leaves the native prompt', { skip }, async () => {
  const harness = await hostHarness('dispose', { 'global.yaml': GLOBAL_LAYERS })
  const agent = fakeAgent('agent-dispose')
  const composed = await harness.ctx.systemPrompt.assemble({ agent, scope: agent })
  assert.ok(sectionNames(composed).includes('custom:literal'))
  await harness.ctx.fiber.dispose()
  assert.equal(harness.ctx.systemPrompt, undefined)
})

// ------------------------------------------------------------- Host candidate gate

test('provider and model candidates activate on the declared route only', { skip }, async () => {
  const modelLayer = [
    'apiVersion: prompt-layers/v1',
    'scope: model',
    'provider: proxy-a',
    'model: model-x',
    'sections:',
    '  - id: custom:model-only',
    '    content: MODEL ONLY',
    '',
  ].join('\n')
  const harness = await hostHarness('declared-route', {
    'global.yaml': 'apiVersion: prompt-layers/v1\nscope: global\n',
    'providers/proxy-a.yaml': PROVIDER_LAYER,
    'models/model-x.yaml': modelLayer,
  })
  try {
    const target = fakeAgent('agent-target', { options: { provider: 'proxy-a', model: 'model-x' } })
    const targetAssembly = await harness.ctx.systemPrompt.assemble({ agent: target, scope: target })
    assert.ok(sectionNames(targetAssembly).includes('custom:provider-only'))
    assert.ok(sectionNames(targetAssembly).includes('custom:model-only'))

    const sibling = fakeAgent('agent-sibling', { options: { provider: 'proxy-a', model: 'model-y' } })
    const siblingAssembly = await harness.ctx.systemPrompt.assemble({ agent: sibling, scope: sibling })
    assert.ok(sectionNames(siblingAssembly).includes('custom:provider-only'))
    assert.ok(!sectionNames(siblingAssembly).includes('custom:model-only'))

    const view = await harness.view()
    assert.equal(view.status.phase, 'active')
    assert.equal(view.status.modelLayers, 'declared-route')
    assert.equal(view.capabilities.modelLayers, true)
    assert.ok(view.files.some((file) => file.path === 'providers/proxy-a.yaml'))
    assert.ok(view.files.some((file) => file.path === 'models/model-x.yaml'))
  } finally {
    await harness.ctx.fiber.dispose()
  }
})

test('managed native overrides need allowManagedOverride and are refused without it', { skip }, async () => {
  const refusedLayer = {
    'global.yaml': [
      'apiVersion: prompt-layers/v1',
      'scope: global',
      'existing:',
      '  deployment:persona-prefix:',
      '    content: OVERRIDDEN',
      '',
    ].join('\n'),
  }
  // With no preset roster the Host now validates the global assembly across every
  // role/powershell combination, so the document is refused during activation and the
  // native prompt survives untouched.
  const refused = await hostHarness('managed-refused', refusedLayer)
  try {
    const agent = fakeAgent('agent-managed-refused')
    const assembly = await refused.ctx.systemPrompt.assemble({ agent, scope: agent })
    assert.equal(assembly.sections.find((section) => section.name === 'deployment:persona-prefix').text, 'PERSONA-PREFIX')
    const view = await refused.view()
    assert.equal(view.status.phase, 'native-fallback')
    assert.match(view.status.reason, /managed/)
  } finally {
    await refused.ctx.fiber.dispose()
  }

  // With a roster the same document is refused during activation as well.
  const gated = await hostHarness('managed-gated', refusedLayer, { roster: [{ id: 'stub-preset' }] })
  try {
    const agent = fakeAgent('agent-managed-gated')
    const assembly = await gated.ctx.systemPrompt.assemble({ agent, scope: agent })
    assert.equal(assembly.sections.find((section) => section.name === 'deployment:persona-prefix').text, 'PERSONA-PREFIX')
    const view = await gated.view()
    assert.match(view.status.reason, /managed/)
  } finally {
    await gated.ctx.fiber.dispose()
  }

  const allowed = await hostHarness('managed-allowed', {
    'global.yaml': [
      'apiVersion: prompt-layers/v1',
      'scope: global',
      'existing:',
      '  deployment:persona-prefix:',
      '    content: OVERRIDDEN',
      '    allowManagedOverride: true',
      '',
    ].join('\n'),
  })
  try {
    const agent = fakeAgent('agent-managed-allowed')
    const assembly = await allowed.ctx.systemPrompt.assemble({ agent, scope: agent })
    assert.equal(assembly.sections.find((section) => section.name === 'deployment:persona-prefix').text, 'OVERRIDDEN')
    assert.equal((await allowed.view()).status.phase, 'active')
  } finally {
    await allowed.ctx.fiber.dispose()
  }
})

test('the PowerShell condition follows the Agent-visible pwsh tool', { skip }, async () => {
  const powershellLayer = [
    'apiVersion: prompt-layers/v1',
    'scope: global',
    'sections:',
    '  - id: custom:pwsh',
    '    content: PWSH ONLY',
    '    when:',
    '      tools:',
    '        powershell: true',
    '',
  ].join('\n')
  const withTool = await hostHarness('pwsh-present', { 'global.yaml': powershellLayer }, {
    tools: { pwsh: { name: 'pwsh', description: 'Persistent command session.', parameters: {} } },
  })
  try {
    const agent = fakeAgent('agent-pwsh-present')
    const assembly = await withTool.ctx.systemPrompt.assemble({ agent, scope: agent })
    assert.ok(sectionNames(assembly).includes('custom:pwsh'))
    assert.equal((await withTool.view()).capabilities.powershell, 'available')
  } finally {
    await withTool.ctx.fiber.dispose()
  }

  const withoutTool = await hostHarness('pwsh-absent', { 'global.yaml': powershellLayer })
  try {
    const agent = fakeAgent('agent-pwsh-absent')
    const assembly = await withoutTool.ctx.systemPrompt.assemble({ agent, scope: agent })
    assert.ok(!sectionNames(assembly).includes('custom:pwsh'))
    assert.equal((await withoutTool.view()).capabilities.powershell, 'unavailable')
  } finally {
    await withoutTool.ctx.fiber.dispose()
  }
})

test('a populated preset roster runs the scoped activation gate against real assemblies', { skip }, async () => {
  const harness = await hostHarness(
    'roster',
    { 'global.yaml': GLOBAL_LAYERS },
    { roster: [{ id: 'stub-preset' }] },
  )
  try {
    const view = await harness.view()
    assert.equal(view.status.phase, 'active')
    const agent = fakeAgent('agent-roster')
    const assembly = await harness.ctx.systemPrompt.assemble({ agent, scope: agent })
    assert.ok(sectionNames(assembly).includes('custom:literal'))
  } finally {
    await harness.ctx.fiber.dispose()
  }
})

// ------------------------------------------------------------ late-route evidence

test('the installed agent loop renders the prompt before the request waterfall (declared-route caveat)', { skip }, async () => {
  assert.ok(runtime.agentLoopEntry, 'the runtime ships @deepseek-ai/dsh-agent-loop')
  const source = readFileSync(runtime.agentLoopEntry, 'utf8')
  const render = source.indexOf('const renderedPrompt = renderPrompt(assembly);')
  const loop = source.indexOf('while (true) {', render)
  const prepare = source.indexOf('await this.prepareRequest(turn, step, signal)', loop)
  const project = source.indexOf('this.systemPrompt.project(renderedPrompt', prepare)
  const dispatch = source.indexOf('agent/request', prepare)
  assert.ok(render > 0, 'the step renders the assembled prompt')
  assert.ok(loop > render, 'the render happens before the retry loop')
  assert.ok(prepare > loop, 'request preparation runs inside the loop')
  assert.ok(project > prepare, 'projection consumes the pre-route rendered prompt')
  assert.ok(dispatch > prepare, 'the agent/request waterfall runs inside prepareRequest')
  assert.equal(source.split('systemPrompt.assemble(').length - 1, 1, 'exactly one assembly point per loop')
})
