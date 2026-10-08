window.updateVisibleControls = (supported = []) => {
  for (const key of [
    'quality',
    'width',
    'height',
    'pages',
    'dpi',
    'fps',
    'start',
    'duration',
    'mute',
  ]) {
    const input = document.getElementById(key)
    input.closest('label').hidden = !supported.includes(key)
    input.disabled = !supported.includes(key)
  }
}
window.updateVisibleControls()
window.conversionControls = () => {
  const options = {}
  for (const key of [
    'quality',
    'width',
    'height',
    'jobs',
    'dpi',
    'fps',
    'start',
    'duration',
  ]) {
    const value = document.getElementById(key).value
    if (value !== '' && !document.getElementById(key).closest('label').hidden)
      options[key] = Number(value)
  }
  for (const key of ['recursive', 'mute', 'overwrite'])
    if (!document.getElementById(key).closest('label').hidden)
      options[key] = document.getElementById(key).checked
  if (!document.getElementById('pages').closest('label').hidden)
    options.pages = document.getElementById('pages').value || undefined
  return options
}
