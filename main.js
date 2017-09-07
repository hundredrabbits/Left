const {app, BrowserWindow, webFrame, Menu, ipcRenderer} = require('electron')
const path = require('path')
const url = require('url')
require('dotenv').config();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {


  if (process.platform === 'darwin') {
    // Create the browser window.
    win = new BrowserWindow({width: 1100, height: 660, frame:false, backgroundColor: 'rgba(0,0,0,0.1)', show:false,  resizable:true, transparent: true, autoHideMenuBar: true, icon: __dirname + '/icon.ico'})

    var nativeHandleBuffer = win.getNativeWindowHandle();

    win.loadURL(`file://${__dirname}/sources/index.html`)

    // Create our menu entries so that we can use MAC shortcuts
    Menu.setApplicationMenu(Menu.buildFromTemplate([
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'delete' },
          { role: 'selectall' },
          {label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: function() { force_quit=true; app.exit();}},
        ]
      }
    ]));

    win.on('ready-to-show',function() {

      win.show();

    })

  }

  else {
    // Create the browser window.
    win = new BrowserWindow({width: 1100, height: 660, frame:false, transparent: true, backgroundColor: 'rgba(200,200,200,.7)', show:false, resizable:true, autoHideMenuBar: true, icon: __dirname + '/icon.ico'})

    win.loadURL(`file://${__dirname}/sources/index.html`)

    var nativeHandleBuffer = win.getNativeWindowHandle();
    win.on('ready-to-show',function() {

      win.show();

    })

    // Emitted when the window is closed.
    win.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      win = null
      app.quit()
    })
  }


  if (process.env.NODE_ENV === "development"){
    win.webContents.openDevTools();
    console.log("dev");
  }

})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  app.quit()
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
  else{

  }
})
