import { FORMATS, type SupportedFormat, type EngineName } from './formats.ts'

export const OFFICE_GROUPS = [
  ['doc', 'docx', 'odt', 'rtf', 'txt', 'html'],
  ['xls', 'xlsx', 'ods', 'csv'],
  ['ppt', 'pptx', 'odp'],
]

/** Direct engine edges; routing composes these without inventing conversions. */
export function directEngine(
  from: SupportedFormat,
  to: SupportedFormat,
): EngineName | null {
  if (from === to || !FORMATS[to].encode) return null
  const source = FORMATS[from]
  const target = FORMATS[to]
  if (source.engine === 'office') {
    return to === 'pdf' ||
      OFFICE_GROUPS.some((group) => group.includes(from) && group.includes(to))
      ? 'office'
      : null
  }
  if (from === 'pdf') return ['png', 'jpeg', 'jpg'].includes(to) ? 'pdf' : null
  if (source.family === 'image') {
    if (to === 'pdf' && source.engine === 'sharp') return 'pdf'
    if (target.family !== 'image') return null
    if (source.engine === 'sharp' && target.engine === 'sharp') return 'sharp'
    if (
      source.engine === 'ffmpeg' ||
      (['png', 'jpeg', 'jpg'].includes(from) && target.engine === 'ffmpeg')
    )
      return 'ffmpeg'
  }
  if (
    source.family === 'video' &&
    (target.family === 'video' ||
      target.family === 'audio' ||
      ['png', 'jpeg', 'jpg'].includes(to))
  )
    return 'ffmpeg'
  if (source.family === 'audio' && target.family === 'audio') return 'ffmpeg'
  return null
}

export function canConvert(
  from: SupportedFormat,
  to: SupportedFormat,
): boolean {
  if (from === to) return false
  let frontier: SupportedFormat[] = [from]
  const seen = new Set(frontier)
  for (let depth = 0; depth < 3; depth++) {
    const next: SupportedFormat[] = []
    for (const current of frontier) {
      for (const target of Object.keys(FORMATS) as SupportedFormat[]) {
        if (!directEngine(current, target) || seen.has(target)) continue
        if (target === to) return true
        seen.add(target)
        next.push(target)
      }
    }
    frontier = next
  }
  return false
}
