const Controller = require('./lib/controller.js');
const Dict = require('./dict.js');
const Operator = require('./operator.js');
const Navi = require('./navi.js');
const Project = require('./project.js');
const Options = require('./options.js');
const Reader = require('./reader.js');
const Insert = require('./insert.js');

module.exports = {
  controller: Controller,
  dictionary: Dict,
  operator: Operator,
  navi: Navi,
  project: Project,
  options: Options,
  reader: Reader,
  insert: Insert,
  textarea_el: {},

  // scroll_el: document.createElement('scrollbar'),
  // drag_el: document.createElement('drag'),

  selection: {word: null,index:1},

  words_count: null,
  lines_count: null,
  chars_count: null,
  suggestion: null,
  synonyms: null,
  last_char: "s", // this is not a typo. it's bad code, but it has to be a length one string

  start()
  {
    this.dictionary.start();
    this.textarea_el.focus();
    this.dictionary.update();
    this.refresh();
  },

  select_autocomplete()
  {
    if(this.selection.word.trim() != "" && this.suggestion && this.suggestion.toLowerCase() != this.active_word().toLowerCase()){
      this.autocomplete();
    }else{
      this.inject("\u00a0\u00a0")
    }
  },

  select_synonym()
  {
    if(this.synonyms){
      this.replace_active_word_with(this.synonyms[this.selection.index % this.synonyms.length]);
      this.update_stats();
      this.selection.index += 1;
    }
  },

  refresh()
  {
    this.selection.word = this.active_word();

    // Only look for suggestion is at the end of word, or text.
    var val = this.textarea_el.getValue();
    var next_char = this.textarea_el.value.substr(this.textarea_el.selectionEnd,1);

    this.suggestion = (next_char == "" || next_char == " " || next_char == "\n") ? this.dictionary.find_suggestion(this.selection.word) : null;

    this.options.update();
    this.navi.update();
    this.update_stats();
  },

  update_stats()
  {
    var stats = this.parse_stats(this.selected());

    var suggestion_html = "";
    var synonym_html = ` {BOLD}${this.selection.word}{/BOLD} `;

    if(this.insert.is_active){
      this.stats_el.setContent(this.insert.status());
      return;
    }
    else if(this.selection.word && this.suggestion && this.selection.word != this.suggestion){
      suggestion_html = ` <t>${this.selection.word}<b>${this.suggestion.substr(this.selection.word.length,this.suggestion.length)}</b></t>`;
    }
    else{
      this.synonyms = this.dictionary.find_synonym(this.selection.word);
      for(syn_id in this.synonyms){
        synonym_html += syn_id == (this.selection.index % this.synonyms.length) ? `<i>${this.synonyms[syn_id]}</i> ` : this.synonyms[syn_id]+" ";
      }
    }

    this.synonyms && this.selected().length < 5 ?
      this.stats_el.setContent(synonym_html) :
      this.stats_el.setContent(
        (this.textarea_el.selectionStart != this.textarea_el.selectionEnd ? "<b>["+this.textarea_el.selectionStart+","+this.textarea_el.selectionEnd+"]</b> " : '')+(`${stats.l}L ${stats.w}W ${stats.v}V ${stats.c}C ${suggestion_html}`)
      );
  },

  parse_stats(text = this.textarea_el.value)
  {
    text = text.length > 5 ? text.trim() : this.textarea_el.value;

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
  },

  // Location tools

  selected()
  {
    var value = this.textarea_el.value.substr(this.textarea_el.selectionStart,this.textarea_el.selectionEnd - this.textarea_el.selectionStart);
    return value;
  },

  active_line_id()
  {
    var segments = this.textarea_el.value.substr(0,this.textarea_el.selectionEnd).split("\n");
    return segments.length-1;
  },

  active_word_location(position = this.textarea_el.selectionEnd)
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
  },

  active_word()
  {
    var l = this.active_word_location();
    return this.textarea_el.value.substr(l.from,l.to-l.from);
  },

  prev_character()
  {
    var l = this.active_word_location();
    return this.textarea_el.value.substr(l.from-1,1);
  },

  replace_active_word_with(word)
  {
    var l = this.active_word_location();
    var w = this.textarea_el.value.substr(l.from,l.to-l.from);

    // Preserve capitalization
    if(w.substr(0,1) == w.substr(0,1).toUpperCase()){
      word = word.substr(0,1).toUpperCase()+word.substr(1,word.length);
    }

    var before = this.textarea_el.value.substr(0,l.from);
    var after = this.textarea_el.value.substr(l.to);

    var target_selection = before.length+word.length;
    this.textarea_el.setValue(before+word+after);

    this.textarea_el.setSelectionRange(target_selection,target_selection);
    this.textarea_el.focus();
  },

  replace_selection_with(characters)
  {
    var from = this.textarea_el.selectionStart;
    var to = this.textarea_el.selectionEnd;
    var length = to - from;
    var before = this.textarea_el.value.substr(0,from);
    var after  = this.textarea_el.value.substr(from+length,this.textarea_el.value.length);

    this.textarea_el.setValue(`${before}${characters}${after}`);

    this.textarea_el.setSelectionRange(from+characters.length,from+characters.length);
    this.refresh();
  },

  inject(characters = "__")
  {
    var pos = this.textarea_el.selectionStart;
    var before = this.textarea_el.value.substr(0,pos);
    var middle = characters;
    var after  = this.textarea_el.value.substr(pos,this.textarea_el.value.length);

    this.textarea_el.setValue(before+middle+after);

    this.textarea_el.setSelectionRange(pos+characters.length,pos+characters.length);
    this.refresh();
  },

  autocomplete()
  {
    var suggestion = this.suggestion;
    console.log(this.selection.word.length,suggestion.length)
    this.inject(suggestion.substr(this.selection.word.length,suggestion.length)+" ");
  },

  replace_line(id, new_text, del = false) // optional arg for deleting the line, used in actions
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
    this.textarea_el.setValue(new_text_value);
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
  },

  go_to_line(id)
  {
    let lineArr = this.textarea_el.value.split("\n",parseInt(id)+1)
    let arrJoin = lineArr.join("\n")

    let from = arrJoin.length-lineArr[id].length;
    let to = arrJoin.length;

    this.go_to_fromTo(from,to)
  },

  go_to(selection)
  {
    var from = this.textarea_el.value.indexOf(selection);
    var to   = from + selection.length;

    this.go_to_fromTo(from,to)
  },

  go_to_fromTo(from,to)
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
  },

  scroll_to(from,to)
  { //creates a temp div which
    let text_val = this.textarea_el.value
    var div = document.createElement("div");
    div.innerHTML = text_val.slice(0,to);
    document.body.appendChild(div);
    this.textarea_el.scrollTop = div.offsetHeight - 60
    div.remove()
  },

  go_to_word(word, from = 0, tries = 0, starting_with = false, ending_with = false)
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
      this.select(location+from,location+from+target.length);
      var perc = (this.textarea_el.selectionEnd/parseFloat(this.chars_count));
      var offset = 60;
      this.textarea_el.scrollTop = (this.textarea_el.scrollHeight * perc) - offset;
      return location;
    }
    else if(starting_with && !char_before.match(/[a-z]/i) && char_after.match(/[a-z]/i)){
      this.select(location+from,location+from+target.length);
      var perc = (this.textarea_el.selectionEnd/parseFloat(this.chars_count));
      var offset = 60;
      this.textarea_el.scrollTop = (this.textarea_el.scrollHeight * perc) - offset;
      return location;
    }
    else if(ending_with && char_before.match(/[a-z]/i) && !char_after.match(/[a-z]/i)){
      this.select(location+from,location+from+target.length);
      var perc = (this.textarea_el.selectionEnd/parseFloat(this.chars_count));
      var offset = 60;
      this.textarea_el.scrollTop = (this.textarea_el.scrollHeight * perc) - offset;
      return location;
    }

    this.go_to_word(word,location+target.length,tries-1, starting_with,ending_with);
  },

  select(from,to)
  {
    this.textarea_el.setSelectionRange(from,to);
  },

  time()
  {
    var d = new Date(), e = new Date(d);
    var since_midnight = e - d.setHours(0,0,0,0);
    var timestamp = parseInt((since_midnight/864) * 10);

    return timestamp/1000;
  },

  splash()
  {
    var time = this.time();
    if(time > 800){ return "Good evening."; }
    if(time > 600){ return "Good afternoon."; }
    if(time < 350){ return "Good morning."; }
    return "Good day.";
  },

  reset()
  {
    this.textarea_el.setValue(this.splash());
    this.dictionary.update();
    this.refresh();
  },
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
