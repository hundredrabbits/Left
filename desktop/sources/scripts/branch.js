"use strict";

const { app, Menu } = require("electron");

function Branch() {
  this.menu = {};
  this.branch_el;

  this.start = () => {
    this.branch_el = document.createElement("div");
  };

  this.setMenu = (menu) => {
    this.menu = menu;
  };

  this.inject = () => {
    document.getElementById("titlebar").appendChild(this.branch_el);
  };

  this.configureMenuItem = (menuItem, subMenu) => {
    var menu_el = document.createElement("div");

    const menu = Menu.buildFromTemplate(submenu);
    menu_el.addEventListener("click", (event) => {
      event.preventDefault();
      menu.popup();
    });
  };
}

module.exports = Branch;
