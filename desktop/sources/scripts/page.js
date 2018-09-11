"use strict";

function Page(text = "",path = null)
{
  this.text = text;
  this.path = path;
  this.time = new Date().getTime();

  this.name = function()
  {
    if(!this.path){ return "Untitled"; }
    
    let parts = this.path.replace(/\\/g,"/").split("/");
    return parts[parts.length-1];
  }

  this.has_changes = function()
  {
    if(!this.path){ 
      if(this.text && this.text.length > 0){ return true; }
      return false;
    }
    return this.load() != this.text;
  }

  this.is_active = function()
  {
    return true;
  }

  this.commit = function(text = left.textarea_el.value)
  {
    this.text = text;
  }

  this.reload = function(force = false)
  {
    if(!this.path){ return; }

    if(!this.has_changes() || force){
      this.commit(this.load());
    }
  }

  this.load = function()
  {
    if(!this.path){ return; }
    let data;
    try {
      data = fs.readFileSync(this.path, 'utf-8');
    } catch (err) {
      alert("An error ocurred reading the file :" + err.message);
      return;
    }
    return data;
  }

  this.edited = function()
  {
    if(!this.path){ return; }

    let time;

    try{
      time = require('fs').statSync(this.path).mtimeMs
    }
    catch(err){
      console.warn(err);
      this.path = null; // Remove path, lost sync.
    }
    return time
  }

  this.sync = function()
  {
    let edit = this.edited();
    if(!edit){ console.log("Nothing to sync"); return; }

    let offset = this.time - edit;
    console.log('edited',offset)
  }

  this.markers = function()
  {
    let a = [];
    let lines = this.text.split("\n");
  
    for(let id in lines){
      let line = lines[id].trim();
      if(line.substr(0,2) == "##"){ a.push({id:a.length,text:line.replace("##","").trim(),line:parseInt(id),type:"subheader"}); }
      else if(line.substr(0,1) == "#"){ a.push({id:a.length,text:line.replace("#","").trim(),line:parseInt(id),type:"header"}); }
      else if(line.substr(0,2) == "--"){ a.push({id:a.length,text:line.replace("--","").trim(),line:parseInt(id),type:"comment"}); }
    }
    return a;
  }
}