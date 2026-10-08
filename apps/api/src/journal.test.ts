import { expect, test } from 'bun:test'
import { mkdtemp, rm, mkdir, readdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { JobJournal } from './journal.ts'
import { JobStore, type Job } from './jobs.ts'

const png = Uint8Array.from(
  atob(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  ),
  (c) => c.charCodeAt(0),
)

test('completed jobs survive restart and remain owner-scoped', async () => {
  const dataDir = await mkdtemp(join(tmpdir(), 'convrt-journal-test-'))
  const config = {
    dataDir,
    concurrency: 1,
    capacity: 2,
    ttlMs: 60000,
    timeoutMs: 10000,
  }
  let store = new JobStore(config)
  try {
    const job = await store.create('owner', 'png', png, { to: 'webp' })
    await store.close()
    store = new JobStore(config)
    expect(store.get(job.id, 'other')).toBeUndefined()
    expect(store.get(job.id, 'owner')?.status).toBe('succeeded')
    expect(await Bun.file(job.options.output ?? '').exists()).toBe(true)
    expect(await store.remove(job)).toBe(true)
    await store.close()
    store = new JobStore(config)
    expect(store.get(job.id, 'owner')).toBeUndefined()
  } finally {
    await store.close()
    await rm(dataDir, { recursive: true, force: true })
  }
}, 15000)

test('interrupted jobs fail explicitly and orphan uploads are cleaned', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'convrt-recovery-test-'))
  const journal = new JobJournal(dir)
  try {
    const retained = join(journal.files, 'job-retained')
    await mkdir(retained)
    await mkdir(join(journal.files, 'job-orphan'))
    const job: Job = {
      id: 'test',
      owner: 'owner',
      dir: retained,
      status: 'running',
      createdAt: Date.now(),
      expiresAt: Date.now() + 1000,
      options: { input: join(retained, 'input.png'), to: 'webp' },
    }
    journal.save(job)
    const restored = journal.load(60000)
    expect(restored[0]?.status).toBe('failed')
    expect(restored[0]?.error).toBe('conversion_interrupted')
    expect(await readdir(journal.files)).toEqual(['job-retained'])
  } finally {
    journal.close()
    await rm(dir, { recursive: true, force: true })
  }
})

test('queued work resumes and expired records do not consume capacity', async () => {
  const dataDir = await mkdtemp(join(tmpdir(), 'convrt-queued-test-'))
  const journal = new JobJournal(dataDir)
  const dir = join(journal.files, 'job-queued')
  await mkdir(dir)
  await Bun.write(join(dir, 'input.png'), png)
  const queued: Job = {
    id: 'queued',
    owner: 'owner',
    dir,
    status: 'queued',
    createdAt: Date.now(),
    expiresAt: Date.now() + 60000,
    options: {
      input: join(dir, 'input.png'),
      output: join(dir, 'output.webp'),
      to: 'webp',
    },
  }
  const expiredDir = join(journal.files, 'job-expired')
  await mkdir(expiredDir)
  journal.save({
    ...queued,
    id: 'expired',
    dir: expiredDir,
    status: 'failed',
    expiresAt: 0,
  })
  journal.save(queued)
  journal.close()
  const store = new JobStore({
    dataDir,
    concurrency: 1,
    capacity: 2,
    ttlMs: 60000,
    timeoutMs: 10000,
  })
  try {
    const fresh = await store.create('owner', 'png', png, { to: 'webp' })
    expect(fresh.id).toBeTruthy()
    const deadline = Date.now() + 10000
    while (
      store.get('queued', 'owner')?.status !== 'succeeded' &&
      Date.now() < deadline
    )
      await Bun.sleep(25)
    expect(store.get('queued', 'owner')?.status).toBe('succeeded')
    expect(await readdir(journal.files)).not.toContain('job-expired')
  } finally {
    await store.close()
    await rm(dataDir, { recursive: true, force: true })
  }
}, 15000)

test('two services cannot own the same job journal', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'convrt-exclusive-test-'))
  const journal = new JobJournal(directory)
  try {
    expect(() => new JobJournal(directory)).toThrow()
  } finally {
    journal.close()
    await rm(directory, { recursive: true, force: true })
  }
})
