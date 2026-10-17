import { contextBridge, ipcRenderer } from 'electron'
import type { AppSettings, DriveAPI, MountConfig } from '../shared/types'

// Only a fixed, typed API is exposed. The renderer never receives raw ipcRenderer.
const api: DriveAPI = {
  snapshot: () => ipcRenderer.invoke('drive:snapshot'),
  diagnostics: () => ipcRenderer.invoke('drive:diagnostics'),
  chooseDirectory: () => ipcRenderer.invoke('drive:chooseDirectory'),
  saveMount: (mount: MountConfig) => ipcRenderer.invoke('drive:saveMount', mount),
  deleteMount: (id: string) => ipcRenderer.invoke('drive:deleteMount', id),
  connect: (id: string) => ipcRenderer.invoke('drive:connect', id),
  disconnect: (id: string) => ipcRenderer.invoke('drive:disconnect', id),
  openMount: (id: string) => ipcRenderer.invoke('drive:openMount', id),
  checkRemote: (id: string) => ipcRenderer.invoke('drive:checkRemote', id),
  backupNow: (id: string) => ipcRenderer.invoke('drive:backupNow', id),
  openBackup: (id: string) => ipcRenderer.invoke('drive:openBackup', id),
  saveSettings: (settings: AppSettings) => ipcRenderer.invoke('drive:saveSettings', settings),
  onChanged: callback => {
    const listener = (): void => callback()
    ipcRenderer.on('drive:changed', listener)
    return () => ipcRenderer.removeListener('drive:changed', listener)
  }
}
contextBridge.exposeInMainWorld('drive', api)
