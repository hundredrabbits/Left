"use strict";

const { app, Menu } = require("electron").remote;

function Branch() {
  this.menuTemplate = {};

  this.start = () => {
    this.inject();
  };

  this.setMenu = (menu) => {
    this.menuTemplate = menu;
  };

  this.inject = () => {
    document
      .getElementById("titlebar")
      .addEventListener("contextmenu", (event) => {
        event.preventDefault();
        Menu.buildFromTemplate(this.format()).popup();
      });
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

module.exports = Branch;
