const { ipcRenderer } = require('electron')

global.pingHost = (theme) => {
  ipcRenderer.sendToHost('theme', {theme: theme})
}


ipcRenderer.on('request', function(){
  var tabTheme = document.body.className;
  ipcRenderer.sendToHost('theme', {theme: tabTheme});
  document.querySelectorAll('textarea').focus();
});

global.changeTitle = (title) => {
  ipcRenderer.sendToHost('title', {title: title});
}
