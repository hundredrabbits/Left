const {app, BrowserWindow, webFrame, Menu} = require('electron')
const path = require('path')
const url = require('url')

let win

app.on('ready', () => 
{
  if (process.platform === 'darwin') {
    win = new BrowserWindow({width: 930, height: 530, frame:false, backgroundColor: '#000', show:false,  resizable:true, transparent: true, autoHideMenuBar: true, icon: __dirname + '/icon.ico'})

    var nativeHandleBuffer = win.getNativeWindowHandle();

    win.loadURL(`file://${__dirname}/sources/index.html`)
      
    let is_shown = true;
    let is_fullscreen = false;

    Menu.setApplicationMenu(Menu.buildFromTemplate([
      {
        label: 'File',
        submenu: [
          { label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: function() { force_quit=true; app.exit(); }}
        ]
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'delete' },
          { role: 'selectall' }
        ]
      },
      {
        label: 'Window',
        submenu : [
          { label: 'Hide', accelerator: 'CmdOrCtrl+H',click: () => { if(is_shown){ win.hide(); } else{ win.show(); }}},
          { label: 'Minimize', accelerator: 'CmdOrCtrl+M',click: () => { win.minimize(); }},
          { label: 'Fullscreen', accelerator: 'CmdOrCtrl+Enter',click: () => { win.setFullScreen(win.isFullScreen() ? false : true); }}
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
    win = new BrowserWindow({width: 1100, height: 660, frame:process.platform === 'win32', backgroundColor: '#000', show:false, resizable:true, autoHideMenuBar: true, icon: __dirname + '/icon.ico'})

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
  // win.webContents.openDevTools();
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
