const { ipcRenderer } = require('electron')

global.pingHost = (theme) => {
  ipcRenderer.sendToHost(theme)
}


ipcRenderer.on('request', function(){
  var tabTheme = document.body.className;
  ipcRenderer.sendToHost(tabTheme);
});
