const api = window.convrt
const element = (id) => document.getElementById(id)
let inputs = []
let outDir
let presets = {}
let busy = false
let selection = 0
let ready = false
let supportedControls = {}
function updateSelectionControls() {
  element('target').disabled = busy || !ready
  element('preset').disabled =
    busy ||
    !ready ||
    ![...element('preset').options].some(
      (option) => option.value && !option.disabled,
    )
  element('convert').disabled = busy || !ready
  window.updateVisibleControls(
    ready && !busy ? supportedControls[element('target').value] : [],
  )
}
async function selectFiles(files) {
  if (busy || !files.length) return
  const revision = ++selection
  inputs = element('append-files').checked
    ? [...new Set([...inputs, ...files])]
    : files
  files = inputs
  element('selection-count').textContent =
    files.length === 1 ? '1 item selected' : `${files.length} items selected`
  document.querySelector('.selection-heading').hidden = false
  showPreview(files[0], revision)
  element('files').replaceChildren(
    ...files.map((path) => {
      const item = document.createElement('li')
      item.textContent = path.split(/[\\/]/).pop()
      return item
    }),
  )
  ready = false
  presets = {}
  element('target').replaceChildren(new Option('Checking files…', ''))
  element('preset').value = ''
  updateSelectionControls()
  try {
    const info = await api.inspect(inputs, element('recursive').checked)
    if (revision !== selection) return
    presets = info.presets
    supportedControls = info.controls
    element('target').replaceChildren(
      ...info.targets.map((target) => new Option(target.toUpperCase(), target)),
    )
    window.renderEngines(info.engines)
    ready = info.targets.length > 0
    if (!ready)
      element('target').replaceChildren(new Option('No compatible formats', ''))
    for (const option of element('preset').options)
      option.disabled =
        !!option.value && !info.targets.includes(presets[option.value]?.to)
    updateSelectionControls()
    element('status').textContent = info.targets.length
      ? ''
      : 'No common target. Select compatible files or install the required engine.'
  } catch (error) {
    if (revision !== selection) return
    element('target').replaceChildren(new Option('Unable to inspect files', ''))
    updateSelectionControls()
    element('status').textContent = error.message
  }
}
element('folders').onclick = async () => selectFiles(await api.pickFolders())
element('recursive').onchange = () => selectFiles(inputs)
element('reset-directory').onclick = () => {
  outDir = undefined
  element('destination').textContent = 'Next to originals'
  element('options-destination').textContent = 'Next to originals'
}
element('pick').onclick = async () => selectFiles(await api.pickFiles())
element('directory').onclick = async () => {
  const path = await api.pickDirectory()
  if (path) {
    outDir = path
    element('destination').textContent = path
    element('options-destination').textContent = path
  }
}
element('target').onchange = () => {
  element('preset').value = ''
  updateSelectionControls()
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
  updateSelectionControls()
}
element('convert').onclick = async () => {
  if (busy || !ready) return
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
  window.stopCelebration?.()
  element('status').dataset.state = 'working'
  element('status').textContent = 'Converting on your device…'
  try {
    const result = await api.convert({
      inputs,
      outDir,
      to: element('target').value,
      ...window.conversionControls(),
    })
    window.showConversionResult(result)
  } catch (error) {
    window.showConversionResult({
      results: [],
      errors: [
        {
          message:
            error.message || 'Unexpected conversion error. Please try again.',
        },
      ],
    })
  } finally {
    busy = false
    for (const control of document.querySelectorAll('input, select, button'))
      control.disabled = false
    updateSelectionControls()
  }
}
for (const name of ['dragover', 'drop'])
  document.addEventListener(name, (event) => event.preventDefault())
for (const name of ['dragenter', 'dragover'])
  element('drop').addEventListener(name, () =>
    element('drop').classList.add('is-dragging'),
  )
for (const name of ['dragleave', 'drop', 'dragend'])
  element('drop').addEventListener(name, () =>
    element('drop').classList.remove('is-dragging'),
  )
element('drop').addEventListener('drop', (event) =>
  selectFiles(
    [...event.dataTransfer.files].map((file) => api.pathForFile(file)),
  ),
)
api.onFiles(selectFiles)
api.initial().then(selectFiles)

element('clear-files').onclick = () => {
  if (busy) return
  selection++
  inputs = []
  ready = false
  presets = {}
  supportedControls = {}
  element('files').replaceChildren()
  element('file-preview').hidden = true
  element('preview-audio').pause()
  element('preview-audio').removeAttribute('src')
  element('preview-details').hidden = true
  document.querySelector('.selection-heading').hidden = true
  element('target').replaceChildren(new Option('Choose files first', ''))
  element('preset').value = ''
  element('status').textContent = ''
  updateSelectionControls()
}
