'use strict'

/* global createWindow */

const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron')
const { Controller } = require('./lib/controller')
const path = require('path')
const EOL = '\n'

let isShown = true

app.win = null

app.on('ready', () => {
  app.win = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 380,
    minHeight: 360,
    backgroundColor: '#000',
    icon: path.join(__dirname, { darwin: 'icon.icns', linux: 'icon.png', win32: 'icon.ico' }[process.platform] || 'icon.ico'),
    resizable: true,
    frame: process.platform !== 'darwin',
    skipTaskbar: process.platform === 'darwin',
    autoHideMenuBar: process.platform === 'darwin',
    webPreferences: {
      zoomFactor: 1.0,
      nodeIntegration: true,
      nodeIntegrationWorker: true,
      contextIsolation: false,
      backgroundThrottling: false,
      enableRemoteModule: true,
    }
  })

  app.win.loadURL(`file://${__dirname}/sources/index.html`)
  app.inspect()
  loadMenu()

  app.win.on('closed', () => {
    app.quit()
  })

  app.win.on('hide', function () {
    isShown = false
  })

  app.win.on('show', function () {
    isShown = true
  })

  app.on('window-all-closed', () => {
    app.quit()
  })

  app.on('activate', () => {
    if (app.win === null) {
      createWindow()
    } else {
      app.win.show()
    }
  })
})

app.inspect = () => {
  app.win.toggleDevTools()
}

function toggleFullscreen() {
  app.win.setFullScreen(!app.win.isFullScreen())
}

function toggleVisible() {
  if (process.platform !== 'darwin') {
    if (!app.win.isMinimized()) { app.win.minimize() } else { app.win.restore() }
  } else {
    if (isShown && !app.win.isFullScreen()) { app.win.hide() } else { app.win.show() }
  }
}

ipcMain.on('process', (e) => {
  e.returnValue = { platform: process.platform, argv: process.argv }
})

ipcMain.on('exit', app.exit)

ipcMain.handle('app-path', () => { return app.getAppPath() })

ipcMain.handle('show-dialog', async (_, fn, data) => {
  return await dialog[fn](data)
})

