function Options() {
  this.zoom = 1
  this.marker_num = false
  this.update = function () {
    var text = left.textarea_el.value;
    var lines = text.split("\n");

    left.lines_count = lines.length;
    if(left.last_char.length == 1) {
      for (var line_id in lines) {
        var line = lines[line_id].toLowerCase()
        this.check_string(line, /~ *(?:left)?.?zoom *=?[ \(]*([^ \(\)]*)[ \)]*/, "number", (res) => {
          this.zoom = res
          webFrame.setZoomFactor(res)
        })
        this.check_string(line, /~ *(?:left)?.?(?:marker|navi)[._ ]?num? *=?[ \(]*([^ \(\)]*)[ \)]*/, "boolean", (res) => {
          this.marker_num = res
        })
        this.check_string(line, /~ *(?:left)?.?theme *=?[ \(]*([^ \(\)]*)[ \)]*/, "string", (res) => {
          left.theme.load(res)
        })
    }
  }

  this.check_string = function (text, regex, type, cb) {
    match = regex.exec(text)
    if(match) {
      console.log(match)
      this.check_json_type(match[1], type, cb)
    }
  }

  this.check_json_type = function (text, type, cb) {
    if(is_json(text)) {
      let res = JSON.parse(text)
      if (typeof res == type) {
        cb(res)
      }
    } else {
      if(type == "string") {
        cb(text.replace(/ *$/,""))
      }
    }
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
  this.check_actions = function() {
    var found = false
    var text = left.textarea_el.value;
    var lines = text.split("\n");
    var line = lines[left.active_line_id()].toLowerCase()
    console.log(lines[left.active_line_id()].toLowerCase())
    this.check_string(line, /> *=? *(?:go[ _]?to) *=?[ \(]*([^ \(\)]*)[ \)]*/, "number", (res) => {
      found = true
      let actLine = left.active_line_id()
      left.go_to_line(res)
      left.replace_line(actLine,"",true)
    })
    return found;
  }
}