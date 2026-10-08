import { afterAll, expect, test } from 'bun:test'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { convert } from '../index.ts'

const dir = await mkdtemp(join(tmpdir(), 'convrt-media-'))
afterAll(() => rm(dir, { recursive: true, force: true }))
test.skipIf(!Bun.which('ffmpeg'))(
  'video and audio target matrix and controls',
  async () => {
    const input = join(dir, 'input.mp4')
    const child = Bun.spawn(
      [
        'ffmpeg',
        '-v',
        'error',
        '-f',
        'lavfi',
        '-i',
        'color=c=red:s=64x48:d=0.3',
        '-f',
        'lavfi',
        '-i',
        'sine=frequency=440:duration=0.3',
        '-c:v',
        'libx264',
        '-c:a',
        'aac',
        '-shortest',
        input,
      ],
      { stdout: 'ignore', stderr: 'ignore' },
    )
    expect(await child.exited).toBe(0)
    for (const to of [
      'mov',
      'webm',
      'mkv',
      'avi',
      'mp3',
      'wav',
      'flac',
      'aac',
      'm4a',
      'ogg',
      'opus',
      'png',
      'avif',
    ]) {
      const result = await convert({
        input,
        to,
        output: join(dir, `media.${to}`),
      })
      expect(result.bytesOut).toBeGreaterThan(0)
    }
    const output = join(dir, 'trimmed.mp4')
    await convert({
      input: join(dir, 'media.mov'),
      to: 'mp4',
      output,
      width: 32,
      fps: 10,
      start: 0.05,
      duration: 0.1,
      mute: true,
    })
    const probe = Bun.spawn(
      ['ffprobe', '-v', 'error', '-show_streams', '-of', 'json', output],
      { stdout: 'pipe', stderr: 'ignore' },
    )
    const metadata = (await new Response(probe.stdout).json()) as {
      streams: { codec_type: string; width?: number }[]
    }
    expect(await probe.exited).toBe(0)
    expect(
      metadata.streams.filter((stream) => stream.codec_type === 'audio'),
    ).toHaveLength(0)
    expect(metadata.streams[0]?.width).toBe(32)
  },
  60000,
)
