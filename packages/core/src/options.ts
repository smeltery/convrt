import { ConvertError } from './errors.ts'

export interface ConversionControls {
  quality?: number
  width?: number
  height?: number
  page?: number
  dpi?: number
  fps?: number
  start?: number
  duration?: number
  mute?: boolean
}

export interface EngineOptions extends ConversionControls {
  input: string
  output: string
  quality: number
  from: import('./formats.ts').SupportedFormat
  to: import('./formats.ts').SupportedFormat
}

export function validateControls(options: ConversionControls) {
  for (const [name, value, min, max, integer] of [
    ['quality', options.quality, 1, 100, true],
    ['width', options.width, 1, 16384, true],
    ['height', options.height, 1, 16384, true],
    ['page', options.page, 1, 100000, true],
    ['dpi', options.dpi, 1, 1200, true],
    ['fps', options.fps, 1, 240, false],
    ['start', options.start, 0, 864000, false],
    ['duration', options.duration, 0.001, 864000, false],
  ] as const) {
    if (
      value !== undefined &&
      (!Number.isFinite(value) ||
        value < min ||
        value > max ||
        (integer && !Number.isInteger(value)))
    ) {
      throw new ConvertError(
        `${name} must be ${integer ? 'an integer' : 'a number'} between ${min} and ${max}`,
      )
    }
  }
}

export const PRESETS = {
  web: { to: 'webp', quality: 80, width: 1920 },
  thumbnail: { to: 'jpeg', quality: 75, width: 320, height: 320 },
  video: { to: 'mp4', quality: 75, width: 1920 },
  audio: { to: 'mp3', quality: 82 },
} as const
