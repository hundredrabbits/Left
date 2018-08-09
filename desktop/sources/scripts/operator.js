function Operator()
{
  this.el = document.createElement('input'); this.el.id = "operator";
  this.is_active = false;
  this.index = 0;

  this.el.addEventListener("keyup", (e) => { left.operator.on_change(e); });

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

  this.on_change = function(e)
  {
    if(!this.is_active){ return; }

    if(e.key == "Enter" || e.code == "Enter"){
      this.active();
    }
    else{
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

    var cmd = this.el.value.split(" ")[0].replace(":","").trim()
    var params = this.el.value.replace(cmd,"").replace(":","").trim()

    if(!this[cmd]){ console.info(`Unknown command ${cmd}.`); return; }

    this[cmd](params,true);
  }

  this.find = function(q,bang = false)
  {
    var r = left.find(q);

    if(r.length < 1){ return; }

    left.go.to_word(q,0,10);

    if(bang){
      left.go.to(r[0],q.length);
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

    var loc = left.go.to_word(a,this.index,10);

    if(bang){
      this.stop();
      left.replace_selection_with(b);  
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