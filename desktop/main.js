const { app, Menu, BrowserWindow } = require('electron')
const path = require('path')

let isShown = true

function createWindow () {
  app.win = new BrowserWindow({
    width: 880,
    height: 530,
    backgroundColor: '#000',
    minWidth: 587,
    minHeight: 540,
    frame: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, '/icon.ico')
  })

  const { webContents } = app.win
  webContents.on('did-finish-load', () => {
    webContents.setZoomFactor(1)
    webContents.setVisualZoomLevelLimits(1, 1)
    webContents.setLayoutZoomLevelLimits(0, 0)
  })

  app.win.loadURL(`file://${__dirname}/sources/index.html`)

  // Uncomment to show devTools on load
  // app.inspect();

  app.win.on('closed', () => {
    app.win = null
    app.quit()
  })

  app.win.on('hide', () => {
    isShown = false
  })

  app.win.on('show', () => {
    isShown = true
  })
}

app.on('ready', () => {
  createWindow()
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

// Helpers

app.inspect = function () {
  app.win.toggleDevTools()
}

app.toggle_fullscreen = function () {
  app.win.setFullScreen(!app.win.isFullScreen())
}

app.toggle_visible = function () {
  if (process.platform === 'win32') {
    if (!app.win.isMinimized()) { app.win.minimize() } else { app.win.restore() }
  } else {
    if (isShown && !app.win.isFullScreen()) { app.win.hide() } else { app.win.show() }
  }
}

app.inject_menu = function (menu) {
  try {
    Menu.setApplicationMenu(Menu.buildFromTemplate(menu))
  } catch (err) {
    console.warn('Cannot inject menu.')
  }
}

app.path = function () {
  return __dirname
}
