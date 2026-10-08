const { contextBridge, ipcRenderer, webUtils } = require('electron')
contextBridge.exposeInMainWorld('convrt', {
  initial: () => ipcRenderer.invoke('initial-files'),
  pickFiles: () => ipcRenderer.invoke('pick-files'),
  pickDirectory: () => ipcRenderer.invoke('pick-directory'),
  inspect: (inputs, recursive) =>
    ipcRenderer.invoke('inspect', inputs, recursive),
  pickFolders: () => ipcRenderer.invoke('pick-folders'),
  convert: (options) => ipcRenderer.invoke('convert', options),
  pathForFile: (file) => webUtils.getPathForFile(file),
  onFiles: (callback) =>
    ipcRenderer.on('files', (_event, files) => callback(files)),
})
