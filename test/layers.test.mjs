import { test } from 'node:test'
import assert from 'node:assert/strict'
import { composeLayers, validateDocuments } from '../src/core/layers.js'

const doc = (path, scope, sections = [], extra = {}) => ({ path, data: { scope, sections, ...extra } })
const native = (...names) => names.map((name, index) => ({ name, text: `native ${name}`, interpolate: index === 0 }))
const facts = { provider: 'proxy-a', model: 'model-x', preset: 'standard', role: 'main', powershell: true }
const run = (documents, nativeSections = native('A', 'B'), requestFacts = facts) => composeLayers(documents, nativeSections, requestFacts)
const names = result => result.sections.map(section => section.name)
const texts = result => result.sections.map(section => section.text)
const custom = (id, content, extra = {}) => ({ id: `custom:${id}`, content, ...extra })

// M01
 test('M01: global additions follow native sections in declaration order', () => {
  const result = run([doc('global.yaml', 'global', [custom('g1', 'G1'), custom('g2', 'G2')])])
  assert.deepEqual(names(result), ['A', 'B', 'custom:g1', 'custom:g2'])
  assert.deepEqual(texts(result), ['native A', 'native B', 'G1', 'G2'])
})

// M02
 test('M02: route layers append in global, provider, model first-definition order', () => {
  const result = run([
    doc('model.yaml', 'model', [custom('m1', 'M1'), custom('m2', 'M2')], { provider: 'proxy-a', model: 'model-x' }),
    doc('provider.yaml', 'provider', [custom('p1', 'P1')], { provider: 'proxy-a' }),
    doc('global.yaml', 'global', [custom('g1', 'G1'), custom('g2', 'G2')]),
  ])
  assert.deepEqual(names(result), ['A', 'B', 'custom:g1', 'custom:g2', 'custom:p1', 'custom:m1', 'custom:m2'])
})

// M03
 test('M03: a model body replaces inherited text without changing its default slot', () => {
  const result = run([
    doc('global.yaml', 'global', [custom('shared', 'global text'), custom('tail', 'tail')]),
    doc('model.yaml', 'model', [{ id: 'custom:shared', content: 'model text' }], { provider: 'proxy-a', model: 'model-x' }),
  ])
  assert.deepEqual(names(result).slice(-2), ['custom:shared', 'custom:tail'])
  assert.equal(result.sections.find(section => section.name === 'custom:shared').text, 'model text')
})

// M04
 test('M04: position default restores the first definition slot', () => {
  const result = run([
    doc('global.yaml', 'global', [custom('early', 'E'), custom('reset', 'R', { position: { after: 'A' } }), custom('late', 'L')]),
    doc('model.yaml', 'model', [{ id: 'custom:reset', position: 'default' }], { provider: 'proxy-a', model: 'model-x' }),
  ])
  assert.deepEqual(names(result), ['A', 'B', 'custom:early', 'custom:reset', 'custom:late'])
})

// M05
 test('M05: a specific layer can re-enable a disabled inherited definition', () => {
  const result = run([
    doc('global.yaml', 'global', [custom('recover', 'kept', { enabled: false })]),
    doc('model.yaml', 'model', [{ id: 'custom:recover', enabled: true }], { provider: 'proxy-a', model: 'model-x' }),
  ])
  assert.ok(names(result).includes('custom:recover'))
  assert.equal(result.sections.find(section => section.name === 'custom:recover').text, 'kept')
})

// M06
 test('M06: a positioned model section moves next to its anchor only', () => {
  const result = run([
    doc('global.yaml', 'global', [custom('g', 'G')]),
    doc('model.yaml', 'model', [custom('m', 'M', { position: { after: 'A' } })], { provider: 'proxy-a', model: 'model-x' }),
  ])
  assert.deepEqual(names(result), ['A', 'custom:m', 'B', 'custom:g'])
})

// M07
 test('M07: G/P/M siblings on one anchor stay ordered by first definition layer', () => {
  const result = run([
    doc('model.yaml', 'model', [custom('m', 'M', { position: { after: 'A' } })], { provider: 'proxy-a', model: 'model-x' }),
    doc('provider.yaml', 'provider', [custom('p', 'P', { position: { after: 'A' } })], { provider: 'proxy-a' }),
    doc('global.yaml', 'global', [custom('g', 'G', { position: { after: 'A' } })]),
  ])
  assert.deepEqual(names(result), ['A', 'custom:g', 'custom:p', 'custom:m', 'B'])
})

