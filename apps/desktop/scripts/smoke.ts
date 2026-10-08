import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'

const supplied = Bun.argv[2]
const release = resolve('apps/desktop/release')
const matches = supplied
  ? []
  : await Array.fromAsync(
      new Bun.Glob('**/bin/convrt-worker.js').scan({
        cwd: release,
        absolute: true,
      }),
    )
const worker = supplied
  ? join(resolve(supplied), 'convrt-worker.js')
  : matches[0]
if (!worker || (!supplied && matches.length !== 1))
  throw new Error(
    'Specify a packaged bin directory when zero or multiple builds exist',
  )
const runtime = join(
  dirname(worker),
  process.platform === 'win32' ? 'bun.exe' : 'bun',
)
const dir = await mkdtemp(join(tmpdir(), 'convrt-package-smoke-'))
const input = join(dir, 'sample.png')
const output = join(dir, 'sample.webp')
const source = Uint8Array.from(
  atob(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  ),
  (c) => c.charCodeAt(0),
)
async function request(value: object) {
  const child = Bun.spawn([runtime, worker], {
    cwd: dir,
    stdin: 'pipe',
    stdout: 'pipe',
    stderr: 'pipe',
  })
  child.stdin.write(JSON.stringify(value))
  child.stdin.end()
  const text = await new Response(child.stdout).text()
  await new Response(child.stderr).text()
  if ((await child.exited) !== 0) throw new Error('Packaged worker failed')
  return JSON.parse(text)
}
try {
  await Bun.write(input, source)
  const inspection = await request({ action: 'inspect', inputs: [input] })
  if (!inspection.targets.includes('webp'))
    throw new Error('Packaged image engine is unavailable')
  const conversion = {
    action: 'convert',
    options: { inputs: [input], to: 'webp', output },
  }
  const result = await request(conversion)
  if (result.errors.length || result.results.length !== 1)
    throw new Error('Packaged conversion failed')
  const bytes = await readFile(output)
  if (
    bytes.toString('ascii', 0, 4) !== 'RIFF' ||
    bytes.toString('ascii', 8, 12) !== 'WEBP'
  )
    throw new Error('Invalid WebP output')
  if (!(await readFile(input)).equals(source))
    throw new Error('Original input was changed')
  if ((await request(conversion)).errors.length !== 1)
    throw new Error('Existing output was not protected')
  console.log(
    'Packaged engine discovery, conversion, and output protection passed',
  )
} finally {
  await rm(dir, { recursive: true, force: true })
}
