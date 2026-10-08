import { ConvertError } from '../errors.ts'
import { FORMATS } from '../formats.ts'
import type { EngineOptions } from '../options.ts'

export async function convertWithFfmpeg(options: EngineOptions): Promise<void> {
  if (!Bun.which('ffmpeg'))
    throw new ConvertError('ffmpeg not found on PATH; install ffmpeg')
  const { input, output, to, quality } = options
  const args = ['-nostdin', '-v', 'error', '-y']
  if (options.start !== undefined) args.push('-ss', String(options.start))
  args.push('-protocol_whitelist', 'file,pipe', '-i', input)
  if (options.duration !== undefined) args.push('-t', String(options.duration))
  const family = FORMATS[to].family
  if (family !== 'audio') {
    if (options.width || options.height)
      args.push(
        '-vf',
        `scale=${options.width ?? -2}:${options.height ?? -2}:force_original_aspect_ratio=decrease`,
      )
    if (options.fps) args.push('-r', String(options.fps))
  }
  const crf = String(Math.round(51 - quality * 0.33))
  const audio: Record<string, string[]> = {
    mp3: ['libmp3lame', '-q:a', String(Math.round((100 - quality) * 0.09))],
    aac: ['aac', '-b:a', '192k'],
    m4a: ['aac', '-b:a', '192k'],
    wav: ['pcm_s16le'],
    flac: ['flac'],
    ogg: ['libvorbis', '-q:a', '5'],
    opus: ['libopus', '-b:a', '128k'],
  }
  if (family === 'audio') args.push('-vn', '-c:a', ...(audio[to] ?? []))
  else if (family === 'video') {
    if (to === 'webm')
      args.push(
        '-c:v',
        'libvpx-vp9',
        '-b:v',
        '0',
        '-crf',
        crf,
        '-c:a',
        'libopus',
      )
    else if (to === 'avi')
      args.push('-c:v', 'mpeg4', '-q:v', '3', '-c:a', 'libmp3lame')
    else
      args.push(
        '-c:v',
        'libx264',
        '-pix_fmt',
        'yuv420p',
        '-crf',
        crf,
        '-c:a',
        'aac',
      )
    if (options.mute) args.push('-an')
  } else if (family === 'image') {
    args.push('-frames:v', '1')
    if (to === 'ico')
      args.push('-vf', 'scale=256:256:force_original_aspect_ratio=decrease')
  } else throw new ConvertError(`ffmpeg cannot encode ${to}`)
  args.push(output)
  const child = Bun.spawn(['ffmpeg', ...args], {
    stdout: 'ignore',
    stderr: 'ignore',
  })
  if ((await child.exited) !== 0)
    throw new ConvertError(
      'ffmpeg conversion failed; check input and installed codecs',
    )
}
