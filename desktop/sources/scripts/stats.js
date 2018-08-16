function Stats()
{
  this.el = document.createElement('stats');

  this.update = function(special = "")
  {
    if(left.insert.is_active){
      this.el.innerHTML = left.insert.status();
      return;
    }
      
    if(left.textarea_el.selectionStart != left.textarea_el.selectionEnd){
      this.el.innerHTML = this._selection();
    }
    else if(left.selection.word && left.suggestion){
      this.el.innerHTML = this._suggestion();
    }
    else if(left.synonyms){
      this.el.innerHTML = this._synonyms();
    }
    else if(left.selection.url){
      this.el.innerHTML = this._url(); 
    }
    else{
      this.el.innerHTML = this._default();
    }
  }

  this._default = function(stats)
  {
    var stats = this.parse(left.selected());
    var date = new Date();
    return `${stats.l}L ${stats.w}W ${stats.v}V ${stats.c}C ${stats.p}% <span class='right'>${date.getHours()}:${date.getMinutes()}</span>`
  }

  this._synonyms = function()
  {
    var html = `<b>${left.selection.word}</b> `
    for(id in left.synonyms){
      var synonym = left.synonyms[id]
      html += id == left.selection.index ? `<i>${synonym}</i> ` : synonym+" ";
    }
    return html
  }

  this._suggestion = function()
  {
    return `<t>${left.selection.word}<b>${left.suggestion.substr(left.selection.word.length,left.suggestion.length)}</b></t>`;
  }

  this._selection = function()
  {
    var p = ((left.textarea_el.selectionEnd/left.textarea_el.value.length)*100).toFixed(2)
    return `<b>[${left.textarea_el.selectionStart},${left.textarea_el.selectionEnd}]</b> ${p}%`
  }

  this._url = function()
  {
    var date = new Date();
    return `Open <b>${left.selection.url}</b> with &lt;c-b&gt; <span class='right'>${date.getHours()}:${date.getMinutes()}</span>`;
  }

  this.on_scroll = function()
  {
    var scroll_distance = left.textarea_el.scrollTop;
    var scroll_max = left.textarea_el.scrollHeight - left.textarea_el.offsetHeight;
    var scroll_perc = Math.min(1, (scroll_max == 0) ? 0 : (scroll_distance / scroll_max));
  
    this.el.innerHTML = `${(scroll_perc * 100).toFixed(2)}%`
  }

  this.parse = function(text = left.textarea_el.value)
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
    stats.p = stats.c > 0 ? ((left.textarea_el.selectionEnd/stats.c)*100).toFixed(2) : 0
    return stats;
  }
}