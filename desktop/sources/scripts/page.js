function Page(text = "",path = null)
{
  this.copy = text;
  this.text = text;
  this.path = path;

  this.name = function()
  {
    if(!this.path){ return "Untitled"; }
    
    var parts = path.replace(/\\/g,"/").split("/");
    return parts[parts.length-1];
  }

  this.has_changes = function()
  {
    return this.copy == this.text;
  }

  this.is_active = function()
  {
    return true;
  }

  this.markers = function()
  {
    var a = [];
    var lines = this.text.split("\n");
  
    for(var id in lines){
      var line = lines[id].trim();
      if(line.substr(0,2) == "##"){ a.push({text:line.replace("##","").trim(),line:parseInt(id),type:"subheader"}); }
      else if(line.substr(0,1) == "#"){ a.push({text:line.replace("#","").trim(),line:parseInt(id),type:"header"}); }
      else if(line.substr(0,2) == "--"){ a.push({text:line.replace("--","").trim(),line:parseInt(id),type:"comment"}); }
    }
    return a;
  }
}