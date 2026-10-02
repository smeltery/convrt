import { ConvertError } from './errors.ts'
import { convertWithFfmpeg } from './engines/ffmpeg.ts'
import { convertWithPdf } from './engines/pdf.ts'
import { convertWithSharp } from './engines/sharp.ts'
import {
  type SupportedFormat,
  FORMATS,
  canConvert,
  formatFromPath,
  normalizeFormat,
} from './formats.ts'
import { outputPathFor } from './path.ts'

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

export { ConvertError }

function pickEngine(from: SupportedFormat, to: SupportedFormat) {
  if (from === 'pdf' || to === 'pdf') return 'pdf' as const
  if (FORMATS[from].engine === 'ffmpeg' || FORMATS[to].engine === 'ffmpeg') {
    return 'ffmpeg' as const
  }
  return 'sharp' as const
}

export async function convert(options: ConvertOptions): Promise<ConvertResult> {
  const started = performance.now()
  const inputFile = Bun.file(options.input)
  if (!(await inputFile.exists())) {
    throw new ConvertError(`input not found: ${options.input}`)
  }

  const from = formatFromPath(options.input)
  if (!from) {
    throw new ConvertError(`unsupported input format for ${options.input}`)
  }

  const to = normalizeFormat(options.to)
  if (!to) throw new ConvertError(`unsupported target format: ${options.to}`)
  if (!canConvert(from, to)) {
    throw new ConvertError(`cannot convert ${from} → ${to}`)
  }

  const quality = options.quality ?? 82
  if (quality < 1 || quality > 100) {
    throw new ConvertError('quality must be between 1 and 100')
  }

  const output = outputPathFor(options.input, to, options.output)
  const engine = pickEngine(from, to)
  if (engine === 'pdf') {
    await convertWithPdf({ input: options.input, output, from, to, quality })
  } else if (engine === 'ffmpeg') {
    await convertWithFfmpeg({
      input: options.input,
      output,
      to,
      quality,
    })
  } else {
    await convertWithSharp({
      input: options.input,
      output,
      to,
      quality,
    })
  }

  const outFile = Bun.file(output)
  if (!(await outFile.exists())) {
    throw new ConvertError('conversion produced no output file')
  }

  return {
    input: options.input,
    output,
    from,
    to,
    bytesIn: inputFile.size,
    bytesOut: outFile.size,
    elapsedMs: Math.round((performance.now() - started) * 100) / 100,
  }
}
