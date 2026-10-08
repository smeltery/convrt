import { Convrt } from '../../../packages/sdk/src/index.ts'

const apiKey = process.env.CONVRT_API_KEYS?.split(',')[0]
if (!apiKey) throw new Error('Set CONVRT_API_KEYS for the test service')
const client = new Convrt({
  baseUrl: process.env.CONVRT_API_URL ?? 'http://127.0.0.1:8787',
  apiKey,
})
const checkpoint = '.artifacts/api-smoke-job.json'
if (Bun.argv.includes('--verify-restart')) {
  const { id } = (await Bun.file(checkpoint).json()) as { id: string }
  if ((await client.getJob(id)).status !== 'succeeded')
    throw new Error('Completed job did not survive restart')
  const output = new Uint8Array(await (await client.download(id)).arrayBuffer())
  if (new TextDecoder().decode(output.slice(8, 12)) !== 'WEBP')
    throw new Error('Invalid retained output')
  await client.deleteJob(id)
  console.log('API restart, retained download, and deletion passed')
} else {
  const bytes = Uint8Array.from(
    atob(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    ),
    (c) => c.charCodeAt(0),
  )
  let job = await client.createJob(new File([bytes], 'sample.png'), 'webp')
  const deadline = Date.now() + 30000
  while (['queued', 'running'].includes(job.status) && Date.now() < deadline) {
    await Bun.sleep(100)
    job = await client.getJob(job.id)
  }
  if (job.status !== 'succeeded') throw new Error('HTTP conversion failed')
  await Bun.write(checkpoint, JSON.stringify({ id: job.id }))
  console.log('API upload and conversion passed')
}
