function Options()
{
  this.zoom = 1
  this.marker_num = false
  this.suggestions = true
  this.synonyms = true
  
  this.update = function () 
  {
    var text = left.textarea_el.value;
    var lines = text.split("\n");

    left.lines_count = lines.length;
    for (var line_id in lines) {
      var line = lines[line_id]
      this.check_string(line, /~ *(?:left)?.?zoom *=?[ \(]*([^ \(\)]*)[ \)]*/i, "number", (res) => {
        this.zoom = res
        if(webFrame){webFrame.setZoomFactor(res) }
      })
      this.check_string(line, /~ *(?:left)?.?(?:marker|navi)[._ ]?nums? *=?[ \(]*([^ \(\)]*)[ \)]*/i, "boolean", (res) => {
        this.marker_num = res
      })
      this.check_string(line, /~ *(?:left)?.?theme *=?[ \(]*([^ \(\)]*)[ \)]*/i, "string", (res) => {
        left.theme.load(res)
      })
      this.check_string(line, /~ *(?:left)?.?suggestions? *=?[ \(]*([^ \(\)]*)[ \)]*/i, "boolean", (res) => {
        this.suggestions=res
      })
      this.check_string(line, /~ *(?:left)?.?synonyms? *=?[ \(]*([^ \(\)]*)[ \)]*/i, "boolean", (res) => {
        this.synonyms=res
      })
    }
  }

  this.check_string = function (text, regex, type, cb)
  {
    match = regex.exec(text)
    if(match) {
      this.check_json_type(match[1], type, cb)
    }
  }

  this.check_json_type = function (text, type, cb)
  {
    text = text.replace(/ *$/,"")
    if(is_json(text.toLowerCase())) {
      let res = JSON.parse(text.toLowerCase())
      if (typeof res == type) {
        cb(res)
      }
    } else {
      switch(type) {
        case "string":
          cb(text)
          break;
        case "boolean":
          if(text == "yes") {
            cb(true)
          } else if(text == "no") {
            cb(false)
          }
          break;
      }
    }
  }

  this.set_zoom = function(new_zoom)
  {
    if(!webFrame){ return; }
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

  this.check_actions = function()
  {
    var found = false
    var text = left.textarea_el.value;
    var lines = text.split("\n");
    var line = lines[left.active_line_id()]
    this.check_string(line, /> *=? *(?:go[ _]?to) *=?[ \(]*([^ \(\)]*)[ \)]*/i, "number", (res) => {
      found = true
      let actLine = left.active_line_id()
      left.go.to_line(res)
      left.replace_line(actLine,"",true)
    })
    this.check_string(line, /> *=? *replace *=?[ \(]*([^ \(\)]*)[ \)]*/i, "string", (res) => {
      let actLine = left.active_line_id()
      found = true
      //// declarations
      
      let res_array = res.split(/,/)
      res_array = res_array.map((a) => a.replace(/^ +/,"").replace(/ +$/,""))
      let regex = new RegExp(res_array[0], "g")
      let text_val = left.textarea_el.value

      let lineArr = text_val.split("\n",parseInt(actLine)+1)
      let arrJoin = lineArr.join("\n")
      let from = arrJoin.length-lineArr[actLine].length;
      let to = arrJoin.length;
      text_val = [text_val.slice(0,from),text_val.slice(to)]

      let replace_string,
      text_before_length_dif = 0; //the diffrence in length between the text before the cursor

      //// computation

      if(res_array.length == 2) { // there are two arguments
        try {
          let replace_num = text_val.join("").match(regex).length
          replace_string = "" + replace_num + " occurrence" + (replace_num==1 ? "" : "s") + " replaced"
          text_before_length_dif = text_val[0].replace(regex,res_array[1]).length-text_val[0].length
        } catch (error) {
          replace_string = "no occurrences found"
        }
      } else { // there is not two arguments
        replace_string = "replace action requires two comma separated arguments"
      }

      //// execution

      if(res_array.length == 2) left.textarea_el.value = left.textarea_el.value.replace(regex,res_array[1])
      let cursor_return_index = from+text_before_length_dif+replace_string.length // the place to set the cursor to
      left.go.to_fromTo(cursor_return_index,cursor_return_index)
      left.replace_line(actLine,replace_string,false)
      left.go.to_fromTo(cursor_return_index,cursor_return_index)
    })
    return found;
  }
}