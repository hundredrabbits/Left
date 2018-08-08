function Page(text = "",path = null)
{
  this.copy = text;
  this.text = text;
  this.path = path;

  this.name = function()
  {
    if(!this.path){ return "Untitled"; }
    
    var parts = this.path.replace(/\\/g,"/").split("/");
    return parts[parts.length-1];
  }

  this.has_changes = function()
  {
    return this.copy != this.text;
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

  this.markers = function()
  {
    var a = [];
    var lines = this.text.split("\n");
  
    for(var id in lines){
      var line = lines[id].trim();
      if(line.substr(0,2) == "##"){ a.push({id:a.length,text:line.replace("##","").trim(),line:parseInt(id),type:"subheader"}); }
      else if(line.substr(0,1) == "#"){ a.push({id:a.length,text:line.replace("#","").trim(),line:parseInt(id),type:"header"}); }
      else if(line.substr(0,2) == "--"){ a.push({id:a.length,text:line.replace("--","").trim(),line:parseInt(id),type:"comment"}); }
    }
    return a;
  }
}