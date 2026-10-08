import { mkdtemp, readdir, rm, copyFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { ConvertError } from '../errors.ts'
import type { EngineOptions } from '../options.ts'
import { officeExecutable } from './availability.ts'

export async function convertWithOffice(options: EngineOptions) {
  const executable = officeExecutable()
  if (!executable)
    throw new ConvertError('LibreOffice not found; install LibreOffice')
  const dir = await mkdtemp(join(tmpdir(), 'convrt-office-'))
  try {
    const profile = pathToFileURL(join(dir, 'profile')).href
    const process = Bun.spawn(
      [
        executable,
        `-env:UserInstallation=${profile}`,
        '--headless',
        '--convert-to',
        options.to,
        '--outdir',
        dir,
        options.input,
      ],
      { stdout: 'ignore', stderr: 'ignore' },
    )
    if ((await process.exited) !== 0)
      throw new ConvertError('LibreOffice conversion failed')
    const output = (await readdir(dir)).find((name) =>
      name.endsWith(`.${options.to}`),
    )
    if (!output) throw new ConvertError('LibreOffice produced no output')
    await copyFile(join(dir, output), options.output)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}
