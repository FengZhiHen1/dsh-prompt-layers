import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { ConfigurationFiles } from '../src/adapter/files.js'

const repositoryRoot = path.resolve(import.meta.dirname, '..', '..', '..')
const fixtureBase = path.join(repositoryRoot, 'tmp', 'configuration-files-tests')
const yamlWithContent = /contentFile:\s*["']?([^"'\s]+)/

async function fixture(t, parser = parseYamlFixture) {
  await mkdir(fixtureBase, { recursive: true })
  const root = await mkdtemp(path.join(fixtureBase, 'case-'))
  t.after(async () => rm(root, { recursive: true, force: true }))
  return { root, files: new ConfigurationFiles(root, parser) }
}

function parseYamlFixture(text, filePath) {
  if (/\*[A-Za-z0-9_-]+/.test(text) || /&[A-Za-z0-9_-]+/.test(text)) {
    throw new Error(`Alias is not allowed in ${filePath}`)
  }
  const contentMatch = text.match(yamlWithContent)
  const data = { path: filePath }
  if (contentMatch) data.contentFile = contentMatch[1]
  return data
}

test('missing root loads as an empty snapshot', async t => {
  await mkdir(fixtureBase, { recursive: true })
  const root = await mkdtemp(path.join(fixtureBase, 'missing-'))
  await rm(root, { recursive: true, force: true })
  t.after(async () => rm(root, { recursive: true, force: true }))
  const files = new ConfigurationFiles(root, parseYamlFixture)
  assert.deepEqual(await files.load(), {
    documents: [],
    revision: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    files: [],
  })
})

test('loads discovered YAML and referenced content while excluding generated JSON', async t => {
  const { root, files } = await fixture(t)
  await mkdir(path.join(root, 'providers'))
  await mkdir(path.join(root, 'models'))
  await mkdir(path.join(root, 'content'))
  await mkdir(path.join(root, 'generated'))
  await writeFile(path.join(root, 'global.yaml'), 'scope: global\n', 'utf8')
  await writeFile(path.join(root, 'providers', 'service.yaml'), 'contentFile: content/guide.md\n', 'utf8')
  await writeFile(path.join(root, 'models', 'model.yaml'), 'scope: model\n', 'utf8')
  await writeFile(path.join(root, 'content', 'guide.md'), 'Exact body\n', 'utf8')
  await writeFile(path.join(root, 'generated', 'old.json'), '{"old":true}', 'utf8')

  const snapshot = await files.load()
  const provider = snapshot.documents.find(document => document.path === 'providers/service.yaml')
  assert.equal(provider.data.contentFile, 'content/guide.md')
  assert.equal(provider.data.content, 'Exact body\n')
  assert.deepEqual(snapshot.files.map(file => file.path), [
    'content/guide.md', 'global.yaml', 'models/model.yaml', 'providers/service.yaml',
  ])
  assert.equal(snapshot.files.find(file => file.path === 'content/guide.md').revision.length, 64)
})

test('unreferenced malformed Markdown does not block configuration loads', async t => {
  const { root, files } = await fixture(t)
  await mkdir(path.join(root, 'content'))
  await writeFile(path.join(root, 'global.yaml'), 'scope: global\\n', 'utf8')
  await writeFile(path.join(root, 'content', 'orphan.md'), Buffer.from([0xc3, 0x28]))

  const snapshot = await files.load()
  assert.deepEqual(snapshot.files.map(file => file.path), ['global.yaml'])
  await assert.rejects(files.listFiles(), /valid UTF-8/)
})

test('rejects malformed UTF-8 and parser-rejected YAML aliases', async t => {
  const first = await fixture(t)
  await writeFile(path.join(first.root, 'global.yaml'), Buffer.from([0xc3, 0x28]))
  await assert.rejects(first.files.load(), /valid UTF-8/)

  const second = await fixture(t)
  await writeFile(path.join(second.root, 'global.yaml'), 'shared: &value text\ncopy: *value\n', 'utf8')
  await assert.rejects(second.files.load(), /invalid configuration/)
})

test('rejects content path aliases and nested YAML directories', async t => {
  const { root, files } = await fixture(t)
  await mkdir(path.join(root, 'providers', 'nested'), { recursive: true })
  await writeFile(path.join(root, 'providers', 'nested', 'bad.yaml'), 'scope: provider\n', 'utf8')
  await assert.rejects(files.load(), /Nested configuration directories/)

  await rm(path.join(root, 'providers'), { recursive: true })
  await mkdir(path.join(root, 'providers'))
  await writeFile(path.join(root, 'providers', 'bad.yaml'), 'contentFile: content/../secret.md\n', 'utf8')
  await assert.rejects(files.load(), /Invalid configuration path/)
})

test('rejects symlinked configuration files and directories', async t => {
  const { root, files } = await fixture(t)
  const outside = path.join(root, '..', 'outside.yaml')
  await writeFile(outside, 'scope: global\n', 'utf8')
  try {
    await symlink(outside, path.join(root, 'global.yaml'))
  } catch (error) {
    if (['EPERM', 'EACCES', 'ENOTSUP'].includes(error.code)) {
      t.skip(`symlink creation unavailable: ${error.code}`)
      return
    }
    throw error
  }
  await assert.rejects(files.load(), /Symbolic links|regular file/)
  await rm(path.join(root, 'global.yaml'))
  await rm(outside)
  await symlink(path.dirname(outside), path.join(root, 'providers'), 'junction')
  await assert.rejects(files.load(), /real directory/)
})

test('rejects a symlinked ancestor of the configuration root', async t => {
  const { root, files } = await fixture(t)
  const realParent = path.join(root, 'real')
  const linkedParent = path.join(root, 'linked')
  await mkdir(path.join(realParent, 'config'), { recursive: true })
  try {
    await symlink(realParent, linkedParent, 'junction')
  } catch (error) {
    if (['EPERM', 'EACCES', 'ENOTSUP'].includes(error.code)) {
      t.skip(`symlink creation unavailable: ${error.code}`)
      return
    }
    throw error
  }
  const linkedRoot = new ConfigurationFiles(path.join(linkedParent, 'config'), parseYamlFixture)
  await assert.rejects(linkedRoot.load(), /ancestors must be real directories/)
  await assert.rejects(linkedRoot.save('global.yaml', 'scope: global\\n', null), /ancestors must be real directories/)
})

test('read and save enforce optimistic revisions and serialized writes', async t => {
  const { root, files } = await fixture(t)
  await mkdir(path.join(root, 'content'))
  const created = await files.save('content/new.md', 'first', null)
  assert.equal(created.revision, (await files.read('content/new.md')).revision)
  const read = await files.read('content/new.md')
  assert.equal(read.text, 'first')
  const updated = await files.save('content/new.md', 'second', read.revision)
  assert.equal(updated.text, 'second')
  await assert.rejects(files.save('content/new.md', 'stale', read.revision), error => error.code === 'REVISION_CONFLICT')

  const concurrent = await Promise.allSettled([
    files.save('global.yaml', 'one', null),
    files.save('global.yaml', 'two', null),
  ])
  assert.equal(concurrent.filter(result => result.status === 'fulfilled').length, 1)
  assert.equal(concurrent.filter(result => result.status === 'rejected').length, 1)
  assert.match(await readFile(path.join(root, 'global.yaml'), 'utf8'), /one|two/)
})

test('rejects invalid paths, symlink targets, and oversized content', async t => {
  const { root, files } = await fixture(t)
  assert.equal(await files.read('global.yaml'), undefined)
  assert.equal(files.root, root)
  await assert.rejects(files.save('global.yaml', 'no revision', undefined), /invalid expected revision/i)
  await assert.rejects(files.read('../outside'), /Invalid configuration path/)
  await assert.rejects(files.save('global.yaml/alias.yaml', 'x', null), /Invalid configuration path/)
  await mkdir(path.join(root, 'content'))
  const external = path.join(root, 'external.md')
  await writeFile(external, 'external', 'utf8')
  try {
    await symlink(external, path.join(root, 'content', 'linked.md'))
  } catch (error) {
    if (['EPERM', 'EACCES', 'ENOTSUP'].includes(error.code)) {
      t.skip(`symlink creation unavailable: ${error.code}`)
      return
    }
    throw error
  }
  await assert.rejects(files.read('content/linked.md'), /regular file/)
  await assert.rejects(files.save('content/large.md', 'x'.repeat(1024 * 1024 + 1), null), /1 MiB/)
})

test('rejects a changing configuration while assembling a snapshot', async t => {
  let changed = false
  const { root, files } = await fixture(t, async (text, filePath) => {
    if (!changed) {
      changed = true
      await writeFile(path.join(root, 'global.yaml'), `${text}# concurrent change\n`, 'utf8')
    }
    return parseYamlFixture(text, filePath)
  })
  await writeFile(path.join(root, 'global.yaml'), 'scope: global\n', 'utf8')
  await assert.rejects(files.load(), /changed during snapshot read/)
})

test('generated writes do not appear in configuration snapshots', async t => {
  const { root, files } = await fixture(t)
  await files.generated({ state: 'ok' }, { sections: [] })
  assert.deepEqual((await files.load()).files, [])
  assert.deepEqual(JSON.parse(await readFile(path.join(root, 'generated', 'status.json'), 'utf8')), { state: 'ok' })
  assert.deepEqual(JSON.parse(await readFile(path.join(root, 'generated', 'sections-index.json'), 'utf8')), { sections: [] })
})
