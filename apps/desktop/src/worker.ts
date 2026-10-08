import {
  convertBatch,
  inspectInputs,
  listEngines,
  previewImage,
  PRESETS,
} from '@convrt/core'

try {
  const request = JSON.parse(await Bun.stdin.text())
  if (request.action === 'inspect') {
    const inspection = await inspectInputs(request.inputs, request.recursive)
    process.stdout.write(
      JSON.stringify({
        ...inspection,
        engines: await listEngines(),
        presets: PRESETS,
      }),
    )
  } else if (request.action === 'preview') {
    process.stdout.write(JSON.stringify(await previewImage(request.input)))
  } else if (request.action === 'convert') {
    process.stdout.write(JSON.stringify(await convertBatch(request.options)))
  } else throw new Error('unknown action')
} catch (error) {
  process.stdout.write(
    JSON.stringify({
      error: error instanceof Error ? error.message : 'conversion failed',
    }),
  )
  process.exitCode = 1
}
