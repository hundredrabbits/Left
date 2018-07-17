function Controller()
{
  this.menu = {default:{}};
  this.mode = "default";

  this.start = function()
  {
  }

  this.add = function(mode,cat,label,fn,key,cmd_ctrl = false)
  {
    if(!this.menu[mode]){ this.menu[mode] = {}; }
    if(!this.menu[mode][cat]){ this.menu[mode][cat] = {}; }
    this.menu[mode][cat][label] = {fn:fn,key:key,cmd_ctrl:cmd_ctrl};
    console.log(`${mode}/${cat}/${label} <${key}>`);
  }

  this.set = function(mode = "default")
  {
    this.mode = mode;
    console.log("Mode Change:",mode)
    left.refresh()
  }

  this.trigger = function(e,is_down = false)
  {
    var key = e.key.toUpperCase();
    var cmd_ctrl = e.ctrlKey || e.metaKey
    for(id in this.menu[this.mode]){
      var options = this.menu[this.mode][id]
      for(name in options){
        var option = options[name]
        if(option.key != key){ continue; }
        if(option.cmd_ctrl && !cmd_ctrl){ continue; }
        console.log(name)
        option.fn()
        e.preventDefault();
      }
    }
  }

  document.onkeydown = (e) => {

    left.last_char = e.key

    // Faster than Electron
    if(e.keyCode == 9){
      if(e.shiftKey){
        left.select_synonym();   
      }
      else{
        left.select_autocomplete(); 
      }
      e.preventDefault();
      return;
    }

    // Reset index on space
    if(e.key == " " || e.key == "Enter"){
      left.selection.index = 0;
    }
    
    if(e.key.substring(0,5) == "Arrow"){
      setTimeout(() => left.refresh(), 0) //force the refresh event to happen after the selection updates
      return;
    }

    // Slower Refresh
    if(e.key == "Enter" && left.textarea_el.value.length > 50000 || left.textarea_el.value.length < 50000 ){
      setTimeout(() => {left.dictionary.update(),left.refresh()}, 0)
      return;
    }

    left.controller.trigger(e,true)
  }

  document.onkeyup = (e) => {

    if(e.keyCode == 9){
      return;
    }

    left.controller.trigger(e)
    left.refresh()
  }
}