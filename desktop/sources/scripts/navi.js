function Navi()
{
  this.el = document.createElement('navi');

  this.update = function()
  {
    this.el.innerHTML = "";

    for(var pid in left.project.pages){
      var page = left.project.pages[pid];
      this.el.appendChild(this._page(pid,page));
      var markers = page.markers();
      for(var i in markers){
        var marker = markers[i]
        this.el.appendChild(this._marker(pid,i,marker,markers));
      }
    }
  }

  this._page = function(id,page)
  {
    var el = document.createElement('li');

    var is_active = left.project.index == id
    var has_changes = left.project.pages[id].has_changes();

    el.textContent = page.name();
    el.className = `page ${is_active ? 'active' : ''} ${has_changes ? 'changes' : ''}`
    el.onmouseup = function on_mouseup(e){ left.go.to_page(id); }

    return el;
  }

  this._marker = function(pid,id,marker,markers)
  {
    var el = document.createElement('li');

    var pos = left.active_line_id();
    var is_active = this.marker() && this.marker().line == marker.line;

    el.innerHTML = `${marker.text}<i>${marker.line}</i>`;
    el.className = `marker ${marker.type} ${is_active ? 'active' : ''}`
    el.onmouseup = function on_mouseup(e){ left.go.to_page(pid,marker.line); }

    return el;
  }

  this.next_page = function()
  {
    var page = clamp(parseInt(left.project.index)+1,0,left.project.pages.length-1)
    left.go.to_page(page,0);
  }

  this.prev_page = function()
  {
    var page = clamp(parseInt(left.project.index)-1,0,left.project.pages.length-1)
    left.go.to_page(page,0);
  }

  this.next_marker = function()
  {
    var page = clamp(parseInt(left.project.index),0,left.project.pages.length-1)
    var marker = this.marker();
    var markers = left.project.page().markers();
    var next_index = clamp(marker.id+1,0,markers.length-1);

    left.go.to_page(page,markers[next_index].line);
  }

  this.prev_marker = function()
  {
    var page = clamp(parseInt(left.project.index),0,left.project.pages.length-1)
    var marker = this.marker();
    var markers = left.project.page().markers();
    var next_index = clamp(marker.id-1,0,markers.length-1);

    left.go.to_page(page,markers[next_index].line);
  }

  this.marker = function()
  {
    var markers = left.project.page().markers();
    var pos = left.active_line_id();

    var prev = null;
    for(id in markers){
      var marker = markers[id];
      if(marker.line > pos){ return markers[parseInt(id)-1]; }
    }
    return markers[markers.length-1];
  }

  this.on_scroll = function()
  {
    var scroll_distance = left.textarea_el.scrollTop;
    var scroll_max = left.textarea_el.scrollHeight - left.textarea_el.offsetHeight;
    var scroll_perc = Math.min(1, (scroll_max == 0) ? 0 : (scroll_distance / scroll_max));
    var navi_overflow_perc = Math.max(0, (left.navi.el.scrollHeight / window.innerHeight) - 1);
    
    left.navi.el.style.transform = "translateY(" + (-100 * scroll_perc * navi_overflow_perc) + "%)";
  }

  function clamp(v, min, max) { return v < min ? min : v > max ? max : v; }
}
