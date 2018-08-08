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
    this.update_scrollbar();
  }

  this._page = function(id,page)
  {
    var el = document.createElement('li');

    var is_active = left.project.index == id
    var has_changes = left.project.has_changes()

    el.textContent = page.name();
    el.className = `page ${is_active ? 'active' : ''} ${has_changes ? 'changes' : ''}`
    el.onmouseup = function on_mouseup(e){ left.project.show(id); }

    return el;
  }

  this._marker = function(pid,id,marker,markers)
  {
    var el = document.createElement('li');

    var pos = left.active_line_id();
    var next_marker = markers[parseInt(id)+1];
    var is_active = pid == left.project.index && pos >= marker.line && (!next_marker || pos < next_marker.line);

    el.innerHTML = `${marker.text}<i>${marker.line}</i>`;
    el.className = `marker ${marker.type} ${is_active ? 'active' : ''}`
    el.onmouseup = function on_mouseup(e){ left.project.show(pid,marker.line); }

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

  this.next_page = function()
  {
    // TODO
  }

  this.prev_page = function()
  {
    // TODO
  }

  this.next_marker = function()
  {
    // TODO
  }

  this.prev_marker = function()
  {
    // TODO
  }
}
