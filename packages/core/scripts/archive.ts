const [directory, output] = Bun.argv.slice(2)
if (!directory || !output)
  throw new Error('usage: archive.ts <directory> <archive.tar.gz>')
const child = Bun.spawn(['tar', '-C', directory, '-czf', output, '.'], {
  stdout: 'inherit',
  stderr: 'inherit',
})
if ((await child.exited) !== 0) throw new Error('archive failed')
const digest = new Bun.CryptoHasher('sha256')
  .update(await Bun.file(output).arrayBuffer())
  .digest('hex')
await Bun.write(`${output}.sha256`, `${digest}  ${output}\n`)
