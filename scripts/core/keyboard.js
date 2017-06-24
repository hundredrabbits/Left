function Keyboard()
{
  this.shift_held = false;
  this.alt_held = false;

  document.onkeyup = function myFunction(){ keyboard.listen_onkeyup(event); };
  document.onkeydown = function myFunction(){ keyboard.listen_onkeydown(event); };

  this.listen_onkeydown = function(event)
  {
    if(event.shiftKey == true){
      this.shift_held = true;
    }
    if(event.altKey == true){
      this.alt_held = true;
    }

    // Autocomplete with tab
    if(event.keyCode === 9){
      var ac = ronin.terminal.find_autocomplete();
      if(ac){
        event.preventDefault();
        ronin.terminal.input.value += ac;
      }
    }

    ronin.cursor.update(event);
    ronin.widget.update();
    ronin.terminal.update();
  }

  this.listen_onkeyup = function(event)
  {
    this.shift_held = false;
    this.alt_held = false;

    event.preventDefault();

    switch (event.key || event.keyCode || event.which) {
      case "Enter": this.key_enter(); break;
      case "ArrowUp": this.key_arrow_up(); break;
      case "ArrowDown": this.key_arrow_down(); break;
      case "ArrowLeft": this.key_arrow_left(); break;
      case "ArrowRight": this.key_arrow_right(); break;
      case "]": ronin.brush.size_up(); break;
      case "[": ronin.brush.size_down(); break;
      case ":": this.key_colon(); break;
      case "Escape": this.key_escape(); break;
      case 13:  this.key_enter();  break;
      case 186: if(event.shiftKey){this.key_colon();}  break;
      case 27:  this.key_escape(); break;
      case 219:  ronin.brush.size_up(); break;
      case 221:  ronin.brush.size_down(); break;
      case 38:  this.key_arrow_up(); break;
      case 40:  this.key_arrow_down(); break;
      case 8: this.key_delete(); break;
    }

    console.log(event)

    // Passive
    ronin.widget.update();
    ronin.terminal.update();
    ronin.cursor.update();
  };

  this.key_tab = function()
  {
  }

  this.key_enter = function()
  {
    ronin.terminal.run();
  }

  this.key_space = function()
  {
  }

  this.key_arrow_up = function()
  {
    ronin.frame.select_layer(ronin.frame.layer_above());
  }

  this.key_arrow_down = function()
  {
    ronin.frame.select_layer(ronin.frame.layer_below());
  }

  this.key_arrow_left = function()
  {
    if(ronin.module){ ronin.module.key_arrow_left(); }
  }

  this.key_arrow_right = function()
  {
    if(ronin.module){ ronin.module.key_arrow_right(); }
  }

  this.key_colon = function()
  {
    return false;
  }

  this.key_escape = function()
  {
    ronin.overlay.key_escape();
    
    for(var key in ronin.modules){
      ronin.modules[key].key_escape();
    }
  }

  this.key_delete = function()
  {
    if(ronin.module){ ronin.module.key_delete(); }
  }
}
