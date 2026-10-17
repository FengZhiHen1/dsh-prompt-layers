import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createConfigurationParser, assertContentPath } from '../src/core/configuration.js'

const schema = JSON.parse(await readFile(new URL('../prompt-layers.schema.json', import.meta.url), 'utf8'))
const parse = createConfigurationParser(schema)
const base = 'apiVersion: prompt-layers/v1\nscope: global\n'

test('strict YAML rejects ambiguous or executable constructs with file context', () => {
  for (const input of [
    `${base}scope: global\n`, `${base}sections: &x []\nexisting: *x\n`,
    `${base}sections: !!seq []\n`, `${base}existing: {<<: {}}\n`,
    `${base}1: wrong\n`, `${base}sections: !execute []\n`,
  ]) assert.throws(() => parse(input, 'global.yaml'), /global.yaml/)
})

test('scope and mutually exclusive text sources are enforced by the published schema', () => {
  for (const data of [
    { apiVersion: 'prompt-layers/v1', scope: 'global', provider: 'a' },
    { apiVersion: 'prompt-layers/v1', scope: 'provider' },
    { apiVersion: 'prompt-layers/v1', scope: 'model', provider: 'a' },
    { apiVersion: 'prompt-layers/v1', scope: 'global', unexpected: true },
    { apiVersion: 'prompt-layers/v1', scope: 'global', sections: [{ id: 'custom:a', content: 'x', contentFile: 'content/a.md' }] },
  ]) assert.throws(() => parse(JSON.stringify(data), 'bad.yaml'), /bad.yaml/)
})

test('Agent and trusted PowerShell conditions are explicit and reject unknown selectors', () => {
  const accepted = parse(`${base}sections:\n  - id: custom:a\n    content: '{{literal}}'\n    when:\n      agent:\n        presets: [cordis, custom-preset]\n        role: delegated\n      tools:\n        powershell: true\n`, 'global.yaml')
  assert.equal(accepted.sections[0].content, '{{literal}}')
  assert.throws(() => parse(`${base}sections:\n  - id: custom:a\n    content: x\n    when:\n      tools:\n        powershell: false\n`, 'global.yaml'))
})

test('content paths reject traversal, native separators, URLs and non-Markdown files', () => {
  for (const path of ['../x.md', 'content/../x.md', 'content/./x.md', 'content\\x.md', 'https://a/x.md', 'C:/x.md', 'content/a.js', 'content//x.md']) {
    assert.throws(() => assertContentPath(path), /contentFile/)
  }
  assert.equal(assertContentPath('content/group/a.md'), 'content/group/a.md')
})
