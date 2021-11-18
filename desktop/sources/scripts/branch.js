"use strict";

function Branch() {
  this.menu = {};

  this.setMenu = (menu) => {
    this.menu = menu;
  };
}

module.exports = Branch;
