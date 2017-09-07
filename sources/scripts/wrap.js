const TabGroup = require("electron-tabs");

function Main()
{

  var main = this;

  this.start = function()
  {
    let tabGroup = new TabGroup();
    let tab = tabGroup.addTab({
        title: "Left",
        src: "page.html",
        visible: true,
        active: true
    });

    console.log("started");
  }

}

document.onkeydown = function key_down(e)
{
  // new tab on T;
  if(e.key == "t" && (e.ctrlKey || e.metaKey)){
    console.log("key pressed");
    e.preventDefault();
    main.start();
  }
}
