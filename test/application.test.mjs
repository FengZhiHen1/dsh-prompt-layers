import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { ConfigurationFiles } from '../src/adapter/files.js'
import { createConfigurationParser } from '../src/core/configuration.js'
import { PromptLayersRuntime } from '../src/adapter/runtime.js'
import { PromptLayersApplication, loadTemplates } from '../src/adapter/application.js'

const parse = createConfigurationParser(JSON.parse(await readFile(new URL('../prompt-layers.schema.json', import.meta.url), 'utf8')))
const templates = await loadTemplates()
async function fixture() {
  const base = resolve('../../tmp/prompt-layers-application-tests')
  await mkdir(base, { recursive: true })
  const root = await mkdtemp(`${base}/case-`)
  const files = new ConfigurationFiles(root, parse)
  const runtime = new PromptLayersRuntime(files)
  await runtime.reload()
  return { files, runtime, application: new PromptLayersApplication(files, runtime, parse, templates) }
}

test('package templates remain inert until explicit import and import uses ordinary Sections', async () => {
  const { files, application, runtime } = await fixture()
  const before = await application.view()
  assert.equal(before.files.length, 0)
  assert.equal(templates.length, 7)
  await application.execute({ action: 'import', templateIds: [templates[0].id], targets: [{ scope: 'global' }], expectedRevision: before.revision })
  const after = await files.load()
  assert.equal(after.documents[0].data.sections[0].content, templates[0].content)
  assert.equal(after.documents[0].data.sections[0].contentFile, `content/${templates[0].file}`)
  assert.equal(runtime.status.phase, 'active')
  await assert.rejects(() => application.execute({ action: 'import', templateIds: [templates[0].id], targets: [{ scope: 'global' }], expectedRevision: after.revision }), /already exists/)
  runtime.dispose()
})

test('stale import and conflicting user content are rejected before changing authority files', async () => {
  const { files, application, runtime } = await fixture()
  const before = await application.view()
  await files.save(`content/${templates[0].file}`, 'user edited', null)
  const edited = await application.view()
  await assert.rejects(() => application.execute({ action: 'import', templateIds: [templates[0].id], targets: [{ scope: 'global' }], expectedRevision: edited.revision }), /local content differs/)
  assert.equal(await files.read('global.yaml'), undefined)
  await files.save('global.yaml', 'apiVersion: prompt-layers/v1\nscope: global\n', null)
  await assert.rejects(() => application.execute({ action: 'import', templateIds: [templates[1].id], targets: [{ scope: 'global' }], expectedRevision: before.revision }), /REVISION_CONFLICT/)
  runtime.dispose()
})

test('scope override leaves global Markdown intact and removal restores inheritance', async () => {
  const { files, application, runtime } = await fixture()
  const initial = await application.view()
  await application.execute({ action: 'import', templateIds: [templates[0].id], targets: [{ scope: 'global' }], expectedRevision: initial.revision })
  const target = { scope: 'model', provider: 'route-a', model: 'model-x' }
  const inherited = await application.execute({ action: 'workspace', target })
  assert.equal(inherited.sections[0].local, false)
  const modified = await application.execute({ action: 'section-save', target, kind: 'custom', id: templates[0].sectionId, fields: { content: 'model-only guidance', enabled: false }, expectedRevision: inherited.revision })
  assert.equal(modified.sections[0].content, 'model-only guidance')
  assert.equal(modified.sections[0].enabled, false)
  assert.equal(modified.sections[0].chain.length, 2)
  assert.equal((await files.read(`content/${templates[0].file}`)).text, templates[0].content)
  const restored = await application.execute({ action: 'section-remove', target, kind: 'custom', id: templates[0].sectionId, expectedRevision: modified.revision })
  assert.equal(restored.sections[0].content, templates[0].content)
  assert.equal(restored.sections[0].local, false)
  await assert.rejects(() => application.execute({ action: 'section-save', target, kind: 'custom', id: 'custom:b', fields: { content: 'stale' }, expectedRevision: inherited.revision }), /REVISION_CONFLICT/)
  runtime.dispose()
})

test('managed native edits and explicit condition reset use the same validated YAML authority', async () => {
  const { application, runtime } = await fixture()
  runtime.assemble({ sections: [{ name: 'native:a', text: 'native' }], tools: [], contexts: [], variables: {} }, {})
  const target = { scope: 'global' }
  const start = await application.workspace(target)
  const changed = await application.execute({ action: 'section-save', target, kind: 'native', id: 'native:a', expectedRevision: start.revision, clearWhen: true, fields: { content: 'changed', allowManagedOverride: true } })
  assert.equal(changed.sections[0].content, 'changed')
  assert.deepEqual(changed.sections[0].when, {})
  const restored = await application.execute({ action: 'section-remove', target, kind: 'native', id: 'native:a', expectedRevision: changed.revision })
  assert.equal(restored.sections[0].content, 'native')
  runtime.dispose()
})

test('UI can recover invalid YAML using raw file reads while preserving native fallback', async () => {
  const { files, application, runtime } = await fixture()
  await writeFile(resolve(files.root, 'global.yaml'), 'scope: [broken')
  await runtime.reload()
  const view = await application.view()
  assert.equal(view.status.phase, 'last-valid')
  assert.equal(view.files[0].text, 'scope: [broken')
  assert.match(view.error, /global.yaml/)
  const repaired = await application.execute({ action: 'save', path: 'global.yaml', text: 'apiVersion: prompt-layers/v1\nscope: global\n', expectedRevision: view.files[0].revision })
  assert.equal(repaired.status.phase, 'empty')
  runtime.dispose()
})
