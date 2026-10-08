import { expect, test } from 'bun:test'
import { mkdir, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { inspectInputs } from '../index.ts'

test('folder inspection respects recursion, duplicate selections and unknown files', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'convrt-inspect-'))
  try {
    await mkdir(join(dir, 'nested'))
    await Bun.write(join(dir, 'photo.png'), '')
    await Bun.write(join(dir, 'notes.unknown'), '')
    await Bun.write(join(dir, 'nested/photo.jpeg'), '')
    const top = await inspectInputs([dir, join(dir, 'photo.png')])
    expect(top.count).toBe(1)
    expect(top.targets).toContain('webp')
    const recursive = await inspectInputs([dir], true)
    expect(recursive.count).toBe(2)
    expect(recursive.targets).toContain('webp')
    expect((await inspectInputs([join(dir, 'notes.unknown')])).targets).toEqual(
      [],
    )
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})
