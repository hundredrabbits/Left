"use strict";

const { app, Menu } = require("electron").remote;

function Branch() {
  this.menu = {};
  this.branch_el;

  this.start = () => {
    this.branch_el = document.createElement("div");

    for (var key in this.menu) {
      this.branch_el.appendChild(this.configureMenuItem(key, this.menu[key]));
    }
    this.inject();
  };

  this.setMenu = (menu) => {
    this.menu = menu;
  };

  this.inject = () => {
    document.getElementById("titlebar").appendChild(this.branch_el);
  };

  this.format = function (m) {
    const f = [];
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

  this.configureMenuItem = (menuItem, subMenu) => {
    var menu_el = document.createElement("div");

    menu_el.innerText = menuItem;

    const menu = Menu.buildFromTemplate(this.format(subMenu));
    menu_el.addEventListener("click", (event) => {
      event.preventDefault();
      menu.popup();
    });

    return menu_el;
  };
}

module.exports = Branch;
