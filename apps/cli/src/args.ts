import { parseArgs } from 'node:util'
import { ConvertError, PRESETS, type BatchOptions } from '@convrt/core'

export function parseConversion(args: string[]): BatchOptions {
  const { values, positionals } = parseArgs({
    args,
    allowPositionals: true,
    strict: true,
    options: {
      to: { type: 'string', short: 't' },
      out: { type: 'string', short: 'o' },
      'out-dir': { type: 'string' },
      quality: { type: 'string', short: 'q' },
      recursive: { type: 'boolean', short: 'r' },
      jobs: { type: 'string', short: 'j' },
      width: { type: 'string' },
      height: { type: 'string' },
      pages: { type: 'string' },
      dpi: { type: 'string' },
      fps: { type: 'string' },
      start: { type: 'string' },
      duration: { type: 'string' },
      mute: { type: 'boolean' },
      overwrite: { type: 'boolean' },
      preset: { type: 'string' },
    },
  })
  const preset = values.preset
    ? PRESETS[values.preset as keyof typeof PRESETS]
    : undefined
  if (values.preset && !preset)
    throw new ConvertError('unknown preset; run convrt presets')
  const to = values.to ?? preset?.to
  if (!to) throw new ConvertError('missing --to <format> or --preset <name>')
  const options: BatchOptions = {
    ...preset,
    inputs: positionals,
    to,
    output: values.out,
    outDir: values['out-dir'],
    recursive: values.recursive,
    pages: values.pages,
    mute: values.mute,
    overwrite: values.overwrite,
  }
  for (const key of [
    'quality',
    'width',
    'height',
    'jobs',
    'dpi',
    'fps',
    'start',
    'duration',
  ] as const) {
    if (values[key] !== undefined) options[key] = Number(values[key])
  }
  return options
}