function loadMenu()
{
  const content = app.win.webContents

  for (const i of ['default', 'reader', 'insert', 'operator']) {
    Controller.add(i, '*', 'About', () => { shell.openExternal('https://github.com/hundredrabbits/Left') }, 'CmdOrCtrl+,')
    Controller.add(i, '*', 'Fullscreen', toggleFullscreen, 'CmdOrCtrl+Enter')
    Controller.add(i, '*', 'Hide', toggleVisible, 'CmdOrCtrl+H')
    Controller.add(i, '*', 'Reset', () => { content.send('left-reset') }, 'CmdOrCtrl+Backspace')
    Controller.add(i, '*', 'Quit', () => { content.send('left-project-quit') }, 'CmdOrCtrl+Q')
  }

  Controller.addSpacer('default', '*', '')
  Controller.addRole('default', '*', 'reload')
  Controller.addRole('default', '*', 'forcereload')
  Controller.addRole('default', '*', 'toggledevtools')

  Controller.add('default', 'File', 'New', () => { content.send('left-project-new') }, 'CmdOrCtrl+N')
  Controller.add('default', 'File', 'Open', () => { content.send('left-project-open') }, 'CmdOrCtrl+O')
  Controller.add('default', 'File', 'Save', () => { content.send('left-project-save') }, 'CmdOrCtrl+S')
  Controller.add('default', 'File', 'Save As', () => { content.send('left-project-save-as') }, 'CmdOrCtrl+Shift+S')
  Controller.add('default', 'File', 'Discard Changes', () => { content.send('left-project-discard') }, 'CmdOrCtrl+D')
  Controller.add('default', 'File', 'Close File', () => { content.send('left-project-close') }, 'CmdOrCtrl+W')
  Controller.add('default', 'File', 'Force Close', () => { content.send('left-project-force-close') }, 'CmdOrCtrl+Shift+W')

  for (const i of ['default', 'operator']) {
    Controller.addRole(i, 'Edit', 'undo')
    Controller.addRole(i, 'Edit', 'redo')
    Controller.addRole(i, 'Edit', 'cut')
    Controller.addRole(i, 'Edit', 'copy')
    Controller.addRole(i, 'Edit', 'paste')
    Controller.addRole(i, 'Edit', 'delete')
    Controller.addRole(i, 'Edit', 'selectall')
  }

  Controller.add('default', 'Edit', 'Add Linebreak', () => {
      content.send('left-go-to-next', EOL, false);
      content.send('left-inject', EOL)
    }, 'CmdOrCtrl+Shift+Enter')
  Controller.add('default', 'Edit', 'Toggle Autoindent', () => { content.send('left-toggle-autoindent') }, 'CmdOrCtrl+Shift+T')

  Controller.add('default', 'Select', 'Select Autocomplete', () => { content.send('left-select-autocomplete') }, 'Tab')
  Controller.add('default', 'Select', 'Select Synonym', () => { content.send('left-select-synonym') }, 'Shift+Tab')
  Controller.add('default', 'Select', 'Find', () => { content.send('left-operator-start', 'find: ') }, 'CmdOrCtrl+F')
  Controller.add('default', 'Select', 'Replace', () => { content.send('left-operator-start', 'replace: a -> b') }, 'CmdOrCtrl+Shift+F')
  Controller.add('default', 'Select', 'Goto', () => { content.send('left-operator-start', 'goto: ') }, 'CmdOrCtrl+G')
  Controller.add('default', 'Select', 'Open Url', () => { content.send('left-open-url') }, 'CmdOrCtrl+B')

  Controller.add('default', 'Navigation', 'Next File', () => { content.send('left-navi-next-page') }, 'CmdOrCtrl+Shift+]')
  Controller.add('default', 'Navigation', 'Prev File', () => { content.send('left-navi-prev-page') }, 'CmdOrCtrl+Shift+[') // FIXME
  Controller.add('default', 'Navigation', 'Next Marker', () => { content.send('left-navi-next-marker') }, 'CmdOrCtrl+]')
  Controller.add('default', 'Navigation', 'Prev Marker', () => { content.send('left-navi-prev-marker') }, 'CmdOrCtrl+[') // FIXME

  Controller.add('default', 'View', 'Toggle Navigation', () => { content.send('left-navi-toggle') }, 'CmdOrCtrl+\\')
  Controller.add('default', 'View', 'Previous Font', () => { content.send('left-font-previous-font') }, 'CmdOrCtrl+Shift+,')
  Controller.add('default', 'View', 'Next Font', () => { content.send('left-font-next-font') }, 'CmdOrCtrl+Shift+.')
  Controller.add('default', 'View', 'Decrease Font Size', () => { content.send('left-font-decrease-font-size') }, 'CmdOrCtrl+-')
  Controller.add('default', 'View', 'Increase Font Size', () => { content.send('left-font-increase-font-size') }, 'CmdOrCtrl+=')
  Controller.add('default', 'View', 'Reset Font Size', () => { content.send('left-font-reset-font-size') }, 'CmdOrCtrl+0')

  Controller.add('default', 'Mode', 'Reader', () => { content.send('left-reader-start') }, 'CmdOrCtrl+K')
  Controller.add('default', 'Mode', 'Insert', () => { content.send('left-insert-start') }, 'CmdOrCtrl+I')

  Controller.add("default","Theme","Open Theme",() => { content.send('left-theme-open') },"CmdOrCtrl+Shift+O")
  Controller.add("default","Theme","Reset Theme",() => { content.send('left-theme-reset') },"CmdOrCtrl+Shift+Backspace")
  Controller.addSpacer('default', 'Theme', 'Download')
  Controller.add("default","Theme","Download Themes..",() => { shell.openExternal('https://github.com/hundredrabbits/Themes') })

  Controller.add('reader', 'Reader', 'Stop', () => { content.send('left-reader-stop') }, 'Esc')

  Controller.add('insert', 'Insert', 'Date', () => { content.send('left-insert-date') }, 'CmdOrCtrl+D')
  Controller.add('insert', 'Insert', 'Time', () => { content.send('left-insert-time') }, 'CmdOrCtrl+T')
  Controller.add('insert', 'Insert', 'Path', () => { content.send('left-insert-path') }, 'CmdOrCtrl+P')
  Controller.add('insert', 'Insert', 'Header', () => { content.send('left-insert-header') }, 'CmdOrCtrl+H')
  Controller.add('insert', 'Insert', 'SubHeader', () => { content.send('left-insert-subheader') }, 'CmdOrCtrl+Shift+H')
  Controller.add('insert', 'Insert', 'Comment', () => { content.send('left-insert-comment') }, 'CmdOrCtrl+/')
  Controller.add('insert', 'Insert', 'Line', () => { content.send('left-insert-line') }, 'CmdOrCtrl+L')
  Controller.add('insert', 'Insert', 'List', () => { content.send('left-insert-list') }, 'CmdOrCtrl+-')
  Controller.add('insert', 'Mode', 'Stop', () => { content.send('left-insert-stop') }, 'Esc')

  Controller.add('operator', 'Find', 'Find', () => { content.send('left-operator-start', 'find: ') }, 'CmdOrCtrl+F')
  Controller.add('operator', 'Find', 'Find Next', () => { content.send('left-operator-find-next') }, 'CmdOrCtrl+N') // FIXME
  Controller.add('operator', 'Operator', 'Stop', () => { content.send('left-operator-stop') }, 'Esc')

  Controller.commit()
}
