export type FormatFamily = 'image' | 'video' | 'audio' | 'document'
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

export interface FormatInfo {
  id: SupportedFormat
  family: FormatFamily
  extensions: string[]
  mime: string
  engine: 'sharp'
  status: 'ready' | 'planned'
  encode: boolean
}

type Row = [SupportedFormat, string[], string, boolean]

const IMAGE: Row[] = [
  ['png', ['.png'], 'image/png', true],
  ['jpeg', ['.jpeg', '.jpg'], 'image/jpeg', true],
  ['jpg', ['.jpg', '.jpeg'], 'image/jpeg', true],
  ['webp', ['.webp'], 'image/webp', true],
  ['avif', ['.avif'], 'image/avif', true],
  ['tiff', ['.tiff', '.tif'], 'image/tiff', true],
  ['gif', ['.gif'], 'image/gif', true],
  ['heic', ['.heic'], 'image/heic', false],
  ['heif', ['.heif'], 'image/heif', false],
]

export const FORMATS = Object.fromEntries(
  IMAGE.map(([id, extensions, mime, encode]) => [
    id,
    {
      id,
      family: 'image',
      extensions,
      mime,
      engine: 'sharp',
      status: 'ready',
      encode,
    },
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
