import { afterAll, beforeAll, expect, test } from 'bun:test'
import { link, mkdir, mkdtemp, readFile, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import sharp from 'sharp'
import {
  convert,
  convertBatch,
  findRoute,
  normalizeFormat,
  parsePages,
} from '../index.ts'

const dir = await mkdtemp(join(tmpdir(), 'convrt-features-'))
const png = join(dir, 'source.png')
beforeAll(async () => {
  await sharp({
    create: { width: 64, height: 48, channels: 3, background: '#348152' },
  })
    .png()
    .toFile(png)
}, 30000)
afterAll(() => rm(dir, { recursive: true, force: true }))

test('rejects invalid controls and inherited object keys', async () => {
  expect(normalizeFormat('constructor')).toBeNull()
  for (const quality of [NaN, Infinity, 0, 101, 1.2])
    await expect(convert({ input: png, to: 'webp', quality })).rejects.toThrow(
      'quality',
    )
  expect(() => parsePages('1,3-5')).not.toThrow()
  expect(parsePages('1,3-5,3')).toEqual([1, 3, 4, 5])
  for (const range of ['0', '4-2', '1-10001', 'all', '-1'])
    expect(() => parsePages(range)).toThrow()
})

test('resizes and preserves originals and existing outputs', async () => {
  const original = await readFile(png)
  const output = join(dir, 'resized.webp')
  await convert({ input: png, to: 'webp', output, width: 16 })
  expect((await sharp(output).metadata()).width).toBe(16)
  const before = await readFile(output)
  await expect(convert({ input: png, to: 'webp', output })).rejects.toThrow(
    'already exists',
  )
  expect(await readFile(output)).toEqual(before)
  await expect(
    convert({ input: png, to: 'webp', output: png, overwrite: true }),
  ).rejects.toThrow('differ')
  const alias = join(dir, 'input-alias.webp')
  await link(png, alias)
  await expect(
    convert({ input: png, to: 'webp', output: alias, overwrite: true }),
  ).rejects.toThrow('differ')
  expect(await readFile(png)).toEqual(original)
  expect((await readdir(dir)).some((name) => name.startsWith('.convrt-'))).toBe(
    false,
  )
})

test('batch recursion preserves relative paths and reports failed inputs', async () => {
  const root = join(dir, 'batch')
  const nested = join(root, 'nested')
  await mkdir(nested, { recursive: true })
  await Bun.write(join(root, 'a.png'), Bun.file(png))
  await Bun.write(join(nested, 'a.png'), Bun.file(png))
  await Bun.write(join(root, 'notes.unknown'), 'not an image')
  const result = await convertBatch({
    inputs: [root],
    to: 'webp',
    outDir: join(dir, 'batch-out'),
    recursive: true,
    jobs: 2,
  })
  expect(result.errors).toEqual([])
  expect(result.results).toHaveLength(2)
  expect(await Bun.file(join(dir, 'batch-out/nested/a.webp')).exists()).toBe(
    true,
  )
  const mixed = await convertBatch({
    inputs: [png, join(dir, 'missing.png')],
    to: 'webp',
    outDir: join(dir, 'mixed'),
  })
  expect(mixed.results).toHaveLength(1)
  expect(mixed.errors).toHaveLength(1)
})

test('SVG and all sharp output formats perform real conversions', async () => {
  const svg = join(dir, 'vector.svg')
  await Bun.write(
    svg,
    '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="24"><rect width="32" height="24" fill="red"/></svg>',
  )
  for (const to of ['png', 'jpeg', 'webp', 'avif', 'tiff', 'gif']) {
    const output = join(dir, `vector.${to}`)
    await convert({ input: svg, to, output })
    expect((await sharp(output).metadata()).width).toBe(32)
  }
}, 30000)

test.skipIf(!Bun.which('ffmpeg'))(
  'extended image formats and multi-step routing round-trip',
  async () => {
    for (const to of ['bmp', 'ico', 'tga', 'ppm', 'qoi', 'exr']) {
      const output = join(dir, `extended.${to}`)
      await convert({ input: png, to, output })
      const back = join(dir, `back-${to}.png`)
      await convert({ input: output, to: 'png', output: back })
      expect((await sharp(back).metadata()).width).toBeGreaterThan(0)
    }
    const avif = join(dir, 'route.avif')
    await convert({ input: png, to: 'avif', output: avif })
    const route = await findRoute('avif', 'bmp')
    expect(route?.length).toBe(2)
    await convert({ input: avif, to: 'bmp', output: join(dir, 'via.bmp') })
  },
  60000,
)

test.skipIf(!Bun.which('pdftoppm'))(
  'PDF page selection and bounds',
  async () => {
    const pdf = join(dir, 'page.pdf')
    await convert({ input: png, to: 'pdf', output: pdf })
    const result = await convertBatch({
      inputs: [pdf],
      to: 'png',
      pages: '1',
      outDir: join(dir, 'pages'),
      dpi: 72,
    })
    expect(result.errors).toEqual([])
    expect(result.results[0]?.output).toEndWith('page-page-1.png')
    await expect(
      convert({
        input: pdf,
        to: 'png',
        page: 2,
        output: join(dir, 'invalid-page.png'),
      }),
    ).rejects.toThrow()
  },
  30000,
)

test.skipIf(process.platform !== 'darwin')(
  'HEIC and HEIF decode with macOS sips',
  async () => {
    const heic = join(dir, 'mac.heic')
    const child = Bun.spawn(
      ['sips', '-s', 'format', 'heic', png, '--out', heic],
      { stdout: 'ignore', stderr: 'ignore' },
    )
    expect(await child.exited).toBe(0)
    const heif = join(dir, 'mac.heif')
    await Bun.write(heif, Bun.file(heic))
    for (const input of [heic, heif]) {
      const result = await convert({
        input,
        to: 'webp',
        output: `${input}.webp`,
      })
      expect((await sharp(result.output).metadata()).width).toBe(64)
    }
  },
  30000,
)
