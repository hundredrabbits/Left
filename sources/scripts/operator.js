function Operator()
{
  this.is_active = false;
  this.value = "";

  this.start = function()
  {
    console.log("started");
    left.controller.set("operator");
    left.textarea_el.blur();

    this.is_active = true;

    this.update();
  }

  this.stop = function()
  {
    console.log("stopped")
    left.controller.set("default");
    this.value = "";
    this.is_active = false;
    left.refresh();
  }

  this.text = function()
  {
    return left.textarea_el.value;
  }

  this.input = function(e)
  {
    // if(e.key == "Escape"){
    //   this.stop();
    //   return;
    // }

    // if(e.key == "Enter"){
    //   this.operate();
    //   return;
    // }
    // if(e.key.length == 1){
    //   this.value += e.key;
    // }
    // if(e.key == "Backspace" && this.value.length > 0){
    //   this.value = this.value.substr(0,this.value.length-1);
    // }
    // if(parseInt(this.value) > 0){
    //   left.go_to_line(parseInt(this.value));
    // }
    // this.update();
  }

  this.update = function()
  {
    var target = this.value.split(" ")[0];
    var operator = this.value.indexOf(" ") > 0 ? this.value.split(" ")[1] : "";
    var param = this.value.split(" ").length > 2 ? this.value.split(" ")[2] : "";

    var starting_with = target.substr(target.length-1,1) == "-" ? true : false;
    var ending_with = target.substr(0,1) == "-" ? true : false;

    if(target.length > 2){
      var location = left.go_to_word(target,0,10,starting_with,ending_with);    
    }

    left.stats_el.innerHTML = "<t class='fm'>></t> <t class='fh'>"+target+"</t> <t class='fm'>"+operator+"</t> <t class='fh'>"+param+"</t> ";
  }

  this.select = function(query)
  {
    if(query.length < 3){ return []; }
    if(this.text().indexOf(query) == -1){ return []; }

    var parts = this.text().split(query);

    return parts;
  }

  this.operate = function()
  {
    var target = this.value.split(" ")[0];
    var operator = this.value.split(" ").length > 0 ? this.value.split(" ")[1] : null;
    var param = this.value.split(" ").length > 2 ? this.value.split(" ")[2] : null;

    var candidate = left.active_word();

    if(!candidate || !operator || !param || left.active_word() == param){
      this.stop();
      return;
    }

    left.replace_active_word_with(param);

    this.update();
  }
}