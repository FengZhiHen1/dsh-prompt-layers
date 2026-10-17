import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'

const code = await readFile(new URL('../client.js', import.meta.url), 'utf8')

async function mount(envelope, { fail = false } = {}) {
  let plugin
  let component
  const states = []
  const effects = []
  let cursor = 0
  const React = {
    Fragment: 'fragment',
    createElement(type, props, ...children) { return { type, props: props ?? {}, children } },
    useState(initial) { const index = cursor++; if (!(index in states)) states[index] = typeof initial === 'function' ? initial() : initial; return [states[index], value => { states[index] = typeof value === 'function' ? value(states[index]) : value }] },
    useRef(initial) { const index = cursor++; states[index] ??= { current: initial }; return states[index] },
    useCallback(callback) { return callback },
    useEffect(callback) { effects.push(callback) },
    useId() { return `test-${cursor++}` },
  }
  const context = vm.createContext({ window: { __ModuleLoader__: { load(entry) { plugin = entry.factory(name => { assert.equal(name, 'react'); return React }) } } },
    fetch: async () => { if (fail) throw new Error('offline'); return { ok: true, json: async () => envelope } },
    navigator: { clipboard: { writeText: async () => undefined } }, AbortController, setTimeout, clearTimeout, console })
  vm.runInContext(code, context)
  plugin.apply({ effect: operation => operation(), locale: { register: () => () => undefined, bind: () => key => key },
    slots: { inject: (_name, callback) => callback(), register: (_options, view) => { component = view; return () => undefined } } })
  const t = key => key
  function render() {
    cursor = 0
    const root = component({ view: 'page', t })
    return resolve(root)
  }
  function resolve(node) {
    if (!node || typeof node !== 'object') return node
    if (Array.isArray(node)) return node.map(resolve)
    if (typeof node.type === 'function') return resolve(node.type(node.props))
    return { ...node, children: node.children.map(resolve) }
  }
  render()
  const pending = effects.splice(0)
  for (const effect of pending) effect()
  await new Promise(resolve => setImmediate(resolve))
  return { render, states }
}

function find(node, predicate, matches = []) {
  if (!node || typeof node !== 'object') return matches
  if (Array.isArray(node)) { node.forEach(item => find(item, predicate, matches)); return matches }
  if (predicate(node)) matches.push(node)
  node.children?.forEach(child => find(child, predicate, matches))
  return matches
}

const empty = { status: { phase: 'empty' }, revision: 'one', sections: [], files: [], templates: [], routes: [], capabilities: { modelLayers: false } }

test('client remains in the bundle slot and renders an actionable empty configuration', async () => {
  const ui = await mount(empty)
  const view = ui.render()
  const create = find(view, node => node.type === 'button' && node.children.includes('add'))[0]
  assert.ok(create)
  create.props.onClick()
  const editing = ui.render()
  const body = find(editing, node => node.type === 'textarea')[0]
  body.props.onChange({ target: { value: 'New guidance' } })
  const save = find(ui.render(), node => node.type === 'button' && node.children.includes('save'))[0]
  assert.equal(save.props.disabled, false)
})

test('invalid YAML response keeps its original file editable', async () => {
  const ui = await mount({ ...empty, error: 'global.yaml: invalid YAML', files: [{ path: 'global.yaml', text: 'scope: [broken', revision: 'one' }] })
  const view = ui.render()
  assert.ok(find(view, node => node.props.role === 'alert').length)
  const fileSelect = find(view, node => node.type === 'select').at(-1)
  fileSelect.props.onChange({ target: { value: 'global.yaml' } })
  assert.equal(find(ui.render(), node => node.type === 'textarea')[0].props.value, 'scope: [broken')
})

test('offline state gives an explicit retry action', async () => {
  const ui = await mount(empty, { fail: true })
  const view = ui.render()
  assert.ok(find(view, node => node.props.role === 'alert').length)
  assert.ok(find(view, node => node.type === 'button' && node.children.includes('retry')).length)
})
