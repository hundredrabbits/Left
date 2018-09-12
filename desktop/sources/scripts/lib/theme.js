'use strict';

function Theme()
{
  let theme = this;

  this.el = document.createElement("style");
  this.el.type = 'text/css';
  this.callback = null;

  this.collection = {
    noir: {meta:{}, data: { background: "#222", f_high: "#fff", f_med: "#777", f_low: "#444", f_inv: "#fff", b_high: "#000", b_med: "#aaa", b_low: "#000", b_inv: "#000" }},
    pale: {meta:{}, data: { background: "#e1e1e1", f_high: "#000", f_med: "#777", f_low: "#aaa", f_inv: "#000", b_high: "#000", b_med: "#aaa", b_low: "#ccc", b_inv: "#fff" }}
  }

  this.active = this.collection.noir;

  this.install = function(host = document.body,callback)
  {
    host.appendChild(this.el)
    this.callback = callback;
  }

  this.start = function()
  {
    this.load(localStorage.theme ? localStorage.theme : this.collection.noir, this.collection.noir);
  }

  this.load = function(t, fall_back = this.collection.noir)
  {
    let theme = is_json(t) ? JSON.parse(t).data : t.data;

    if(!theme || !theme.background){
      if(fall_back) {
        theme = fall_back.data;
      } else {
        return;
      }
    }

    let css = `
    :root {
      --background: ${theme.background};
      --f_high: ${theme.f_high};
      --f_med: ${theme.f_med};
      --f_low: ${theme.f_low};
      --f_inv: ${theme.f_inv};
      --b_high: ${theme.b_high};
      --b_med: ${theme.b_med};
      --b_low: ${theme.b_low};
      --b_inv: ${theme.b_inv};
    }`;

    this.active = theme;
    this.el.innerHTML = css;
    localStorage.setItem("theme", JSON.stringify({data: theme}));

    if(this.callback){
      this.callback();  
    }
  }

  this.reset = function()
  {
    this.load(this.collection.noir);
  }

  // Defaults

  this.pale = function()
  {
    this.load(this.collection.pale)
  }

  this.noir = function()
  {
    this.load(this.collection.noir)
  }

  this.invert = function()
  {
    this.load(this.active.background == this.collection.noir.data.background ? this.collection.pale : this.collection.noir)
  }

  // Drag

  this.drag_enter = function(e)
  {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }

  this.drag = function(e)
  {
    e.preventDefault();
    e.stopPropagation();

    let file = e.dataTransfer.files[0];

    if(!file.name || !file.name.indexOf(".thm") < 0){ console.log("Theme","Not a theme"); return; }

    let reader = new FileReader();
    reader.onload = function(e){
      theme.load(e.target.result);
    };
    reader.readAsText(file);
  }

  window.addEventListener('dragover',this.drag_enter);
  window.addEventListener('drop', this.drag);

  function is_json(text){ try{ JSON.parse(text); return true; } catch (error){ return false; } }
}