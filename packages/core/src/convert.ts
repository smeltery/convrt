import { basename, dirname, extname, join } from 'node:path'
import sharp from 'sharp'
import {
  type SupportedFormat,
  FORMATS,
  formatFromPath,
  normalizeFormat,
} from './formats.ts'

export interface ConvertOptions {
  input: string
  to: string
  output?: string
  quality?: number
}

export interface ConvertResult {
  input: string
  output: string
  from: SupportedFormat
  to: SupportedFormat
  bytesIn: number
  bytesOut: number
  elapsedMs: number
}

export class ConvertError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConvertError'
  }
}

function outputPathFor(
  input: string,
  to: SupportedFormat,
  explicit?: string,
): string {
  if (explicit) return explicit
  const base = basename(input, extname(input))
  const ext = to === 'jpeg' || to === 'jpg' ? '.jpg' : `.${to}`
  return join(dirname(input), `${base}${ext}`)
}

async function encode(
  pipeline: sharp.Sharp,
  to: SupportedFormat,
  quality: number,
): Promise<Buffer> {
  switch (to) {
    case 'png':
      return pipeline.png().toBuffer()
    case 'jpeg':
    case 'jpg':
      return pipeline.jpeg({ quality, mozjpeg: true }).toBuffer()
    case 'webp':
      return pipeline.webp({ quality }).toBuffer()
    case 'avif':
      return pipeline.avif({ quality }).toBuffer()
    case 'tiff':
      return pipeline.tiff({ quality }).toBuffer()
    case 'gif':
      return pipeline.gif().toBuffer()
    case 'heic':
    case 'heif':
      throw new ConvertError(`${to} is decode-only`)
    default: {
      const _exhaustive: never = to
      throw new ConvertError(`unsupported output format: ${_exhaustive}`)
    }
  }
}

export async function convert(options: ConvertOptions): Promise<ConvertResult> {
  const started = performance.now()
  const inputFile = Bun.file(options.input)
  if (!(await inputFile.exists())) {
    throw new ConvertError(`input not found: ${options.input}`)
  }

  const from = formatFromPath(options.input)
  if (!from) {
    throw new ConvertError(
      `unsupported input format for ${options.input}; see docs/formats/`,
    )
  }

  const to = normalizeFormat(options.to)
  if (!to) {
    throw new ConvertError(`unsupported target format: ${options.to}`)
  }
  if (!FORMATS[to].encode) {
    throw new ConvertError(`${to} is decode-only; pick an encodeable format`)
  }

  const quality = options.quality ?? 82
  if (quality < 1 || quality > 100) {
    throw new ConvertError('quality must be between 1 and 100')
  }

  const bytesIn = inputFile.size
  const pipeline = sharp(options.input, { failOn: 'none' }).rotate()
  const buffer = await encode(pipeline, to, quality)
  const output = outputPathFor(options.input, to, options.output)
  await Bun.write(output, buffer)

  return {
    input: options.input,
    output,
    from,
    to,
    bytesIn,
    bytesOut: buffer.byteLength,
    elapsedMs: Math.round((performance.now() - started) * 100) / 100,
  }
}
