'use strict'

import { app, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'
import { format as formatUrl } from 'url'
const { autoUpdater } = require("electron-updater")
import {
  configDatabaseSettings,
  configInvoicingColumns,
  configInvoicingDetails,
  configProjectsDetail,
  configTaskColumns
} from './scripts/misc'
configDatabaseSettings()
configInvoicingColumns()
// configInvoicingDetails()
// configProjectsDetail()
configTaskColumns()

const isDevelopment = process.env.NODE_ENV !== 'production'
// autoUpdater.setFeedURL({
//   provider: 'github',
//   owner: 'Kylyi',
//   repo: 'ProjectGentlX',
//   token: '662eff9a8d5874a82dced5528b7e597efc1007b3',
//   private: true
// })


// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow
let loadWindow
let newWindow

function createLoadWindow() {
  const window = new BrowserWindow({
    frame: false,
    show: true,
    width: 380,
    height: 385,
    webPreferences: {
      plugins: true,
      webSecurity: false,
      nodeIntegration: true
    }
  })

  if (isDevelopment) {
    window.loadURL(formatUrl({
      pathname: path.join(__dirname, 'loadingPage.html'),
      protocol: 'file',
      slashes: true
    }))
  }
  else {
    window.loadURL(formatUrl({
      pathname: path.join(__dirname, '..', 'defaultSettings', 'loadingPage.html'),
      protocol: 'file',
      slashes: true
    }))
  }

  window.on('closed', () => {
    loadWindow = null
  })
  
  return window
}


function createMainWindow() {
  const window = new BrowserWindow({
    frame: false,
    minHeight: 700,
    minWidth: 1280,
    width: 1280,
    height: 700,
    show: false,
    // fullscreen: true,
    webPreferences: {
      plugins: true,
      webSecurity: false,
      nodeIntegration: true,
      webviewTag: true
    }
  })

  if (isDevelopment) {
    window.webContents.openDevTools()
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
    autoUpdater.updateConfigPath = path.join(__dirname, 'app-update.yml')
  }
  else {
    window.loadURL(formatUrl({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file',
      slashes: true
    }))
  }

  window.on('closed', () => {
    mainWindow = null
  })

  window.webContents.on('devtools-opened', () => {
    window.focus()
    setImmediate(() => {
      window.focus()
    })
  })

  return window
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow()
  }
})

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  loadWindow = createLoadWindow()
  mainWindow = createMainWindow()

  mainWindow.once('show', () => {
    loadWindow.close()
  })
  
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault()
    const win = new BrowserWindow({
      show: false,
      frame: true
    })
    win.once('ready-to-show', () => win.show())
    win.loadURL(url)
    event.newGuest = win
  })
})

ipcMain.on('appReady', (e, isReady) => {
  if (isReady) {
    mainWindow.show()
  }
})

ipcMain.on('userInfo', (e, userInfo) => {
  global.user = userInfo
  e.sender.send('userInfo', userInfo)
})

ipcMain.on('invoicingArrReady', (e) => {
  e.sender.send('invoicingArrReadyFromMain')
})

ipcMain.on('projectsChange', (e, docs) => {
  e.sender.send('changeInProjects', docs)
})

ipcMain.on('selectedProjectChanged', (e, newData) => {
  console.log(newData)
  e.sender.send('selProjectChanged', newData)
})

ipcMain.on('showDevTools', e => {
  mainWindow.webContents.openDevTools()
})

ipcMain.on('check-for-updates', (e) => {
  autoUpdater.checkForUpdates()
  // e.sender.send('gentl-update', 'error', autoUpdater.currentVersion)
  // e.sender.send('gentl-update', 'error', autoUpdater.fullChangelog)


  autoUpdater.once('checking-for-update', () => {
    e.sender.send('gentl-update', 'checking')
  })

  autoUpdater.once('update-available', info => {
    e.sender.send('gentl-update', 'available', info)
  })

  autoUpdater.once('update-not-available', info => {
    e.sender.send('gentl-update', 'unavailable', info)
  })

  autoUpdater.once('error', info => {
    e.sender.send('gentl-update', 'error', info)
  })

  autoUpdater.once('download-progress', info => {
    e.sender.send('gentl-update', 'progress', info)
  })

  autoUpdater.once('update-downloaded', info => {
    e.sender.send('gentl-update', 'downloaded', info)
    autoUpdater.quitAndInstall()
  })

})


