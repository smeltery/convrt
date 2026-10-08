import { listEngines } from './engines/availability.ts'
import {
  directEngine,
  FORMATS,
  type EngineName,
  type SupportedFormat,
} from './formats.ts'

export interface RouteStep {
  from: SupportedFormat
  to: SupportedFormat
  engine: EngineName
}

export async function findRoute(
  from: SupportedFormat,
  to: SupportedFormat,
): Promise<RouteStep[] | null> {
  if (from === to) return null
  const available = new Set(
    (await listEngines()).filter((e) => e.available).map((e) => e.name),
  )
  const queue: { format: SupportedFormat; steps: RouteStep[] }[] = [
    { format: from, steps: [] },
  ]
  const seen = new Set([from])
  for (const { format, steps } of queue) {
    if (steps.length === 3) continue
    for (const target of Object.keys(FORMATS) as SupportedFormat[]) {
      let engine = directEngine(format, target)
      if (
        ['heic', 'heif'].includes(format) &&
        target === 'png' &&
        available.has('sips')
      )
        engine = 'sips'
      if (
        ['heic', 'heif'].includes(format) &&
        available.has('sips') &&
        engine !== 'sips'
      )
        continue
      if (!engine || !available.has(engine) || seen.has(target)) continue
      if (format === 'pdf' && !Bun.which('pdftoppm')) continue
      const route = [...steps, { from: format, to: target, engine }]
      if (target === to) return route
      seen.add(target)
      queue.push({ format: target, steps: route })
    }
  }
  return null
}

export async function targetsFor(from: SupportedFormat) {
  const targets: SupportedFormat[] = []
  for (const to of Object.keys(FORMATS) as SupportedFormat[]) {
    if (await findRoute(from, to)) targets.push(to)
  }
  return targets
}
