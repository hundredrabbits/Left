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
    if(this.has_changes()){ left.project.alert(); return; }

    var paths = dialog.showOpenDialog({properties: ['openFile','multiSelections']});

    if(!paths){ console.log("Nothing to load"); return; }

    this.index = 0;
    this.paths = paths;

    this.load_path(paths[0])
  }

  this.open_extra = function(path)
  {
    if(left.project.paths.indexOf(path) < 0){ left.project.paths.push(path); }

    this.index = left.project.paths.length-1;
    this.load_path(left.project.paths[this.index])
  }

  this.load_path = function(path)
  {
    fs.readFile(path, 'utf-8', (err, data) => {
      if(err){ alert("An error ocurred reading the file :" + err.message); return; }
      left.project.load(data,path);
      left.scroll_to(0,0)
      left.refresh();
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
    if(this.has_changes()){ left.project.alert(); return; }

    this.index = index;
    this.load_path(this.paths[index])
  }

  this.save = function()
  {
    var path = this.paths[this.index]
    if(!path){ this.save_as(); return; }

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

  this.save_as = function()
  {
    var str = left.textarea_el.value;

    dialog.showSaveDialog((fileName) => {
      if (fileName === undefined){ return; }
      let filename = left.project.has_extension(fileName) ? fileName : `${fileName}.txt`;
      fs.writeFile(filename, str, (err) => {
        if(err){ alert("An error ocurred creating the file "+ err.message); return; }
        left.project.open_extra(filename);
      });
    }); 
  }

  this.has_extension = function(str)
  {
    if(str.indexOf(".") < 0){ return false; }
    var parts = str.split(".");
    return parts[parts.length-1].length <= 3 ? true : false;
  }

  this.has_changes = function()
  {
    return left.textarea_el.value != left.project.original && left.textarea_el.value != left.splash();
  }

  this.alert = function()
  {
    setTimeout(function(){ left.stats_el.innerHTML = `<b>Unsaved Changes</b> ${left.project.paths.length > 0 ? left.project.paths[left.project.index] : 'Press ctrl+s to save file.'}` },100);
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