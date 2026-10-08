import { createApi } from './app.ts'

const api = createApi({
  keys: (process.env.CONVRT_API_KEYS ?? '').split(',').filter(Boolean),
  dataDir: process.env.CONVRT_DATA_DIR,
})
const server = Bun.serve({
  hostname: process.env.HOST ?? '127.0.0.1',
  port: Number(process.env.PORT ?? 8787),
  maxRequestBodySize: 25 * 1024 * 1024,
  idleTimeout: 30,
  fetch: api.fetch,
})
for (const signal of ['SIGINT', 'SIGTERM'] as const)
  process.on(signal, async () => {
    server.stop(true)
    await api.close()
    process.exit(0)
  })
