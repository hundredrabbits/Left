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
    for(line_id in lines){
      var line = lines[line_id];
      if(line.substr(0,1) == "@"){
        html += "<li>"+line.replace("@ ","")+"<span>~"+line_id+"</span></li>";
      }
      else if(line.substr(0,1) == "$"){
        html += "<li class='note'>- "+line.replace("$ ","")+"<span>~"+line_id+"</span></li>";
      }
    }
    this.navi.innerHTML = html;
  }

  this.go_to = function(line)
  {
    var lineHeight = this.textarea.scrollHeight / this.textarea.rows;
    var jump = (line - 1) * lineHeight;
    this.textarea.scrollTop = jump;
  }

  function input_change()
  {
    left.parse(left.textarea.value);
  }
}
