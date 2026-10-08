import { loadSharp } from './image-library.ts'
import { ConvertError } from '../errors.ts'
import type { EngineOptions } from '../options.ts'

export async function convertWithSharp(options: EngineOptions): Promise<void> {
  let sharp: typeof import('sharp')
  try {
    sharp = await loadSharp()
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    throw new ConvertError(`image engine unavailable: ${detail}`)
  }

  let pipeline = sharp(options.input, { failOn: 'error' }).rotate()
  if (options.width || options.height)
    pipeline = pipeline.resize({
      width: options.width,
      height: options.height,
      fit: 'inside',
      withoutEnlargement: true,
    })
  const { to, quality } = options
  if (to === 'png') pipeline = pipeline.png()
  else if (to === 'jpeg' || to === 'jpg') {
    pipeline = pipeline.jpeg({ quality, mozjpeg: true })
  } else if (to === 'webp') pipeline = pipeline.webp({ quality })
  else if (to === 'avif') pipeline = pipeline.avif({ quality })
  else if (to === 'tiff') pipeline = pipeline.tiff({ quality })
  else if (to === 'gif') pipeline = pipeline.gif()
  else throw new ConvertError(`sharp cannot encode ${to}`)

  await Bun.write(options.output, await pipeline.toBuffer())
}
