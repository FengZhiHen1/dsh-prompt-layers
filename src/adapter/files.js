import { createHash, randomUUID } from 'node:crypto'
import { lstat, mkdir, opendir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { assertContentPath } from '../core/configuration.js'

const MAX_FILES = 256
const MAX_FILE_BYTES = 1024 * 1024
const MAX_TOTAL_BYTES = 4 * 1024 * 1024
const MAX_PENDING_SAVES = 32
const EMPTY_REVISION = hash('')

function hash(value) {
  return createHash('sha256').update(value).digest('hex')
}

function fail(message) {
  if (message === 'REVISION_CONFLICT') {
    const error = new Error(message)
    error.code = message
    throw error
  }
  throw new Error(message.startsWith('Configuration files:') ? message : `Configuration files: ${message}`)
}

function normalizeRelativePath(relativePath) {
  if (typeof relativePath !== 'string' || relativePath.includes('\\') || relativePath.startsWith('/')) {
    fail('Invalid configuration path')
  }
  if (relativePath === 'global.yaml') return relativePath
  if (/^(providers|models)\/[A-Za-z0-9_.-]+\.yaml$/.test(relativePath)) return relativePath
  try {
    assertContentPath(relativePath)
    return relativePath
  } catch {
    fail('Invalid configuration path')
  }
}

function safeError(error, relativePath) {
  if (error?.code === 'REVISION_CONFLICT') return error
  if (error?.message?.startsWith('Configuration files:')) return error
  const suffix = relativePath ? ` (${relativePath})` : ''
  return new Error(`Configuration files: filesystem operation failed${suffix}`)
}

/**
 * Read and revision-check the prompt-layers directory using only Node APIs.
 * Loads are limited to 256 files, 1 MiB per file, and 4 MiB total.
 */
export class ConfigurationFiles {
  #root
  #parseConfiguration
  #saveTail = Promise.resolve()
  #pendingSaves = 0

  /** Get the resolved trusted configuration root. */
  get root() {
    return this.#root
  }

  /**
   * @param {string} root - Trusted configuration directory.
   * @param {(text: string, path: string) => unknown} parseConfiguration - YAML parser and validator.
   */
  constructor(root, parseConfiguration) {
    if (typeof root !== 'string' || root.length === 0 || typeof parseConfiguration !== 'function') {
      throw new TypeError('ConfigurationFiles requires a root and parser')
    }
    this.#root = path.resolve(root)
    this.#parseConfiguration = parseConfiguration
  }

  /** Load one stable snapshot of the discovered YAML files and referenced Markdown. */
  async load() {
    try {
      const discovered = await this.#discover()
      if (discovered === null) return emptySnapshot()
      const allPaths = new Set(discovered)
      this.#checkBudget(allPaths.size, 0, 0)
      const initial = new Map()
      let totalBytes = 0
      for (const relativePath of [...allPaths].sort((left, right) => left.localeCompare(right))) {
        const entry = await this.#readEntry(relativePath)
        totalBytes += entry.bytes.length
        this.#checkBudget(allPaths.size, entry.bytes.length, totalBytes)
        initial.set(relativePath, entry)
      }

      const documents = []
      for (const relativePath of discovered.filter(item => item.endsWith('.yaml'))) {
        const entry = initial.get(relativePath)
        const data = await this.#parse(relativePath, entry.text)
        documents.push({ path: relativePath, data })
        for (const contentPath of collectContentPaths(data)) {
          const checkedPath = normalizeRelativePath(contentPath)
          if (!checkedPath.startsWith('content/')) fail('Invalid contentFile path')
          if (!initial.has(checkedPath)) {
            const contentEntry = await this.#readEntry(checkedPath)
            totalBytes += contentEntry.bytes.length
            allPaths.add(checkedPath)
            this.#checkBudget(allPaths.size, contentEntry.bytes.length, totalBytes)
            initial.set(checkedPath, contentEntry)
          }
          const content = initial.get(checkedPath).text
          attachContent(data, contentPath, content)
        }
      }

      const afterDiscovery = await this.#discover()
      const afterPaths = new Set(afterDiscovery ?? [])
      for (const document of documents) {
        for (const contentPath of collectContentPaths(document.data)) {
          afterPaths.add(normalizeRelativePath(contentPath))
        }
      }
      if (afterDiscovery === null || !samePaths([...allPaths].sort(), [...afterPaths].sort())) {
        fail('Configuration changed during snapshot read')
      }
      for (const [relativePath, entry] of initial) {
        const current = await this.#readEntry(relativePath)
        if (current.revision !== entry.revision || current.fingerprint !== entry.fingerprint) {
          fail('Configuration changed during snapshot read')
        }
      }
      const files = [...initial.entries()]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([filePath, entry]) => ({ path: filePath, text: entry.text, revision: entry.revision }))
      const revision = hash(files.map(file => `${file.path}\0${file.revision}`).join('\0'))
      return { documents, revision, files }
    } catch (error) {
      throw safeError(error)
    }
  }

  /** List readable authoritative configuration and content files without parsing YAML. */
  async listFiles() {
    try {
      const discovered = await this.#discover()
      if (discovered === null) return []
      const paths = new Set(discovered)
      await this.#discoverContentPaths(this.#absolute('content'), 'content', paths)
      if (paths.size > MAX_FILES) fail('Configuration files: total file limit is 256')
      const files = []
      let totalBytes = 0
      for (const relativePath of [...paths].sort((left, right) => left.localeCompare(right))) {
        const entry = await this.#readEntry(relativePath)
        totalBytes += entry.bytes.length
        this.#checkBudget(paths.size, entry.bytes.length, totalBytes)
        files.push({ path: relativePath, text: entry.text, revision: entry.revision })
      }
      return files
    } catch (error) {
      throw safeError(error)
    }
  }

  /** Read one allowed configuration or content file, returning its SHA-256 revision. */
  async read(relativePath) {
    const checkedPath = normalizeRelativePath(relativePath)
    try {
      if (!(await this.#ensureSafeRoot(false))) return undefined
      const entry = await this.#readOptional(checkedPath)
      if (entry === null) return undefined
      return { path: checkedPath, text: entry.text, revision: entry.revision }
    } catch (error) {
      throw safeError(error, checkedPath)
    }
  }

  /** Replace or create a file only when its current revision matches the caller's value. */
  async save(relativePath, text, expectedRevision) {
    const checkedPath = normalizeRelativePath(relativePath)
    if (typeof text !== 'string') fail('Configuration files: text must be a string')
    if (expectedRevision === undefined || (expectedRevision !== null && (typeof expectedRevision !== 'string' || !/^[a-f\d]{64}$/.test(expectedRevision)))) {
      fail('Configuration files: invalid expected revision')
    }
    const bytes = Buffer.from(text, 'utf8')
    if (bytes.length > MAX_FILE_BYTES) fail('Configuration files: file exceeds 1 MiB limit')
    return this.#enqueueSave(() => this.#save(checkedPath, bytes, expectedRevision))
  }

  /** Write generated status and index JSON without including them in load snapshots. */
  async generated(status, index) {
    const entries = [
      ['generated/status.json', status],
      ['generated/sections-index.json', index],
    ]
    return this.#enqueueSave(async () => {
      for (const [relativePath, value] of entries) {
        const text = `${JSON.stringify(value, null, 2)}\n`
        const bytes = Buffer.from(text, 'utf8')
        if (bytes.length > MAX_FILE_BYTES) fail('Configuration files: generated file exceeds 1 MiB limit')
        try {
          await this.#atomicWrite(relativePath, bytes)
        } catch (error) {
          throw safeError(error, relativePath)
        }
      }
    })
  }

  #enqueueSave(task) {
    if (this.#pendingSaves >= MAX_PENDING_SAVES) fail('Configuration files: save queue is full')
    this.#pendingSaves += 1
    const operation = this.#saveTail.then(task)
    // Consume only the queue tail; the original operation still rejects to its caller.
    this.#saveTail = operation.then(() => undefined, () => undefined)
    return operation.finally(() => {
      this.#pendingSaves -= 1
    })
  }

  async #save(relativePath, bytes, expectedRevision) {
    try {
      await this.#ensureSafeParent(relativePath, true)
      const current = await this.#readOptional(relativePath)
      if (expectedRevision === null) {
        if (current !== null) fail('REVISION_CONFLICT')
      } else if (current === null || current.revision !== expectedRevision) {
        fail('REVISION_CONFLICT')
      }
      await this.#checkSaveBudget(relativePath, bytes.length, current?.bytes.length ?? 0)
      await this.#atomicWrite(relativePath, bytes, expectedRevision)
      return { path: relativePath, text: bytes.toString('utf8'), revision: hash(bytes) }
    } catch (error) {
      throw safeError(error, relativePath)
    }
  }

  async #atomicWrite(relativePath, bytes, expectedRevision) {
    await this.#ensureSafeParent(relativePath, true)
    const destination = this.#absolute(relativePath)
    await this.#assertNoSymlink(destination, true)
    if (expectedRevision !== undefined) await this.#assertRevision(relativePath, expectedRevision)
    const temporary = `${destination}.tmp-${randomUUID()}`
    try {
      await writeFile(temporary, bytes, { flag: 'wx', mode: 0o600 })
      await this.#ensureSafeParent(relativePath, true)
      await this.#assertNoSymlink(destination, true)
      if (expectedRevision !== undefined) await this.#assertRevision(relativePath, expectedRevision)
      // External writers can still race between this final check and rename; portable Node APIs do not offer a compare-and-swap rename.
      await rename(temporary, destination)
    } catch (error) {
      await rm(temporary, { force: true }).catch(cleanupError => {
        throw safeError(cleanupError, relativePath)
      })
      throw error
    }
  }

  async #discover() {
    if (!(await this.#ensureSafeRoot(false))) return null
    const rootState = await this.#statOrMissing(this.#root)
    if (rootState === null) return null
    if (!rootState.isDirectory() || rootState.isSymbolicLink()) fail('Configuration root must be a real directory')
    const result = []
    const globalState = await this.#statOrMissing(this.#absolute('global.yaml'))
    if (globalState !== null) {
      if (!globalState.isFile() || globalState.isSymbolicLink()) fail('Configuration entry must be a regular file')
      result.push('global.yaml')
    }
    for (const directory of ['providers', 'models']) {
      const absoluteDirectory = this.#absolute(directory)
      const state = await this.#statOrMissing(absoluteDirectory)
      if (state === null) continue
      if (!state.isDirectory() || state.isSymbolicLink()) fail('Configuration directory must be a real directory')
      const directoryHandle = await opendir(absoluteDirectory)
      for await (const item of directoryHandle) {
        if (result.length >= MAX_FILES) fail('Configuration files: total file limit is 256')
        const name = item.name
        const entryPath = `${directory}/${name}`
        const entryState = await lstat(this.#absolute(entryPath))
        if (entryState.isSymbolicLink()) fail('Symbolic links are not supported')
        if (name.endsWith('.yaml')) {
          if (!entryState.isFile()) fail('Configuration entry must be a regular file')
          result.push(entryPath)
        } else if (entryState.isDirectory()) {
          fail('Nested configuration directories are not supported')
        }
      }
    }
    return result.sort((left, right) => left.localeCompare(right))
  }

  async #readEntry(relativePath) {
    const checkedPath = normalizeRelativePath(relativePath)
    await this.#ensureSafeParent(checkedPath)
    const absolute = this.#absolute(checkedPath)
    const before = await lstat(absolute)
    if (before.isSymbolicLink() || !before.isFile()) fail('Configuration entry must be a regular file')
    if (before.size > MAX_FILE_BYTES) fail('Configuration files: file exceeds 1 MiB limit')
    const bytes = await readFile(absolute)
    if (bytes.length > MAX_FILE_BYTES) fail('Configuration files: file exceeds 1 MiB limit')
    const text = decodeUtf8(bytes)
    const after = await lstat(absolute)
    if (after.isSymbolicLink() || !after.isFile()) fail('Configuration entry changed during read')
    const fingerprint = `${before.dev}:${before.ino}:${before.size}:${before.mtimeMs}:${after.dev}:${after.ino}:${after.size}:${after.mtimeMs}`
    return { bytes, text, revision: hash(bytes), fingerprint }
  }

  async #readOptional(relativePath) {
    try {
      if (!(await this.#ensureSafeParent(relativePath))) return null
      return await this.#readEntry(relativePath)
    } catch (error) {
      if (error?.code === 'ENOENT') return null
      throw error
    }
  }

  async #parse(relativePath, text) {
    try {
      return await this.#parseConfiguration(text, relativePath)
    } catch (error) {
      fail(`Configuration files: invalid configuration (${relativePath}): ${error.message}`)
    }
  }

  async #discoverContentPaths(absoluteDirectory, relativeDirectory, paths) {
    const state = await this.#statOrMissing(absoluteDirectory)
    if (state === null) return
    if (state.isSymbolicLink() || !state.isDirectory()) fail('Content directory must be a real directory')
    const directoryHandle = await opendir(absoluteDirectory)
    for await (const item of directoryHandle) {
      if (paths.size >= MAX_FILES && (item.isDirectory() || item.isFile() && item.name.endsWith('.md'))) {
        fail('Configuration files: total file limit is 256')
      }
      if (!item.isDirectory() && !item.isFile()) fail('Unsupported filesystem entry')
      const name = item.name
      const absolutePath = path.join(absoluteDirectory, name)
      const relativePath = `${relativeDirectory}/${name}`
      const entry = await lstat(absolutePath)
      if (entry.isSymbolicLink()) fail('Symbolic links are not supported')
      if (entry.isDirectory()) {
        await this.#discoverContentPaths(absolutePath, relativePath, paths)
      } else if (entry.isFile() && name.endsWith('.md')) {
        paths.add(normalizeRelativePath(relativePath))
      }
      if (paths.size > MAX_FILES) fail('Configuration files: total file limit is 256')
    }
  }

  async #ensureSafeParent(relativePath, create = false) {
    const rootExists = await this.#ensureSafeRoot(create)
    if (!rootExists) return false
    let current = this.#root
    const parts = relativePath.split('/')
    for (const part of parts.slice(0, -1)) {
      current = path.join(current, part)
      const state = await this.#statOrMissing(current)
      if (state === null) {
        if (!create) return false
        await mkdir(current)
        continue
      }
      if (state.isSymbolicLink() || !state.isDirectory()) fail('Symbolic links and non-directories are not supported')
    }
    return true
  }

  async #ensureSafeRoot(create) {
    const rootPath = this.#root
    const rootParts = path.parse(rootPath)
    const relative = path.relative(rootParts.root, rootPath)
    const directories = relative ? relative.split(path.sep) : []
    let current = rootParts.root
    for (let index = 0; index < directories.length; index += 1) {
      current = path.join(current, directories[index])
      const state = await this.#statOrMissing(current)
      if (state === null) {
        if (!create) return false
        await mkdir(current)
        const created = await lstat(current)
        if (created.isSymbolicLink() || !created.isDirectory()) fail('Configuration root must be a real directory')
      } else if (state.isSymbolicLink() || !state.isDirectory()) {
        fail('Configuration root ancestors must be real directories')
      }
    }
    return true
  }

  async #assertRevision(relativePath, expectedRevision) {
    const current = await this.#readOptional(relativePath)
    const matches = expectedRevision === null
      ? current === null
      : current !== null && current.revision === expectedRevision
    if (!matches) fail('REVISION_CONFLICT')
  }

  async #assertNoSymlink(absolute, allowMissing) {
    const state = await this.#statOrMissing(absolute)
    if (state === null && allowMissing) return
    if (state === null || state.isSymbolicLink() || !state.isFile()) fail('Configuration entry must be a regular file')
  }

  async #statOrMissing(absolute) {
    try {
      return await lstat(absolute)
    } catch (error) {
      if (error?.code === 'ENOENT') return null
      throw error
    }
  }

  #absolute(relativePath) {
    return path.join(this.#root, ...relativePath.split('/'))
  }

  async #checkSaveBudget(relativePath, incomingBytes, replacedBytes) {
    const files = await this.#discover()
    const currentPaths = files ?? []
    const allPaths = new Set(currentPaths)
    await this.#discoverContentPaths(this.#absolute('content'), 'content', allPaths)
    let totalBytes = 0
    for (const filePath of allPaths) {
      const entry = await this.#readOptional(filePath)
      if (entry !== null) totalBytes += entry.bytes.length
    }
    if (!allPaths.has(relativePath)) {
      allPaths.add(relativePath)
      if (replacedBytes > 0) totalBytes += replacedBytes
    }
    totalBytes = totalBytes - replacedBytes + incomingBytes
    this.#checkBudget(allPaths.size, incomingBytes, totalBytes)
  }

  #checkBudget(fileCount, fileBytes, totalBytes) {
    if (fileCount > MAX_FILES) fail('Configuration files: total file limit is 256')
    if (fileBytes > MAX_FILE_BYTES) fail('Configuration files: file limit is 1 MiB')
    if (totalBytes > MAX_TOTAL_BYTES) fail('Configuration files: total size limit is 4 MiB')
  }
}

function decodeUtf8(bytes) {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    fail('Configuration files: file is not valid UTF-8')
  }
}

function collectContentPaths(value, paths = new Set(), seen = new Set()) {
  if (value === null || typeof value !== 'object' || seen.has(value)) return paths
  seen.add(value)
  if (typeof value.contentFile === 'string') paths.add(value.contentFile)
  for (const child of Array.isArray(value) ? value : Object.values(value)) collectContentPaths(child, paths, seen)
  return paths
}

function attachContent(value, contentPath, content, seen = new Set()) {
  if (value === null || typeof value !== 'object' || seen.has(value)) return
  seen.add(value)
  if (value.contentFile === contentPath) value.content = content
  for (const child of Array.isArray(value) ? value : Object.values(value)) attachContent(child, contentPath, content, seen)
}

function samePaths(left, right) {
  return left.length === right.length && left.every((item, index) => item === right[index])
}

function emptySnapshot() {
  return { documents: [], revision: EMPTY_REVISION, files: [] }
}
