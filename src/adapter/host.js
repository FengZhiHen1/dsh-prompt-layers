// host — wires snapshots, scoped assembly, and authenticated configuration UI.
// Boundary: no private registry access or post-route message mutation.
import z from '@deepseek-ai/schemastery'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { createConfigurationParser } from '../core/configuration.js'
import { composeLayers } from '../core/layers.js'
import { ConfigurationFiles } from './files.js'
import { PromptLayersRuntime } from './runtime.js'
import { PromptLayersApplication, loadTemplates } from './application.js'

/** Stable package/plugin identifier. */
export const name = 'dsh-prompt-layers'
/** Services needed for scoped matching and authenticated browser operations. */
export const inject = ['systemPrompt', 'agentPresets', 'tools', 'connection']
/** Lightweight settings; prompt text remains in YAML and Markdown. */
export const Config = z.object({
  directory: z.string().default(''),
  pollIntervalMs: z.number().min(250).max(30000).default(1000),
})

/**
 * Extract Agent identity, the route this assembly actually runs on, and
 * presentation-independent tool facts.
 *
 * The route comes from the assembly's `provider`/`model` variables, read after
 * `next()`: the Host's Session model selection overwrites them inside this
 * waterfall, so they are what the rendered prompt and the follow-up request use.
 * `agent.options` only keeps the default model captured when the Agent was
 * created, which drifts from the Session route on every model switch, so it is
 * the fallback for assemblies that declare no route.
 */
export function assemblyFacts(ctx, context, assembly) {
  const agent = context.agent
  if (!agent) return {}
  const header = agent.session?.header
  const depths = [header?.delegationDepth, agent.options?.subagentDepth].filter(value => Number.isSafeInteger(value) && value >= 0)
  // The Host treats an omitted delegationDepth as 0 (subagent delegationDepthOf()).
  // A live session header without delegation evidence is therefore the root/main Agent.
  const role = header?.origin === 'subagent' || header?.parentSession || depths.some(value => value > 0)
    ? 'delegated' : header === undefined ? undefined : 'main'
  // The scoped pwsh tool is direct evidence that this Agent can execute PowerShell.
  const powershell = ctx.tools.get('pwsh', agent) !== undefined
  const route = assemblyRoute(assembly, agent)
  return {
    preset: ctx.agentPresets.composedPreset(agent.ctx),
    role,
    powershell,
    provider: route.provider,
    model: route.model,
  }
}

/**
 * Read the route this assembly is rendered for: the waterfall variables when the
 * Host resolved a provider/model pair, otherwise the creation-time options.
 * @param assembly - post-waterfall assembly whose variables carry the Session route.
 * @param agent - the Agent being assembled.
 * @returns the provider/model pair, possibly with undefined members.
 */
function assemblyRoute(assembly, agent) {
  const provider = assembly?.variables?.provider
  const model = assembly?.variables?.model
  if (typeof provider === 'string' && provider.length > 0 && typeof model === 'string' && model.length > 0) {
    return { provider, model }
  }
  return { provider: agent.options?.provider, model: agent.options?.model }
}

