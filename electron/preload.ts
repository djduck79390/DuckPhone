import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('duckphone', {
  getRuntime: () => ipcRenderer.invoke('duckphone:runtime') as Promise<{ platform: string; desktop: boolean }>,
})