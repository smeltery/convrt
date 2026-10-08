#!/usr/bin/env bun
import { $ } from 'bun'
import { dirname, resolve } from 'node:path'

const repoRoot = (await $`git rev-parse --show-toplevel`.text()).trim()
const files = (
  await $`git ls-files --cached --others --exclude-standard -- "*.md" "*.mdx"`.text()
)
  .split('\n')
  .filter(Boolean)

const link = /\[[^\]]*\]\(([^)]+)\)/g
let fail = false

for (const file of files) {
  const text = await Bun.file(`${repoRoot}/${file}`).text()
  for (const match of text.matchAll(link)) {
    const raw = match[1].trim().replace(/^<|>$/g, '')
    const href = raw.split(/\s+/)[0]
    if (!href) continue
    if (/^(https?:|mailto:|data:)/i.test(href)) continue
    // Site-absolute paths are Blume/app routes, not repository files.
    if (href.startsWith('/')) continue
    const [pathPart, hash] = href.split('#')
    if (!pathPart) {
      if (hash === undefined) continue
      continue
    }
    const target = resolve(
      dirname(`${repoRoot}/${file}`),
      decodeURIComponent(pathPart),
    )
    const exists =
      (await Bun.file(target).exists()) ||
      (await Bun.file(`${target}.md`).exists()) ||
      (await Bun.file(`${target}/README.md`).exists())
    const dirHint = Bun.file(`${target}/.gitkeep`)
    const isDir = await isDirectory(target)
    if (!exists && !isDir && !(await dirHint.exists())) {
      console.error(`FAIL: ${file}: broken link ${href}`)
      fail = true
    }
  }
}

async function isDirectory(path: string): Promise<boolean> {
  const stat = Bun.file(path)
  if (await stat.exists()) return false
  const listing = await $`test -d ${path}`.nothrow()
  return listing.exitCode === 0
}

if (fail) {
  console.error('doc link check failed')
  process.exit(1)
}

console.log(`doc link check passed (${files.length} files)`)
