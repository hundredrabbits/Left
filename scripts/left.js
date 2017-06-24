function Left()
{
  this.navi      = document.createElement('navi'); 
  this.textarea  = document.createElement('textarea'); 

  document.body.appendChild(this.navi);
  document.body.appendChild(this.textarea);
  document.body.className = window.location.hash.replace("#","");

  this.textarea.focus();
  this.textarea.addEventListener('input', input_change, false);

  this.go_to = function(selection)
  {
    var from = this.textarea.value.indexOf(selection);
    var to   = from + selection.length;

    if(this.textarea.setSelectionRange){
     this.textarea.setSelectionRange(from,to);
    } 
    else if(this.textarea.createTextRange){
      var range = this.textarea.createTextRange();
      range.collapse(true);
      range.moveEnd('character',to);
      range.moveStart('character',from);
      range.select();
    }
    this.textarea.focus();
  }

  function input_change()
  {
    left.navi.innerHTML = "";

    var html = "";
    var lines = left.textarea.value.split("\n");
    var word_count = 0;

    for(line_id in lines){
      var line = lines[line_id];
      if(line.substr(0,1) == "@"){ html += "<li onClick='go_to(\""+line+"\")'>"+line.replace("@ ","")+"<span>~"+line_id+"</span></li>"; }
      if(line.substr(0,1) == "$"){ html += "<li onClick='go_to(\""+line+"\")' class='note'>- "+line.replace("$ ","")+"<span>~"+line_id+"</span></li>"; }
      word_count += line.split(" ").length;
    }

    html += "<div class='stats'>"+lines.length+" lines, "+word_count+" words</div>"
    left.navi.innerHTML = html;
  }
}