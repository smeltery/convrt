import { FORMATS } from '../formats.ts'
import type { RouteStep } from '../routes.ts'

export function controlsForRoute(route: RouteStep[]) {
  const controls = new Set<string>()
  for (const step of route) {
    if (step.engine === 'sharp') {
      controls.add('width').add('height')
      if (['jpeg', 'jpg', 'webp', 'avif', 'tiff'].includes(step.to))
        controls.add('quality')
    }
    if (step.engine === 'pdf' && step.from === 'pdf')
      controls.add('pages').add('dpi')
    if (step.engine === 'ffmpeg') {
      const source = FORMATS[step.from].family
      const target = FORMATS[step.to].family
      if (source === 'video' || source === 'audio')
        controls.add('start').add('duration')
      if (target !== 'audio' && step.to !== 'ico')
        controls.add('width').add('height')
      if (target === 'video') controls.add('fps').add('mute')
      if (['mp4', 'mov', 'mkv', 'webm', 'mp3'].includes(step.to))
        controls.add('quality')
    }
  }
  return [...controls]
}
