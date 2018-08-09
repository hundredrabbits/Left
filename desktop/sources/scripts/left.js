function Left()
{
  this.splash = new Splash();
  this.theme = new Theme();
  this.controller = new Controller();
  this.dictionary = new Dictionary();
  this.operator = new Operator();
  this.navi = new Navi();
  this.stats = new Stats();
  this.go = new Go();
  this.project = new Project();
  this.options = new Options();
  this.reader = new Reader();
  this.insert = new Insert();

  this.textarea_el    = document.createElement('textarea');
  this.scroll_el      = document.createElement('scrollbar');
  this.drag_el        = document.createElement('drag');

  this.selection = {word: null,index:1};

  this.words_count = null;
  this.lines_count = null;
  this.chars_count = null;
  this.suggestion = null;
  this.synonyms = null;
  this.last_char = "s"; // this is not a typo. it's bad code, but it has to be a length one string

  document.body.appendChild(this.navi.el);
  document.body.appendChild(this.textarea_el);
  document.body.appendChild(this.stats.el);
  document.body.appendChild(this.scroll_el);
  document.body.appendChild(this.drag_el);
  document.body.appendChild(this.operator.el);
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

    this.textarea_el.value = `${this.splash}`;
    this.textarea_el.setSelectionRange(0,0);

    this.dictionary.update();
    this.refresh();
  }

  this.select_autocomplete = function()
  {
    if(left.selection.word.trim() != "" && left.suggestion && left.suggestion.toLowerCase() != left.active_word().toLowerCase()){ 
      left.autocomplete(); 
    }else{
      left.inject("\u00a0\u00a0")
    }
  }

  this.select_synonym = function()
  {
    if(left.synonyms){
      left.replace_active_word_with(left.synonyms[left.selection.index % left.synonyms.length]); 
      left.stats.update();
      left.selection.index += 1;
    }
  }

  this.select = function(from,to)
  {
    left.textarea_el.setSelectionRange(from,to);
  }

  this.select_line = function(id)
  {
    let lineArr = this.textarea_el.value.split("\n",parseInt(id)+1)
    let arrJoin = lineArr.join("\n")

    let from = arrJoin.length-lineArr[id].length;
    let to = arrJoin.length;

    this.select(from,to)
  }

  this.refresh = function()
  {
    var time = performance.now();

    var next_char = this.textarea_el.value.substr(left.textarea_el.selectionEnd,1);

    left.selection.word = this.active_word();
    left.suggestion     = (next_char == "" || next_char == " " || next_char == "\n") ? left.dictionary.find_suggestion(left.selection.word) : null;
    left.synonyms       = left.dictionary.find_synonym(left.selection.word);

    this.project.update();
    this.options.update();
    this.navi.update();
    this.stats.update();

    console.log(`Refreshed in ${(performance.now() - time).toFixed(2)}ms.`);
  }

  // Location tools

  this.selected = function()
  {
    var from = this.textarea_el.selectionStart;
    var to = this.textarea_el.selectionEnd;
    var length = to - from;
    return this.textarea_el.value.substr(from,length);
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

  this.prev_character = function()
  {
    var l = this.active_word_location();
    return left.textarea_el.value.substr(l.from-1,1);
  }

  this.replace_active_word_with = function(word)
  {
    var l = this.active_word_location();
    var w = left.textarea_el.value.substr(l.from,l.to-l.from);

    // Preserve capitalization
    if(w.substr(0,1) == w.substr(0,1).toUpperCase()){
      word = word.substr(0,1).toUpperCase()+word.substr(1,word.length);
    }
    
    this.textarea_el.setSelectionRange(l.from, l.to);

    document.execCommand('insertText', false, word);
    
    this.textarea_el.focus();
  }

  this.replace_selection_with = function(characters)
  {
    document.execCommand('insertText', false, characters);
    this.refresh();    
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

  this.inject = function(characters = "__")
  {
    var pos = this.textarea_el.selectionStart;
    this.textarea_el.setSelectionRange(pos, pos);
    document.execCommand('insertText', false, characters);
    this.refresh();
  }

  this.inject_line = function(characters = "__")
  {
    left.select_line(left.active_line_id())
    this.inject(characters)
  }

  this.inject_multiline = function(characters = "__")
  {
    var lines = this.selected().match(/[^\r\n]+/g);
    var text = ""
    for(id in lines){
      var line = lines[id];
      text += `${characters}${line}\n`
    }
    this.replace_selection_with(text);
  }

  this.find = function(word)
  {
    var text = left.textarea_el.value;
    var parts = text.split(word);
    var a = [];
    var sum = 0;

    for(id in parts){
      var p = parts[id].length
      a.push(sum + p);
      sum += p + word.length;
    }

    a.splice(-1,1)

    return a;
  }

  this.autocomplete = function()
  {
    this.inject(left.suggestion.substr(left.selection.word.length,left.suggestion.length)+" ");
  }

  this.reset = function()
  {
    left.theme.reset();
    left.refresh();
  }
}
