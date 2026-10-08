import { stat, mkdtemp, rm, readdir } from 'node:fs/promises'
import { extname, join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { pathToFileURL } from 'node:url'
import { loadSharp } from '../engines/image-library.ts'
import { officeExecutable } from '../engines/availability.ts'
import { FORMATS, formatFromPath } from '../formats.ts'

async function run(args: string[]) {
  const child = Bun.spawn(args, { stdout: 'pipe', stderr: 'ignore' })
  const timer = setTimeout(() => child.kill(), 15000)
  try {
    const text = await new Response(child.stdout).text()
    if ((await child.exited) !== 0) throw new Error('Preview engine failed')
    return text
  } finally {
    clearTimeout(timer)
  }
}

export async function previewImage(path: string) {
  const input = resolve(path)
  const format = formatFromPath(input)
  const kind = format ? FORMATS[format].family : 'file'
  const base = {
    image: null as string | null,
    audio: null as string | null,
    kind,
    detail: '',
    duration: undefined as number | undefined,
    pages: undefined as number | undefined,
  }
  const info = await stat(input)
  if (!info.isFile()) return { ...base, detail: 'Folder selection' }
  if (info.size > 250 * 1024 * 1024)
    return { ...base, detail: 'Preview unavailable for files over 250 MiB' }
  const dir = await mkdtemp(join(tmpdir(), 'convrt-preview-'))
  try {
    let source = input
    if (kind === 'audio' || kind === 'video') {
      if (!Bun.which('ffmpeg'))
        return { ...base, detail: 'Install FFmpeg to preview this file' }
      if (Bun.which('ffprobe')) {
        const value = await run([
          'ffprobe',
          '-v',
          'error',
          '-protocol_whitelist',
          'file,pipe',
          '-show_entries',
          'format=duration',
          '-of',
          'default=noprint_wrappers=1:nokey=1',
          input,
        ])
        const duration = Number(value.trim())
        if (Number.isFinite(duration) && duration > 0) base.duration = duration
      }
      if (kind === 'audio') {
        const output = join(dir, 'preview.mp3')
        await run([
          'ffmpeg',
          '-v',
          'error',
          '-nostdin',
          '-protocol_whitelist',
          'file,pipe',
          '-i',
          input,
          '-t',
          '30',
          '-vn',
          '-ac',
          '2',
          '-ar',
          '22050',
          '-b:a',
          '64k',
          output,
        ])
        base.audio = `data:audio/mpeg;base64,${Buffer.from(await Bun.file(output).arrayBuffer()).toString('base64')}`
        return { ...base, detail: 'Audio preview · first 30 seconds' }
      }
      source = join(dir, 'frame.png')
      await run([
        'ffmpeg',
        '-v',
        'error',
        '-nostdin',
        '-protocol_whitelist',
        'file,pipe',
        '-i',
        input,
        '-frames:v',
        '1',
        '-vf',
        'scale=160:160:force_original_aspect_ratio=decrease',
        source,
      ])
    } else if (kind === 'document') {
      if (format !== 'pdf') {
        const office = officeExecutable()
        if (!office)
          return {
            ...base,
            detail: 'Install LibreOffice for document previews',
          }
        await run([
          office,
          `-env:UserInstallation=${pathToFileURL(join(dir, 'profile')).href}`,
          '--headless',
          '--convert-to',
          'pdf',
          '--outdir',
          dir,
          input,
        ])
        const pdf = (await readdir(dir)).find(
          (name) => extname(name) === '.pdf',
        )
        if (!pdf) throw new Error('Document preview unavailable')
        source = join(dir, pdf)
      }
      if (!Bun.which('pdftoppm'))
        return { ...base, detail: 'Install Poppler for page previews' }
      if (Bun.which('pdfinfo')) {
        const details = await run(['pdfinfo', source])
        const pages = details.match(/^Pages:\s+(\d+)/m)
        if (pages) base.pages = Number(pages[1])
      }
      const prefix = join(dir, 'page')
      await run([
        'pdftoppm',
        '-f',
        '1',
        '-l',
        '1',
        '-singlefile',
        '-scale-to',
        '160',
        '-png',
        source,
        prefix,
      ])
      source = `${prefix}.png`
    } else if (kind !== 'image')
      return { ...base, detail: 'Preview unavailable for this file type' }
    const sharp = await loadSharp()
    const image = await sharp(source, { limitInputPixels: 40_000_000 })
      .rotate()
      .resize(160, 160, { fit: 'inside', withoutEnlargement: true })
      .png()
      .toBuffer()
    return {
      ...base,
      image: `data:image/png;base64,${image.toString('base64')}`,
      detail:
        kind === 'video'
          ? 'Video preview'
          : kind === 'document'
            ? 'First page'
            : 'Image preview',
    }
  } catch {
    return {
      ...base,
      detail: 'Preview unavailable; you can still convert this file',
    }
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}
