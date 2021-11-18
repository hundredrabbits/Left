"use strict";

function Branch() {
  this.menu = {};

  this.setMenu = (menu) => {
    this.menu = menu;
  };

  this.inject = () => {};
}

module.exports = Branch;
