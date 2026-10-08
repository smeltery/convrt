import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { ConvertOptions } from '@convrt/core'
import { JobJournal } from './journal.ts'
import { runWorker } from './worker-process.ts'

export interface Job {
  id: string
  owner: string
  dir: string
  status: 'queued' | 'running' | 'succeeded' | 'failed'
  createdAt: number
  expiresAt: number
  options: ConvertOptions
  error?: string
}

export class JobStore {
  private jobs = new Map<string, Job>()
  private active = 0
  private accepting = true
  private journal?: JobJournal
  private recovery: Promise<void> = Promise.resolve()
  constructor(
    private config: {
      concurrency: number
      capacity: number
      ttlMs: number
      timeoutMs: number
      dataDir?: string
    },
  ) {
    for (const value of [
      config.concurrency,
      config.capacity,
      config.ttlMs,
      config.timeoutMs,
    ]) {
      if (!Number.isSafeInteger(value) || value < 1)
        throw new Error('job limits must be positive integers')
    }
    if (config.dataDir) {
      this.journal = new JobJournal(config.dataDir)
      for (const job of this.journal.load(config.ttlMs))
        this.jobs.set(job.id, job)
      this.recovery = this.expire()
      this.recovery
        .then(() => this.pump())
        .catch(() => {
          console.error('convrt: job recovery failed')
        })
    }
  }
  get(id: string, owner: string) {
    const job = this.jobs.get(id)
    return job?.owner === owner && job.expiresAt > Date.now() ? job : undefined
  }
  async create(
    owner: string,
    extension: string,
    data: Uint8Array,
    controls: Omit<ConvertOptions, 'input' | 'output'>,
  ) {
    await this.recovery
    if (!this.accepting || this.jobs.size >= this.config.capacity)
      throw new Error('capacity')
    const id = crypto.randomUUID()
    // Reserve capacity before the first await so concurrent requests cannot bypass it.
    const job: Job = {
      id,
      owner,
      dir: '',
      status: 'queued',
      createdAt: Date.now(),
      expiresAt: Date.now() + this.config.ttlMs,
      options: { ...controls, input: '' },
    }
    this.jobs.set(id, job)
    try {
      job.dir = await mkdtemp(
        this.journal
          ? join(this.journal.files, 'job-')
          : join(tmpdir(), 'convrt-api-'),
      )
      job.options = {
        ...controls,
        input: join(job.dir, `input.${extension}`),
      }
      await Bun.write(job.options.input, data)
      job.options.output = join(job.dir, `output.${controls.to}`)
      this.journal?.save(job)
      this.pump()
      return job
    } catch (error) {
      this.jobs.delete(id)
      if (job.dir) await rm(job.dir, { recursive: true, force: true })
      throw error
    }
  }
  private pump() {
    if (!this.accepting) return
    for (const job of this.jobs.values()) {
      if (this.active >= this.config.concurrency) break
      if (
        job.status !== 'queued' ||
        !job.options.output ||
        job.expiresAt <= Date.now()
      )
        continue
      job.status = 'running'
      this.journal?.save(job)
      this.active++
      this.run(job)
        .catch(() => {
          console.error('convrt: job state could not be saved')
        })
        .finally(() => {
          this.active--
          this.pump()
        })
    }
  }
  private async run(job: Job) {
    try {
      const code = await runWorker(job, this.config.timeoutMs)
      job.status = code === 0 ? 'succeeded' : 'failed'
      if (code !== 0) job.error = 'conversion_failed'
    } catch {
      job.status = 'failed'
      job.error = 'conversion_failed'
    }
    job.expiresAt = Date.now() + this.config.ttlMs
    this.journal?.save(job)
  }
  async remove(job: Job) {
    if (job.status === 'running' || !job.dir) return false
    this.jobs.delete(job.id)
    try {
      await rm(job.dir, { recursive: true, force: true })
      this.journal?.remove(job.id)
    } catch (error) {
      this.jobs.set(job.id, job)
      throw error
    }
    return true
  }
  async expire() {
    for (const job of this.jobs.values())
      if (job.expiresAt <= Date.now()) await this.remove(job)
  }
  async close() {
    this.accepting = false
    await this.recovery
    while (this.active) await Bun.sleep(25)
    if (this.journal) this.journal.close()
    else for (const job of this.jobs.values()) await this.remove(job)
  }
}

export function publicJob(job: Job) {
  return {
    id: job.id,
    status: job.status,
    createdAt: new Date(job.createdAt).toISOString(),
    expiresAt: new Date(job.expiresAt).toISOString(),
    error: job.error,
    downloadUrl:
      job.status === 'succeeded' ? `/v1/jobs/${job.id}/download` : undefined,
  }
}
