function Source()
{  
  this.path = null;

  this.clear = function()
  {
    left.source.path = null;
    left.textarea_el.value = "";
    left.dictionary.update();
    left.refresh();
  }

  this.load = function(content,path = "")
  {
    if(is_json(content)){
      var obj = JSON.parse(content);
      content = this.format_json(obj);
    }

    var file_type = path.split(".")[path.split(".").length-1];

    if(file_type == "thm"){
      left.theme.install(obj);
    }

    this.path = path ? path : null;
    left.textarea_el.value = content;
    left.dictionary.update();
    left.refresh();
    left.stats_el.innerHTML = "<b>Loaded</b> "+path;
  }

  this.open = function()
  {
    var filepath = dialog.showOpenDialog({properties: ['openFile']});

    if(!filepath){ console.log("Nothing to load"); return; }

    fs.readFile(filepath[0], 'utf-8', (err, data) => {
      if(err){ alert("An error ocurred reading the file :" + err.message); return; }

      left.source.load(data,filepath[0]);
    });
  }

  this.save = function()
  {
    if(!this.path){ this.export(); return; }
    fs.writeFile(left.source.path, left.textarea_el.value, (err) => {
      if(err) { alert("An error ocurred updating the file" + err.message); console.log(err); return; }
      left.stats_el.innerHTML = "<b>Saved</b> "+this.path;
    });
  }

  this.backup = function()
  {
    localStorage.setItem("backup", left.textarea_el.value);
    console.log("Saved backup");
  }

  this.simple_export = function()
  {
    var text = left.textarea_el.value;
    var blob = new Blob([text], {type: "text/plain;charset=" + document.characterSet});
    var d = new Date(), e = new Date(d);
    var since_midnight = e - d.setHours(0,0,0,0);
    var timestamp = parseInt((since_midnight/864) * 10);
    saveAs(blob, "backup."+timestamp+".txt");
  }

  this.export = function()
  {
    if(typeof dialog == "undefined"){ this.simple_export(); return; }

    var str = left.textarea_el.value;

    dialog.showSaveDialog((fileName) => {
      if (fileName === undefined){ return; }
      fs.writeFile(fileName+".txt", str, (err) => {
        if(err){ alert("An error ocurred creating the file "+ err.message); return; }
        left.source.path = fileName+".txt";
      });
    }); 
  }

  this.format_json = function(obj)
  {
    return JSON.stringify(obj, null, "  ");
  }

  function is_json(text)
  {
    try{
        JSON.parse(text);
        return true;
    }
    catch (error){
      return false;
    }
  }
}