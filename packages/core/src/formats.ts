export type FormatFamily = 'image' | 'video' | 'audio' | 'document'
export type EngineName = 'sharp' | 'ffmpeg' | 'pdf' | 'office' | 'sips'

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
  | 'svg'
  | 'bmp'
  | 'ico'
  | 'tga'
  | 'ppm'
  | 'qoi'
  | 'exr'
  | 'avi'
  | 'opus'
  | 'doc'
  | 'docx'
  | 'odt'
  | 'rtf'
  | 'txt'
  | 'html'
  | 'xls'
  | 'xlsx'
  | 'ods'
  | 'csv'
  | 'ppt'
  | 'pptx'
  | 'odp'

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
  ['svg', 'image', ['.svg'], 'image/svg+xml', false, 'sharp'],
  ['bmp', 'image', ['.bmp'], 'image/bmp', true, 'ffmpeg'],
  ['ico', 'image', ['.ico'], 'image/x-icon', true, 'ffmpeg'],
  ['tga', 'image', ['.tga'], 'image/x-tga', true, 'ffmpeg'],
  ['ppm', 'image', ['.ppm'], 'image/x-portable-pixmap', true, 'ffmpeg'],
  ['qoi', 'image', ['.qoi'], 'image/qoi', true, 'ffmpeg'],
  ['exr', 'image', ['.exr'], 'image/x-exr', true, 'ffmpeg'],
  ['avi', 'video', ['.avi'], 'video/x-msvideo', true, 'ffmpeg'],
  ['opus', 'audio', ['.opus'], 'audio/opus', true, 'ffmpeg'],
  ['doc', 'document', ['.doc'], 'application/octet-stream', true, 'office'],
  ['docx', 'document', ['.docx'], 'application/octet-stream', true, 'office'],
  ['odt', 'document', ['.odt'], 'application/octet-stream', true, 'office'],
  ['rtf', 'document', ['.rtf'], 'application/octet-stream', true, 'office'],
  ['txt', 'document', ['.txt'], 'text/plain', true, 'office'],
  ['html', 'document', ['.html'], 'application/octet-stream', true, 'office'],
  ['xls', 'document', ['.xls'], 'application/octet-stream', true, 'office'],
  ['xlsx', 'document', ['.xlsx'], 'application/octet-stream', true, 'office'],
  ['ods', 'document', ['.ods'], 'application/octet-stream', true, 'office'],
  ['csv', 'document', ['.csv'], 'application/octet-stream', true, 'office'],
  ['ppt', 'document', ['.ppt'], 'application/octet-stream', true, 'office'],
  ['pptx', 'document', ['.pptx'], 'application/octet-stream', true, 'office'],
  ['odp', 'document', ['.odp'], 'application/octet-stream', true, 'office'],
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
  if (Object.hasOwn(FORMATS, key)) return key as SupportedFormat
  return EXTENSION_MAP.get(`.${key}`) ?? null
}

export function listReadyFormats(): FormatInfo[] {
  return Object.values(FORMATS).filter((f) => f.status === 'ready')
}

export { canConvert, directEngine } from './format-rules.ts'
