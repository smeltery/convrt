import { convert } from '@convrt/core'
try {
  const options = JSON.parse(await Bun.stdin.text())
  await convert(options)
} catch {
  // Never forward engine diagnostics or uploaded file metadata to service logs.
  process.exitCode = 1
}
