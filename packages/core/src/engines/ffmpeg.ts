import { ConvertError } from '../errors.ts'
import type { SupportedFormat } from '../formats.ts'

async function haveFfmpeg(): Promise<boolean> {
  const result = await Bun.$`ffmpeg -version`.quiet().nothrow()
  return result.exitCode === 0
}

function argsFor(
  input: string,
  output: string,
  to: SupportedFormat,
  quality: number,
): string[] {
  const crf = String(Math.round(51 - (quality / 100) * 33))
  const base = ['-y', '-i', input]
  switch (to) {
    case 'mp3':
      return [...base, '-vn', '-c:a', 'libmp3lame', '-q:a', '2', output]
    case 'aac':
    case 'm4a':
      return [...base, '-vn', '-c:a', 'aac', '-b:a', '192k', output]
    case 'wav':
      return [...base, '-vn', '-c:a', 'pcm_s16le', output]
    case 'flac':
      return [...base, '-vn', '-c:a', 'flac', output]
    case 'ogg':
      return [...base, '-vn', '-c:a', 'libvorbis', '-q:a', '5', output]
    case 'mp4':
      return [
        ...base,
        '-c:v',
        'libx264',
        '-pix_fmt',
        'yuv420p',
        '-crf',
        crf,
        '-c:a',
        'aac',
        output,
      ]
    case 'mov':
      return [
        ...base,
        '-c:v',
        'libx264',
        '-pix_fmt',
        'yuv420p',
        '-crf',
        crf,
        '-c:a',
        'aac',
        output,
      ]
    case 'webm':
      return [
        ...base,
        '-c:v',
        'libvpx-vp9',
        '-b:v',
        '0',
        '-crf',
        crf,
        '-c:a',
        'libopus',
        output,
      ]
    case 'mkv':
      return [
        ...base,
        '-c:v',
        'libx264',
        '-pix_fmt',
        'yuv420p',
        '-crf',
        crf,
        '-c:a',
        'aac',
        output,
      ]
    case 'png':
    case 'jpeg':
    case 'jpg':
    case 'webp':
      return [...base, '-frames:v', '1', output]
    default:
      throw new ConvertError(`ffmpeg cannot encode ${to}`)
  }
}

export async function convertWithFfmpeg(options: {
  input: string
  output: string
  to: SupportedFormat
  quality: number
}): Promise<void> {
  if (!(await haveFfmpeg())) {
    throw new ConvertError('ffmpeg not found on PATH; install ffmpeg')
  }
  const argv = argsFor(
    options.input,
    options.output,
    options.to,
    options.quality,
  )
  const result = await Bun.$`ffmpeg ${argv}`.quiet().nothrow()
  if (result.exitCode !== 0) {
    await Bun.$`rm -f ${options.output}`.quiet().nothrow()
    const err =
      result.stderr.toString().trim().split('\n').at(-1) ?? 'encode failed'
    throw new ConvertError(`ffmpeg failed: ${err}`)
  }
  if (!(await Bun.file(options.output).exists())) {
    throw new ConvertError('ffmpeg produced no output file')
  }
}
