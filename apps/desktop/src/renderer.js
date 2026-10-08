const api = window.convrt
const element = (id) => document.getElementById(id)
let inputs = []
let outDir
let presets = {}
let busy = false
let selection = 0
async function selectFiles(files) {
  if (busy || !files.length) return
  const revision = ++selection
  inputs = files
  element('files').replaceChildren(
    ...files.map((path) => {
      const item = document.createElement('li')
      item.textContent = path.split(/[\\/]/).pop()
      return item
    }),
  )
  element('convert').disabled = true
  try {
    const info = await api.inspect(inputs, element('recursive').checked)
    if (revision !== selection) return
    presets = info.presets
    element('target').replaceChildren(
      ...info.targets.map((target) => new Option(target.toUpperCase(), target)),
    )
    element('engines').textContent = info.engines
      .map(
        (engine) =>
          `${engine.name}: ${engine.available ? 'available' : 'missing'} — ${engine.detail}`,
      )
      .join('\n')
    element('convert').disabled = !info.targets.length
    element('status').textContent = info.targets.length
      ? ''
      : 'No common target. Select compatible files or install the required engine.'
  } catch (error) {
    element('status').textContent = error.message
  }
}
element('folders').onclick = async () => selectFiles(await api.pickFolders())
element('recursive').onchange = () => selectFiles(inputs)
element('reset-directory').onclick = () => {
  outDir = undefined
  element('destination').textContent = 'Next to originals'
}
element('pick').onclick = async () => selectFiles(await api.pickFiles())
element('directory').onclick = async () => {
  const path = await api.pickDirectory()
  if (path) {
    outDir = path
    element('destination').textContent = path
  }
}
element('preset').onchange = () => {
  const preset = presets[element('preset').value]
  if (!preset) return
  if (
    ![...element('target').options].some((option) => option.value === preset.to)
  ) {
    element('status').textContent =
      'This preset is unavailable for the selected files.'
    return
  }
  element('target').value = preset.to
  element('quality').value = preset.quality
  element('width').value = preset.width ?? ''
  element('height').value = preset.height ?? ''
}
element('convert').onclick = async () => {
  if (
    [...document.querySelectorAll('input')].some(
      (input) => !input.reportValidity(),
    )
  )
    return
  busy = true
  for (const control of document.querySelectorAll('input, select, button'))
    control.disabled = true
  element('convert').disabled = true
  element('status').textContent = 'Converting on your device…'
  try {
    const result = await api.convert({
      inputs,
      outDir,
      to: element('target').value,
      ...window.conversionControls(),
    })
    element('status').textContent = [
      ...result.results.map((item) => `Saved ${item.output}`),
      ...result.errors.map((item) => item.message),
    ].join('\n')
  } catch (error) {
    element('status').textContent = error.message
  } finally {
    busy = false
    for (const control of document.querySelectorAll('input, select, button'))
      control.disabled = false
    element('convert').disabled = false
  }
}
for (const name of ['dragover', 'drop'])
  document.addEventListener(name, (event) => event.preventDefault())
element('drop').addEventListener('drop', (event) =>
  selectFiles(
    [...event.dataTransfer.files].map((file) => api.pathForFile(file)),
  ),
)
api.onFiles(selectFiles)
api.initial().then(selectFiles)