// M08
 test('M08: missing, disabled, self, and cyclic anchors are rejected with file and ID context', () => {
  const cases = [
    [doc('global.yaml', 'global', [custom('x', 'X', { position: { after: 'absent' } })]), /global\.yaml.*custom:x.*anchor absent/],
    [doc('global.yaml', 'global', [custom('x', 'X', { position: { after: 'custom:y' } }), custom('y', 'Y', { enabled: false })]), /global\.yaml.*custom:x.*disabled/],
    [doc('global.yaml', 'global', [custom('x', 'X', { position: { before: 'custom:x' } })]), /custom:x.*itself/],
    [doc('global.yaml', 'global', [custom('x', 'X', { position: { after: 'custom:y' } }), custom('y', 'Y', { position: { after: 'custom:x' } })]), /cycle/],
  ]
  for (const [document, expected] of cases) assert.throws(() => run([document]), expected)
})

// M09
 test('M09: a conditional section cannot serve as a strict anchor', () => {
  const document = doc('global.yaml', 'global', [
    custom('conditional', 'C', { when: { agent: { role: 'main' } } }),
    custom('placed', 'P', { position: { after: 'custom:conditional' } }),
  ])
  assert.throws(() => run([document]), /global\.yaml.*custom:placed.*conditional/)
})

// M10
 test('M10: enabled and position-only overrides retain inherited body', () => {
  const result = run([
    doc('global.yaml', 'global', [custom('retain', 'original')]),
    doc('model.yaml', 'model', [{ id: 'custom:retain', position: { after: 'A' }, interpolate: true }], { provider: 'proxy-a', model: 'model-x' }),
  ])
  const section = result.sections.find(item => item.name === 'custom:retain')
  assert.equal(section.text, 'original')
  assert.equal(section.interpolate, true)
})

// M11
 test('M11: model names are scoped by exact provider identity', () => {
  const result = run([
    doc('model-a.yaml', 'model', [custom('private', 'A only')], { provider: 'proxy-a', model: 'shared-name' }),
    doc('model-b.yaml', 'model', [custom('private', 'B only')], { provider: 'proxy-b', model: 'shared-name' }),
  ], native('A'), { provider: 'proxy-b', model: 'shared-name' })
  assert.equal(result.sections.find(section => section.name === 'custom:private').text, 'B only')
})

// M12
 test('M12: custom definitions cannot take over a native section name', () => {
  assert.throws(() => run([doc('global.yaml', 'global', [custom('identity', 'custom')])], native('custom:identity')), /global\.yaml.*custom:identity.*conflicts/)
})

// M13
 test('M13: existing map key order does not reorder native sections', () => {
  const result = run([doc('global.yaml', 'global', [], { existing: { B: { content: 'changed B' }, A: { content: 'changed A' } } })], native('A', 'B'))
  assert.deepEqual(names(result), ['A', 'B'])
  assert.deepEqual(texts(result), ['changed A', 'changed B'])
})

// M14
 test('M14: existing overrides only declared attributes and retains native interpolation', () => {
  const result = run([doc('global.yaml', 'global', [], { existing: { A: { content: 'replaced' } } })], [
    { name: 'A', text: 'native A', interpolate: true },
    { name: 'B', text: 'native B', interpolate: false },
  ])
  assert.deepEqual(result.sections, [
    { name: 'A', text: 'replaced', interpolate: true },
    { name: 'B', text: 'native B', interpolate: false },
  ])
})

test('validation catches route duplicates, duplicate IDs, missing disabled first bodies, and namespace collisions', () => {
  assert.throws(() => validateDocuments([doc('one', 'provider', [], { provider: 'p' }), doc('two', 'provider', [], { provider: 'p' })]), /two.*duplicate provider scope tuple.*one/)
  assert.throws(() => validateDocuments([doc('one', 'global', [custom('x', '1'), custom('x', '2')])]), /one.*duplicate section id custom:x/)
  assert.throws(() => validateDocuments([doc('one', 'global', [{ id: 'custom:x', enabled: false }])]), /one.*custom:x.*first definition requires content/)
  assert.throws(() => validateDocuments([doc('one', 'global', [], { existing: { 'custom:x': {} } })]), /one.*custom:x.*custom namespace/)
})

test('managed native sections require explicit allowManagedOverride for changes', () => {
  assert.throws(() => run([doc('global.yaml', 'global', [], { existing: { A: { enabled: false } } })], [{ name: 'A', text: 'managed', managed: true }]), /global\.yaml.*A.*allowManagedOverride/)
  const result = run([doc('global.yaml', 'global', [], { existing: { A: { content: 'replacement', allowManagedOverride: true } } })], [{ name: 'A', text: 'managed', managed: true }])
  assert.deepEqual(texts(result), ['replacement'])
})

