#!/usr/bin/env bun
import {
  convertBatch,
  ConvertError,
  formatFromPath,
  listEngines,
  listReadyFormats,
  PRESETS,
  targetsFor,
} from '@convrt/core'
import { parseConversion } from './args.ts'

const USAGE = `convrt — convert files locally

Usage:
  convrt <files or directories...> --to <format> [options]
  convrt formats | engines | presets
  convrt targets <file> [--menu]

Options:
  -t, --to FORMAT       Target format
  -o, --out PATH        Single output file
      --out-dir DIR    Output directory (preserves directory structure)
  -r, --recursive      Include subdirectories
  -j, --jobs 1-32      Parallel jobs (default 1)
  -q, --quality 1-100  Output quality (default 82)
      --width N        Maximum image/video width
      --height N       Maximum image/video height
      --pages 1,3-5    PDF page selection (default first page)
      --dpi N          PDF rendering resolution (default 150)
      --fps N          Video frame rate
      --start SECONDS  Media start position
      --duration SEC   Media duration
      --mute           Remove video audio
      --preset NAME    web, thumbnail, video, audio
      --overwrite      Replace existing output files
  -h, --help           Show help

Conversions stay on this device. Cloud API use is separate and explicit.
`

async function main() {
  const args = Bun.argv.slice(2)
  try {
    if (!args.length || args.includes('--help') || args.includes('-h')) {
      process.stdout.write(USAGE)
      return
    }
    if (args[0] === 'formats' && args.length === 1) {
      for (const f of listReadyFormats())
        process.stdout.write(
          `${f.id.padEnd(8)} ${f.family.padEnd(10)} ${f.engine.padEnd(8)} ${f.encode ? 'read/write' : 'read only'}\n`,
        )
      return
    }
    if (args[0] === 'engines' && args.length === 1) {
      for (const engine of await listEngines())
        process.stdout.write(
          `${engine.name.padEnd(8)} ${engine.available ? 'available' : 'missing'} — ${engine.detail}\n`,
        )
      return
    }
    if (args[0] === 'presets' && args.length === 1) {
      for (const [name, preset] of Object.entries(PRESETS))
        process.stdout.write(`${name.padEnd(12)} ${JSON.stringify(preset)}\n`)
      return
    }
    if (args[0] === 'targets') {
      if (!args[1] || args.length > 3 || (args[2] && args[2] !== '--menu'))
        throw new ConvertError('usage: convrt targets <file> [--menu]')
      const from = formatFromPath(args[1])
      if (!from) throw new ConvertError('unsupported input format')
      process.stdout.write(`${(await targetsFor(from)).join('\n')}\n`)
      return
    }
    const result = await convertBatch(parseConversion(args))
    for (const item of result.results)
      process.stdout.write(`${item.input} → ${item.output}\n`)
    for (const error of result.errors)
      process.stderr.write(`convrt: ${error.message}\n`)
    if (result.errors.length) process.exitCode = 1
  } catch (error) {
    process.stderr.write(
      `convrt: ${error instanceof Error ? error.message : 'conversion failed'}\n`,
    )
    process.exitCode = 1
  }
}
await main()
