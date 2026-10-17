import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'

const code = await readFile(new URL('../client.js', import.meta.url), 'utf8')

async function mount(envelope, { fail = false, saveError = false } = {}) {
  let plugin
  let component
  const states = []
  const effects = []
  const calls = []
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
    fetch: async (url, options) => {
      const body = JSON.parse(options.body)
      calls.push(body)
      if (fail) throw new Error('offline')
      if (saveError && body.action === 'commit') return { ok: false, status: 409, json: async () => ({ error: 'REVISION_CONFLICT' }) }
      return { ok: true, status: 200, json: async () => envelope }
    },
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
  return { render, calls }
}

function find(node, predicate, matches = []) {
  if (!node || typeof node !== 'object') return matches
  if (Array.isArray(node)) { node.forEach(item => find(item, predicate, matches)); return matches }
  if (predicate(node)) matches.push(node)
  node.children?.forEach(child => find(child, predicate, matches))
  return matches
}

const byClass = (name) => (node) => node.props?.className === name
const saveButton = (view) => find(view, byClass('pl-save'))[0]
const addButton = (view) => find(view, (node) => node.type === 'button' && node.props?.className === 'pl-button' && node.children.includes('add'))[0]
const rowOpen = (view) => find(view, byClass('pl-rowOpen'))[0]
const textarea = (view) => find(view, (node) => node.type === 'textarea')[0]

const empty = { status: { phase: 'empty' }, revision: 'one', sections: [], files: [], templates: [], routes: [], identities: [], capabilities: { modelLayers: false } }

test('the settings form keeps Save disabled until a staged edit is valid', async () => {
  const ui = await mount(empty)
  let view = ui.render()
  assert.equal(saveButton(view).props.disabled, true)

  addButton(view).props.onClick()
  view = ui.render()
  assert.equal(find(view, byClass('pl-rowState'))[0].children[0], 'newSection')

  rowOpen(view).props.onClick()
  view = ui.render()
  assert.equal(textarea(view).props.value, '')
  assert.equal(saveButton(view).props.disabled, true, 'an empty body blocks the save')

  textarea(view).props.onChange({ target: { value: 'New guidance' } })
  view = ui.render()
  assert.equal(saveButton(view).props.disabled, false, 'a valid staged edit enables the save')
})

test('saving writes one revision-fenced commit and reports no success message', async () => {
  const ui = await mount(empty)
  let view = ui.render()
  addButton(view).props.onClick()
  view = ui.render()
  rowOpen(view).props.onClick()
  view = ui.render()
  textarea(view).props.onChange({ target: { value: 'New guidance' } })
  view = ui.render()

  const actions = ui.calls.map((call) => call.action)
  assert.deepEqual(actions, ['workspace'])
  await saveButton(view).props.onClick()

  const commits = ui.calls.filter((call) => call.action === 'commit')
  assert.equal(commits.length, 1, 'one staged save is one commit request')
  assert.equal(commits[0].expectedRevision, 'one')
  assert.equal(commits[0].changes.length, 1)
  assert.equal(commits[0].changes[0].op, 'save')
  assert.equal(commits[0].changes[0].fields.content, 'New guidance')

  view = ui.render()
  assert.equal(saveButton(view).props.disabled, true, 'the draft is consumed by the save')
  assert.equal(find(view, byClass('pl-failed')).length, 0, 'success stays silent')
})

test('a refused save keeps the draft and shows the form failure line', async () => {
  const ui = await mount(empty, { saveError: true })
  let view = ui.render()
  addButton(view).props.onClick()
  view = ui.render()
  rowOpen(view).props.onClick()
  view = ui.render()
  textarea(view).props.onChange({ target: { value: 'New guidance' } })
  view = ui.render()

  await saveButton(view).props.onClick()
  view = ui.render()
  assert.equal(find(view, byClass('pl-failed')).length, 1)
  assert.equal(saveButton(view).props.disabled, false, 'the retained draft can be saved again')
  assert.equal(textarea(view).props.value, 'New guidance')
})

test('an unavailable configuration renders the settings-form notice instead of fields', async () => {
  const ui = await mount(empty, { fail: true })
  const view = ui.render()
  const notice = find(view, (node) => node.props?.role === 'status')[0]
  assert.ok(notice)
  assert.equal(notice.children[0], 'unavailable')
  assert.equal(find(view, byClass('pl-form')).length, 0)
})

test('the client bundle stays free of Harness client packages and literal colors', () => {
  assert.equal(/@deepseek-ai\/dsh-client-/.test(code), false, 'no Harness client package dependency')
  const requires = [...code.matchAll(/require\(["']([^"']+)["']\)/g)].map((match) => match[1])
  assert.deepEqual(requires, ['react'])
  const start = code.indexOf('const css = `')
  const styles = code.slice(start, code.indexOf('`;', start))
  assert.equal(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/.test(styles), false, 'styles carry tokens, not literal colors')
})
