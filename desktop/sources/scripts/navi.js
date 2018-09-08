"use strict";

function Navi()
{
  this.el = document.createElement('navi');

  this.update = function()
  {
    this.el.innerHTML = "";

    for(let pid in left.project.pages){
      let page = left.project.pages[pid];
      this.el.appendChild(this._page(pid,page));
      let markers = page.markers();
      for(let i in markers){
        let marker = markers[i]
        this.el.appendChild(this._marker(pid,i,marker,markers));
      }
    }
  }

  this._page = function(id,page)
  {
    let el = document.createElement('li');

    let is_active = left.project.index == id
    let has_changes = left.project.pages[id].has_changes();

    el.textContent = page.name();
    el.className = `page ${is_active ? 'active' : ''} ${has_changes ? 'changes' : ''}`
    // el.onmouseup = function on_mouseup(e){ left.go.to_page(id); }
    el.onclick = (e) => { left.go.to_page(id); }

    return el;
  }

  this._marker = function(pid,id,marker,markers)
  {
    let el = document.createElement('li');

    let pos = left.active_line_id();
    let is_active = this.marker() && this.marker().line == marker.line;

    el.innerHTML = `<span>${marker.text}</span><i>${marker.line}</i>`;
    el.className = `marker ${marker.type} ${is_active ? 'active' : ''}`
    el.onclick = function on_click(e) { left.go.to_page(pid, marker.line); }

    return el;
  }

  this.next_page = function()
  {
    let page = clamp(parseInt(left.project.index)+1,0,left.project.pages.length-1)
    left.go.to_page(page,0);
  }

  this.prev_page = function()
  {
    let page = clamp(parseInt(left.project.index)-1,0,left.project.pages.length-1)
    left.go.to_page(page,0);
  }

  this.next_marker = function()
  {
    let page = clamp(parseInt(left.project.index),0,left.project.pages.length-1)
    let marker = this.marker();
    let markers = left.project.page().markers();
    let next_index = clamp(marker.id+1,0,markers.length-1);

    left.go.to_page(page,markers[next_index].line);
  }

  this.prev_marker = function()
  {
    let page = clamp(parseInt(left.project.index),0,left.project.pages.length-1)
    let marker = this.marker();
    let markers = left.project.page().markers();
    let next_index = clamp(marker.id-1,0,markers.length-1);

    left.go.to_page(page,markers[next_index].line);
  }

  this.marker = function()
  {
    let markers = left.project.page().markers();
    let pos = left.active_line_id();

    let prev = null;
    for(let id in markers){
      let marker = markers[id];
      if(marker.line > pos){ return markers[parseInt(id)-1]; }
    }
    return markers[markers.length-1];
  }

  this.on_scroll = function()
  {
    let scroll_distance = left.textarea_el.scrollTop;
    let scroll_max = left.textarea_el.scrollHeight - left.textarea_el.offsetHeight;
    let scroll_perc = Math.min(1, (scroll_max == 0) ? 0 : (scroll_distance / scroll_max));
    let navi_overflow_perc = Math.max(0, (left.navi.el.scrollHeight / window.innerHeight) - 1);

    left.navi.el.style.transform = "translateY(" + (-100 * scroll_perc * navi_overflow_perc) + "%)";
  }

  this.toggle = function()
  {
    document.body.classList.toggle('mobile');
  }

  function clamp(v, min, max) { return v < min ? min : v > max ? max : v; }
}
