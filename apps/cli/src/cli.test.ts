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
