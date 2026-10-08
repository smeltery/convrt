import { cp, mkdir, readFile, chmod, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'

const [entry, output] = Bun.argv.slice(2)
if (!entry || !output)
  throw new Error('usage: build-runtime.ts <entry> <output>')
const destination = resolve(output)
await mkdir(dirname(destination), { recursive: true })
const build = await Bun.build({
  entrypoints: [entry],
  target: 'bun',
  external: ['sharp'],
  outdir: dirname(destination),
  naming: `${destination.split(/[\\/]/).pop()}.js`,
})
if (!build.success) throw new Error('runtime build failed')
const runtimeName = process.platform === 'win32' ? 'bun.exe' : 'bun'
await cp(process.execPath, join(dirname(destination), runtimeName))
if (process.platform === 'win32') {
  await writeFile(
    `${destination}.cmd`,
    `@echo off\r\n"%~dp0bun.exe" "%~dp0${destination.split(/[\\/]/).pop()}.js" %*\r\n`,
  )
} else {
  await writeFile(
    destination,
    `#!/bin/sh\nexec "$(dirname "$0")/bun" "$(dirname "$0")/${destination.split('/').pop()}.js" "$@"\n`,
  )
  await chmod(destination, 0o755)
}
const modules = join(dirname(destination), 'node_modules')
await mkdir(modules, { recursive: true })
const visited = new Set<string>()
async function copyPackage(
  name: string,
  require: NodeRequire,
  optional = false,
): Promise<void> {
  if (visited.has(name)) return
  let manifest: string
  try {
    manifest = require.resolve(`${name}/package.json`)
  } catch (error) {
    if (
      optional &&
      (error as NodeJS.ErrnoException).code === 'MODULE_NOT_FOUND'
    )
      return
    throw error
  }
  visited.add(name)
  const metadata = JSON.parse(await readFile(manifest, 'utf8'))
  const target = join(modules, name)
  await cp(dirname(manifest), target, { recursive: true, dereference: true })
  const childRequire = createRequire(manifest)
  for (const dependency of Object.keys(metadata.dependencies ?? {}))
    await copyPackage(dependency, childRequire)
  for (const dependency of Object.keys(metadata.optionalDependencies ?? {}))
    await copyPackage(dependency, childRequire, true)
}
await copyPackage(
  'sharp',
  createRequire(new URL('../package.json', import.meta.url)),
)
