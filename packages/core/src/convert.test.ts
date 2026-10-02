import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { convert, ConvertError } from './convert.ts'
import { canConvert, formatFromPath, normalizeFormat } from './formats.ts'

const dir = mkdtempSync(join(tmpdir(), 'convrt-core-'))
const pngPath = join(dir, 'sample.png')
let sharpAvailable = false
let ffmpegAvailable = false
let popplerAvailable = false

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
  ffmpegAvailable =
    (await Bun.$`ffmpeg -version`.quiet().nothrow()).exitCode === 0
  popplerAvailable = (await Bun.$`pdftoppm -v`.quiet().nothrow()).exitCode === 0
})

afterAll(() => {
  rmSync(dir, { recursive: true, force: true })
})

describe('format helpers', () => {
  test('reads extension from path', () => {
    expect(formatFromPath('/tmp/miso.heic')).toBe('heic')
    expect(formatFromPath('/tmp/clip.mp4')).toBe('mp4')
    expect(formatFromPath('/tmp/doc.pdf')).toBe('pdf')
    expect(normalizeFormat('WEBP')).toBe('webp')
    expect(normalizeFormat('.mp3')).toBe('mp3')
  })

  test('canConvert across families', () => {
    expect(canConvert('png', 'webp')).toBe(true)
    expect(canConvert('mp4', 'mp3')).toBe(true)
    expect(canConvert('mp4', 'png')).toBe(true)
    expect(canConvert('png', 'pdf')).toBe(true)
    expect(canConvert('pdf', 'png')).toBe(true)
    expect(canConvert('png', 'mp3')).toBe(false)
    expect(canConvert('heic', 'heic')).toBe(false)
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
  })

  test('png to pdf via pdf engine', async () => {
    if (!sharpAvailable) return
    const out = join(dir, 'sample.pdf')
    const result = await convert({ input: pngPath, to: 'pdf', output: out })
    expect(result.to).toBe('pdf')
    expect(await Bun.file(out).exists()).toBe(true)
    expect(result.bytesOut).toBeGreaterThan(100)
  })

  test('pdf to png via poppler', async () => {
    if (!sharpAvailable || !popplerAvailable) return
    const pdf = join(dir, 'roundtrip.pdf')
    await convert({ input: pngPath, to: 'pdf', output: pdf })
    const out = join(dir, 'from-pdf.png')
    const result = await convert({ input: pdf, to: 'png', output: out })
    expect(result.from).toBe('pdf')
    expect(await Bun.file(out).exists()).toBe(true)
  })

  test('wav to mp3 via ffmpeg', async () => {
    if (!ffmpegAvailable) return
    const wav = join(dir, 'tone.wav')
    const gen =
      await Bun.$`ffmpeg -y -f lavfi -i sine=frequency=440:duration=0.2 -ar 22050 ${wav}`
        .quiet()
        .nothrow()
    if (gen.exitCode !== 0) return
    const out = join(dir, 'tone.mp3')
    const result = await convert({ input: wav, to: 'mp3', output: out })
    expect(result.to).toBe('mp3')
    expect(await Bun.file(out).exists()).toBe(true)
  })

  test('rejects missing input', async () => {
    await expect(
      convert({ input: join(dir, 'missing.png'), to: 'webp' }),
    ).rejects.toBeInstanceOf(ConvertError)
  })

  test('rejects impossible pair', async () => {
    if (!sharpAvailable) return
    await expect(convert({ input: pngPath, to: 'mp3' })).rejects.toBeInstanceOf(
      ConvertError,
    )
  })
})
