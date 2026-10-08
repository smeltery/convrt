const engineDescriptions = {
  sharp: ['Images', 'sharp', 'Resize and convert photos and illustrations.'],
  ffmpeg: [
    'Video & audio',
    'FFmpeg',
    'Convert media, extract audio, and trim clips.',
  ],
  pdf: ['PDF', 'PDF tools', 'Create PDFs and render their pages as images.'],
  office: [
    'Documents',
    'LibreOffice',
    'Convert documents, spreadsheets, and presentations.',
  ],
  sips: ['HEIC images', 'macOS sips', 'Decode HEIC photos using macOS.'],
}
window.renderEngines = (engines) => {
  const cards = engines.map((engine) => {
    const [category, title, description] = engineDescriptions[engine.name]
    const card = document.createElement('article')
    card.className = 'engine-card'
    const header = document.createElement('div')
    header.className = 'engine-card-heading'
    const heading = document.createElement('h3')
    const logo = document.createElement('img')
    const marks = {
      sharp: 'sharp',
      ffmpeg: 'ffmpeg',
      office: 'libreoffice',
      sips: 'apple',
      pdf: 'pdf',
    }
    logo.src = 'assets/' + marks[engine.name] + '.svg'
    logo.alt = ''
    logo.width = 22
    logo.height = 22
    heading.append(logo, document.createTextNode(title))
    const status = document.createElement('span')
    status.className = engine.available
      ? 'engine-state available'
      : 'engine-state'
    status.textContent = engine.available
      ? engine.name === 'sharp'
        ? 'Included with convrt'
        : engine.name === 'sips'
          ? 'Included with macOS'
          : 'Installed'
      : engine.name === 'sharp'
        ? 'Needs repair'
        : engine.name === 'sips'
          ? 'macOS only'
          : 'Not installed'
    header.append(heading, status)
    const label = document.createElement('span')
    label.className = 'engine-category'
    label.textContent = category
    const text = document.createElement('p')
    text.textContent = description
    const detail = document.createElement('small')
    detail.textContent =
      engine.name === 'pdf' || !engine.available
        ? engine.detail
        : engine.name === 'sharp'
          ? 'Bundled with this app.'
          : engine.name === 'sips'
            ? 'Built into macOS.'
            : 'Detected on this device.'
    card.append(label, header, text, detail)
    const missingRenderer =
      engine.name === 'pdf' && engine.detail.includes('writer only')
    if (missingRenderer) status.textContent = 'Renderer not installed'
    if ((!engine.available || missingRenderer) && engine.name !== 'sips') {
      const download = document.createElement('button')
      download.type = 'button'
      download.className = 'engine-install'
      download.textContent =
        engine.name === 'sharp'
          ? 'Get convrt installer ↗'
          : `Install ${engine.name === 'pdf' ? 'Poppler' : title} ↗`
      download.onclick = async () => {
        try {
          await window.convrt.engineDownload(engine.name)
          document.getElementById('engine-status').textContent =
            'Download page opened. Complete installation, then click Refresh.'
        } catch {
          document.getElementById('engine-status').textContent =
            'Could not open the download page. Please try again.'
        }
      }
      const hint = document.createElement('small')
      hint.className = 'engine-install-hint'
      hint.textContent =
        engine.name === 'sharp'
          ? 'Included with convrt. Reinstall the app to repair it.'
          : 'Opens installation downloads in your browser.'
      card.append(download, hint)
    }
    if (!engine.available && engine.name === 'sips')
      detail.textContent =
        'Included with macOS; not available on Windows or Linux.'
    return card
  })
  document.getElementById('engines').replaceChildren(...cards)
  document.getElementById('engine-status').textContent =
    `${engines.filter((engine) => engine.available).length} of ${engines.length} engines ready`
}
document.getElementById('refresh-engines').onclick = async () => {
  const button = document.getElementById('refresh-engines')
  button.disabled = true
  document.getElementById('engine-status').textContent =
    'Checking installed engines…'
  try {
    const info = await window.convrt.inspect([], false)
    window.renderEngines(info.engines)
  } catch {
    document.getElementById('engine-status').textContent =
      'Could not check engines. Try refreshing again.'
  } finally {
    button.disabled = false
  }
}
document.getElementById('refresh-engines').click()
