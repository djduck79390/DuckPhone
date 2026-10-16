import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'

const isDevelopment = !app.isPackaged

function createWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 960,
    minHeight: 680,
    backgroundColor: '#080c16',
    title: 'DuckPhone',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  if (isDevelopment) {
    void window.loadURL('http://127.0.0.1:5173')
  } else {
    void window.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

ipcMain.handle('duckphone:runtime', () => ({ platform: process.platform, desktop: true }))

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})