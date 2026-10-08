import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

export async function loadSharp(): Promise<typeof import('sharp')> {
  const runtime = dirname(process.execPath)
  if (existsSync(join(runtime, 'node_modules/sharp/package.json'))) {
    return createRequire(join(runtime, 'runtime.cjs'))(
      join(runtime, 'node_modules/sharp/lib/index.js'),
    )
  }
  return (await import('sharp')).default
}
