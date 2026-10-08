import { createHash, timingSafeEqual } from 'node:crypto'
import { FORMATS } from '@convrt/core'
import { JobStore, publicJob } from './jobs.ts'
import { HttpError, readUpload } from './upload.ts'

export interface ApiConfig {
  keys: string[]
  maxBytes?: number
  concurrency?: number
  capacity?: number
  ttlMs?: number
  timeoutMs?: number
  dataDir?: string
}

export function createApi(config: ApiConfig) {
  if (!config.keys.length || config.keys.some((key) => key.length < 32))
    throw new Error('API keys must contain at least 32 characters')
  const hashes = config.keys.map((key) =>
    createHash('sha256').update(key).digest(),
  )
  const store = new JobStore({
    concurrency: config.concurrency ?? 2,
    capacity: config.capacity ?? 100,
    ttlMs: config.ttlMs ?? 3600000,
    timeoutMs: config.timeoutMs ?? 120000,
    dataDir: config.dataDir,
  })
  let uploads = 0
  const timer = setInterval(() => {
    store.expire().catch(() => {
      console.error('convrt: job cleanup failed')
    })
  }, 60000)
  timer.unref()
  async function fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname === '/health' && request.method === 'GET')
      return Response.json({ status: 'ok' })
    const bearer =
      request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1] ?? ''
    const hash = createHash('sha256').update(bearer).digest()
    if (!hashes.some((key) => timingSafeEqual(key, hash)))
      return Response.json({ error: 'unauthorized' }, { status: 401 })
    const owner = hash.toString('hex')
    try {
      if (url.pathname === '/v1/formats' && request.method === 'GET')
        return Response.json(Object.values(FORMATS))
      if (url.pathname === '/v1/jobs' && request.method === 'POST') {
        if (uploads >= 4)
          throw new HttpError(429, 'too many concurrent uploads')
        uploads++
        try {
          const input = await readUpload(
            request,
            config.maxBytes ?? 25 * 1024 * 1024,
          )
          const job = await store.create(
            owner,
            input.extension,
            input.data,
            input.controls,
          )
          return Response.json(publicJob(job), {
            status: 202,
            headers: { location: `/v1/jobs/${job.id}` },
          })
        } finally {
          uploads--
        }
      }
      const match = /^\/v1\/jobs\/([a-f0-9-]{36})(\/download)?$/.exec(
        url.pathname,
      )
      const job = match?.[1] ? store.get(match[1], owner) : undefined
      if (!job) throw new HttpError(404, 'not found')
      if (request.method === 'GET' && match?.[2]) {
        if (job.status !== 'succeeded')
          throw new HttpError(409, 'output not ready')
        return new Response(Bun.file(job.options.output ?? ''), {
          headers: {
            'content-type': 'application/octet-stream',
            'content-disposition': `attachment; filename="converted.${job.options.to}"`,
            'cache-control': 'no-store',
          },
        })
      }
      if (request.method === 'GET') return Response.json(publicJob(job))
      if (request.method === 'DELETE' && !match?.[2]) {
        if (!(await store.remove(job)))
          throw new HttpError(409, 'job is running')
        return new Response(null, { status: 204 })
      }
      throw new HttpError(405, 'method not allowed')
    } catch (error) {
      const status =
        error instanceof HttpError
          ? error.status
          : error instanceof Error && error.message === 'capacity'
            ? 429
            : 500
      return Response.json(
        {
          error:
            error instanceof HttpError
              ? error.message
              : status === 429
                ? 'job capacity reached'
                : 'internal error',
        },
        { status },
      )
    }
  }
  return {
    fetch,
    close: async () => {
      clearInterval(timer)
      await store.close()
    },
  }
}
