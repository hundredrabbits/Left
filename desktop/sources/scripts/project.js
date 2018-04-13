function Project()
{  
  this.paths = [];
  this.index = 0;
  this.original = "";

  this.new = function()
  {
    var str = "";
    dialog.showSaveDialog((fileName) => {
      if (fileName === undefined){ return; }
      let filename = left.project.has_extension(fileName) ? fileName : `${fileName}.txt`;
      fs.writeFile(filename, str, (err) => {
        if(err){ alert("An error ocurred creating the file "+ err.message); return; }
        this.paths.push(filename);
        left.refresh();
        setTimeout(() => { left.project.next(); left.textarea_el.focus(); },200);
      });
    }); 
  }

  this.open = function()
  {
    if(this.has_changes()){
      this.alert()
      return;
    }
    
    var paths = dialog.showOpenDialog({properties: ['openFile','multiSelections']});

    if(!paths){ console.log("Nothing to load"); return; }

    for(id in paths){
      this.add(paths[id]);
    }
    setTimeout(() => { left.project.next(); },200);
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
    if(this.has_changes()){ 
      dialog.showMessageBox({
        type: 'question', buttons: ['Yes', 'No'], title: 'Confirm', message: 'Are you sure you want to discard changes?'
      }, function (response) {
        if (response === 0) { // Runs the following if 'Yes' is clicked
          this.force_close();
        }
      })
    }
    // Unchanged
    if(this.paths.length == 0){ 
      this.clear();
    }
    else{
      this.force_close();
    }
  }

  this.force_close = function()
  {
    this.paths.splice(this.index,1);
    this.prev();
  }

  this.discard = function()
  {
    dialog.showMessageBox({
      type: 'question',
      buttons: ['Yes', 'No'],
      title: 'Confirm',
      message: 'Are you sure you want to discard changes?'
    }, function (response) {
      if (response === 0) { // Runs the following if 'Yes' is clicked
        left.textarea_el.value = left.project.original ? left.project.original : '';
        left.refresh();
      }
    })
  }

  this.quit = function()
  {
    if(this.has_changes()){
      this.quit_dialog();  
    }
    else{
      app.exit()
    }
    
  }

  this.quit_dialog = function()
  {
    dialog.showMessageBox({
      type: 'question',
      buttons: ['Yes', 'No'],
      title: 'Confirm',
      message: 'Unsaved data will be lost. Are you sure you want to quit?',
      icon: `${app.path()}/icon.png`
    }, function (response) {
      if (response === 0) {
        app.exit()
      }
    })
  }

  this.add = function(path)
  {
    if(!path){ return; }
    if(this.paths.indexOf(path) > -1){ return; }

    this.paths.push(path);
    left.refresh();
    this.show_file(this.paths.length-1);
  }

  this.next = function()
  {
    if(this.index >= this.paths.length-1){ return; }

    this.show_file(this.index+1);
    left.refresh()
  }

  this.prev = function()
  {
    if(this.index < 1){ return; }

    this.show_file(this.index-1);
    left.refresh();
  }

  this.clear = function()
  {
    this.paths = [];
    this.index = 0;
    this.original = "";

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

  this.load = function(content,path)
  {
    if(is_json(content)){
      var obj = JSON.parse(content);
      content = this.format_json(obj);
    }

    left.textarea_el.value = content;
    
    // 'content' has the line ending of the file (\r, \n or \r\n).
    // Textarea converts all line endings to \n.
    // Load the value back from the textarea so that both have \n line
    // endings. Otherwise has_changes() does not work correctly.
    this.original = left.textarea_el.value;
    
    left.dictionary.update();
    left.refresh();
    left.stats_el.innerHTML = "<b>Loaded</b> "+path;
  }

  this.show_file = function(index,force = false)
  {
    if(this.has_changes() && !force){ left.project.alert(); return; }

    this.index = clamp(index,0,this.paths.length-1);
    
    var path = left.project.paths[this.index];
    var parts = path.replace(/\\/g,"/").split("/")
    var file_name = parts[parts.length-1];

    document.title = file_name ? `Left — ${file_name}` : "Left"

    this.load_path(this.paths[this.index]);
    left.navi.update();
  }

  this.has_extension = function(str)
  {
    if(str.indexOf(".") < 0){ return false; }
    var parts = str.split(".");
    return parts[parts.length-1].length <= 2 ? true : false;
  }

  this.has_changes = function()
  {
    return left.textarea_el.value != left.project.original && left.textarea_el.value != left.splash();
  }

  this.alert = function()
  {
    setTimeout(function(){ left.stats_el.innerHTML = `<b>Unsaved Changes</b> ${left.project.paths.length > 0 ? left.project.paths[left.project.index] : 'Save(C-s) or Discard changes(C-d).'}` },400);
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