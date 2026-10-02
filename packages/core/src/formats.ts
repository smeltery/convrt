export type FormatFamily = 'image' | 'video' | 'audio' | 'document'
export type EngineName = 'sharp' | 'ffmpeg' | 'pdf'

export type SupportedFormat =
  | 'png'
  | 'jpeg'
  | 'jpg'
  | 'webp'
  | 'avif'
  | 'tiff'
  | 'gif'
  | 'heic'
  | 'heif'
  | 'mp4'
  | 'mov'
  | 'webm'
  | 'mkv'
  | 'mp3'
  | 'aac'
  | 'm4a'
  | 'wav'
  | 'flac'
  | 'ogg'
  | 'pdf'

export interface FormatInfo {
  id: SupportedFormat
  family: FormatFamily
  extensions: string[]
  mime: string
  engine: EngineName
  status: 'ready' | 'planned'
  encode: boolean
}

/** id, family, extensions, mime, encode, engine */
type Row = [
  SupportedFormat,
  FormatFamily,
  string[],
  string,
  boolean,
  EngineName,
]

const ROWS: Row[] = [
  ['png', 'image', ['.png'], 'image/png', true, 'sharp'],
  ['jpeg', 'image', ['.jpeg', '.jpg'], 'image/jpeg', true, 'sharp'],
  ['jpg', 'image', ['.jpg', '.jpeg'], 'image/jpeg', true, 'sharp'],
  ['webp', 'image', ['.webp'], 'image/webp', true, 'sharp'],
  ['avif', 'image', ['.avif'], 'image/avif', true, 'sharp'],
  ['tiff', 'image', ['.tiff', '.tif'], 'image/tiff', true, 'sharp'],
  ['gif', 'image', ['.gif'], 'image/gif', true, 'sharp'],
  ['heic', 'image', ['.heic'], 'image/heic', false, 'sharp'],
  ['heif', 'image', ['.heif'], 'image/heif', false, 'sharp'],
  ['mp4', 'video', ['.mp4'], 'video/mp4', true, 'ffmpeg'],
  ['mov', 'video', ['.mov'], 'video/quicktime', true, 'ffmpeg'],
  ['webm', 'video', ['.webm'], 'video/webm', true, 'ffmpeg'],
  ['mkv', 'video', ['.mkv'], 'video/x-matroska', true, 'ffmpeg'],
  ['mp3', 'audio', ['.mp3'], 'audio/mpeg', true, 'ffmpeg'],
  ['aac', 'audio', ['.aac'], 'audio/aac', true, 'ffmpeg'],
  ['m4a', 'audio', ['.m4a'], 'audio/mp4', true, 'ffmpeg'],
  ['wav', 'audio', ['.wav'], 'audio/wav', true, 'ffmpeg'],
  ['flac', 'audio', ['.flac'], 'audio/flac', true, 'ffmpeg'],
  ['ogg', 'audio', ['.ogg'], 'audio/ogg', true, 'ffmpeg'],
  ['pdf', 'document', ['.pdf'], 'application/pdf', true, 'pdf'],
]

export const FORMATS = Object.fromEntries(
  ROWS.map(([id, family, extensions, mime, encode, engine]) => [
    id,
    { id, family, extensions, mime, engine, status: 'ready', encode },
  ]),
) as Record<SupportedFormat, FormatInfo>

const EXTENSION_MAP = new Map<string, SupportedFormat>()
for (const format of Object.values(FORMATS)) {
  for (const ext of format.extensions) EXTENSION_MAP.set(ext, format.id)
}

export function formatFromPath(path: string): SupportedFormat | null {
  const dot = path.lastIndexOf('.')
  if (dot < 0) return null
  return EXTENSION_MAP.get(path.slice(dot).toLowerCase()) ?? null
}

export function normalizeFormat(input: string): SupportedFormat | null {
  const key = input.trim().toLowerCase().replace(/^\./, '')
  if (key in FORMATS) return key as SupportedFormat
  return EXTENSION_MAP.get(`.${key}`) ?? null
}

export function listReadyFormats(): FormatInfo[] {
  return Object.values(FORMATS).filter((f) => f.status === 'ready')
}

/** True when this pair is a supported offline conversion. */
export function canConvert(
  from: SupportedFormat,
  to: SupportedFormat,
): boolean {
  if (from === to) return false
  if (!FORMATS[to].encode) return false
  const a = FORMATS[from].family
  const b = FORMATS[to].family
  if (a === b) return true
  if (a === 'video' && (b === 'audio' || b === 'image')) return true
  if (a === 'document' && b === 'image') return true
  if (a === 'image' && to === 'pdf') return true
  return false
}
