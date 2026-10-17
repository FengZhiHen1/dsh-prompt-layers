// runtime — owns immutable configuration snapshots and bounded observations.
// Boundary: model-specific activation requires a post-route assembly API.
import { createHash } from 'node:crypto'
import { validateDocuments, composeLayers } from '../core/layers.js'

const fingerprint = value => createHash('sha256').update(JSON.stringify(value)).digest('hex')
const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value)
    for (const nested of Object.values(value)) freeze(nested)
  }
  return value
}

/** Manage candidate activation without losing the previous valid snapshot. */
export class PromptLayersRuntime {
  constructor(files, { validateHost = () => undefined, now = () => new Date().toISOString() } = {}) {
    this.files = files
    this.validateHost = validateHost
    this.now = now
    this.snapshot = undefined
    this.status = { phase: 'native-fallback', reason: 'not-loaded', modelLayers: 'blocked-host-timing' }
    this.observations = []
    this.catalogs = new Map()
    this.disposed = false
    this.pending = undefined
  }

  /** Coalesce concurrent reload requests into one complete candidate read. */
  reload() {
    if (this.disposed) return Promise.resolve(this.status)
    if (this.pending) return this.pending
    this.pending = this.activate().finally(() => { this.pending = undefined })
    return this.pending
  }

  async activate() {
    let candidate
    try {
      candidate = await this.files.load()
      if (candidate.revision === this.status.candidateRevision && this.status.phase !== 'native-fallback') {
        await this.publish()
        return this.status
      }
      validateDocuments(candidate.documents)
      // Verified on DSH 0.2.0-rc.2 and 0.2.1-rc.2: no supported hook rebuilds Sections after routing.
      if (candidate.documents.some(document => document.data.scope !== 'global')) {
        throw new Error('HOST_ROUTE_TIMING: this host renders Sections before final request routing, so provider/model activation is blocked; configuration remains available for preview')
      }
      await this.validateHost(candidate.documents)
      for (const { sections, facts } of this.catalogs.values()) composeLayers(candidate.documents, sections, facts)
      if (this.disposed) return this.status
      this.snapshot = freeze({ documents: candidate.documents, revision: candidate.revision })
      this.status = {
        phase: candidate.documents.every(document => !(document.data.sections?.length || Object.keys(document.data.existing ?? {}).length)) ? 'empty' : 'active',
        candidateRevision: candidate.revision, activeRevision: candidate.revision,
        activatedAt: this.now(), modelLayers: 'blocked-host-timing',
      }
    } catch (error) {
      if (this.disposed) return this.status
      this.status = {
        phase: this.snapshot ? 'last-valid' : 'native-fallback',
        activeRevision: this.snapshot?.revision, candidateRevision: candidate?.revision,
        reason: error.message, modelLayers: 'blocked-host-timing',
      }
    }
    await this.publish()
    return this.status
  }

  /** Apply only the current complete snapshot to an observed host assembly. */
  assemble(assembly, facts) {
    const key = fingerprint(facts)
    // The last 64 observed scope/route combinations bound diagnostic memory.
    if (!this.catalogs.has(key) && this.catalogs.size >= 64) this.catalogs.delete(this.catalogs.keys().next().value)
    this.catalogs.set(key, { sections: assembly.sections.map(section => ({ ...section, managed: true })), facts })
    if (!this.snapshot || this.disposed) return assembly
    try {
      const result = composeLayers(this.snapshot.documents, this.catalogs.get(key).sections, facts)
      this.record({ phase: 'assembled-preview', revision: this.snapshot.revision, sectionIds: result.sections.map(section => section.name), facts, index: result.index })
      return { ...assembly, sections: result.sections }
    } catch (error) {
      this.record({ phase: 'not-applied', revision: this.snapshot.revision, reason: error.message, facts })
      return assembly
    }
  }

  /** Keep structure-only observations; prompt bodies never enter diagnostic files. */
  record(observation) {
    this.observations.push({ ...observation, at: this.now() })
    if (this.observations.length > 32) this.observations.shift()
  }

  /** Publish derived files without making them configuration inputs. */
  async publish() {
    if (!this.disposed) await this.files.generated(this.status, { observations: this.observations.map(({ index, sectionIds, phase, at }) => ({ index, sectionIds, phase, at })) })
  }

  /** Release memory and expose explicit plugin shutdown. */
  dispose() {
    this.disposed = true
    this.snapshot = undefined
    this.catalogs.clear()
    this.observations = []
    this.status = { phase: 'disabled', modelLayers: 'blocked-host-timing' }
  }
}
