function Left()
{
  this.navi      = document.createElement('navi'); 
  this.textarea  = document.createElement('textarea'); 

  this.dictionary = null;
  this.words_count = null;
  this.lines_count = null;
  this.chars_count = null;

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

    left.lines_count = lines.length;
    left.words_count = 0;
    left.chars_count = 0;

    for(line_id in lines){
      var line = lines[line_id];
      // Headers
      if(line.substr(0,2) == "@ "){ html += "<li onClick='go_to(\""+line+"\")'>"+line.replace("@ ","")+"<span>~"+line_id+"</span></li>"; }
      if(line.substr(0,6) == "class "){ html += "<li onClick='go_to(\""+line+"\")'>"+line.replace("class ","")+"<span>~"+line_id+"</span></li>"; }
      // Subs
      if(line.substr(0,2) == "$ "){ html += "<li onClick='go_to(\""+line+"\")' class='note'>- "+line.replace("$ ","")+"<span>~"+line_id+"</span></li>"; }
      if(line.substr(0,4) == "def "){ html += "<li onClick='go_to(\""+line+"\")' class='note'>- "+line.replace("def ","")+"<span>~"+line_id+"</span></li>"; }
      left.words_count += line.split(" ").length;
      left.chars_count += line.length;
    }
    left.navi.innerHTML = html+"<div class='stats'>"+left.lines_count+"L"+left.words_count+"W"+left.chars_count+"C</div>";
  }

  // Unused
  
  function refresh_dict()
  {
    var new_dict = {};
    left.words_count = 0;

    var lines = left.textarea.value.split("\n");
    for(line_id in lines){
      var line = lines[line_id];
      // Dict
      for(word_id in line.split(" ")){
        var word = line.split(" ")[word_id].replace(/\W/g, '');
        if(!dictionary[word]){ dictionary[word] = 0; }
        dictionary[word] += 1;
        left.words_count += 1;
      }
    }
    left.dictionary = sort_val(dictionary);
  }

  function sort_val(map)
  {
    var tupleArray = [];
    for (var key in map) tupleArray.push([key, map[key]]);
    tupleArray.sort(function (a, b) { return b[1] - a[1] });
    return tupleArray;
  }
}