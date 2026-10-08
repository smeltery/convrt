import { loadSharp } from './image-library.ts'
import type { EngineName } from '../formats.ts'

export interface EngineStatus {
  name: EngineName
  available: boolean
  detail: string
}

export async function listEngines(): Promise<EngineStatus[]> {
  let sharpAvailable = false
  try {
    const sharp = await loadSharp()
    sharpAvailable = Boolean(sharp.versions.vips)
  } catch {
    /* Optional native module may not load on this machine. */
  }
  return [
    {
      name: 'sharp',
      available: sharpAvailable,
      detail: 'Bundled image engine',
    },
    {
      name: 'ffmpeg',
      available: Boolean(Bun.which('ffmpeg')),
      detail: 'Install ffmpeg for media and additional image formats',
    },
    {
      name: 'pdf',
      available: sharpAvailable,
      detail: Bun.which('pdftoppm')
        ? 'PDF writer and poppler renderer'
        : 'PDF writer only; install poppler to render pages',
    },
    {
      name: 'office',
      available: Boolean(officeExecutable()),
      detail:
        'Install LibreOffice for documents, spreadsheets and presentations',
    },
    {
      name: 'sips',
      available: process.platform === 'darwin' && Boolean(Bun.which('sips')),
      detail: 'macOS HEIC decoder',
    },
  ]
}

export function officeExecutable() {
  return (
    Bun.which('soffice') ??
    Bun.which('libreoffice') ??
    (process.platform === 'darwin'
      ? Bun.which('/Applications/LibreOffice.app/Contents/MacOS/soffice')
      : null)
  )
}
