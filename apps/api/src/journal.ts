import { Database } from 'bun:sqlite'
import { mkdirSync, readdirSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { Job } from './jobs.ts'

/** One API instance owns this directory; file bytes live outside the database. */
export class JobJournal {
  private db: Database
  readonly files: string
  constructor(directory: string) {
    directory = resolve(directory)
    mkdirSync(directory, { recursive: true, mode: 0o700 })
    this.files = join(directory, 'files')
    mkdirSync(this.files, { recursive: true, mode: 0o700 })
    this.db = new Database(join(directory, 'jobs.sqlite'), { create: true })
    try {
      this.db.exec(
        'PRAGMA busy_timeout=0; PRAGMA locking_mode=EXCLUSIVE; PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; CREATE TABLE IF NOT EXISTS jobs (id TEXT PRIMARY KEY, record TEXT NOT NULL)',
      )
      // Acquire the exclusive lock even when the schema already exists.
      this.db.exec('BEGIN EXCLUSIVE; COMMIT')
    } catch (error) {
      this.db.close()
      throw error
    }
  }
  load(ttlMs: number): Job[] {
    const jobs = this.db
      .query<{ record: string }, []>('SELECT record FROM jobs')
      .all()
      .map((row) => JSON.parse(row.record) as Job)
    const retained = new Set(jobs.map((job) => job.dir))
    for (const entry of readdirSync(this.files, { withFileTypes: true })) {
      const path = join(this.files, entry.name)
      if (
        entry.isDirectory() &&
        entry.name.startsWith('job-') &&
        !retained.has(path)
      )
        rmSync(path, { recursive: true, force: true })
    }
    for (const job of jobs) {
      if (job.status === 'running') {
        job.status = 'failed'
        job.error = 'conversion_interrupted'
        job.expiresAt = Date.now() + ttlMs
        this.save(job)
      }
    }
    return jobs
  }
  save(job: Job) {
    this.db
      .query('INSERT OR REPLACE INTO jobs (id, record) VALUES (?, ?)')
      .run(job.id, JSON.stringify(job))
  }
  remove(id: string) {
    this.db.query('DELETE FROM jobs WHERE id = ?').run(id)
  }
  close() {
    this.db.close()
  }
}
