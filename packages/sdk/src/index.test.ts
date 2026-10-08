import { expect, test } from 'bun:test'
import { Convrt } from './index.ts'

test('requires encrypted remote transport', () => {
  expect(
    () => new Convrt({ baseUrl: 'http://example.com', apiKey: 'key' }),
  ).toThrow('HTTPS')
  expect(
    () => new Convrt({ baseUrl: 'http://localhost:8787', apiKey: 'key' }),
  ).not.toThrow()
})

test('sends bearer authentication and multipart upload without following redirects', async () => {
  let seen = false
  const client = new Convrt({
    baseUrl: 'https://example.com',
    apiKey: 'key',
    fetch: (async (url, init) => {
      expect(String(url)).toBe('https://example.com/v1/jobs')
      expect(new Headers(init?.headers).get('authorization')).toBe('Bearer key')
      expect(init?.redirect).toBe('error')
      expect(init?.body).toBeInstanceOf(FormData)
      seen = true
      return Response.json({ id: 'job', status: 'queued' })
    }) as typeof fetch,
  })
  expect(
    (await client.createJob(new File(['data'], 'input.txt'), 'pdf')).id,
  ).toBe('job')
  expect(seen).toBe(true)
})
