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
    if (value !== '') options[key] = Number(value)
  }
  for (const key of ['recursive', 'mute', 'overwrite'])
    options[key] = document.getElementById(key).checked
  options.pages = document.getElementById('pages').value || undefined
  return options
}
