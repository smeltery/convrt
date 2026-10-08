import { rename, link, mkdir, mkdtemp, rm, stat } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { ConvertError } from './errors.ts'
import { convertWithFfmpeg } from './engines/ffmpeg.ts'
import { convertWithOffice } from './engines/office.ts'
import { convertWithPdf } from './engines/pdf.ts'
import { convertWithSharp } from './engines/sharp.ts'
import {
  formatFromPath,
  normalizeFormat,
  type SupportedFormat,
} from './formats.ts'
import { type ConversionControls, validateControls } from './options.ts'
import { outputPathFor } from './path.ts'
import { findRoute } from './routes.ts'

export interface ConvertOptions extends ConversionControls {
  input: string
  to: string
  output?: string
  overwrite?: boolean
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

export async function convert(options: ConvertOptions): Promise<ConvertResult> {
  validateControls(options)
  const started = performance.now()
  const input = resolve(options.input)
  const inputStat = await stat(input).catch(() => null)
  if (!inputStat?.isFile())
    throw new ConvertError('input is not a readable file')
  const from = formatFromPath(input)
  const to = normalizeFormat(options.to)
  if (!from || !to) throw new ConvertError('unsupported input or target format')
  const route = await findRoute(from, to)
  if (!route)
    throw new ConvertError(
      `cannot convert ${from} → ${to} with installed engines`,
    )
  const output = resolve(outputPathFor(input, to, options.output))
  const existingOutput = await stat(output).catch(() => null)
  if (
    input === output ||
    (existingOutput &&
      existingOutput.dev === inputStat.dev &&
      existingOutput.ino === inputStat.ino)
  )
    throw new ConvertError('output must differ from input')
  await mkdir(dirname(output), { recursive: true })
  const temp = await mkdtemp(join(dirname(output), '.convrt-'))
  let current = input
  try {
    for (const [index, step] of route.entries()) {
      const next = join(temp, `step-${index}.${step.to}`)
      const controls = {
        ...options,
        ...step,
        input: current,
        output: next,
        quality: options.quality ?? 82,
      }
      if (step.engine === 'sharp') await convertWithSharp(controls)
      else if (step.engine === 'ffmpeg') await convertWithFfmpeg(controls)
      else if (step.engine === 'pdf') await convertWithPdf(controls)
      else if (step.engine === 'office') await convertWithOffice(controls)
      else {
        const child = Bun.spawn(
          ['sips', '-s', 'format', 'png', current, '--out', next],
          { stdout: 'ignore', stderr: 'ignore' },
        )
        if ((await child.exited) !== 0)
          throw new ConvertError('macOS image decoding failed')
      }
      current = next
    }
    const resultStat = await stat(current)
    if (!resultStat.size)
      throw new ConvertError('conversion produced an empty file')
    // Exclusive publication prevents racing jobs from replacing an existing file.
    if (options.overwrite) await rename(current, output)
    else
      await link(current, output).catch(() => {
        throw new ConvertError(
          'output already exists or cannot be written; use --overwrite to replace it',
        )
      })
    return {
      input: options.input,
      output,
      from,
      to,
      bytesIn: inputStat.size,
      bytesOut: resultStat.size,
      elapsedMs: Math.round(performance.now() - started),
    }
  } finally {
    await rm(temp, { recursive: true, force: true })
  }
}
