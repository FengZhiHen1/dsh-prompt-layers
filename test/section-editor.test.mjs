import { test } from 'node:test'
import assert from 'node:assert/strict'
import { sectionWorkspace, documentsForTarget, validateTarget } from '../src/core/section-editor.js'
const documents = [
  { path: 'global.yaml', data: { scope: 'global', sections: [{ id: 'custom:a', content: 'global' }, { id: 'custom:off', content: 'disabled', enabled: false }] } },
  { path: 'providers/a.yaml', data: { scope: 'provider', provider: 'a', sections: [{ id: 'custom:a', content: 'provider' }] } },
  { path: 'models/a.yaml', data: { scope: 'model', provider: 'a', model: 'x', sections: [{ id: 'custom:a', content: 'model' }] } },
]
test('workspace scope chooses exact inheritance chain and retains disabled rows', () => {
  assert.equal(documentsForTarget(documents, { scope: 'global' }).length, 1)
  const provider = sectionWorkspace(documents, [], { scope: 'provider', provider: 'a' })
  assert.equal(provider[0].content, 'provider')
  assert.equal(provider[0].chain.length, 2)
  assert.equal(provider[0].chain[0].effective.content, 'global')
  assert.equal(provider[0].chain[1].effective.content, 'provider')
  assert.equal(provider[0].local, true)
  assert.equal(provider[1].enabled, false)
  const other = sectionWorkspace(documents, [], { scope: 'model', provider: 'b', model: 'x' })
  assert.equal(other[0].content, 'global')
  assert.equal(other[0].local, false)
})
test('scope identity rejects inconsistent provider and model fields', () => {
  for (const target of [{ scope: 'global', provider: 'a' }, { scope: 'model', provider: 'a' }, { scope: 'provider', provider: 'a', model: 'x' }]) assert.throws(() => validateTarget(target))
})
