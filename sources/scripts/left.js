function Left()
{
  this.theme = new Theme();
  this.dictionary = new Dict();
  this.operator = new Operator();
  this.navi = new Navi();
  this.project = new Project();
  this.options = new Options();
  this.reader = new Reader();

  this.textarea_el    = document.createElement('textarea');
  this.stats_el       = document.createElement('stats');
  this.scroll_el      = document.createElement('scrollbar');

  this.selection = {word: null,index:1};

  this.words_count = null;
  this.lines_count = null;
  this.chars_count = null;
  this.suggestion = null;
  this.synonyms = null;
  this.last_char = "s"; // this is not a typo. it's bad code, but it has to be a length one string

  document.body.appendChild(this.navi.el);
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

    this.textarea_el.value = this.splash();
    this.textarea_el.setSelectionRange(0,0);
    
    this.dictionary.update();
    this.refresh();
  }

  this.refresh = function()
  {
    left.selection.word = this.active_word();

    // Only look for suggestion is at the end of word, or text.
    var next_char = this.textarea_el.value.substr(left.textarea_el.selectionEnd,1);

    left.suggestion = (next_char == "" || next_char == " " || next_char == "\n") ? left.dictionary.find_suggestion(left.selection.word) : null;

    this.options.update();
    this.navi.update();
    this.update_stats();
  }

  this.update_stats = function()
  {
    var stats = left.parse_stats(left.selected());

    var suggestion_html = "";
    var synonym_html = " <b>"+left.selection.word+"</b> ";

    if(left.selection.word && left.suggestion && left.selection.word != left.suggestion){
      suggestion_html = " <t>"+left.selection.word+"<b>"+left.suggestion.substr(left.selection.word.length,left.suggestion.length)+"</b></t>"
    }
    else{
      left.synonyms = this.dictionary.find_synonym(left.selection.word);
      for(syn_id in left.synonyms){
        synonym_html += syn_id == (left.selection.index % left.synonyms.length) ? "<i>"+left.synonyms[syn_id]+"</i> " : left.synonyms[syn_id]+" ";
      }
    }
    left.stats_el.innerHTML = left.synonyms && left.selected().length < 5 ? synonym_html : (left.textarea_el.selectionStart != left.textarea_el.selectionEnd ? "<b>["+left.textarea_el.selectionStart+","+left.textarea_el.selectionEnd+"]</b> " : '')+""+stats.l+"L "+stats.w+"W "+stats.v+"V "+stats.c+"C "+suggestion_html;
  }

  this.parse_stats = function(text = left.textarea_el.value)
  {
    text = text.length > 5 ? text.trim() : left.textarea_el.value;

    var h = {};
    var words = text.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(" ");
    for(id in words){
      h[words[id]] = 1
    }

    var stats = {};
    stats.l = text.split("\n").length; // lines_count
    stats.w = text.split(" ").length; // words_count
    stats.c = text.length; // chars_count
    stats.v = Object.keys(h).length;
    return stats;
  }

  // Location tools

  this.selected = function()
  {
    var value = left.textarea_el.value.substr(left.textarea_el.selectionStart,left.textarea_el.selectionEnd - left.textarea_el.selectionStart);
    return value;
  }

  this.active_line_id = function()
  {
    var segments = left.textarea_el.value.substr(0,left.textarea_el.selectionEnd).split("\n");
    return segments.length-1;
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

    // Preserve capitalization
    if(w.substr(0,1) == w.substr(0,1).toUpperCase()){
      word = word.substr(0,1).toUpperCase()+word.substr(1,word.length);
    }

    var before = this.textarea_el.value.substr(0,l.from);
    var after = this.textarea_el.value.substr(l.to);

    var target_selection = before.length+word.length;
    this.textarea_el.value = before+word+after;

    this.textarea_el.setSelectionRange(target_selection,target_selection);
    this.textarea_el.focus();
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
    this.inject(suggestion.substr(left.selection.word.length,suggestion.length)+" ");
  }

  this.replace_line = function(id, new_text, del = false) // optional arg for deleting the line, used in actions
  {
    let lineArr = this.textarea_el.value.split("\n",parseInt(id)+1)
    let arrJoin = lineArr.join("\n")

    let from = arrJoin.length-lineArr[id].length;
    let to = arrJoin.length;
    
    //splicing the string
    let new_text_value = this.textarea_el.value.slice(0,del ? from-1: from) + new_text + this.textarea_el.value.slice(to)

    // the cursor automatically moves to the changed position, so we have to set it back
    let cursor_start = this.textarea_el.selectionStart;
    let cursor_end = this.textarea_el.selectionEnd;
    let old_length = this.textarea_el.value.length
    let old_scroll = this.textarea_el.scrollTop
    //setting text area
    this.textarea_el.value = new_text_value
    //adjusting the cursor position for the change in length
    let length_dif = this.textarea_el.value.length - old_length
    if(cursor_start>to) {
    cursor_start += length_dif
    cursor_end += length_dif
    }
    //setting the cursor position
    if(this.textarea_el.setSelectionRange){
    this.textarea_el.setSelectionRange(cursor_start,cursor_end);
    }
    else if(this.textarea_el.createTextRange){
      var range = this.textarea_el.createTextRange();
      range.collapse(true);
      range.moveEnd('character',cursor_end);
      range.moveStart('character',cursor_start);
      range.select();
    }
    //setting the scroll position
    this.textarea_el.scrollTop = old_scroll
    //this function turned out a lot longer than I was expecting. Ah well :/
  }

  this.go_to_line = function(id)
  {
    let lineArr = this.textarea_el.value.split("\n",parseInt(id)+1)
    let arrJoin = lineArr.join("\n")

    let from = arrJoin.length-lineArr[id].length;
    let to = arrJoin.length;

    this.go_to_fromTo(from,to)
  }
  
  this.go_to = function(selection)
  {
    var from = this.textarea_el.value.indexOf(selection);
    var to   = from + selection.length;

    this.go_to_fromTo(from,to)
  }
  
  this.go_to_fromTo = function(from,to)
  {
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
     this.scroll_to(from,to)
     return from == -1 ? null : from;
  }

  this.scroll_to = function(from,to)
  { //creates a temp div which 
    let text_val = this.textarea_el.value
    var div = document.createElement("div");
    div.innerHTML = text_val.slice(0,to); 
    document.body.appendChild(div);
    this.textarea_el.scrollTop = div.offsetHeight - 60
    div.remove()
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

  this.reset = function()
  {
    left.textarea_el.value = left.splash();
    left.dictionary.update();
    left.refresh();
  }
}

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