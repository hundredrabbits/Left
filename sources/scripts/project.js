function Project()
{  
  this.paths = [];
  this.index = 0;

  this.new = function()
  {
    // No Project
    if(this.paths.length == 0){
      left.textarea_el.value = "";
      return;
    }

    var str = "";
    dialog.showSaveDialog((fileName) => {
      if (fileName === undefined){ return; }
      let filename = left.project.has_extension(fileName) ? fileName : `${fileName}.txt`;
      fs.writeFile(filename, str, (err) => {
        if(err){ alert("An error ocurred creating the file "+ err.message); return; }
        this.paths.push(filename);
        left.refresh();
      });
    }); 
  }

  this.open = function()
  {
    if(this.paths.length == 0 && this.has_changes()){ this.save_as(); return; }

    var paths = dialog.showOpenDialog({properties: ['openFile','multiSelections']});

    if(!paths){ console.log("Nothing to load"); return; }

    for(id in paths){
      this.add(paths[id]);
    }
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

  this.save_as = function()
  {
    var str = left.textarea_el.value;

    dialog.showSaveDialog((fileName) => {
      if (fileName === undefined){ return; }
      let filename = left.project.has_extension(fileName) ? fileName : `${fileName}.txt`;
      fs.writeFile(filename, str, (err) => {
        if(err){ alert("An error ocurred creating the file "+ err.message); return; }
        this.paths.push(filename);
        left.refresh();
      });
    }); 
  }

  this.close = function()
  {
    if(this.paths.length < 2){ return; }
    if(this.has_changes()){ left.project.alert(); return; }
    
    this.force_close();
  }

  this.force_close = function()
  {
    if(this.paths.length < 2){ this.clear(); return; }

    this.paths.splice(this.index,1);
    this.prev();
  }

  this.add = function(path)
  {
    if(!path){ return; }
    if(this.paths.indexOf(path) > -1){ return; }

    this.paths.push(path);
    left.refresh();
    this.next();
  }

  this.next = function()
  {
    if(this.index > this.paths.length-1){ return; }

    this.show_file(this.index+1);
  }

  this.prev = function()
  {
    if(this.index < 1){ return; }

    this.show_file(this.index-1);
  }

  this.clear = function()
  {
    this.paths = [];
    this.index = 0;

    left.textarea_el.value = "";
    left.dictionary.update();
    left.refresh();
  }

  this.load_path = function(path)
  {
    if(!path){ this.original = left.textarea_el.value; return; }

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

  this.show_file = function(index,force = false)
  {
    if(this.has_changes() && !force){ left.project.alert(); return; }

    this.index = clamp(index,0,this.paths.length-1);

    this.load_path(this.paths[index])
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

  function clamp(v, min, max) { return v < min ? min : v > max ? max : v; }
}