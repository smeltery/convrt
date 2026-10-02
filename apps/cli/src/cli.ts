#!/usr/bin/env bun
import { convert, ConvertError, listReadyFormats } from '@convrt/core'

function usage(): string {
  return `convrt — convert files locally

Usage:
  convrt <input> --to <format> [--out <path>] [--quality <1-100>]
  convrt formats
  convrt --help

Examples:
  convrt photo.heic --to webp
  convrt slide.png --to avif --quality 70
  convrt formats
`
}

function parseArgs(argv: string[]) {
  const args = [...argv]
  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    return { kind: 'help' as const }
  }
  if (args[0] === 'formats') {
    return { kind: 'formats' as const }
  }

  const input = args.shift()
  if (!input || input.startsWith('-')) {
    throw new ConvertError('missing input path')
  }

  let to: string | undefined
  let output: string | undefined
  let quality: number | undefined

  while (args.length > 0) {
    const flag = args.shift()
    if (flag === '--to' || flag === '-t') {
      to = args.shift()
      continue
    }
    if (flag === '--out' || flag === '-o') {
      output = args.shift()
      continue
    }
    if (flag === '--quality' || flag === '-q') {
      const raw = args.shift()
      quality = raw ? Number(raw) : undefined
      continue
    }
    throw new ConvertError(`unknown argument: ${flag}`)
  }

  if (!to) throw new ConvertError('missing --to <format>')
  return { kind: 'convert' as const, input, to, output, quality }
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(2)} MB`
}

async function main() {
  try {
    const parsed = parseArgs(Bun.argv.slice(2))
    if (parsed.kind === 'help') {
      process.stdout.write(usage())
      return
    }
    if (parsed.kind === 'formats') {
      for (const format of listReadyFormats()) {
        process.stdout.write(
          `${format.id.padEnd(8)} ${format.family.padEnd(10)} ${format.extensions.join(', ')}\n`,
        )
      }
      return
    }

    const result = await convert({
      input: parsed.input,
      to: parsed.to,
      output: parsed.output,
      quality: parsed.quality,
    })

    const seconds = (result.elapsedMs / 1000).toFixed(2)
    process.stdout.write(
      `${result.input} → ${result.output}\n` +
        `${formatBytes(result.bytesIn)} → ${formatBytes(result.bytesOut)} · ${seconds}s\n`,
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'unexpected conversion failure'
    process.stderr.write(`convrt: ${message}\n`)
    process.exitCode = 1
  }
}

await main()