test('disabled and unmatched custom sections do not validate or participate in anchor ordering', () => {
  const document = doc('global.yaml', 'global', [
    custom('disabled-bad-anchor', 'D', { enabled: false, position: { after: 'missing' } }),
    custom('unmatched-bad-anchor', 'U', { when: { agent: { role: 'delegated' } }, position: { before: 'missing' } }),
    custom('visible', 'V'),
  ])
  const result = run([document], native('A'), { role: 'main' })
  assert.deepEqual(names(result), ['A', 'custom:visible'])
})

test('existing conditions are inherited and evaluated after all layer overrides merge', () => {
  const nativeSections = [{ name: 'A', text: 'native A', interpolate: true }]
  const inherited = [
    doc('global.yaml', 'global', [], { existing: { A: { content: 'global x', when: { agent: { role: 'main' } } } } }),
    doc('model.yaml', 'model', [], { provider: 'proxy-a', model: 'model-x', existing: { A: { content: 'model y' } } }),
  ]
  assert.deepEqual(texts(run(inherited, nativeSections, { provider: 'proxy-a', model: 'model-x', role: 'delegated' })), ['native A'])
  assert.deepEqual(texts(run(inherited, nativeSections, { provider: 'proxy-a', model: 'model-x', role: 'main' })), ['model y'])

  const replacedCondition = [
    doc('global.yaml', 'global', [], { existing: { A: { content: 'global x', when: { agent: { role: 'main' } } } } }),
    doc('model.yaml', 'model', [], { provider: 'proxy-a', model: 'model-x', existing: { A: { enabled: true, when: { agent: { role: 'delegated' } } } } }),
  ]
  assert.deepEqual(texts(run(replacedCondition, nativeSections, { provider: 'proxy-a', model: 'model-x', role: 'delegated' })), ['global x'])
  assert.deepEqual(texts(run(replacedCondition, nativeSections, { provider: 'proxy-a', model: 'model-x', role: 'main' })), ['native A'])
})

test('resolved content takes precedence while contentFile provenance remains valid', () => {
  const result = run([doc('global.yaml', 'global', [{
    id: 'custom:resolved',
    contentFile: 'content/guide.md',
    content: 'resolved markdown body',
  }])])
  assert.equal(result.sections.find(section => section.name === 'custom:resolved').text, 'resolved markdown body')
  assert.equal(JSON.stringify(result.index).includes('resolved markdown body'), false)
  assert.equal(JSON.stringify(result.index).includes('content/guide.md'), false)
})

test('inherited when conditions replace the whole condition and unknown facts never match', () => {
  const documents = [
    doc('global.yaml', 'global', [custom('conditional', 'base', { when: { agent: { presets: ['standard'] }, tools: { powershell: true } } })]),
    doc('model.yaml', 'model', [{ id: 'custom:conditional', content: 'override', when: { agent: { role: 'delegated' } } }], { provider: 'proxy-a', model: 'model-x' }),
  ]
  assert.deepEqual(names(run(documents, native('A'), { provider: 'proxy-a', model: 'model-x', preset: 'standard', role: 'main', powershell: true })), ['A'])
  assert.deepEqual(names(run(documents, native('A'), { provider: 'proxy-a', model: 'model-x', role: 'delegated' })), ['A', 'custom:conditional'])
})

test('identity selectors match preset and main/delegated role exactly', () => {
  const sections = [custom('main-standard', 'S', { when: { agent: { presets: ['standard'], role: 'main' } } }), custom('delegated', 'D', { when: { agent: { role: 'delegated' } } })]
  assert.deepEqual(names(run([doc('global.yaml', 'global', sections)], native('A'), { preset: 'standard', role: 'main' })), ['A', 'custom:main-standard'])
  assert.deepEqual(names(run([doc('global.yaml', 'global', sections)], native('A'), { preset: 'standard', role: 'delegated' })), ['A', 'custom:delegated'])
  assert.deepEqual(names(run([doc('global.yaml', 'global', sections)], native('A'), {})), ['A'])
})

test('PowerShell condition is exact and unknown tool availability does not match', () => {
  const document = doc('global.yaml', 'global', [custom('pwsh', 'PS', { when: { tools: { powershell: true } } })])
  assert.deepEqual(names(run([document], native('A'), { powershell: true })), ['A', 'custom:pwsh'])
  assert.deepEqual(names(run([document], native('A'), { powershell: false })), ['A'])
  assert.deepEqual(names(run([document], native('A'), {})), ['A'])
})
