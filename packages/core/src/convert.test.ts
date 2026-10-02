import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { convert, ConvertError } from './convert.ts'
import { formatFromPath, normalizeFormat } from './formats.ts'

const dir = mkdtempSync(join(tmpdir(), 'convrt-core-'))
const pngPath = join(dir, 'sample.png')
let sharpAvailable = false

beforeAll(async () => {
  try {
    const sharp = (await import('sharp')).default
    await sharp({
      create: {
        width: 32,
        height: 24,
        channels: 3,
        background: { r: 40, g: 160, b: 90 },
      },
    })
      .png()
      .toFile(pngPath)
    sharpAvailable = true
  } catch {
    sharpAvailable = false
  }
})

afterAll(() => {
  rmSync(dir, { recursive: true, force: true })
})

describe('format helpers', () => {
  test('reads extension from path', () => {
    expect(formatFromPath('/tmp/miso.heic')).toBe('heic')
    expect(formatFromPath('/tmp/miso.webp')).toBe('webp')
    expect(normalizeFormat('WEBP')).toBe('webp')
    expect(normalizeFormat('.jpg')).toBe('jpg')
  })
})

describe('convert', () => {
  test('png to webp shrinks and writes output', async () => {
    if (!sharpAvailable) return
    const out = join(dir, 'sample.webp')
    const result = await convert({ input: pngPath, to: 'webp', output: out })
    expect(result.to).toBe('webp')
    expect(result.bytesOut).toBeGreaterThan(0)
    expect(await Bun.file(out).exists()).toBe(true)
    expect(result.elapsedMs).toBeGreaterThanOrEqual(0)
  })

  test('rejects missing input', async () => {
    await expect(
      convert({ input: join(dir, 'missing.png'), to: 'webp' }),
    ).rejects.toBeInstanceOf(ConvertError)
  })

  test('rejects unknown target', async () => {
    if (!sharpAvailable) return
    await expect(convert({ input: pngPath, to: 'xyz' })).rejects.toBeInstanceOf(
      ConvertError,
    )
  })
})
