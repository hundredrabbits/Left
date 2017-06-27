function Left()
{
  this.navi      = document.createElement('navi'); 
  this.textarea  = document.createElement('textarea'); 
  this.stats     = document.createElement('stats');

  this.dictionary = null;
  this.words_count = null;
  this.lines_count = null;
  this.chars_count = null;

  this.ctrlcmdPressed = false;

  document.body.appendChild(this.navi);
  document.body.appendChild(this.textarea);
  document.body.appendChild(this.stats);
  document.body.className = window.location.hash.replace("#","");

  // Handle key presses 
  document.onkeydown = function key_down(e) {
    if(this.ctrlcmdPressed && e.key == 's') {
      e.preventDefault();
      var text = document.getElementsByTagName('textarea')[0].value;
      var blob = new Blob([text], {type: "text/plain;charset=" + document.characterSet});
      saveAs(blob, text.split("\n")[0] + ".txt");
    }

    if(e.keyCode === 224 || e.keyCode === 91 || e.keyCode === 93 || e.keyCode === 17)
      this.ctrlcmdPressed = true;
  };
  document.onkeyup = function key_up(e) {
    if(e.keyCode === 224 || e.keyCode === 91 || e.keyCode === 93 || e.keyCode === 17)
      this.ctrlcmdPressed = false;

    update_dict(event);
  };

  this.textarea.focus();
  this.textarea.addEventListener('input', input_change, false);
  this.textarea.addEventListener("scroll", on_scroll);

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
  };

  function on_scroll()
  {
    update_stats();
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
    left.navi.innerHTML = html+"";

    update_stats();
  }

  function update_stats()
  {
    var scroll_position = ((left.textarea.scrollTop + 30)/left.textarea.scrollHeight) * 100;
    left.stats.innerHTML = "<div class='stats'>"+left.lines_count+"L "+left.words_count+"W "+(left.dictionary ? Object.keys(left.dictionary).length+'V' : '')+" "+left.chars_count+"C "+parseInt(scroll_position)+"%</div>"
  }
  // Unused

  function update_dict(e)
  {
    if(e.keyCode != 13){ return; }
    
    var new_dict = {};
    left.words_count = 0;

    var lines = left.textarea.value.split("\n");
    for(line_id in lines){
      var line = lines[line_id];
      // Dict
      for(word_id in line.split(" ")){
        var word = line.split(" ")[word_id].replace(/\W/g, '');
        if(!new_dict[word]){ new_dict[word] = 0; }
        new_dict[word] += 1;
        left.words_count += 1;
      }
    }
    left.dictionary = sort_val(new_dict);
  }

  function sort_val(map)
  {
    var tupleArray = [];
    for (var key in map) tupleArray.push([key, map[key]]);
    tupleArray.sort(function (a, b) { return b[1] - a[1] });
    return tupleArray;
  }
}