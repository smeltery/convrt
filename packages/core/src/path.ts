import { basename, dirname, extname, join } from 'node:path'
import type { SupportedFormat } from './formats.ts'

const EXT: Partial<Record<SupportedFormat, string>> = {
  jpeg: '.jpg',
  jpg: '.jpg',
}

export function outputPathFor(
  input: string,
  to: SupportedFormat,
  explicit?: string,
) {
  if (explicit) return explicit
  const ext = EXT[to] ?? `.${to}`
  return join(dirname(input), `${basename(input, extname(input))}${ext}`)
}
