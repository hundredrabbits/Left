function Left()
{
  this.theme = new Theme();
  this.dictionary = new Dict();
  this.operator = new Operator();

  this.navi_el        = document.createElement('navi');
  this.textarea_el    = document.createElement('textarea');
  this.stats_el       = document.createElement('stats');
  this.scroll_el      = document.createElement('scrollbar');

  this.words_count = null;
  this.lines_count = null;
  this.chars_count = null;
  this.current_word = null;
  this.suggestion = null;
  this.synonyms = null;
  this.synonym_index = 0;

  this.path = null;

  document.body.appendChild(this.theme.el);
  document.body.appendChild(this.navi_el);
  document.body.appendChild(this.textarea_el);
  document.body.appendChild(this.stats_el);
  document.body.appendChild(this.scroll_el);
  document.body.className = window.location.hash.replace("#","");

  this.textarea_el.setAttribute("autocomplete","off");
  this.textarea_el.setAttribute("autocorrect","off");
  this.textarea_el.setAttribute("autocapitalize","off");
  this.textarea_el.setAttribute("spellcheck","false");
  this.textarea_el.setAttribute("type","text");

  var left = this;

  this.start = function()
  {
    this.theme.start();
    this.dictionary.start();

    this.textarea_el.focus();

    if(localStorage.backup){
      this.textarea_el.value = localStorage.backup;
    }
    else{
      this.textarea_el.value = this.splash();
      this.textarea_el.setSelectionRange(0,0);
    }
    
    this.dictionary.update();
    this.refresh();
  }

  this.refresh = function()
  {
    left.current_word = left.active_word();

    // Only look for suggestion is at the end of word, or text.
    var next_char = this.textarea_el.value.substr(left.textarea_el.selectionEnd,1);

    left.suggestion = (next_char == "" || next_char == " " || next_char == "\n") ? left.dictionary.find_suggestion(left.current_word) : null;

    this.refresh_navi();
    this.refresh_stats();
    left.refresh_scrollbar();
  }

  this.active_line_id = function()
  {
    var segments = left.textarea_el.value.substr(0,left.textarea_el.selectionEnd).split("\n");
    return segments.length-1;
  }

  this.find_markers = function()
  {
    var text = left.textarea_el.value;
    var lines = text.split("\n");
    var markers = [];

    left.lines_count = lines.length;
    left.words_count = text.split(" ").length;
    left.chars_count = text.length;

    for(var line_id in lines){
      var line = lines[line_id];
      if(line.substr(0,3) == "  \"" && line.indexOf(":") > -1){
        var text = line.split(":")[0].replace(/\"/g,'');
        markers.push({text:text,line:line_id,type:"header"});        
      }
      if(line.substr(0,2) == "@ " || line.substr(0,2) == "# "){
        var text = line.replace("@ ","").replace("# ","");
        markers.push({text:text,line:line_id,type:"header"});
      }
      if(line.substr(0,2) == "$ " || line.substr(0,3) == "## "){
        var text = line.replace("@ ","").replace("## ","");
        markers.push({text:text,line:line_id,type:"note"});
      }
    }
    return markers;
  }

  this.refresh_navi = function()
  {
    var markers = left.find_markers();
    left.navi_el.innerHTML = "";
    var active_line_id = left.active_line_id();
    var i = 0;
    for(marker_id in markers){
      var marker = markers[marker_id];
      var next_marker = markers[i+1];

      var el = document.createElement('li');
      el.destination = marker.line;
      el.innerHTML = marker.text+"<span>"+marker.line+"</span>";
      el.className = active_line_id >= marker.line && (next_marker && active_line_id < next_marker.line) ? marker.type+" active" : marker.type;
      el.className += marker.type == "header" ? " fh" : " fm";
      el.onmouseup = function on_mouseup(e){ left.go_to_line(e.target.destination); }
      left.navi_el.appendChild(el);

      i += 1;
    }
  }

  this.refresh_stats = function()
  {
    var stats = {};
    stats.l = left.lines_count;
    stats.w = left.words_count;
    stats.c = left.chars_count;
    stats.v = left.dictionary.vocabulary.length-1;

    suggestion_html = (left.current_word && left.suggestion && left.current_word != left.suggestion) ? " <t>"+left.current_word+"<b>"+left.suggestion.substr(left.current_word.length,left.suggestion.length)+"</b></t>" : "";

    // Synonyms
    left.synonyms = this.dictionary.find_synonym(left.current_word);

    synonym_html = "";

    for(syn_id in left.synonyms){
      synonym_html += syn_id == (left.synonym_index % left.synonyms.length) ? "<i>"+left.synonyms[syn_id]+"</i> " : left.synonyms[syn_id]+" ";
    }

    left.stats_el.innerHTML = left.synonyms ? " <b>"+left.current_word+"</b> "+synonym_html : ""+stats.l+"L "+stats.w+"W "+stats.v+"V "+stats.c+"C "+suggestion_html+synonym_html;
  }

  this.refresh_scrollbar = function()
  {
    var scroll_distance = left.textarea_el.scrollTop;
    var scroll_max = left.textarea_el.scrollHeight - left.textarea_el.offsetHeight;
    left.scroll_el.style.height = (scroll_distance/scroll_max) * window.innerHeight;
  }

  this.active_word_location = function(position = left.textarea_el.selectionEnd)
  {
    var from = position - 1;

    // Find beginning of word 
    while(from > -1){
      char = this.textarea_el.value[from];
      if(!char || !char.match(/[a-z]/i)){
        break;
      }
      from -= 1;
    }

    // Find end of word
    var to = from+1;
    while(to < from+30){
      char = this.textarea_el.value[to];
      if(!char || !char.match(/[a-z]/i)){
        break;
      }
      to += 1;
    }

    from += 1;

    return {from:from,to:to};
  }

  this.active_word = function()
  {
    var l = this.active_word_location();
    return left.textarea_el.value.substr(l.from,l.to-l.from);
  }

  this.replace_active_word_with = function(word)
  {
    var l = this.active_word_location();
    var w = left.textarea_el.value.substr(l.from,l.to-l.from);

    // Preserve capitali.ation
    if(w.substr(0,1) == w.substr(0,1).toUpperCase()){
      word = word.substr(0,1).toUpperCase()+word.substr(1,word.length);
    }

    var before = this.textarea_el.value.substr(0,l.from);
    var after = this.textarea_el.value.substr(l.to);

    var target_selection = before.length+word.length;
    this.textarea_el.value = before+word+after;

    this.textarea_el.setSelectionRange(target_selection,target_selection);
    this.textarea_el.focus();

    left.synonym_index += 1;

    left.refresh_stats();
  }

  this.inject = function(characters = "__")
  {
    var pos = this.textarea_el.selectionStart;
    var before = this.textarea_el.value.substr(0,pos);
    var middle = characters;
    var after  = this.textarea_el.value.substr(pos,this.textarea_el.value.length);

    this.textarea_el.value = before+middle+after;
    this.textarea_el.setSelectionRange(pos+characters.length,pos+characters.length);
    this.refresh();
  }

  this.autocomplete = function()
  {
    var suggestion = left.suggestion;
    this.inject(suggestion.substr(left.current_word.length,suggestion.length));
  }

  this.simple_export = function()
  {
    var text = left.textarea_el.value;
    var blob = new Blob([text], {type: "text/plain;charset=" + document.characterSet});
    var d = new Date(), e = new Date(d);
    var since_midnight = e - d.setHours(0,0,0,0);
    var timestamp = parseInt((since_midnight/864) * 10);
    saveAs(blob, "backup."+timestamp+".txt");
  }

  this.export = function()
  {
    if(typeof dialog == "undefined"){ this.simple_export(); return; }

    var str = left.textarea_el.value;

    dialog.showSaveDialog((fileName) => {
      if (fileName === undefined){ return; }
      fs.writeFile(fileName+".txt", str, (err) => {
        if(err){ alert("An error ocurred creating the file "+ err.message); return; }
        left.path = fileName+".txt";
      });
    }); 
  }

  this.go_to_line = function(line_id)
  {
    this.go_to(this.textarea_el.value.split("\n")[line_id]);
  }

  this.go_to = function(selection)
  {
    var from = this.textarea_el.value.indexOf(selection);
    var to   = from + selection.length;

    if(this.textarea_el.setSelectionRange){
     this.textarea_el.setSelectionRange(from,to);
    }
    else if(this.textarea_el.createTextRange){
      var range = this.textarea_el.createTextRange();
      range.collapse(true);
      range.moveEnd('character',to);
      range.moveStart('character',from);
      range.select();
    }
    this.textarea_el.focus();

    var perc = (left.textarea_el.selectionEnd/parseFloat(left.chars_count));
    var offset = 60;
    this.textarea_el.scrollTop = (this.textarea_el.scrollHeight * perc) - offset;
    return from == -1 ? null : from;
  }

  this.go_to_next = function()
  {
    var markers = left.find_markers();
    var active_line_id = left.active_line_id();

    for(marker_id in markers){
      var marker = markers[marker_id];
      if(marker.line > active_line_id){
        left.go_to_line(marker.line);
        break;
      }
    }
  }

  this.go_to_prev = function()
  {
    var markers = left.find_markers();
    var active_line_id = left.active_line_id();

    var i = 0;
    for(marker_id in markers){
      var next_marker = markers[i+1];

      if(markers[i-1] && next_marker && next_marker.line > active_line_id){
        left.go_to_line(markers[i-1].line);
        break;
      }
      else if(!next_marker){
        left.go_to_line(markers[i-1].line);
        break;
      }
      i += 1;
    }
  }

  this.go_to_word = function(word,from = 0, tries = 0, starting_with = false, ending_with = false)
  {
    var target = word;
    if(starting_with){ target = target.substr(0,target.length-1); }
    if(ending_with){ target = target.substr(1,target.length-1); }

    if(this.textarea_el.value.substr(from,length).indexOf(target) == -1 || tries < 1){ console.log("failed"); return; }

    var length = this.textarea_el.value.length - from;
    var segment = this.textarea_el.value.substr(from,length)
    var location = segment.indexOf(target);
    var char_before = segment.substr(location-1,1);
    var char_after = segment.substr(location+target.length,1);

    // Check for full word
    if(!starting_with && !ending_with && !char_before.match(/[a-z]/i) && !char_after.match(/[a-z]/i)){
      left.select(location+from,location+from+target.length);
      var perc = (left.textarea_el.selectionEnd/parseFloat(left.chars_count));
      var offset = 60;
      this.textarea_el.scrollTop = (this.textarea_el.scrollHeight * perc) - offset;
      return location;
    }
    else if(starting_with && !char_before.match(/[a-z]/i) && char_after.match(/[a-z]/i)){
      left.select(location+from,location+from+target.length);
      var perc = (left.textarea_el.selectionEnd/parseFloat(left.chars_count));
      var offset = 60;
      this.textarea_el.scrollTop = (this.textarea_el.scrollHeight * perc) - offset;
      return location;
    }
    else if(ending_with && char_before.match(/[a-z]/i) && !char_after.match(/[a-z]/i)){
      left.select(location+from,location+from+target.length);
      var perc = (left.textarea_el.selectionEnd/parseFloat(left.chars_count));
      var offset = 60;
      this.textarea_el.scrollTop = (this.textarea_el.scrollHeight * perc) - offset;
      return location;
    }

    left.go_to_word(word,location+target.length,tries-1, starting_with,ending_with);
  }

  this.select = function(from,to)
  {
    left.textarea_el.setSelectionRange(from,to);
  }

  this.selection = function()
  {
    return this.textarea_el.value.substr(left.textarea_el.selectionStart,left.textarea_el.selectionEnd - left.textarea_el.selectionStart);
  }

  this.reset = function()
  {
    left.textarea_el.value = left.splash();
    localStorage.setItem("backup", null);
    left.dictionary.update();
    left.refresh();
  }

  this.clear = function()
  {
    left.textarea_el.value = "";
    left.dictionary.update();
    left.refresh();
  }

  this.load = function(content,path = "")
  {
    if(is_json(content)){
      var obj = JSON.parse(content);
      content = this.format_json(obj);
    }

    if(left.textarea_el.value != ""){
      left.stats_el.innerHTML = "Erase content before loading a new file.";
      return;
    }

    var file_type = path.split(".")[path.split(".").length-1];

    if(file_type == "thm"){
      left.theme.install(obj);
    }

    left.path = path ? path : null;
    left.textarea_el.value = content;
    left.dictionary.update();
    left.refresh();
    left.stats_el.innerHTML = "<b>Loaded</b> "+path;
  }

  this.open = function()
  {
    var filepath = dialog.showOpenDialog({properties: ['openFile']});

    if(!filepath){ console.log("Nothing to load"); return; }

    fs.readFile(filepath[0], 'utf-8', (err, data) => {
      if(err){ alert("An error ocurred reading the file :" + err.message); return; }

      left.load(data,filepath[0]);
    });
  }

  this.save = function()
  {
    if(!left.path){ left.export(); return; }
    fs.writeFile(left.path, left.textarea_el.value, (err) => {
      if(err) { alert("An error ocurred updating the file" + err.message); console.log(err); return; }
      left.stats_el.innerHTML = "<b>Saved</b> "+left.path;
    });
  }

  this.save_backup = function()
  {
    localStorage.setItem("backup", left.textarea_el.value);
    console.log("Saved backup");
  }

  this.time = function()
  {
    var d = new Date(), e = new Date(d);
    var since_midnight = e - d.setHours(0,0,0,0);
    var timestamp = parseInt((since_midnight/864) * 10);

    return timestamp/1000;
  }

  this.splash = function()
  {
    var time = this.time();

    if(time > 800){ return "Good evening."; }
    if(time > 600){ return "Good afternoon."; }
    if(time < 350){ return "Good morning."; }
    return "Good day.";
  }

  this.format_json = function(obj)
  {
    return JSON.stringify(obj, null, "  ");
  }

  document.onkeyup = function key_up(e)
  {
    if(left.operator.is_active){
      e.preventDefault();
      return;
    }
  }

  document.onkeydown = function key_down(e)
  {
    // Operator
    if(e.key == "k" && (e.ctrlKey || e.metaKey)){
      e.preventDefault();
      left.operator.start();
      return;
    }

    if(left.operator.is_active){
      e.preventDefault();
      if(e.key == "Escape"){
        left.operator.stop();
      }
      else{
        left.operator.input(e);
      }
      return;
    }

    // Save
    if(e.key == "S" && (e.ctrlKey || e.metaKey)){
      e.preventDefault();
      left.export();
    }

    // Reset
    if((e.key == "Backspace" || e.key == "Delete") && e.ctrlKey && e.shiftKey){
      e.preventDefault();
      left.reset();
    }

    // Autocomplete
    if(e.keyCode == 9){
      e.preventDefault();
      if(left.suggestion && left.suggestion.toLowerCase() != left.active_word().toLowerCase()){ left.autocomplete(); }
      else if(left.synonyms){ left.replace_active_word_with(left.synonyms[left.synonym_index % left.synonyms.length]); }
    }

    if(e.key == "]" && (e.ctrlKey || e.metaKey)){
      e.preventDefault();
      left.go_to_next();
    }

    if(e.key == "[" && (e.ctrlKey || e.metaKey)){
      e.preventDefault();
      left.go_to_prev();
    }

    if(e.key == "n" && (e.ctrlKey || e.metaKey)){
      e.preventDefault();
      left.clear();
    }

    if(e.key == "o" && (e.ctrlKey || e.metaKey)){
      e.preventDefault();
      left.open();
    }

    if(e.key == "s" && (e.ctrlKey || e.metaKey)){
      e.preventDefault();
      left.save();
    }

    // Slower Refresh
    if(e.key == "Enter"){
      left.dictionary.update();
      left.save_backup();
      left.theme.save();
    }

    // Reset index on space
    if(e.key == " " || e.key == "Enter"){
      left.synonym_index = 0;
    }

    left.refresh();
  };

  left.textarea_el.addEventListener('wheel', function(e)
  {
    e.preventDefault();
    left.textarea_el.scrollTop += e.wheelDeltaY * -0.25;
    left.refresh_scrollbar();
  }, false);

  document.oninput = function on_input(e)
  {
    left.refresh();
  }

  document.onmouseup = function on_mouseup(e)
  {
    left.operator.stop();
    left.refresh();
  }
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
  
  if (file.type && !file.type.match(/text.*/)) { console.log("Not text", file.type); return false; }

  var path = file.path ? file.path : file.name;
  var reader = new FileReader();
  reader.onload = function(e){
    left.load(e.target.result,path)
  };
  reader.readAsText(file);
});

window.onbeforeunload = function(e)
{
  left.save_backup();
};

function is_json(text)
{
  try{
      JSON.parse(text);
      return true;
  }
  catch (error){
    return false;
  }
}