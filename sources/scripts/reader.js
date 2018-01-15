function Reader()
{
  this.segment = {from:0,to:0,text:"",words:[]};
  this.queue = [];
  this.index = 0;
  this.speed = 175;

  this.start = function()
  {
    left.controller.set("reader");
    this.segment.from = left.textarea_el.selectionStart
    this.segment.to = left.textarea_el.selectionEnd
    this.segment.text = left.textarea_el.value.substr(this.segment.from,this.segment.to - this.segment.from).replace(/\n/g," ")
    this.segment.words = this.segment.text.split(" ");
    this.queue = this.segment.words;
    this.index = 0;
    this.run();
  }

  this.run = function()
  {
    if(left.reader.queue.length == 0){ left.reader.stop(); return; }

    var words = left.reader.segment.text.split(" ");
    var word = left.reader.queue[0];
    var orp = left.reader.find_orp(word,words);

    var html = ": ";
    html += "<span style='opacity:0'>"+left.reader.orp_pad(words,orp)+"</span>"
    html += "<span class='fm'>"+orp.before.trim()+"</span><span class='fh'>"+orp.key.trim()+"</span><span class='fm'>"+(word.length > 1 ? orp.after : '').trim()+"</span>";
    html += "<span style='float:right'>"+left.reader.queue.length+"W "+parseInt((left.reader.queue.length * 175)/1000)+"S "+parseInt(((left.reader.index)/parseFloat(left.reader.queue.length+left.reader.index)) * 100)+"% "+parseInt((1000/left.reader.speed)*60)+"W/M</span>"
    left.stats_el.innerHTML = html;

    left.reader.queue = left.reader.queue.splice(1,left.reader.queue.length-1);
    left.reader.index += 1;

    var range = words.splice(0,left.reader.index).join(" ").length;
    left.select(left.reader.segment.from,left.reader.segment.from+range);

    setTimeout(left.reader.run,left.reader.speed);
  }

  this.stop = function()
  {
    left.controller.set("default");
    this.segment = {from:0,to:0,text:"",words:[]};
    this.queue = [];
    this.index = 0;
    left.operator.stop();
    left.refresh();
  }

  this.find_orp = function(word,words)
  {
    var word = word.toLowerCase().trim();
    var index = parseInt(word.length/2)-1;
    var before = word.substr(0,index);
    var after = word.substr(index+1,word.length-index);

    return {before:before,key:word.substr(index,1),after:after,index:index}
  }

  this.orp_pad = function(words,orp)
  {
    var longest = "";
    for(i in words){
      if(words[i].length < longest.length){ continue; }
      longest = words[i]
    }

    var longest_orp = left.reader.find_orp(longest)
    var longest_pad = longest_orp.index;

    var pad = "";

    i = 0;
    while(i < longest_pad - (orp.index)){
      pad += "-";
      i += 1
    }
    return pad;
  }
}