"use strict";

function Oak() {
  this.get = () => {
    console.log("Oak", "Getting Themes..");
    const fs = require("fs");
    const paths = fs.readdirSync(`${__dirname}/../media/themes/`);
    var themes = [];
    paths.map((path) => {
      console.log(`[Theme Found] ${path}`);
      themes.push(path.replace(".svg", ""));
    });
    return themes;
  };
}

module.exports = Oak;
