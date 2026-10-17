// configuration — strict YAML parsing and structural validation.
// Boundary: filesystem access belongs to the adapter.
import { parseDocument, isAlias, isMap, isScalar, visit } from 'yaml'
import Ajv2020 from 'ajv/dist/2020.js'

/** Build the validator from the same schema shipped to editors. */
export function createConfigurationParser(schema) {
  // Conditional scope requirements refer to properties declared on the parent schema.
  const validate = new Ajv2020({ allErrors: true, strict: true, strictRequired: false }).compile(schema)
  return (text, file) => {
    const document = parseDocument(text, { uniqueKeys: true, version: '1.2', strict: true })
    if (document.errors.length || document.warnings.length) {
      throw new Error(`${file}: ${[...document.errors, ...document.warnings].map(error => error.message).join('; ')}`)
    }
    visit(document, {
      Node(_key, node) {
        if (isAlias(node) || node.tag) throw new Error(`${file}: YAML aliases and explicit tags are not supported`)
        if (isMap(node)) for (const pair of node.items) {
          if (!isScalar(pair.key) || typeof pair.key.value !== 'string' || pair.key.value === '<<') {
            throw new Error(`${file}: mapping keys must be strings; merge keys are not supported`)
          }
        }
      },
    })
    const data = document.toJS({ maxAliasCount: 0 })
    if (!validate(data)) {
      throw new Error(`${file}: ${validate.errors.map(error => `${error.instancePath || '/'} ${error.message}`).join('; ')}`)
    }
    return data
  }
}

/** Reject unsupported content paths before touching the filesystem. */
export function assertContentPath(value) {
  if (typeof value !== 'string' || !/^content\/(?:[A-Za-z0-9_. -]+\/)*[A-Za-z0-9_. -]+\.md$/.test(value)
    || value.split('/').some(part => part === '..' || part === '.')) {
    throw new Error(`Invalid contentFile: expected a relative Markdown path inside content/`)
  }
  return value
}
