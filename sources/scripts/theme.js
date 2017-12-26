function Theme()
{
  this.el = document.createElement("style");
  this.active = null;

  this.default = { background: "#222", f_high: "#fff", f_med: "#777", f_low: "#444", f_inv: "#000", b_high: "#000", b_med: "#affec7", b_low: "#000", b_inv: "#affec7" }

  this.start = function()
  {
    if(localStorage.theme && is_json(localStorage.theme)){
      console.log("Theme","Found in localStorage")
      this.install(JSON.parse(localStorage.theme));  
    }
    else{
      console.log("Theme","Creating new")
      this.install(this.default);
    }
  }

  this.save = function()
  {
    localStorage.setItem("theme", JSON.stringify(this.active));
    console.log("Theme","Saved");
  }

  this.load = function(theme_str)
  {
    if(is_json(theme_str)){
      this.install(JSON.parse(theme_str));
    }
    console.log("Theme","Loaded");
  }

  this.install = function(theme)
  {
    var html = "";

    this.active = theme;

    html += "body { background:"+theme.background+" !important }\n";
    html += ".fh { color:"+theme.f_high+" !important; stroke:"+theme.f_high+" !important }\n";
    html += ".fm { color:"+theme.f_med+" !important ; stroke:"+theme.f_med+" !important }\n";
    html += ".fl { color:"+theme.f_low+" !important ; stroke:"+theme.f_low+" !important }\n";
    html += ".f_inv { color:"+theme.f_inv+" !important ; stroke:"+theme.f_inv+" !important }\n";
    html += ".f_special { color:"+theme.f_special+" !important ; stroke:"+theme.f_special+" !important }\n";
    html += ".bh { background:"+theme.b_high+" !important; fill:"+theme.b_high+" !important }\n";
    html += ".bm { background:"+theme.b_med+" !important ; fill:"+theme.b_med+" !important }\n";
    html += ".bl { background:"+theme.b_low+" !important ; fill:"+theme.b_low+" !important }\n";
    html += ".b_inv { background:"+theme.b_inv+" !important ; fill:"+theme.b_inv+" !important }\n";

    html += "scrollbar { background:"+theme.b_med+" !important }\n";
    html += "textarea { color:"+theme.f_high+" !important }\n";
    html += "stats { color:"+theme.f_low+" !important }\n";
    html += "stats b { color:"+theme.f_high+" !important }\n";
    html += "highlight b { border-bottom: 1px solid "+theme.f_low+" !important; }\n";
    html += "::selection { background:"+theme.b_low+" !important; color:"+theme.f_med+" }\n";

    this.el.innerHTML = html;
    this.save();
  }

  this.reset = function()
  {
    console.log("Theme","reset");
    this.install(this.default);
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