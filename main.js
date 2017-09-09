const {app, BrowserWindow, webFrame, Menu} = require('electron')
const path = require('path')
const url = require('url')

let win

app.on('ready', () => 
{
  if (process.platform === 'darwin') {
    win = new BrowserWindow({width: 1100, height: 660, frame:false, backgroundColor: 'rgba(0,0,0,0.1)', show:false,  resizable:true, transparent: true, autoHideMenuBar: true, icon: __dirname + '/icon.ico'})

    var nativeHandleBuffer = win.getNativeWindowHandle();

    win.loadURL(`file://${__dirname}/sources/index.html`)
      
    let is_shown = true;

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
          { label: 'Hide', accelerator: 'CmdOrCtrl+H',click: () => { if(is_shown){ win.hide(); } else{ win.show(); }}},
          { label: 'Minimize', accelerator: 'CmdOrCtrl+M',click: () => { win.minimize(); }},
          { label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: function() { force_quit=true; app.exit(); }},
        ]
      }
    ]));

    win.on('ready-to-show',function() {
      win.show();
    })

    win.on('hide',function() {
      is_shown = false;
    })

    win.on('show',function() {
      is_shown = true;
    })
  }
  else {
    win = new BrowserWindow({width: 1100, height: 660, frame:false, transparent: true, backgroundColor: 'rgba(200,200,200,.7)', show:false, resizable:true, autoHideMenuBar: true, icon: __dirname + '/icon.ico'})

    win.loadURL(`file://${__dirname}/sources/index.html`)

    var nativeHandleBuffer = win.getNativeWindowHandle();

    win.on('ready-to-show',function() {
      win.show();
    })

    win.on('closed', () => {
      win = null
      app.quit()
    })
  }
  // Open the DevTools.
  // win.webContents.openDevTools()
})

app.on('window-all-closed', () => 
{
  app.quit()
})

app.on('activate', () => 
{
  if (win === null) {
    createWindow()
  }
})
