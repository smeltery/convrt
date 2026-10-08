import { describe, expect, test } from 'bun:test'
import { $ } from 'bun'

const cli = new URL('./cli.ts', import.meta.url).pathname

describe('cli', () => {
  test('prints help', async () => {
    const result = await $`bun ${cli} --help`.text()
    expect(result).toContain('convrt — convert files locally')
  })

  test('lists formats', async () => {
    const result = await $`bun ${cli} formats`.text()
    expect(result).toContain('webp')
    expect(result).toContain('png')
  })
})

test('rejects incomplete and unknown flags', async () => {
  for (const args of [
    ['photo.png', '--to'],
    ['photo.png', '--to', 'webp', '--unknown'],
  ]) {
    const result = await $`bun ${cli} ${args}`.quiet().nothrow()
    expect(result.exitCode).toBe(1)
    expect(result.stderr.toString()).toContain('convrt:')
  }
})

test('prints presets and targets without converting', async () => {
  expect(await $`bun ${cli} presets`.text()).toContain('thumbnail')
  const targets = await $`bun ${cli} targets photo.png --menu`.text()
  expect(targets).toContain('webp')
  expect(targets).not.toContain('mp3')
})
