import { ConvertError } from '../errors.ts'
import type { SupportedFormat } from '../formats.ts'

export async function convertWithSharp(options: {
  input: string
  output: string
  to: SupportedFormat
  quality: number
}): Promise<void> {
  let sharp: typeof import('sharp')
  try {
    sharp = (await import('sharp')).default
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    throw new ConvertError(`image engine unavailable: ${detail}`)
  }

  let pipeline = sharp(options.input, { failOn: 'none' }).rotate()
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
