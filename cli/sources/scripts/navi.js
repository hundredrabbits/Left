module.exports = {
  // el: naviEl,
  markers: [],

  update() {
    this.el.setContent('');

    if (left.project.paths.length > 0) {
      this.project_markers();
    } else {
      this.display_markers();
    }

    this.update_scrollbar();
  },

  project_markers() {
    for (id in left.project.paths) {
      // Project markers
      var path = left.project.paths[id];
      var parts = path.replace(/\\/g, "/").split("/")
      var file_name = parts[parts.length - 1]
      // var file_el = document.createElement('li');

      file_el.destination = id;
      // file_el.className = left.project.index == id ? 'file active' : 'file';
      // file_el.textContent = file_name.substr(-file_name.length, 20);
      // this.el.append(file_el);

      this.el.add(file_name.substr(-file_name.length, 20));

      file_el.onmouseup = function on_mouseup(e) {
        left.project.show_file(e.target.destination);
      }

      // File Markers
      if (id != left.project.index) {
        continue;
      }

      // file_el.className += left.project.has_changes() ? " changes" : "";
      this.display_markers();
    }
  },

  display_markers() {
    this.update_markers();

    var active_line_id = left.active_line_id();
    var i = 0;
    var marker_num = left.options.marker_num
    for (marker_id in this.markers) {
      var marker = this.markers[marker_id];
      var next_marker = this.markers[i + 1];
      var el = document.createElement('li');

      el.destination = marker.line;

      // if (marker_num) {
      //   el.innerHTML = marker.text + "<span>" + marker.line + "</span>";
      // } else {
      //   el.innerHTML = marker.text;
      // }

      // el.className = active_line_id >= marker.line && (!(next_marker) || active_line_id < next_marker.line) ? marker.type + " active fh" : marker.type + " fm";
      //
      // el.className += marker.type == "header" ? " fh" : "";

      el.onmouseup = function on_mouseup(e) {
        left.go_to_line(e.target.destination);
      }

      if (marker_num) {
        this.el.add("<span>" + marker.line + "</span>");
      } else {
        this.el.add(marker.text);
      }

      this.el.appendChild(el);
      i += 1;
    }
  },

  update_markers() {
    var text = left.textarea_el.getValue();
    var lines = text.split("\n");
    this.markers = [];

    left.lines_count = lines.length;
    let regex = new RegExp(/[\w][^\w\-]+[\w]/g),
      matches = [],
      match;
    while (match = regex.exec(text)) {
      matches.push(match);
      regex.lastIndex = match.index + 1;
    }
    left.words_count = matches.length + 1;
    left.chars_count = text.length;

    for (var line_id in lines) {
      var line = lines[line_id];
      if (line.substr(0, 2).replace(/@/g, "#") == "##") {
        var text = line.substring(2).trim();
        text = text.replace(/[@#]+/, (match) => {
          return new Array(match.length + 1).join("\u200b ")
        })
        this.markers.push({
          text: text,
          line: line_id,
          type: "note"
        });
      } else if (line.substr(0, 1).replace(/@/g, "#") == "#") {
        var text = line.substring(1).trim();
        this.markers.push({
          text: text,
          line: line_id,
          type: "header"
        });
      } else if (line.substr(0, 2).replace(/@/g, "#") == "--") {
        var text = line.substring(2).trim();
        if (text.indexOf(" : ")) {
          text = text.split(" : ")[0].trim();
        }
        this.markers.push({
          text: text,
          line: line_id,
          type: "comment"
        });
      }
    }
  },

  update_scrollbar() {
    var scroll_distance = left.textarea_el.scrollTop;
    var scroll_progress = left.textarea_el.scrollHeight - left.textarea_el.offsetHeight;
    var scroll_max = left.textarea_el.scrollHeight - left.textarea_el.offsetHeight;
    var scroll_perc = (scroll_distance / scroll_max);

    // left.scroll_el.style.width = ((scroll_distance / scroll_progress) * window.innerWidth) + "px";

    // var navi_overflow = (left.navi.el.scrollHeight) - window.innerHeight;
    // left.navi.el.style.top = navi_overflow > 0 ? -(scroll_perc * navi_overflow) + "px" : 0;
  },

  next() {
    var active_line_id = left.active_line_id();

    for (marker_id in this.markers) {
      var marker = this.markers[marker_id];
      if (marker.line > active_line_id) {
        left.go_to_line(marker.line);
        break;
      }
    }
  },

  prev() {
    var active_line_id = left.active_line_id();

    for (marker_id in this.markers) {
      var marker = this.markers[this.markers.length - (parseInt(marker_id) + 1)];
      if (marker.line < active_line_id) {
        left.go_to_line(marker.line);
        break;
      }
    }
  }
}
