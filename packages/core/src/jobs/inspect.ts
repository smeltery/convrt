import { readdir, stat } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { formatFromPath, type SupportedFormat } from '../formats.ts'
import { targetsFor } from '../routes.ts'

export async function inspectInputs(inputs: string[], recursive = false) {
  const formats = new Set<SupportedFormat>()
  const visited = new Set<string>()
  let count = 0
  let unsupported = false
  async function visit(input: string, explicit: boolean) {
    const path = resolve(input)
    if (visited.has(path)) return
    visited.add(path)
    const info = await stat(path)
    if (info.isDirectory()) {
      for (const entry of await readdir(path, { withFileTypes: true })) {
        if (entry.isSymbolicLink() || entry.name.startsWith('.convrt-'))
          continue
        if (entry.isDirectory() && !recursive) continue
        await visit(join(path, entry.name), false)
      }
    } else if (info.isFile()) {
      const format = formatFromPath(path)
      if (format) {
        formats.add(format)
        count++
      } else if (explicit) unsupported = true
    }
  }
  for (const input of inputs) await visit(input, true)
  const lists = await Promise.all(
    [...formats].map((format) => targetsFor(format)),
  )
  const targets = unsupported
    ? []
    : (lists[0]?.filter((target) =>
        lists.every((list) => list.includes(target)),
      ) ?? [])
  return { count, targets }
}
