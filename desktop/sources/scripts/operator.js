function Operator()
{
  this.el = document.createElement('input'); this.el.id = "operator";
  this.is_active = false;
  this.index = 0;

  this.el.addEventListener("keyup", (e) => { left.operator.on_change(e,false); });
  this.el.addEventListener("keydown", (e) => { left.operator.on_change(e,true); });

  this.start = function(f = "")
  {
    console.log("started");
    left.controller.set("operator");
    this.is_active = true;

    left.textarea_el.blur();
    this.el.value = f;
    this.el.focus();

    this.update();
    left.refresh();
  }

  this.stop = function()
  {
    if(!this.is_active){ return; }
    
    console.log("stopped")
    left.controller.set("default");
    this.is_active = false;

    this.el.value = "";
    this.el.blur();
    left.textarea_el.focus();

    this.update();
    left.refresh();
  }

  this.on_change = function(e,down = false)
  {
    if(!this.is_active){ return; }

    if(e.key == "ArrowUp" && down){
      this.el.value = this.prev;
      e.preventDefault();
      return;
    }
    
    if(!down && (e.key == "Enter" || e.code == "Enter")){
      this.active();
    }
    else if(!down){
      this.passive();
    }
  }

  this.update = function()
  {
    this.el.className = this.is_active ? "active" : "inactive";

    if(!this.is_active){ return; }

    this.passive();
  }

  this.passive = function()
  {
    if(this.el.value.indexOf(" ") < 0){ return; }

    var cmd = this.el.value.split(" ")[0].replace(":","").trim()
    var params = this.el.value.replace(cmd,"").replace(":","").trim()

    if(!this[cmd]){ console.info(`Unknown command ${cmd}.`); return; }

    this[cmd](params);
  }

  this.active = function()
  {
    if(this.el.value.indexOf(" ") < 0){ return; }

    this.prev = this.el.value;

    var cmd = this.el.value.split(" ")[0].replace(":","").trim()
    var params = this.el.value.replace(cmd,"").replace(":","").trim()

    if(!this[cmd]){ console.info(`Unknown command ${cmd}.`); return; }

    this[cmd](params,true);
  }

  this.find = function(q,bang = false)
  {
    if(q.length < 3){ return; }

    var results = left.find(q);

    if(results.length < 1){ return; }

    var from = left.textarea_el.selectionStart;
    var result = 0;
    for(id in results){
      result = results[id];
      if(result > from){ break; }
    }

    if(bang && result){
      left.go.to(result,result+q.length);
      this.stop();
    }
  }

  this.replace = function(q,bang = false)
  {
    if(q.indexOf("->") < 0){ return; }

    var a = q.split("->")[0].trim();
    var b = q.split("->")[1].trim();

    if(a.length < 3){ return; }
    if(b.length < 3){ return; }

    var results = left.find(a);

    if(results.length < 1){ return; }

    var from = left.textarea_el.selectionStart;
    var result = 0;
    for(id in results){
      result = results[id];
      if(result > from){ break; }
    }

    if(bang){
      left.go.to(result,result+a.length);
      setTimeout(() => { left.replace_selection_with(b); }, 500)
      this.stop();
    }
  }

  this.goto = function(q,bang = false)
  {
    var target = parseInt(q);

    if(q == "" || target < 1){ return; }

    if(bang){
      this.stop();
      left.go.to_line(target);
    }
  }
}