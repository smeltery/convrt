let confirmationTimer
element('options-directory').onclick = () => element('directory').click()
element('options-reset-directory').onclick = () =>
  element('reset-directory').click()
element('reset-options').onclick = async () => {
  if (busy) return
  for (const input of document.querySelectorAll('input')) {
    if (input.type === 'checkbox') input.checked = input.defaultChecked
    else input.value = input.defaultValue
  }
  element('preset').value = ''
  element('reset-directory').click()
  if (inputs.length) await selectFiles(inputs)
  updateSelectionControls()
  clearTimeout(confirmationTimer)
  element('options-status').textContent = 'Defaults restored'
  confirmationTimer = setTimeout(() => {
    element('options-status').textContent = ''
  }, 3000)
}

for (const button of document.querySelectorAll('[data-view]'))
  button.addEventListener('click', () => {
    clearTimeout(confirmationTimer)
    element('options-status').textContent = ''
  })

async function showPreview(path, revision) {
  const audio = element('preview-audio')
  audio.pause()
  audio.removeAttribute('src')
  audio.load()
  audio.hidden = true
  element('preview-details').hidden = true
  const image = element('preview-image')
  const fallback = element('preview-fallback')
  image.hidden = true
  image.removeAttribute('src')
  fallback.hidden = false
  fallback.textContent = 'FILE'
  element('file-preview').hidden = false
  try {
    const result = await api.preview(path)
    if (revision !== selection) return
    const metadata = [result.detail]
    if (result.duration)
      metadata.push(
        Math.floor(result.duration / 60) +
          ':' +
          String(Math.floor(result.duration % 60)).padStart(2, '0'),
      )
    if (result.pages)
      metadata.push(result.pages + (result.pages === 1 ? ' page' : ' pages'))
    element('preview-description').textContent = metadata
      .filter(Boolean)
      .join(' · ')
    element('preview-details').hidden = false
    if (result.audio) {
      audio.src = result.audio
      audio.hidden = false
    }
    if (result.image) {
      image.src = result.image
      image.hidden = false
      fallback.hidden = true
    } else
      fallback.textContent =
        result.kind === 'audio'
          ? '♫'
          : (path.split('.').pop() || 'FILE').toUpperCase().slice(0, 6)
  } catch {
    if (revision === selection) fallback.textContent = 'NO PREVIEW'
  }
}
