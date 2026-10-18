import { after, test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { ConfigurationFiles } from '../src/adapter/files.js'
import { createConfigurationParser } from '../src/core/configuration.js'
import { PromptLayersRuntime } from '../src/adapter/runtime.js'
import { PromptLayersApplication, loadTemplates } from '../src/adapter/application.js'

const BASE = resolve('../../tmp/prompt-layers-application-tests')
after(() => { rmSync(BASE, { recursive: true, force: true }) })

const parse = createConfigurationParser(JSON.parse(await readFile(new URL('../prompt-layers.schema.json', import.meta.url), 'utf8')))
const templates = await loadTemplates()
async function fixture() {
  await mkdir(BASE, { recursive: true })
  const root = await mkdtemp(`${BASE}/case-`)
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

test('the package version line is the reset 0.1.0', async () => {
  const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
  assert.equal(manifest.version, '0.1.0')
})

test('the package-root icon is exported and valid', async () => {
  const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
  assert.equal(manifest.exports['./icon'], './icon.svg')
  assert.ok(manifest.files.includes('icon.svg'))
  const icon = await readFile(new URL('../icon.svg', import.meta.url), 'utf8')
  assert.match(icon, /^<svg[\s>]/)
  assert.match(icon, /viewBox="0 0 64 64"/)
  assert.ok(!/<script\b/i.test(icon))
  assert.ok(Buffer.byteLength(icon) <= 256 * 1024)
  for (const locale of ['en', 'zh']) {
    const meta = JSON.parse(await readFile(new URL(`../locale/${locale}.json`, import.meta.url), 'utf8')).meta
    assert.ok(meta.title.trim())
    assert.ok(meta.description.trim())
  }
})

test('shipped template display metadata is bilingual and complete', () => {
  for (const template of templates) {
    for (const field of ['title', 'titleZh', 'description', 'descriptionEn']) {
      assert.equal(typeof template[field], 'string')
      assert.ok(template[field].trim(), `${template.id}: ${field}`)
    }
  }
})

test('the main coordination template is model-scoped and limited to the main Agent', () => {
  const template = templates.find((item) => item.sectionId === 'custom:flash-main-coordination')
  assert.ok(template)
  assert.equal(template.recommendedScope, 'model')
  assert.deepEqual(template.when, { agent: { role: 'main' } })
})

test('the PowerShell template defaults to the native tool anchor', async () => {
  const template = templates.find((item) => item.sectionId === 'custom:pwsh-guidance')
  assert.ok(template)
  assert.deepEqual(template.position, { after: 'tool:pwsh' })
  const { files, application, runtime } = await fixture()
  const before = await application.view()
  await application.execute({ action: 'import', templateIds: [template.id], targets: [{ scope: 'global' }], expectedRevision: before.revision })
  const after = await files.load()
  const section = after.documents[0].data.sections.find((item) => item.id === 'custom:pwsh-guidance')
  assert.ok(section)
  assert.deepEqual(section.position, { after: 'tool:pwsh' })
  assert.deepEqual(section.when, { tools: { powershell: true } })
  assert.equal(section.contentFile, 'content/pwsh-guidance.md')
  assert.equal(runtime.status.phase, 'active')
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

test('one commit writes every staged Section change under one revision fence', async () => {
  const { files, application, runtime } = await fixture()
  await application.execute({ action: 'import', templateIds: [templates[0].id], targets: [{ scope: 'global' }], expectedRevision: (await application.view()).revision })
  const target = { scope: 'global' }
  const start = await application.workspace(target)
  const committed = await application.execute({
    action: 'commit',
    target,
    expectedRevision: start.revision,
    changes: [
      { op: 'save', id: templates[0].sectionId, kind: 'custom', fields: { content: 'rewritten in one save', enabled: true } },
      { op: 'save', id: 'custom:second', kind: 'custom', fields: { content: 'second section' } },
      { op: 'remove', id: 'custom:absent-but-listed', kind: 'custom' },
    ],
  }).catch((error) => error)
  assert.match(committed.message, /No current-scope definition exists/)
  const document = await files.load()
  assert.equal(document.documents[0].data.sections.length, 1, 'a refused commit writes nothing')
  const after = await application.workspace(target)
  const applied = await application.execute({
    action: 'commit',
    target,
    expectedRevision: after.revision,
    changes: [
      { op: 'save', id: templates[0].sectionId, kind: 'custom', fields: { content: 'rewritten in one save', enabled: true } },
      { op: 'save', id: 'custom:second', kind: 'custom', fields: { content: 'second section' } },
    ],
  })
  assert.equal(applied.sections.filter((section) => section.local).length, 2)
  assert.equal(applied.sections.find((section) => section.id === 'custom:second').content, 'second section')
  await assert.rejects(() => application.execute({ action: 'commit', target, expectedRevision: after.revision, changes: [{ op: 'save', id: 'custom:third', kind: 'custom', fields: { content: 'stale' } }] }), /REVISION_CONFLICT/)
  runtime.dispose()
})
