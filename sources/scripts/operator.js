function Operator()
{
  this.el = document.createElement('input'); this.el.id = "operator";
  this.is_active = false;

  this.el.addEventListener("keyup", (e) => { left.operator.on_change(e); });

  this.start = function()
  {
    console.log("started");
    left.controller.set("operator");
    this.is_active = true;

    left.textarea_el.blur();
    this.el.focus();

    this.update();
    left.refresh();
  }

  this.stop = function()
  {
    console.log("stopped")
    left.controller.set("default");
    this.is_active = false;

    this.el.value = "";
    this.el.blur();
    left.textarea_el.focus();

    this.update();
    left.refresh();
  }

  this.on_change = function(e)
  {
    if(!this.is_active){ return; }

    this.update();

    if(e.key == "Enter" || e.code == "Enter"){
      this.operate();
    }
  }

  this.text = function()
  {
    return left.textarea_el.value;
  }

  this.update = function()
  {
    this.el.className = this.is_active ? "active" : "inactive";

    if(!this.is_active){ return; }

    var value = this.el.value;
    var target = value.split("=")[0];
    var operator = value.indexOf("=") > 0 ? value.split("=")[1] : "";
    var param = value.split("=").length > 2 ? value.split("=")[2] : "";

    var starting_with = target.substr(target.length-1,1) == "-" ? true : false;
    var ending_with = target.substr(0,1) == "-" ? true : false;

    if(target.length > 2){
      var location = left.go_to_word(target,0,10,starting_with,ending_with);    
    }
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
    var value = this.el.value;

    if(value.indexOf("=") > -1){
      var target = value.split("=")[0].trim();
      var param = value.split("=")[1].trim();
      this.update();
      left.replace_selection_with(param);  
    }

    this.stop();
  }
}