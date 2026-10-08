import { loadSharp } from './image-library.ts'
import { dirname, join } from 'node:path'
import type { EngineOptions } from '../options.ts'
import { ConvertError } from '../errors.ts'
import type { SupportedFormat } from '../formats.ts'
import { convertWithSharp } from './sharp.ts'

const IMAGE = new Set<SupportedFormat>([
  'png',
  'jpeg',
  'jpg',
  'webp',
  'avif',
  'tiff',
  'gif',
  'heic',
  'heif',
  'svg',
])

async function havePdftoppm() {
  return (await Bun.$`pdftoppm -v`.quiet().nothrow()).exitCode === 0
}

function tempBase(dir: string) {
  return join(dir, `.convrt-${process.pid}-${Date.now()}`)
}

async function pdfToImage(options: EngineOptions) {
  const { input, output, to } = options
  if (!(await havePdftoppm())) {
    throw new ConvertError('pdftoppm not found on PATH; install poppler')
  }
  const prefix = tempBase(dirname(output))
  const wantJpeg = to === 'jpeg' || to === 'jpg'
  const flag = wantJpeg ? '-jpeg' : '-png'
  const result =
    await Bun.$`pdftoppm ${flag} -r ${options.dpi ?? 150} -f ${options.page ?? 1} -l ${options.page ?? 1} -singlefile ${input} ${prefix}`
      .quiet()
      .nothrow()
  if (result.exitCode !== 0) {
    throw new ConvertError('pdftoppm failed to render PDF page')
  }
  const rendered = `${prefix}.${wantJpeg ? 'jpg' : 'png'}`
  if (!(await Bun.file(rendered).exists())) {
    throw new ConvertError('pdftoppm produced no page image')
  }
  await convertWithSharp({
    ...options,
    input: rendered,
    from: wantJpeg ? 'jpeg' : 'png',
  })
  await Bun.$`rm -f ${rendered}`.quiet().nothrow()
}

async function imageToPdf(options: EngineOptions) {
  const { input, output } = options
  const jpegPath = `${tempBase(dirname(output))}.jpg`
  await convertWithSharp({
    ...options,
    input,
    output: jpegPath,
    to: 'jpg',
  })
  const jpeg = new Uint8Array(await Bun.file(jpegPath).arrayBuffer())
  const meta = await (await loadSharp())(jpegPath).metadata()
  const width = meta.width ?? 1
  const height = meta.height ?? 1
  const enc = new TextEncoder()
  const pieces: Uint8Array[] = []
  let cursor = 0
  const w = (data: string | Uint8Array) => {
    const bytes = typeof data === 'string' ? enc.encode(data) : data
    const start = cursor
    pieces.push(bytes)
    cursor += bytes.byteLength
    return start
  }
  const starts: number[] = []
  w('%PDF-1.4\n')
  starts[1] = w('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n')
  starts[2] = w('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n')
  starts[3] = w(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Contents 4 0 R /Resources << /XObject << /Im0 5 0 R >> >> >>\nendobj\n`,
  )
  const stream = `q ${width} 0 0 ${height} 0 0 cm /Im0 Do Q`
  starts[4] = w(
    `4 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`,
  )
  starts[5] = w(
    `5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.byteLength} >>\nstream\n`,
  )
  w(jpeg)
  w('\nendstream\nendobj\n')
  const xrefPos = cursor
  let xref = 'xref\n0 6\n0000000000 65535 f \n'
  for (let i = 1; i <= 5; i += 1) {
    xref += `${String(starts[i]).padStart(10, '0')} 00000 n \n`
  }
  w(xref)
  w(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`)
  const merged = new Uint8Array(cursor)
  let o = 0
  for (const p of pieces) {
    merged.set(p, o)
    o += p.byteLength
  }
  await Bun.write(output, merged)
  await Bun.$`rm -f ${jpegPath}`.quiet().nothrow()
}

export async function convertWithPdf(options: EngineOptions): Promise<void> {
  if (options.from === 'pdf' && IMAGE.has(options.to)) {
    await pdfToImage(options)
    return
  }
  if (options.to === 'pdf' && IMAGE.has(options.from)) {
    await imageToPdf(options)
    return
  }
  throw new ConvertError(
    `pdf engine cannot convert ${options.from} → ${options.to}`,
  )
}
