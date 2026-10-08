const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron')
const { spawn } = require('node:child_process')
const { join, delimiter } = require('node:path')
if (process.platform === 'darwin')
  process.env.PATH = [process.env.PATH, '/opt/homebrew/bin', '/usr/local/bin']
    .filter(Boolean)
    .join(delimiter)
let window
let pending = process.argv
  .slice(app.isPackaged ? 1 : 2)
  .filter((arg) => !arg.startsWith('-'))
let busy = false

function runWorker(request) {
  return new Promise((resolve, reject) => {
    const executable = app.isPackaged
      ? join(
          process.resourcesPath,
          'bin',
          process.platform === 'win32' ? 'bun.exe' : 'bun',
        )
      : process.env.CONVRT_BUN || 'bun'
    const args = app.isPackaged
      ? [join(process.resourcesPath, 'bin', 'convrt-worker.js')]
      : [join(__dirname, 'worker.ts')]
    const child = spawn(executable, args, { stdio: ['pipe', 'pipe', 'ignore'] })
    let output = ''
    child.stdout.on('data', (chunk) => {
      output += chunk
    })
    child.on('error', reject)
    child.on('close', () => {
      try {
        const result = JSON.parse(output)
        if (result.error) reject(new Error(result.error))
        else resolve(result)
      } catch {
        reject(new Error('Conversion worker failed'))
      }
    })
    child.stdin.on('error', () => {})
    child.stdin.end(JSON.stringify(request))
  })
}

if (!app.requestSingleInstanceLock()) app.quit()
else {
  app.on('second-instance', (_event, argv) => {
    const incoming = argv
      .slice(app.isPackaged ? 1 : 2)
      .filter((arg) => !arg.startsWith('-'))
    pending = [...new Set([...pending, ...incoming])]
    if (window) {
      window.show()
      window.focus()
      window.webContents.send('files', pending)
    }
  })
  app.on('open-file', (event, path) => {
    event.preventDefault()
    pending.push(path)
    window?.webContents.send('files', pending)
  })
  app.whenReady().then(() => {
    ipcMain.handle('engine-download', async (_event, engine) => {
      const urls = {
        ffmpeg: 'https://ffmpeg.org/download.html',
        office: 'https://www.libreoffice.org/download/',
        pdf: 'https://poppler.freedesktop.org/',
        sharp: 'https://github.com/smeltery/convrt/releases',
      }
      if (!Object.hasOwn(urls, engine)) throw new Error('Unknown engine')
      await shell.openExternal(urls[engine])
    })
    ipcMain.handle('preview', (_event, input) =>
      runWorker({ action: 'preview', input }),
    )
    ipcMain.handle('initial-files', () => pending)
    ipcMain.handle(
      'pick-files',
      async () =>
        (
          await dialog.showOpenDialog(window, {
            properties: ['openFile', 'multiSelections'],
          })
        ).filePaths,
    )
    ipcMain.handle(
      'pick-directory',
      async () =>
        (
          await dialog.showOpenDialog(window, {
            properties: ['openDirectory', 'createDirectory'],
          })
        ).filePaths[0],
    )
    ipcMain.handle(
      'pick-folders',
      async () =>
        (
          await dialog.showOpenDialog(window, {
            properties: ['openDirectory', 'multiSelections'],
          })
        ).filePaths,
    )
    ipcMain.handle('inspect', (_event, inputs, recursive) =>
      runWorker({ action: 'inspect', inputs, recursive }),
    )
    ipcMain.handle('convert', async (_event, options) => {
      if (busy) throw new Error('A conversion is already running')
      busy = true
      try {
        return await runWorker({ action: 'convert', options })
      } finally {
        busy = false
      }
    })
    if (process.platform === 'darwin')
      app.dock.setIcon(join(__dirname, 'assets', 'icon.png'))
    window = new BrowserWindow({
      width: 820,
      height: 550,
      resizable: false,
      maximizable: false,
      fullscreenable: false,
      backgroundColor: '#f6f6f3',
      icon: join(__dirname, 'assets', 'icon.png'),
      minWidth: 620,
      minHeight: 520,
      webPreferences: {
        preload: join(__dirname, 'preload.cjs'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
    })
    window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
    window.webContents.on('will-navigate', (event) => event.preventDefault())
    window.loadFile(join(__dirname, 'index.html'))
  })
  app.on('window-all-closed', () => app.quit())
}
