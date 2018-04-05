module.exports = {
  is_active: false,

  start() {
    left.controller.set("insert");
    this.is_active = true;
    left.refresh();
  },

  stop() {
    left.controller.set("default");
    this.is_active = false;
    left.refresh();
  },

  time() {
    left.inject(new Date().toLocaleTimeString() + " ")
    this.stop();
  },

  date() {
    var date = new Date()
    var strArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var d = date.getDate();
    var m = strArray[date.getMonth()];
    var y = date.getFullYear();
    var s = '' + (d <= 9 ? '0' + d : d) + '-' + m + '-' + y;
    left.inject(s + " ")
    this.stop();
  },

  path() {
    if (left.project.paths.length == 0) {
      left.inject("<Unsaved File>");
      this.stop();
      return;
    }

    left.inject(left.project.paths[left.project.index]);
    this.stop();
  },

  header() {
    if (left.prev_character() != "\n") {
      left.inject("\n");
    }
    left.inject("# ");
    this.stop();
  },

  subheader() {
    if (left.prev_character() != "\n") {
      left.inject("\n");
    }
    left.inject("## ");
    this.stop();
  },

  comment() {
    if (left.prev_character() != "\n") {
      left.inject("\n");
    }
    left.inject("-- ");
    this.stop();
  },

  line() {
    if (left.prev_character() != "\n") {
      left.inject("\n");
    }
    left.inject("===================== \n");
    this.stop();
  },

  status() {
    return `<b>Insert Mode</b> c-D <i>Date</i> c-T <i>Time</i> c-P <i>Path</i> Esc <i>Exit</i>.`
  }
}
