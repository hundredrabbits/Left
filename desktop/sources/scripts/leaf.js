"use strict";

const { app, Menu, Tray } = require("electron").remote;

function Leaf() {
  this.menuTemplate = {};
  this.contextMenu;
  this.tray;

  this.start = () => {
    this.tray = new Tray(`${__dirname}/../../icon.ico`);
    this.inject();
  };

  this.setMenu = (menu) => {
    this.menuTemplate = menu;
  };

  this.inject = () => {
    this.contextMenu = Menu.buildFromTemplate(this.format());
    this.tray.setContextMenu(this.contextMenu);
  };

  this.format = function () {
    const f = [];
    const m = this.menuTemplate;
    for (const cat in m) {
      const submenu = [];
      for (const name in m[cat]) {
        const option = m[cat][name];
        if (option.role) {
          submenu.push({ role: option.role });
        } else if (option.type) {
          submenu.push({ type: option.type });
        } else {
          submenu.push({
            label: name,
            accelerator: option.accelerator,
            click: option.fn,
          });
        }
      }
      f.push({ label: cat, submenu: submenu });
    }
    return f;
  };
}

module.exports = Leaf;
