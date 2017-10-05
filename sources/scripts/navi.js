function Navi()
{
  this.el = document.createElement('navi');
  this.markers = [];

  this.update = function()
  {
    this.update_markers();
    this.update_scrollbar();

    this.el.innerHTML = "";
    var active_line_id = left.active_line_id();
    var i = 0;
    var marker_num = left.options.marker_num
    for(marker_id in this.markers){
      var marker = this.markers[marker_id];
      var next_marker = this.markers[i+1];
      var el = document.createElement('li');
      el.destination = marker.line;
      if(marker_num) {
        el.innerHTML = marker.text+"<span>"+marker.line+"</span>";
      } else {
        el.innerHTML = marker.text;
      }
      el.className = active_line_id >= marker.line && (!(next_marker) || active_line_id < next_marker.line) ? marker.type+" active" : marker.type;
      el.className += marker.type == "header" ? " fh" : " fm";
      el.onmouseup = function on_mouseup(e){ left.go_to_line(e.target.destination); }
      this.el.appendChild(el);
      i += 1;
    }
  }

  this.update_markers = function()
  {
    var text = left.textarea_el.value;
    var lines = text.split("\n");
    this.markers = [];

    left.lines_count = lines.length;
    left.words_count = text.split(" ").length;
    left.chars_count = text.length;

    for(var line_id in lines){
      var line = lines[line_id];
      if(line.substr(0,2).replace(/@/g,"#") == "##"){
        var text = line.replace(/ +/,"").substring(2);
        text = text.replace(/#+/,(match) => {console.log(match);return new Array(match.length+1).join("\u200b ")})
        this.markers.push({text:text,line:line_id,type:"note"});
      }
      else if(line.substr(0,1).replace(/@/g,"#") == "#"){
        var text = line.replace(/ +/,"").substring(1);
        this.markers.push({text:text,line:line_id,type:"header"});
      }
      
    }
    // End
  }

  this.update_scrollbar = function()
  {
    var scroll_distance = left.textarea_el.scrollTop;
    var scroll_max = left.textarea_el.scrollHeight - left.textarea_el.offsetHeight;
    // if-else statement here could be shortened to single line, sacrificing readability
    if(scroll_max > 0) {
      left.scroll_el.style.width = (scroll_distance/scroll_max) * window.innerWidth;
    } else {
      left.scroll_el.style.width = 0
    }
  }

  this.next = function()
  {
    var active_line_id = left.active_line_id();

    for(marker_id in this.markers){
      var marker = this.markers[marker_id];
      if(marker.line > active_line_id){
        left.go_to_line(marker.line);
        break;
      }
    }
  }

  this.prev = function()
  {
    var active_line_id = left.active_line_id();

    var i = 0;
    for(marker_id in this.markers){
      var next_marker = this.markers[i+1];

      if(this.markers[i-1] && next_marker && next_marker.line > active_line_id){
        left.go_to_line(this.markers[i-1].line);
        break;
      }
      else if(!next_marker){
        left.go_to_line(this.markers[i-1].line);
        break;
      }
      i += 1;
    }
  }
}
