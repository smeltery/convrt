export type FormatFamily = 'image' | 'video' | 'audio' | 'document'

export type ImageFormat =
  | 'png'
  | 'jpeg'
  | 'jpg'
  | 'webp'
  | 'avif'
  | 'tiff'
  | 'gif'
  | 'heic'
  | 'heif'

export type SupportedFormat = ImageFormat

export interface FormatInfo {
  id: SupportedFormat
  family: FormatFamily
  extensions: string[]
  mime: string
  engine: 'sharp'
  status: 'ready' | 'planned'
  /** When false, the format can be decoded as input but not written. */
  encode: boolean
}

export const FORMATS: Record<SupportedFormat, FormatInfo> = {
  png: {
    id: 'png',
    family: 'image',
    extensions: ['.png'],
    mime: 'image/png',
    engine: 'sharp',
    status: 'ready',
    encode: true,
  },
  jpeg: {
    id: 'jpeg',
    family: 'image',
    extensions: ['.jpeg', '.jpg'],
    mime: 'image/jpeg',
    engine: 'sharp',
    status: 'ready',
    encode: true,
  },
  jpg: {
    id: 'jpg',
    family: 'image',
    extensions: ['.jpg', '.jpeg'],
    mime: 'image/jpeg',
    engine: 'sharp',
    status: 'ready',
    encode: true,
  },
  webp: {
    id: 'webp',
    family: 'image',
    extensions: ['.webp'],
    mime: 'image/webp',
    engine: 'sharp',
    status: 'ready',
    encode: true,
  },
  avif: {
    id: 'avif',
    family: 'image',
    extensions: ['.avif'],
    mime: 'image/avif',
    engine: 'sharp',
    status: 'ready',
    encode: true,
  },
  tiff: {
    id: 'tiff',
    family: 'image',
    extensions: ['.tiff', '.tif'],
    mime: 'image/tiff',
    engine: 'sharp',
    status: 'ready',
    encode: true,
  },
  gif: {
    id: 'gif',
    family: 'image',
    extensions: ['.gif'],
    mime: 'image/gif',
    engine: 'sharp',
    status: 'ready',
    encode: true,
  },
  heic: {
    id: 'heic',
    family: 'image',
    extensions: ['.heic'],
    mime: 'image/heic',
    engine: 'sharp',
    status: 'ready',
    encode: false,
  },
  heif: {
    id: 'heif',
    family: 'image',
    extensions: ['.heif'],
    mime: 'image/heif',
    engine: 'sharp',
    status: 'ready',
    encode: false,
  },
}

const EXTENSION_MAP = new Map<string, SupportedFormat>()
for (const format of Object.values(FORMATS)) {
  for (const ext of format.extensions) {
    EXTENSION_MAP.set(ext.toLowerCase(), format.id)
  }
}

export function formatFromPath(path: string): SupportedFormat | null {
  const lower = path.toLowerCase()
  const dot = lower.lastIndexOf('.')
  if (dot < 0) return null
  return EXTENSION_MAP.get(lower.slice(dot)) ?? null
}

export function normalizeFormat(input: string): SupportedFormat | null {
  const key = input.trim().toLowerCase().replace(/^\./, '')
  if (key in FORMATS) return key as SupportedFormat
  return EXTENSION_MAP.get(`.${key}`) ?? null
}

export function listReadyFormats(): FormatInfo[] {
  return Object.values(FORMATS).filter((f) => f.status === 'ready')
}

export function listEncodableFormats(): FormatInfo[] {
  return listReadyFormats().filter((f) => f.encode)
}
