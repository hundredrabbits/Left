function Left()
{
  this.navi      = document.createElement('navi'); 
  this.textarea  = document.createElement('textarea'); 
  this.stats     = document.createElement('stats');

  this.dictionary = null;
  this.words_count = null;
  this.lines_count = null;
  this.chars_count = null;

  document.body.appendChild(this.navi);
  document.body.appendChild(this.textarea);
  document.body.appendChild(this.stats);
  document.body.className = window.location.hash.replace("#","");

  var left = this;

  this.textarea.focus();

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

  // Unused

  function dict_refresh()
  {    
    console.log("update dict");
    var new_dict = {};
    left.words_count = 0;

    var lines = left.textarea.value.split("\n");
    for(var line_id in lines){
      var line = lines[line_id];
      // Dict
      for(var word_id in line.split(" ")){
        var word = line.split(" ")[word_id].replace(/\W/g, '');
        if(!new_dict[word]){ new_dict[word] = 0; }
        new_dict[word] += 1;
        left.words_count += 1;
      }
    }
    left.dictionary = new_dict;
    // left.dictionary = sort_val(new_dict);
  }

  function sort_val(map)
  {
    var tupleArray = [];
    for (var key in map) tupleArray.push([key, map[key]]);
    tupleArray.sort(function (a, b) { return b[1] - a[1] });
    return tupleArray;
  }

  function navi_refresh()
  {
    left.navi.innerHTML = "";

    var html = "";
    var lines = left.textarea.value.split("\n");
    var markers = [];

    left.lines_count = lines.length;
    left.words_count = 0;
    left.chars_count = 0;

    for(var line_id in lines){
      var line = lines[line_id];
      // Headers
      if(line.substr(0,2) == "@ "){ html += "<li onClick='go_to(\""+line+"\")'>"+line.replace("@ ","")+"<span>~"+line_id+"</span></li>"; markers.push(line); }
      if(line.substr(0,6) == "class "){ html += "<li onClick='go_to(\""+line+"\")'>"+line.replace("class ","")+"<span>~"+line_id+"</span></li>"; markers.push(line); }
      
      // Subs
      if(line.substr(0,2) == "$ "){ html += "<li onClick='go_to(\""+line+"\")' class='note'>- "+line.replace("$ ","")+"<span>~"+line_id+"</span></li>"; markers.push(line); }
      if(line.substr(0,2) == "> "){ html += "<li onClick='go_to(\""+line+"\")' class='note'>> "+line.replace("> ","")+"<span>~"+line_id+"</span></li>"; markers.push(line); }
      if(line.substr(0,4) == "def "){ html += "<li onClick='go_to(\""+line+"\")' class='note'>- "+line.replace("def ","")+"<span>~"+line_id+"</span></li>"; markers.push(line); }
      left.words_count += line.split(" ").length;
      left.chars_count += line.length;
    }

    if(markers.length == 0){
      html = "No Markers";
    }

    left.navi.innerHTML = html+"";
  }

  function stats_refresh()
  {
    var stats = {};
    stats.l = left.lines_count;
    stats.w = left.words_count;
    stats.v = (left.dictionary ? Object.keys(left.dictionary).length : '0');
    stats.c = left.chars_count;
    stats.p = (left.textarea.selectionStart/parseFloat(left.chars_count)) * 100; stats.p = stats.p > 100 ? 100 : parseInt(stats.p);

    left.stats.innerHTML = "<div class='stats'>"+stats.l+"L "+stats.w+"W "+stats.v+"V "+stats.c+"C "+stats.p+"%</div>";
  }

  function refresh()
  {
    navi_refresh();
    stats_refresh();    
  }

  document.onkeydown = function key_down(e)
  {
    if(e.key == "s" && e.ctrlKey){
      e.preventDefault();
      var text = left.textarea.value;
      var blob = new Blob([text], {type: "text/plain;charset=" + document.characterSet});
      saveAs(blob, "backup.txt");
    }
    if(e.key == " " || e.key == "Enter" || e.key == "." || e.key == ","){
      refresh();
    }
    if(e.key == "Enter"){
      dict_refresh();
    }
  };

  function refresh_loop()
  {
    refresh();
    setTimeout(function(){ refresh_loop(); }, 2000); 
  }

  function dict_refresh_loop()
  {
    dict_refresh();
    setTimeout(function(){ dict_refresh_loop(); }, 10000); 
  }

  this.refresh = function()
  {
    refresh();
  }

  refresh_loop();
  dict_refresh_loop();
}

window.addEventListener('dragover',function(e)
{ 
  e.stopPropagation(); 
  e.preventDefault(); 
  e.dataTransfer.dropEffect = 'copy'; 
});

window.addEventListener('drop', function(e)
{
  e.stopPropagation();
  e.preventDefault();

  var files = e.dataTransfer.files;
  var file = files[0];

  if (!file.type.match(/text.*/)) { console.log("Not image"); return false; }

  var reader = new FileReader();
  reader.onload = function(e){
    left.textarea.value = e.target.result;
    left.refresh();
  };
  reader.readAsText(file);
});

window.onbeforeunload = function(e)
{
  return 'Trying to close the window';
};
