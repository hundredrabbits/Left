function Theme()
{
  var app = this;

  this.el = document.createElement("style");
  this.el.type = 'text/css';
  this.default = {meta:{}, data: { background: "#222", f_high: "#fff", f_med: "#777", f_low: "#444", f_inv: "#000", b_high: "#000", b_med: "#affec7", b_low: "#000", b_inv: "#affec7" }}
  this.active = this.default;

  this.start = function()
  {
    this.load(localStorage.theme ? localStorage.theme : this.default, this.default);
    window.addEventListener('dragover',this.drag_enter);
    window.addEventListener('drop', this.drag);
    document.head.appendChild(this.el)
  }

  this.load = function(t, fall_back)
  {
    var theme = is_json(t) ? JSON.parse(t).data : t.data;

    if(!theme || !theme.background){
      if(fall_back) {
        theme = fall_back.data;
      } else {
        return;
      }
    }

    var css = `
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
    this.el.textContent = css;
    localStorage.setItem("theme", JSON.stringify({data: theme}));
  }

  this.reset = function()
  {
    this.load(this.default);
  }

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

    var file = e.dataTransfer.files[0];

    if(!file.name || !file.name.indexOf(".thm") < 0){ console.log("Theme","Not a theme"); return; }

    var reader = new FileReader();
    reader.onload = function(e){
      app.load(e.target.result);
    };
    reader.readAsText(file);
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
}