"use strict";

function Page(text = "",path = null)
{
  this.copy = text;
  this.text = text;
  this.path = path;

  this.name = function()
  {
    if(!this.path){ return "Untitled"; }
    
    let parts = this.path.replace(/\\/g,"/").split("/");
    return parts[parts.length-1];
  }

  this.has_changes = function()
  {
    return this.copy != this.text;
  }

  this.has_external_changes = function()
  {
    return this.origin() != this.text;
  }

  this.is_active = function()
  {
    return true;
  }

  this.commit = function()
  {
    this.copy = this.text;
  }

  this.revert = function()
  {
    this.text = this.copy;
  }

  this.refresh = function()
  {
    this.text = this.origin();
    this.commit();
  }

  this.origin = function()
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