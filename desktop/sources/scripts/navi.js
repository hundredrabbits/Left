function Navi()
{
  this.el = document.createElement('navi');
  this.markers = [];

  this.update = function()
  {
    this.el.innerHTML = "";

    for(var id in left.project.pages){
      var page = left.project.pages[id];
      this.el.appendChild(this._file(id,page));
      var markers = page.markers();
      for(var i in markers){
        var marker = markers[i]
        this.el.appendChild(this._marker(i,marker,markers));
      }
    }
    this.update_scrollbar();
  }

  this._file = function(id,page)
  {
    var el = document.createElement('li');

    var is_active = left.project.index == id
    var has_changes = left.project.has_changes()

    el.textContent = page.name();
    el.className = `${is_active ? 'active' : ''} ${has_changes ? 'changes' : ''}`
    el.onmouseup = function on_mouseup(e){ left.project.show_page(id); }

    return el;
  }

  this._marker = function(id,marker,markers)
  {
    var el = document.createElement('li');

    var pos = left.active_line_id();
    var next_marker = markers[parseInt(id)+1];
    var is_active = pos >= marker.line && (!next_marker || pos < next_marker.line);

    el.innerHTML = `${marker.text}<i>${marker.line}</i>`;
    el.className = `${marker.type} ${is_active ? 'active' : ''}`
    el.onmouseup = function on_mouseup(e){ left.go.to_line(marker.line); }

    return el;
  }

  this.update_scrollbar = function()
  {
    var scroll_distance = left.textarea_el.scrollTop;
    var scroll_max = left.textarea_el.scrollHeight - left.textarea_el.offsetHeight;
    var scroll_perc = Math.min(1, (scroll_max == 0) ? 0 : (scroll_distance / scroll_max));
    var navi_overflow_perc = Math.max(0, (left.navi.el.scrollHeight / window.innerHeight) - 1);
    
    left.scroll_el.style.transform = "scaleX(" + scroll_perc + ")";
    left.navi.el.style.transform = "translateY(" + (-100 * scroll_perc * navi_overflow_perc) + "%)";
  }

  this.next = function()
  {
    var active_line_id = left.active_line_id();

    for(marker_id in this.markers){
      var marker = this.markers[marker_id];
      if(marker.line > active_line_id){
        left.go.to_line(marker.line);
        break;
      }
    }
  }

  this.prev = function()
  {
    var active_line_id = left.active_line_id();

    for(marker_id in this.markers){
      var marker = this.markers[this.markers.length-(parseInt(marker_id)+1)];
      if(marker.line < active_line_id){
        left.go.to_line(marker.line);
        break;
      }
    }
  }
}
