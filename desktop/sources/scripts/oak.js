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
  this.load = (name) => {
    console.log("Oak", `Loading Theme ${name}..`);
    const fs = require("fs");
    const themePath = `${__dirname}/../media/themes/${name}.svg`;
    const themeExists = fs.existsSync(themePath);
    if (themeExists) {
      const theme = fs.readFileSync(themePath, "utf-8");
    }
  };
}

module.exports = Oak;
