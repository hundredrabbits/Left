function Left()
{
  this.navi_el        = document.createElement('navi'); 
  this.textarea_el    = document.createElement('textarea'); 
  this.stats_el       = document.createElement('stats');

  this.dictionary = new Dict();

  this.words_count = null;
  this.lines_count = null;
  this.chars_count = null;  
  this.current_word = null;
  this.suggestion = null;

  document.body.appendChild(this.navi_el);
  document.body.appendChild(this.textarea_el);
  document.body.appendChild(this.stats_el);
  document.body.className = window.location.hash.replace("#","");

  var left = this;

  this.start = function()
  {
    this.textarea_el.focus();
    this.textarea_el.value = this.splash();
    this.textarea_el.setSelectionRange(2,9);
    this.dictionary.update();
    this.refresh();
  }
  
  this.refresh = function()
  {
    left.current_word = left.active_word();
    left.suggestion = left.dictionary.find_suggestion(left.current_word);

    this.refresh_navi();
    this.refresh_stats();
  }

  this.refresh_navi = function()
  {
    left.navi_el.innerHTML = "";

    var html = "";
    var text = left.textarea_el.value;
    var lines = text.split("\n");
    var markers = [];

    left.lines_count = lines.length;
    left.words_count = text.split(" ").length;
    left.chars_count = text.length;

    for(var line_id in lines){
      var line = lines[line_id];
      if(line.substr(0,2) == "@ "){ html += "<li onClick='go_to(\""+line+"\")'>"+line.replace("@ ","")+"<span>"+line_id+"</span></li>"; markers.push(line); }
      if(line.substr(0,2) == "$ "){ html += "<li onClick='go_to(\""+line+"\")' class='note'>"+line.replace("$ ","")+"<span>"+line_id+"</span></li>"; markers.push(line); }
    }

    if(markers.length == 0){
      html = "No Markers";
    }

    left.navi_el.innerHTML = html;
  }

  this.refresh_stats = function()
  {
    var stats = {};
    stats.l = left.lines_count;
    stats.w = left.words_count;
    stats.c = left.chars_count;
    stats.v = left.dictionary.vocabulary.length;
    stats.p = (left.textarea_el.selectionStart/parseFloat(left.chars_count)) * 100; stats.p = stats.p > 100 ? 100 : parseInt(stats.p);

    suggestion_html = (left.current_word && left.suggestion && left.current_word != left.suggestion) ? " <t>"+left.current_word+"<b>"+left.suggestion.substr(left.current_word.length,left.suggestion.length)+"</b></t>" : "";

    // Synonyms
    var synonyms = this.dictionary.find_synonym(left.current_word); synonym_html = "";
    for(syn_id in synonyms){ synonym_html += synonyms[syn_id]+" "; }

    left.stats_el.innerHTML = synonyms ? " <b>"+left.current_word+"</b> "+synonym_html : stats.l+"L "+stats.w+"W "+stats.v+"V "+stats.c+"C "+stats.p+"%"+suggestion_html+synonym_html;
  }

  this.splash = function()
  {
    return "@ Welcome\n\n$ Controls\n\n- Create markers by beginning lines with either @ or $.\n- Overline words to look at synonyms.\n- Export a text file with ctrl+s.\n- Import a text file by dragging it on the window.\n- Press <tab> to autocomplete a word.\n- The synonyms dictionary contains "+Object.keys(left.dictionary.synonyms).length+" common words.\n\n$ Details\n\n- #L, stands for Lines.\n- #W, stands for Words.\n- #V, stands for Vocabulary, or unique words.\n- #C, stands for Characters.\n\n$ Themes\n\n- left.theme=blanc for the default theme.\n- left.theme=noir for the noir theme.\n- left.theme=pale for the low-contrast theme.\n\n$ Enjoy.\n\n- https://github.com/hundredrabbits/Left";
  }

  this.active_word = function()
  {
    var before = this.textarea_el.value.substr(0,left.textarea_el.selectionEnd);
    var words = before.replace(/\n/g," ").split(" ");
    var last_word = words[words.length-1];
    return last_word.replace(/\W/g, '');
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
  };

  this.check_cmd = function()
  {
    if(left.current_word == "leftthemenoir"){ document.body.className = "noir"; } // left.theme=noir
    if(left.current_word == "leftthemeblanc"){ document.body.className = "blanc"; } // left.theme=pale
    if(left.current_word == "leftthemepale"){ document.body.className = "pale"; } // left.theme=pale
    console.log(left.current_word)
  }

  document.onkeydown = function key_down(e)
  {
    if(e.key == "s" && e.ctrlKey){
      e.preventDefault();
      var text = left.textarea_el.value;
      var blob = new Blob([text], {type: "text/plain;charset=" + document.characterSet});
      var d = new Date(), e = new Date(d);
      var since_midnight = e - d.setHours(0,0,0,0);
      var timestamp = parseInt((since_midnight/864) * 10);
      saveAs(blob, "backup."+timestamp+".txt");
    }

    if(e.keyCode == 9 && left.suggestion){
      left.autocomplete();
      e.preventDefault();
    }

    if(e.key == "Enter" || e.key == " "){
      left.dictionary.update();
    }

    if(e.key.substr(0,5) == "Arrow"){
      left.refresh();
    }
  };

  document.oninput = function on_input(e)
  {
    left.refresh();
    left.check_cmd();
  }

  document.onmouseup = function on_mouseup(e)
  {
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

  if (!file.type.match(/text.*/)) { console.log("Not image"); return false; }

  var reader = new FileReader();
  reader.onload = function(e){
    left.textarea_el.value = e.target.result;
    left.dictionary.update();
    left.refresh();
  };
  reader.readAsText(file);
});

window.onbeforeunload = function(e)
{
  return 'Trying to close the window';
};
