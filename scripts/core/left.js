function Left()
{
  this.navi  = document.createElement('navi'); 
  this.textarea  = document.createElement('textarea'); 

  this.textarea.addEventListener('input', input_change, false);

  document.body.appendChild(this.navi);
  document.body.appendChild(this.textarea);

  this.textarea.focus();

  // document.body.className = window.location.hash.replace("#","");

  this.go_to = function(selection)
  {
    var oInput = this.textarea;
    var oStart = this.textarea.value.indexOf(selection);
    var oEnd = oStart + selection.length;

    if( oInput.setSelectionRange ) {
     oInput.setSelectionRange(oStart,oEnd);
    } 
    else if( oInput.createTextRange ) {
     var range = oInput.createTextRange();
      range.collapse(true);
      range.moveEnd('character',oEnd);
      range.moveStart('character',oStart);
      range.select();
    }
    oInput.focus();
  }

  function input_change()
  {
    left.navi.innerHTML = "";

    var text = left.textarea.value;
    var html = "";
    var lines = text.split("\n");
    var word_count = 0;
    for(line_id in lines){
      var line = lines[line_id];
      if(line.substr(0,1) == "@"){
        html += "<li onClick='go_to(\""+line+"\")'>"+line.replace("@ ","")+"<span>~"+line_id+"</span></li>";
      }
      else if(line.substr(0,1) == "$"){
        html += "<li onClick='go_to(\""+line+"\")' class='note'>- "+line.replace("$ ","")+"<span>~"+line_id+"</span></li>";
      }
      word_count += line.split(" ").length;
    }

    html += "<div class='stats'>"+lines.length+" lines, "+word_count+" words</div>"
    left.navi.innerHTML = html;
  }
}