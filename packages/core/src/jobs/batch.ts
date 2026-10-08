import { readdir, stat } from 'node:fs/promises'
import { basename, dirname, join, relative, resolve } from 'node:path'
import { convert, type ConvertOptions, type ConvertResult } from '../convert.ts'
import { ConvertError } from '../errors.ts'
import { canConvert, formatFromPath, normalizeFormat } from '../formats.ts'
import { outputPathFor } from '../path.ts'

export interface BatchOptions extends Omit<ConvertOptions, 'input'> {
  inputs: string[]
  recursive?: boolean
  outDir?: string
  jobs?: number
  pages?: string
}
export interface BatchResult {
  results: ConvertResult[]
  errors: { input: string; message: string }[]
}

export function parsePages(value?: string): number[] {
  if (!value) return [1]
  const pages = new Set<number>()
  for (const part of value.split(',')) {
    const match = /^(\d+)(?:-(\d+))?$/.exec(part)
    if (!match)
      throw new ConvertError('pages must be numbers or ranges, such as 1,3-5')
    const start = Number(match[1])
    const end = Number(match[2] ?? start)
    if (start < 1 || end < start || end > 10000)
      throw new ConvertError('invalid page range (maximum 10000)')
    for (let page = start; page <= end; page++) pages.add(page)
  }
  return [...pages].sort((a, b) => a - b)
}

export async function convertBatch(
  options: BatchOptions,
): Promise<BatchResult> {
  const jobs = options.jobs ?? 1
  if (!Number.isInteger(jobs) || jobs < 1 || jobs > 32)
    throw new ConvertError('jobs must be an integer between 1 and 32')
  if (!options.inputs.length) throw new ConvertError('missing input paths')
  const to = normalizeFormat(options.to)
  if (!to) throw new ConvertError('unsupported target format')
  const pages = parsePages(options.pages)
  const files = new Map<string, string>()
  const result: BatchResult = { results: [], errors: [] }
  async function collect(path: string, root: string, explicit: boolean) {
    const info = await stat(path)
    if (info.isDirectory()) {
      const entries = await readdir(path, { withFileTypes: true })
      for (const entry of entries.sort((a, b) =>
        a.name.localeCompare(b.name),
      )) {
        if (
          entry.isSymbolicLink() ||
          (entry.isDirectory() && !options.recursive)
        )
          continue
        if (entry.name.startsWith('.convrt-')) continue
        const child = join(path, entry.name)
        if (options.outDir && resolve(child) === resolve(options.outDir))
          continue
        await collect(child, root, false)
      }
    } else if (info.isFile()) {
      const from = formatFromPath(path)
      if (explicit || (from && to && canConvert(from, to)))
        files.set(path, root)
    }
  }
  for (const input of options.inputs) {
    const absolute = resolve(input)
    try {
      const info = await stat(absolute)
      await collect(
        absolute,
        info.isDirectory() ? absolute : dirname(absolute),
        true,
      )
    } catch {
      result.errors.push({ input, message: 'input cannot be read' })
    }
  }
  if (options.output && (files.size !== 1 || pages.length !== 1))
    throw new ConvertError(
      '--out requires a single file and page; use --out-dir',
    )
  if (options.output && options.outDir)
    throw new ConvertError('--out and --out-dir are mutually exclusive')
  const tasks: ConvertOptions[] = []
  const destinations = new Set<string>()
  for (const [input, root] of files) {
    const selected = formatFromPath(input) === 'pdf' ? pages : [1]
    if (options.pages && formatFromPath(input) !== 'pdf') {
      result.errors.push({ input, message: '--pages requires a PDF input' })
      continue
    }
    for (const page of selected) {
      let output = outputPathFor(input, to, options.output)
      if (options.outDir)
        output = join(
          resolve(options.outDir),
          relative(root, dirname(input)),
          basename(output),
        )
      if (options.pages && !options.output) {
        const dot = output.lastIndexOf('.')
        output = `${output.slice(0, dot)}-page-${page}${output.slice(dot)}`
      }
      if (destinations.has(output)) {
        result.errors.push({
          input,
          message: 'multiple inputs resolve to the same output',
        })
        continue
      }
      destinations.add(output)
      tasks.push({ ...options, input, output, page })
    }
  }
  let index = 0
  await Promise.all(
    Array.from({ length: Math.min(jobs, tasks.length) }, async () => {
      while (index < tasks.length) {
        const task = tasks[index++]
        if (!task) break
        try {
          result.results.push(await convert(task))
        } catch (error) {
          result.errors.push({
            input: task.input,
            message:
              error instanceof Error ? error.message : 'conversion failed',
          })
        }
      }
    }),
  )
  if (!files.size && !result.errors.length)
    result.errors.push({ input: '', message: 'no convertible files found' })
  return result
}
