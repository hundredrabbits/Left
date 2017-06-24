function Left()
{
  this.navi  = document.createElement('navi'); 
  this.textarea  = document.createElement('textarea'); 

  this.textarea.addEventListener('input', input_change, false);

  this.install = function()
  {
    document.body.appendChild(this.navi);
    document.body.appendChild(this.textarea);
    this.start();
  }

  this.start = function()
  {

  }

  this.parse = function(text)
  {
    this.navi.innerHTML = "";

    var html = "";
    var lines = text.split("\n");
    var words = 0;
    for(line_id in lines){
      var line = lines[line_id];
      if(line.substr(0,1) == "@"){
        html += "<li onClick='go_to(\""+line+"\")'>"+line.replace("@ ","")+"<span>~"+line_id+"</span></li>";
      }
      else if(line.substr(0,1) == "$"){
        html += "<li onClick='go_to(\""+line+"\")' class='note'>- "+line.replace("$ ","")+"<span>~"+line_id+"</span></li>";
      }
      words += line.split(" ").length;
    }

    html += "<li class='stats'>"+lines.length+" lines, "+words+" words</li>"
    this.navi.innerHTML = html;
  }

  this.go_to = function(selection)
  {
    var oInput = this.textarea;
    var oStart = this.textarea.value.indexOf(selection);
    var oEnd = oStart + 10;

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
    left.parse(left.textarea.value);
  }

}