/** Mount one complete snapshot owner and release every observer on unload. */
export async function apply(ctx, config = {}) {
  const configured = config.directory || (process.env.DSH_HOME ? resolve(process.env.DSH_HOME, 'prompt-layers') : undefined)
  if (!configured) throw new Error('prompt-layers requires DSH_HOME or an explicit directory')
  const schema = JSON.parse(await readFile(new URL('../../prompt-layers.schema.json', import.meta.url), 'utf8'))
  const parse = createConfigurationParser(schema)
  const files = new ConfigurationFiles(resolve(configured), parse)
  let validating = false
  const runtime = new PromptLayersRuntime(files, { async validateHost(documents) {
    validating = true
    try {
      const roster = await ctx.agentPresets.list()
      // Validate every configured target, not only the global/default composition.
      const targets = documents
        .filter(document => document.data.scope !== 'global')
        .map(document => ({ provider: document.data.provider, model: document.data.model }))
      const check = (native, base) => {
        const sections = native.sections.map(section => ({ ...section, managed: true }))
        // The assembled tool section is the capability source. A preset without
        // pwsh must not be checked with an impossible powershell:true fact, or a
        // conditional PowerShell anchor would be rejected for a tool it cannot see.
        const powershell = sections.some(section => section.name === 'tool:pwsh')
        for (const target of [{}, ...targets]) for (const role of ['main', 'delegated']) {
          composeLayers(documents, sections, { ...base, ...target, role, powershell })
        }
      }
      if (roster.length === 0) {
        check(await ctx.systemPrompt.assemble(), {})
      }
      for (const preset of roster.slice(0, 64)) {
        if (preset.broken) continue
        const lease = await ctx.agentPresets.acquireScope(preset.id)
        try {
          check(await ctx.systemPrompt.assemble({ scope: lease.key }), { preset: preset.id })
        } finally { await lease[Symbol.asyncDispose]() }
      }
    } finally { validating = false }
  } })
  const application = new PromptLayersApplication(files, runtime, parse, await loadTemplates(), async () => {
    const llm = ctx.get('llm')
    if (!llm) return []
    const routes = []
    for (const provider of llm.listProviders().slice(0, 32)) {
      const models = await llm.listModels(provider.id)
      for (const model of models.slice(0, 256)) routes.push({ provider: provider.id, model: model.id })
    }
    return routes
  }, () => ({
    modelLayers: true,
    powershell: ctx.tools.get('pwsh') === undefined ? 'unavailable' : 'available',
    reason: 'Model layers follow the provider/model the assembly is rendered for; a later agent/request override is not observed',
  }))
  const expected = new Map()
  let polling = false
  const logFailure = error => ctx.logger.warn(`prompt-layers: ${error.message}`)
  ctx.effect(() => async () => {
    runtime.dispose()
    expected.clear()
    await files.generated(runtime.status, { observations: [] })
  }, 'prompt-layers.runtime')
  ctx.on('system-prompt/assemble', async (_assembly, context, next) => {
    const assembly = await next()
    if (validating && !context.agent) return assembly
    const result = runtime.assemble(assembly, assemblyFacts(ctx, context, assembly))
    if (context.agent && result !== assembly) {
      // Keep only hashes and IDs; no prompt bodies enter observation memory.
      const variables = result.variables
      const text = result.sections.map(section => section.interpolate === false ? section.text : section.text.replace(/\{\{([a-z][a-z0-9_]*)\}\}/g, (match, key) => variables[key] ?? match)).join('\n\n')
      if (expected.size >= 64 && !expected.has(context.agent.id)) expected.delete(expected.keys().next().value)
      expected.set(context.agent.id, { hash: createHash('sha256').update(text).digest('hex'), revision: runtime.snapshot?.revision })
    }
    return result
  }, { prepend: true })
  ctx.on('session/event', (session, event) => {
    if (event.type !== 'system/message') return
    const expectation = expected.get(session.id)
    if (!expectation) return
    const text = event.data.message.content.filter(block => block.type === 'text').map(block => block.text).join('\n')
    const same = createHash('sha256').update(text).digest('hex') === expectation.hash
    runtime.record({ phase: same ? 'committed' : 'suppressed-or-changed', revision: expectation.revision })
    runtime.publish().catch(logFailure)
  })
  ctx.effect(() => ctx.connection.fetch.register({
    path: '/api/prompt-layers', methods: ['GET', 'POST'], requestBody: 'buffered',
    async fetch(request) {
      try {
        if (request.method === 'GET') return Response.json(await application.view())
        const text = await request.text()
        if (Buffer.byteLength(text) > 2 * 1024 * 1024) return Response.json({ error: 'Request exceeds 2 MiB' }, { status: 413 })
        return Response.json(await application.execute(JSON.parse(text)))
      } catch (error) {
        return Response.json({ error: error.message }, { status: /REVISION_CONFLICT/.test(error.message) ? 409 : 400 })
      }
    },
  }), 'prompt-layers.api')
  await runtime.reload()
  // Polling handles atomic file replacement on Windows and excludes generated writes.
  const timer = setInterval(() => {
    if (polling || runtime.disposed) return
    polling = true
    runtime.reload().catch(logFailure).finally(() => { polling = false })
  }, config.pollIntervalMs ?? 1000)
  timer.unref()
  ctx.effect(() => () => clearInterval(timer), 'prompt-layers.poll')
}
