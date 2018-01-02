function Project()
{  
  this.paths = [];
  this.index = 0;

  this.clear = function()
  {
    this.paths = [];
    this.index = 0;

    left.textarea_el.value = "";
    left.dictionary.update();
    left.refresh();
  }

  this.open = function()
  {
    var paths = dialog.showOpenDialog({properties: ['openFile','multiSelections']});

    if(!paths){ console.log("Nothing to load"); return; }

    this.index = 0;
    this.paths = paths;

    this.load_path(paths[0])
  }

  this.load_path = function(path)
  {
    fs.readFile(path, 'utf-8', (err, data) => {
      if(err){ alert("An error ocurred reading the file :" + err.message); return; }
      left.project.load(data,path);
      left.scroll_to(0,0)
    });
  }

  this.original = "";

  this.load = function(content,path)
  {
    if(is_json(content)){
      var obj = JSON.parse(content);
      content = this.format_json(obj);
    }

    this.original = content;

    left.textarea_el.value = content;
    left.dictionary.update();
    left.refresh();
    left.stats_el.innerHTML = "<b>Loaded</b> "+path;
  }

  this.show_file = function(index)
  {
    if(this.has_changes()){ setTimeout(function(){ left.stats_el.innerHTML = `<b>Unsaved Changes</b> ${left.project.paths[left.project.index]}` },100); return; }

    this.index = index;
    this.load_path(this.paths[index])
  }

  this.save = function()
  {
    var path = this.paths[this.index]
    if(!path){ this.export(); return; }

    this.original = left.textarea_el.value;

    fs.writeFile(path, left.textarea_el.value, (err) => {
      if(err) { alert("An error ocurred updating the file" + err.message); console.log(err); return; }
      left.refresh();
      left.stats_el.innerHTML = "<b>Saved</b> "+path;
    });
  }

  this.close_file = function()
  {
    if(this.paths.length < 2){ return; }

    this.paths.splice(this.index,1);
    this.show_file(0);
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
        if(left.project.paths.indexOf(fileName+".txt") < 0){ left.project.paths.push(fileName+".txt"); left.refresh(); }
      });
    }); 
  }

  this.has_changes = function()
  {
    return left.textarea_el.value != left.project.original;
  }

  this.format_json = function(obj)
  {
    return JSON.stringify(obj, null, "  ");
  }

  this.should_confirm = function()
  {
    if(left.textarea_el.value.length > 0){ return true; }
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