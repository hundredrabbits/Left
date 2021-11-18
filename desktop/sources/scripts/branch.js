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

  this.configureMenuItem = (menuItem, subMenu) => {
    var menu_el = document.createElement("div");

    menu_el.innerText = menuItem;

    const menu = Menu.buildFromTemplate(subMenu);
    menu_el.addEventListener("click", (event) => {
      event.preventDefault();
      menu.popup();
    });

    return menu_el;
  };
}

module.exports = Branch;
