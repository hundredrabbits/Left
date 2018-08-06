function Insert()
{
  this.is_active = false;

  this.start = function()
  {
    left.controller.set("insert");
    this.is_active = true;
    left.refresh();
  }

  this.stop = function()
  {
    left.controller.set("default");
    this.is_active = false;
    left.refresh();  
  }

  this.time = function()
  {
    left.inject(new Date().toLocaleTimeString()+" ")
    this.stop();
  }

  this.date = function()
  {
    var date = new Date()
    var strArray=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var d = date.getDate();
    var m = strArray[date.getMonth()];
    var y = date.getFullYear();
    var s = '' + (d <= 9 ? '0' + d : d) + '-' + m + '-' + y;
    left.inject(s+" ")
    this.stop();
  }

  this.path = function()
  {
    if(left.project.paths.length == 0){ this.stop(); return; }
    
    left.inject(left.project.paths[left.project.index]);
    this.stop();
  }

  this.header = function()
  {
    var is_multiline = left.selected().match(/[^\r\n]+/g);
    
    if(left.prev_character() == "\n" && !is_multiline){
      left.inject("# ");
    }
    else if(is_multiline){
      left.inject_multiline("# ");
    }
    else{
      left.inject_line("# ");
    }
    this.stop();
  }

  this.subheader = function()
  {
    var is_multiline = left.selected().match(/[^\r\n]+/g);

    if(left.prev_character() == "\n" && !is_multiline){
      left.inject("## ");
    }
    else if(is_multiline){
      left.inject_multiline("## ");
    }
    else{
      left.inject_line("## ");
    }
    this.stop();
  }

  this.comment = function()
  {
    var is_multiline = left.selected().match(/[^\r\n]+/g);

    if(left.prev_character() == "\n" && !is_multiline){
      left.inject("-- ");
    }
    else if(is_multiline){
      left.inject_multiline("-- ");
    }
    else{
      left.inject_line("-- ");
    }
    this.stop();
  }

  this.list = function()
  {
    var is_multiline = left.selected().match(/[^\r\n]+/g);

    if(left.prev_character() == "\n" && !is_multiline){
      left.inject("- ");
    }
    else if(is_multiline){
      left.inject_multiline("- ");
    }
    else{
      left.inject_line("- ");
    }
    this.stop();
  }

  this.line = function()
  {
    if(left.prev_character() != "\n"){
      left.inject("\n");
    }
    left.inject("===================== \n");
    this.stop();
  }

  this.status = function()
  {
    return `<b>Insert Mode</b> c-D <i>Date</i> c-T <i>Time</i> ${left.project.paths.length > 0 ? 'c-P <i>Path</i> c-H <i>Header</i> ' : ''}Esc <i>Exit</i>.`
  }
}