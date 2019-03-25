'use strict'

import { app, BrowserWindow, ipcMain } from 'electron'
import generate from './scripts/docx'
import {generateXlsx} from './scripts/xlsx'
import * as path from 'path'
import { format as formatUrl } from 'url'
import {
  configDatabaseSettings,
  configInvoicingColumns,
  configInvoicingDetails,
  configProjectsDetail
} from './scripts/misc'
configDatabaseSettings()
configInvoicingColumns()
configInvoicingDetails()
configProjectsDetail()

const isDevelopment = process.env.NODE_ENV !== 'production'

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow

function createMainWindow() {
  const window = new BrowserWindow({
    frame: false,
    minHeight: 700,
    minWidth: 1280,
    show: false
  })

  // if (isDevelopment) {
  //   window.webContents.openDevTools()
  // }

  // window.webContents.openDevTools()

  if (isDevelopment) {
    window.webContents.openDevTools()
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
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
  mainWindow = createMainWindow()
  // loginWindow = createMainWindow()
})

ipcMain.on('tmpl-gen', (e, data) => {
  if (data.tmplType === 'docx') {
    generate(data, (p) => {
      e.sender.send('generated', p)
    })
  } else if (data.tmplType === 'xlsx') {
    generateXlsx(data, (p) => {
      e.sender.send('generated', p)
    })
  }
})

ipcMain.on('appIsReady', (e, isReady) => {
  if (isReady) mainWindow.show()
})

ipcMain.on('new-template-downloaded', (e, data) => {
  console.log(data)
  e.sender.send('new-template-added-info', data)
})

ipcMain.on('new-project-downloaded', (e, data) => {
  e.sender.send('new-project-added-info', data)
})

ipcMain.on('userInfo', (e, userInfo) => {
  global.user = userInfo
  e.sender.send('userInfo', userInfo)
})