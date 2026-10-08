import { afterAll, expect, test } from 'bun:test'
import { createApi } from './app.ts'

const key = 'test-key-with-at-least-thirty-two-characters'
const other = 'another-key-with-at-least-thirty-two-characters'
const api = createApi({ keys: [key, other], maxBytes: 4096, timeoutMs: 10000 })
const headers = { authorization: `Bearer ${key}` }
const png = Uint8Array.from(
  atob(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  ),
  (c) => c.charCodeAt(0),
)
afterAll(() => api.close())
const request = (path: string, init: RequestInit = {}) =>
  api.fetch(new Request(`http://localhost${path}`, { headers, ...init }))
function upload(options = '{}', bytes = png) {
  const form = new FormData()
  form.set('file', new File([bytes], '../../private.png'))
  form.set('to', 'webp')
  form.set('options', options)
  return request('/v1/jobs', { method: 'POST', body: form, headers })
}

test('requires authentication and never accepts client filesystem options', async () => {
  expect((await request('/v1/formats', { headers: {} })).status).toBe(401)
  expect((await upload('{"output":"/tmp/stolen"}')).status).toBe(400)
  expect((await upload('null')).status).toBe(400)
  expect((await upload('{"quality":0}')).status).toBe(400)
  expect((await upload('{}', new Uint8Array(5000))).status).toBe(413)
})

test('upload, poll, isolate ownership, download and delete', async () => {
  const response = await upload()
  expect(response.status).toBe(202)
  let job = (await response.json()) as { id: string; status: string }
  expect(JSON.stringify(job)).not.toContain('private')
  expect(
    (
      await request(`/v1/jobs/${job.id}`, {
        headers: { authorization: `Bearer ${other}` },
      })
    ).status,
  ).toBe(404)
  const deadline = Date.now() + 10000
  while (['queued', 'running'].includes(job.status) && Date.now() < deadline) {
    await Bun.sleep(50)
    job = (await (await request(`/v1/jobs/${job.id}`)).json()) as typeof job
  }
  expect(job.status).toBe('succeeded')
  const output = await request(`/v1/jobs/${job.id}/download`)
  expect(output.status).toBe(200)
  expect(
    new TextDecoder().decode((await output.arrayBuffer()).slice(0, 4)),
  ).toBe('RIFF')
  expect(
    (await request(`/v1/jobs/${job.id}`, { method: 'DELETE' })).status,
  ).toBe(204)
  expect((await request(`/v1/jobs/${job.id}`)).status).toBe(404)
}, 15000)
