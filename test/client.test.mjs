import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'

const code = await readFile(new URL('../client.js', import.meta.url), 'utf8')

async function mount(envelope, { fail = false, saveError = false, lang = 'zh' } = {}) {
  let plugin
  let component
  let registration
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
  plugin.apply({ effect: operation => operation(), locale: {
    register: () => () => undefined,
    bind: () => key => key,
    getLocale: () => ({ active: lang, locales: [], revision: 0 }),
    subscribe: () => () => undefined,
  },
    slots: { inject: (_name, callback) => callback(), register: (options, view) => { registration = options; component = view; return () => undefined } } })
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
  return { render, calls, registration, component }
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

const empty = { status: { phase: 'empty' }, revision: 'one', sections: [], files: [], templates: [], routes: [], identities: [], capabilities: { modelLayers: true, powershell: 'available' } }

const templates = [
  {
    id: 'builtin:evidence-discipline',
    version: '1.0.0',
    title: 'Evidence discipline',
    titleZh: '证据纪律',
    description: '证据诚实底线：中文说明。',
    descriptionEn: 'Evidence honesty baseline: English summary.',
    file: 'evidence-discipline.md',
    sectionId: 'custom:evidence-discipline',
    recommendedScope: 'global',
    content: 'Evidence discipline body',
  },
  {
    id: 'builtin:flash-execution-core',
    version: '1.0.0',
    title: 'Engineering execution discipline',
    titleZh: '工程执行纪律',
    description: '面向资源受限模型的中文说明。',
    descriptionEn: 'Execution discipline for resource-constrained models.',
    file: 'flash-execution-core.md',
    sectionId: 'custom:flash-execution-core',
    recommendedScope: 'model',
    when: { agent: { role: 'main' }, tools: { powershell: true } },
    content: 'Flash execution body',
  },
]
const withTemplates = { ...empty, templates }
const savedLocal = {
  ...withTemplates,
  sections: [{
    id: 'custom:evidence-discipline',
    kind: 'custom',
    local: true,
    source: 'global',
    content: 'Evidence discipline body',
    enabled: true,
    interpolate: false,
    position: 'default',
    when: {},
    chain: [{
      scope: 'global',
      file: 'global.yaml',
      target: { scope: 'global' },
    }],
  }],
}
const iconButtons = (view) => find(view, (node) => node.type === 'button'
  && String(node.props?.className).includes('pl-iconButton'))
const templateTrigger = (view) => find(view, (node) => node.type === 'button'
  && String(node.props?.className).includes('pl-button') && node.children.includes('templates'))[0]
const dialog = (view) => find(view, (node) => node.type === 'dialog')[0]
const templateAddButton = (view) => find(view, (node) => node.type === 'button'
  && String(node.props?.className).includes('pl-button') && node.children.includes('templateAdd'))[0]
const templatePreviewButton = (view) => find(view, (node) => node.type === 'button'
  && String(node.props?.className).includes('pl-templatePreview'))[0]

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
  assert.equal(find(view, byClass('pl-save')).length, 2, 'the open row offers the same save action')
  assert.equal(saveButton(view).props.disabled, true, 'an empty body blocks the save')

  textarea(view).props.onChange({ target: { value: 'New guidance' } })
  view = ui.render()
  const buttons = find(view, byClass('pl-save'))
  assert.equal(buttons[0].props.disabled, false, 'a valid staged edit enables the row save')
  assert.equal(buttons[1].props.disabled, false, 'the footer save follows the same state')
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

  await find(ui.render(), byClass('pl-save'))[1].props.onClick()
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

test('the Section workspace is a row config page with a summary', async () => {
  const ui = await mount(empty)
  assert.equal(ui.registration.name, 'plugins.row.config')
  assert.equal(ui.registration.key, 'dsh-prompt-layers#prompt-layers')
  assert.equal(ui.registration.locale, 'dshPromptLayers')
  assert.equal(ui.component({ view: 'summary', t: key => key }), 'summary')
})

test('saved Sections use delete copy while new rows use discard copy', async () => {
  const ui = await mount(savedLocal)
  let view = ui.render()
  const savedIcon = iconButtons(view)[0]
  assert.ok(savedIcon)
  assert.equal(savedIcon.props.title, 'deleteLocal')
  assert.equal(savedIcon.props['aria-label'], 'deleteLocal: evidence-discipline')
  assert.equal(find(view, (node) => node.children?.includes?.('delete')).length, 0, 'no draft wording remains')

  templateTrigger(view).props.onClick()
  view = ui.render()
  templateAddButton(view).props.onClick()
  view = ui.render()
  find(view, (node) => node.type === 'button'
    && node.children?.includes?.('templateModelConfirmAdd'))[0].props.onClick()
  view = ui.render()
  const discard = iconButtons(view).find((node) => String(node.props?.['aria-label']).startsWith('discardNew'))
  assert.ok(discard)
  assert.equal(discard.props.title, 'discardNew')
  assert.equal(discard.props['aria-label'], 'discardNew: flash-execution-core')
  assert.equal(iconButtons(view).length, 2, 'one saved row plus one new row')
})

test('a body that differs from its template shows a warning, diff and explicit replace', async () => {
  const modified = {
    ...savedLocal,
    sections: [{ ...savedLocal.sections[0], content: 'Existing body' }],
  }
  const ui = await mount(modified)
  let view = ui.render()
  templateTrigger(view).props.onClick()
  view = ui.render()
  const stateTag = find(view, (node) => node.props?.className === 'pl-tag'
    && node.children?.[0] === 'templateModified')[0]
  assert.ok(stateTag)
  assert.equal(stateTag.props['data-tone'], 'warning')
  assert.equal(stateTag.props.title, undefined)
  const stateInfo = find(view, (node) => node.type === 'button'
    && node.props?.['aria-label'] === 'info: templateModified')[0]
  assert.ok(stateInfo)
  stateInfo.props.onClick()
  view = ui.render()
  assert.ok(find(view, (node) => node.children?.[0] === 'templateModifiedHint').length)

  templatePreviewButton(view).props.onClick()
  view = ui.render()
  const diff = find(view, byClass('pl-diff'))[0]
  assert.ok(diff)
  assert.ok(find(diff, (node) => node.props?.['data-kind'] === 'del'
    && String(node.children?.[0]).includes('Existing body')).length)
  assert.ok(find(diff, (node) => node.props?.['data-kind'] === 'add'
    && String(node.children?.[0]).includes('Evidence discipline body')).length)

  const replace = find(view, (node) => node.type === 'button'
    && node.children?.includes?.('templateReplace'))[0]
  assert.ok(replace)
  replace.props.onClick()
  view = ui.render()
  assert.ok(find(view, (node) => node.children?.includes?.('templateReplaceConfirm')).length)
  const confirm = find(view, (node) => node.type === 'button'
    && node.children?.includes?.('templateReplaceConfirmAction'))[0]
  assert.ok(confirm)
  confirm.props.onClick()
  view = ui.render()
  assert.ok(find(view, (node) => node.children?.includes?.('templateReplacedNotice')).length)
  assert.equal(find(view, byClass('pl-diff')).length, 0)
  const back = find(view, (node) => node.type === 'button'
    && String(node.props?.className).includes('pl-secondary'))[0]
  back.props.onClick()
  view = ui.render()
  assert.ok(find(view, (node) => node.props?.className === 'pl-tag'
    && node.children?.[0] === 'templateAdded').length)
  assert.equal(find(view, (node) => node.props?.className === 'pl-tag'
    && node.children?.[0] === 'templateModified').length, 0)

  await saveButton(view).props.onClick()
  const commits = ui.calls.filter((call) => call.action === 'commit')
  assert.equal(commits.length, 1)
  assert.equal(commits[0].changes[0].fields.content, 'Evidence discipline body')
})

test('line-ending and trailing-whitespace differences do not mark a template as modified', async () => {
  const normalized = {
    ...savedLocal,
    sections: [{
      ...savedLocal.sections[0],
      content: 'Evidence discipline body\r\n',
    }],
  }
  const ui = await mount(normalized)
  let view = ui.render()
  templateTrigger(view).props.onClick()
  view = ui.render()
  assert.ok(find(view, (node) => node.props?.className === 'pl-tag'
    && node.children?.[0] === 'templateAdded').length)
  assert.equal(find(view, (node) => node.props?.className === 'pl-tag'
    && node.children?.[0] === 'templateModified').length, 0)
})

test('the Section editor and list label show the current scope', async () => {
  const ui = await mount(savedLocal)
  let view = ui.render()
  assert.equal(find(view, (node) => node.props?.className === 'pl-tag'
    && node.children?.[0] === 'sectionScope').length, 1, 'the list label carries the scope')
  rowOpen(view).props.onClick()
  view = ui.render()
  assert.equal(find(view, (node) => node.props?.className === 'pl-tag'
    && node.children?.[0] === 'sectionScope').length, 2, 'the open editor repeats the scope')
  assert.ok(find(view, (node) => node.props?.className === 'pl-linkButton'
    && node.children?.[0] === 'scopeSettings').length)
})

test('the page states the scope and template add order in info', async () => {
  const ui = await mount(empty)
  let view = ui.render()
  assert.equal(find(view, byClass('pl-guide')).length, 0)
  assert.equal(find(view, (node) => node.children?.[0] === 'scopeShortHint').length, 1)
  assert.equal(find(view, (node) => node.children?.[0] === 'scopeGuideOrder').length, 0)
  const button = find(view, (node) => node.type === 'button'
    && node.props?.['aria-label'] === 'info: scope')[0]
  assert.ok(button)
  assert.equal(button.props['aria-expanded'], false)
  button.props.onClick()
  view = ui.render()
  const panel = find(view, byClass('pl-info'))[0]
  assert.ok(panel)
  assert.equal(panel.props.role, 'region')
  assert.ok(find(view, (node) => node.children?.[0] === 'scopeHint').length)
  assert.ok(find(view, (node) => node.children?.[0] === 'scopeGuideOrder').length)
  assert.ok(find(view, (node) => node.children?.[0] === 'scopeGuideModel').length)
  assert.equal(find(view, (node) => node.props?.['aria-label'] === 'scope')[0]
    .props['aria-describedby'], panel.props.id)
})

test('the sections label keeps its save hint in info', async () => {
  const ui = await mount(empty)
  let view = ui.render()
  assert.equal(find(view, (node) => node.children?.[0] === 'sectionsHint').length, 0)
  const button = find(view, (node) => node.type === 'button'
    && node.props?.['aria-label'] === 'info: sections')[0]
  assert.ok(button)
  const icon = button.children[0]
  assert.equal(icon.type, 'svg')
  assert.equal(icon.props.width, 12)
  button.props.onClick()
  view = ui.render()
  const panel = find(view, byClass('pl-info'))[0]
  assert.ok(panel)
  assert.equal(panel.props.role, 'region')
  assert.ok(find(view, (node) => node.children?.[0] === 'sectionsHint').length)
})

test('the picker states each add target and confirms a model template at a broader scope', async () => {
  const ui = await mount(withTemplates)
  let view = ui.render()
  templateTrigger(view).props.onClick()
  view = ui.render()
  assert.ok(find(view, (node) => node.children?.[0] === 'templateScopeShort').length)
  assert.ok(find(view, (node) => node.children?.[0] === 'templateAddTarget').length)
  const scopeInfo = find(view, (node) => node.type === 'button'
    && node.props?.['aria-label'] === 'info: templateScopeLabel')[0]
  assert.ok(scopeInfo)
  scopeInfo.props.onClick()
  view = ui.render()
  assert.ok(find(view, (node) => node.children?.[0] === 'templateScopeWarning').length)
  assert.ok(find(view, (node) => node.children?.[0] === 'templateScopeSteps').length)

  const adds = find(view, (node) => node.type === 'button'
    && node.children?.includes?.('templateAdd'))
  assert.equal(adds.length, 2)
  adds[1].props.onClick()
  view = ui.render()
  const confirm = find(view, byClass('pl-templateConfirm'))[0]
  assert.ok(confirm)
  assert.ok(find(view, (node) => node.children?.[0] === 'templateModelConfirm').length)
  assert.ok(find(view, (node) => node.type === 'button'
    && node.children?.includes?.('templateModelConfirmAdd')).length)
  assert.ok(find(view, (node) => node.type === 'button'
    && node.children?.includes?.('templateScopeSettings')).length)
  assert.equal(find(view, (node) => node.props?.className === 'pl-tag'
    && node.children?.[0] === 'templateAdded').length, 0)

  find(view, (node) => node.type === 'button'
    && node.children?.includes?.('templateModelConfirmAdd'))[0].props.onClick()
  view = ui.render()
  assert.equal(find(view, (node) => node.props?.className === 'pl-tag'
    && node.children?.[0] === 'templateAdded').length, 1)
  assert.equal(find(view, byClass('pl-templateConfirm')).length, 0)
})

test('a model-recommended template section warns at a broader scope', async () => {
  const modelSection = {
    ...withTemplates,
    sections: [{
      ...savedLocal.sections[0],
      id: 'custom:flash-execution-core',
      content: 'Flash execution body',
    }],
  }
  const ui = await mount(modelSection)
  let view = ui.render()
  rowOpen(view).props.onClick()
  view = ui.render()
  assert.ok(find(view, (node) => node.props?.className === 'pl-rowWarning').length)
  assert.ok(find(view, (node) => node.children?.[0] === 'sectionModelRecommendedShort').length)
  assert.equal(find(view, (node) => node.children?.[0] === 'sectionModelRecommended').length, 0)
  const rowInfo = find(view, (node) => node.type === 'button'
    && node.props?.['aria-label'] === 'info: sectionScopeInfo')[0]
  assert.ok(rowInfo)
  rowInfo.props.onClick()
  view = ui.render()
  assert.ok(find(view, (node) => node.children?.[0] === 'sectionModelRecommended').length)
  assert.ok(find(view, (node) => node.children?.[0] === 'scopeSettings').length)

  templateTrigger(view).props.onClick()
  view = ui.render()
  const scopeButton = find(view, (node) => node.type === 'button'
    && node.children?.includes?.('templateScopeSettings'))[0]
  assert.ok(scopeButton)
  scopeButton.props.onClick()
  view = ui.render()
  assert.equal(dialog(view), undefined)
})

test('changing scope with a draft asks before discarding it', async () => {
  const scoped = {
    ...savedLocal,
    routes: [{ provider: 'p', model: 'm' }],
  }
  const ui = await mount(scoped)
  let view = ui.render()
  rowOpen(view).props.onClick()
  view = ui.render()
  textarea(view).props.onChange({ target: { value: 'Changed body' } })
  view = ui.render()
  const findScope = (current) => find(current, (node) => node.type === 'select'
    && node.props?.['aria-label'] === 'scope')[0]
  findScope(view).props.onChange({ target: { value: 'provider' } })
  view = ui.render()
  assert.ok(find(view, (node) => node.props?.className === 'pl-scopeConfirm').length)
  assert.equal(findScope(view).props.value, 'global', 'the scope is not changed before confirmation')
  find(view, (node) => node.type === 'button' && node.children?.includes?.('cancel'))[0].props.onClick()
  view = ui.render()
  assert.equal(find(view, (node) => node.props?.className === 'pl-scopeConfirm').length, 0)
  assert.equal(textarea(view).props.value, 'Changed body', 'cancel keeps the draft')

  findScope(view).props.onChange({ target: { value: 'provider' } })
  view = ui.render()
  find(view, (node) => node.type === 'button'
    && node.children?.includes?.('scopeSwitchConfirmAction'))[0].props.onClick()
  await new Promise(resolve => setImmediate(resolve))
  view = ui.render()
  assert.equal(findScope(view).props.value, 'provider')
  assert.equal(find(view, (node) => node.props?.className === 'pl-scopeConfirm').length, 0)
  assert.equal(saveButton(view).props.disabled, true, 'switching discards the draft')
})

test('a local override removes the override rather than the definition', async () => {
  const override = {
    ...savedLocal,
    sections: [{
      ...savedLocal.sections[0],
      chain: [
        { scope: 'global', file: 'global.yaml' },
        { scope: 'model', file: 'model.yaml' },
      ],
    }],
  }
  const ui = await mount(override)
  const icon = iconButtons(ui.render())[0]
  assert.equal(icon.props.title, 'remove')
  assert.equal(icon.props['aria-label'], 'remove: evidence-discipline')
})

test('the picker reports an empty catalogue instead of disabling the trigger', async () => {
  const ui = await mount(empty)
  let view = ui.render()
  assert.equal(templateTrigger(view).props.disabled, false)
  templateTrigger(view).props.onClick()
  view = ui.render()
  assert.ok(find(view, (node) => node.children?.[0] === 'templateNoTemplates').length)
  find(view, byClass('pl-primary'))[0].props.onClick()
  view = ui.render()
  assert.equal(dialog(view), undefined)
})

test('the template picker adds each row directly and keeps the picker open', async () => {
  const ui = await mount(withTemplates)
  let view = ui.render()
  assert.equal(dialog(view), undefined)
  assert.equal(templateTrigger(view).props['aria-haspopup'], 'dialog')
  templateTrigger(view).props.onClick()
  view = ui.render()
  assert.ok(dialog(view), 'the trigger opens the native dialog')
  assert.equal(dialog(view).props['aria-modal'], 'true')

  const add = templateAddButton(view)
  add.props.onClick()
  add.props.onClick()
  view = ui.render()
  assert.equal(find(view, byClass('pl-rowState')).length, 1, 'a repeated add is suppressed by sectionId')
  assert.equal(find(view, byClass('pl-rowState'))[0].children[0], 'newSection')
  assert.ok(find(view, (node) => node.children?.includes?.('templateAdded')).length > 0)
  assert.equal(saveButton(view).props.disabled, false, 'the added template is a staged edit')
  assert.ok(dialog(view), 'the picker stays open for the next template')
  const addButtons = find(view, (node) => node.type === 'button'
    && String(node.props?.className).includes('pl-button') && node.children.includes('templateAdd'))
  assert.equal(addButtons.length, 1, 'the added row no longer offers Add')

  find(view, byClass('pl-primary'))[0].props.onClick()
  view = ui.render()
  assert.equal(dialog(view), undefined)
  assert.equal(find(view, (node) => node.children?.[0] === 'templateAddedNotice').length, 1)
})

test('template titles and descriptions follow the active locale', async () => {
  const zh = await mount(withTemplates, { lang: 'zh' })
  let view = zh.render()
  templateTrigger(view).props.onClick()
  view = zh.render()
  assert.ok(find(view, (node) => node.children?.[0] === '证据纪律').length)
  assert.ok(find(view, (node) => node.children?.[0] === '证据诚实底线：中文说明。').length)

  const en = await mount(withTemplates, { lang: 'en' })
  view = en.render()
  templateTrigger(view).props.onClick()
  view = en.render()
  assert.ok(find(view, (node) => node.children?.[0] === 'Evidence discipline').length)
  assert.ok(find(view, (node) => node.children?.[0] === 'Evidence honesty baseline: English summary.').length)
})

test('the template picker previews the approved body and returns to the list', async () => {
  const ui = await mount(withTemplates)
  let view = ui.render()
  templateTrigger(view).props.onClick()
  view = ui.render()
  templatePreviewButton(view).props.onClick()
  view = ui.render()
  const body = find(view, (node) => node.type === 'pre' && node.props?.className === 'pl-previewBody')[0]
  assert.ok(body)
  assert.equal(body.children[0], 'Evidence discipline body')
  const back = find(view, (node) => node.type === 'button' && node.props?.className === 'pl-secondary')[0]
  assert.ok(back)
  back.props.onClick()
  view = ui.render()
  assert.equal(find(view, (node) => node.type === 'pre' && node.props?.className === 'pl-previewBody').length, 0)
  assert.ok(dialog(view), 'returning to the list keeps the picker open')
})

test('the picker warns when model-layer templates are added at a broader scope', async () => {
  const ui = await mount(withTemplates)
  let view = ui.render()
  templateTrigger(view).props.onClick()
  view = ui.render()
  const warning = find(view, (node) => node.children?.[0] === 'templateScopeShort')[0]
  assert.ok(warning)
  assert.equal(warning.props.role, 'note')
  assert.equal(find(view, (node) => node.children?.[0] === 'templateScopeWarning').length, 0)
  const templateInfo = find(view, (node) => node.type === 'button'
    && node.props?.['aria-label'] === 'info: templateScopeLabel')[0]
  assert.ok(templateInfo)
  templateInfo.props.onClick()
  view = ui.render()
  assert.ok(find(view, (node) => node.children?.[0] === 'templateScopeWarning').length)
  const modelTag = find(view, (node) => node.children?.includes?.('templateRecommendedModel'))[0]
  assert.equal(modelTag.props['data-tone'], 'warning')
  const globalTag = find(view, (node) => node.children?.includes?.('templateRecommendedGlobal'))[0]
  assert.equal(globalTag.props['data-tone'], 'outline')
  const pwshTag = find(view, (node) => node.children?.includes?.('templateNeedsPwsh'))[0]
  assert.equal(pwshTag.props['data-tone'], 'outline')
  assert.equal(pwshTag.props.title, undefined)
  assert.equal(find(view, (node) => node.type === 'button'
    && node.props?.['aria-label'] === 'info: templatePwshUnknown').length, 0)
  assert.ok(find(view, (node) => node.children?.includes?.('templateMainOnly')).length)
})

test('a template already present in the scope is not offered again', async () => {
  const ui = await mount(savedLocal)
  let view = ui.render()
  templateTrigger(view).props.onClick()
  view = ui.render()
  assert.equal(find(view, byClass('pl-templateRow')).length, 2)
  assert.ok(find(view, (node) => node.props?.className === 'pl-tag' && node.children?.[0] === 'templateAdded').length)
  const addButtons = find(view, (node) => node.type === 'button'
    && String(node.props?.className).includes('pl-button') && node.children.includes('templateAdd'))
  assert.equal(addButtons.length, 1, 'only the second template remains addable')
})

test('the client bundle stays free of Harness client packages and literal colors', () => {
  assert.equal(/@deepseek-ai\/dsh-client-/.test(code), false, 'no Harness client package dependency')
  const requires = [...code.matchAll(/require\(["']([^"']+)["']\)/g)].map((match) => match[1])
  assert.deepEqual(requires, ['react'])
  const start = code.indexOf('const css = `')
  const styles = code.slice(start, code.indexOf('`;', start))
  assert.equal(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/.test(styles), false, 'styles carry tokens, not literal colors')
})
