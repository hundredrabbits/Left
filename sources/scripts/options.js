function Options() {
  this.zoom = 1
  this.update = function () {
    var text = left.textarea_el.value;
    var lines = text.split("\n");

    left.lines_count = lines.length;

    for (var line_id in lines) {
      var line = lines[line_id].toLowerCase()
      this.check_string(line, /~ *(?:left)?.?zoom *=? */, "number", (res) => {
        this.zoom = res
        webFrame.setZoomFactor(res)
      })
    }
  }

  this.check_string = function (text, regex, type, cb) {
    if ( regex.test(text)) {
      this.check_json_type(text.replace(regex, ""), type, cb)
    }
  }

  this.check_json_type = function (text, type, cb) {
    try {
      let res = JSON.parse(text)
      if (typeof res == type) {
        cb(res)
      }
    } catch (error) { }
  }
  this.set_zoom = function(new_zoom) {
    if(new_zoom<0.1) new_zoom = 0.1
    new_zoom = Math.round(new_zoom*10)/10
    this.zoom = new_zoom
    webFrame.setZoomFactor(new_zoom)
    var text = left.textarea_el.value;
    var lines = text.split("\n");
    for (var line_id in lines) {
      var line = lines[line_id].toLowerCase()
      this.check_string(line, /~ *(?:left)?.?zoom *=? */, "number", (res) => {
        let c_line = line.replace(/~ *(?:left)?.?zoom *=? */, "")
        line_dif = line.length-c_line.length

          left.replace_line(line_id,line.substring(0,line_dif)+new_zoom)
      })
    }
  }
}