#!/usr/bin/env bun
import { convert, ConvertError, listReadyFormats } from '@convrt/core'

const USAGE = `convrt — convert files locally

Usage:
  convrt <input> --to <format> [--out <path>] [--quality <1-100>]
  convrt formats
  convrt --help
`

function take(args: string[], flag: string, short: string) {
  const i = args.findIndex((a) => a === flag || a === short)
  if (i < 0) return undefined
  const value = args[i + 1]
  args.splice(i, 2)
  return value
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(2)} MB`
}

async function main() {
  const args = Bun.argv.slice(2)
  try {
    if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
      process.stdout.write(USAGE)
      return
    }
    if (args[0] === 'formats') {
      for (const f of listReadyFormats()) {
        process.stdout.write(
          `${f.id.padEnd(8)} ${f.family.padEnd(10)} ${f.extensions.join(', ')}\n`,
        )
      }
      return
    }

    const to = take(args, '--to', '-t')
    const output = take(args, '--out', '-o')
    const qualityRaw = take(args, '--quality', '-q')
    const input = args.shift()
    if (!input || input.startsWith('-'))
      throw new ConvertError('missing input path')
    if (!to) throw new ConvertError('missing --to <format>')
    if (args.length) throw new ConvertError(`unknown argument: ${args[0]}`)

    const result = await convert({
      input,
      to,
      output,
      quality: qualityRaw ? Number(qualityRaw) : undefined,
    })
    process.stdout.write(
      `${result.input} → ${result.output}\n` +
        `${formatBytes(result.bytesIn)} → ${formatBytes(result.bytesOut)} · ${(result.elapsedMs / 1000).toFixed(2)}s\n`,
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'unexpected conversion failure'
    process.stderr.write(`convrt: ${message}\n`)
    process.exitCode = 1
  }
}

await main()
