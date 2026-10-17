import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PromptLayersRuntime } from '../src/adapter/runtime.js'

const document = (content = 'old') => ({ path: 'global.yaml', data: { scope: 'global', sections: [{ id: 'custom:a', content }] } })
const native = { sections: [{ name: 'native:a', text: 'native' }], contexts: [{ name: 'context', text: 'context' }], tools: [], variables: {} }

test('invalid candidates retain the complete last snapshot including resolved Markdown', async () => {
  let candidate = { documents: [document()], revision: 'one' }
  const published = []
  const runtime = new PromptLayersRuntime({ load: async () => candidate, generated: async (...args) => published.push(args) })
  await runtime.reload()
  candidate = { documents: [document('new'), { path: 'models/a.yaml', data: { scope: 'model', provider: 'a', model: 'b', sections: [] } }], revision: 'two' }
  await runtime.reload()
  assert.equal(runtime.status.phase, 'last-valid')
  assert.match(runtime.status.reason, /HOST_ROUTE_TIMING/)
  const result = runtime.assemble(native, {})
  assert.equal(result.sections.at(-1).text, 'old')
  assert.equal(result.contexts, native.contexts)
  assert.equal(result.tools, native.tools)
  assert.equal(runtime.snapshot.revision, 'one')
  assert.ok(Object.isFrozen(runtime.snapshot.documents))
  assert.equal(published.length, 2)
})

test('a restart with invalid disk falls back to native and disposal cannot reactivate', async () => {
  let release
  const runtime = new PromptLayersRuntime({ load: async () => { throw new Error('global.yaml: invalid YAML') }, generated: async () => undefined })
  await runtime.reload()
  assert.equal(runtime.status.phase, 'native-fallback')
  assert.equal(runtime.assemble(native, {}), native)
  runtime.files.load = () => new Promise(resolve => { release = resolve })
  const pending = runtime.reload()
  runtime.dispose()
  release({ documents: [document()], revision: 'late' })
  await pending
  assert.equal(runtime.status.phase, 'disabled')
  assert.equal(runtime.snapshot, undefined)
})

test('diagnostic memory is bounded and does not contain section bodies', async () => {
  const runtime = new PromptLayersRuntime({ load: async () => ({ documents: [document('PRIVATE-BODY')], revision: 'one' }), generated: async () => undefined })
  await runtime.reload()
  for (let index = 0; index < 100; index++) runtime.assemble(native, { preset: `preset-${index}` })
  assert.equal(runtime.observations.length, 32)
  assert.equal(runtime.catalogs.size, 64)
  assert.ok(!JSON.stringify(runtime.observations).includes('PRIVATE-BODY'))
})
