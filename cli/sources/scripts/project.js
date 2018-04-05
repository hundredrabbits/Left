module.exports = {
  paths: [],
  index: 0,
  original: '',

  new() {
    // No Project
    if (this.paths.length == 0) {
      left.textarea_el.setValue('');
      return;
    }

    var str = '';
    dialog.showSaveDialog((fileName) => {
      if (fileName === undefined) {
        return;
      }
      let filename = left.project.has_extension(fileName) ? fileName : `${fileName}.txt`;
      fs.writeFile(filename, str, (err) => {
        if (err) {
          alert("An error ocurred creating the file " + err.message);
          return;
        }
        this.paths.push(filename);
        left.refresh();
      });
    });
  },

  open() {
    if (this.has_changes()) {
      this.alert();
      return;
    }

    var paths = dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections']
    });

    if (!paths) {
      console.log("Nothing to load");
      return;
    }

    for (id in paths) {
      this.add(paths[id]);
    }
    setTimeout(() => {
      left.project.next();
    }, 400);
  },

  save() {
    var path = this.paths[this.index]
    if (!path) {
      this.save_as();
      return;
    }

    this.original = left.textarea_el.value;

    fs.writeFile(path, left.textarea_el.value, (err) => {
      if (err) {
        alert("An error ocurred updating the file" + err.message);
        console.log(err);
        return;
      }
      left.refresh();

      left.stats_el.setContent("<b>Saved</b> " + path);
    });
  },

  save_as() {
    var str = left.textarea_el.value;

    dialog.showSaveDialog((fileName) => {
      if (fileName === undefined) {
        return;
      }
      let filename = left.project.has_extension(fileName) ? fileName : `${fileName}.txt`;
      fs.writeFile(filename, str, (err) => {
        if (err) {
          alert("An error ocurred creating the file " + err.message);
          return;
        }
        this.paths.push(filename);
        left.refresh();
      });
    });
  },

  close() {
    if (this.paths.length == 1) {
      this.clear();
      return;
    }
    if (this.has_changes()) {
      left.project.alert();
      return;
    }

    this.force_close();
  },

  force_close() {
    this.discard();

    this.paths.splice(this.index, 1);
    this.prev();
  },

  discard() {
    left.textarea_el.setValue(left.project.original);
    left.refresh();
  },

  quit() {
    if (this.has_changes()) {
      this.quit_dialog();
    } else {
      app.exit()
    }
  },

  quit_dialog() {
    dialog.showMessageBox({
      type: 'question',
      buttons: ['Yes', 'No'],
      title: 'Confirm',
      message: 'Unsaved data will be lost. Are you sure you want to quit?',
      icon: `${app.path()}/icon.png`
    }, function(response) {
      if (response === 0) {
        app.exit()
      }
    })
  },

  add(path) {
    if (!path) {
      return;
    }
    if (this.paths.indexOf(path) > -1) {
      return;
    }

    this.paths.push(path);
    left.refresh();
    this.next();
  },

  next() {
    if (this.index > this.paths.length - 1) {
      return;
    }

    this.show_file(this.index + 1);
    left.navi.update();
  },

  prev() {
    if (this.index < 1) {
      return;
    }

    this.show_file(this.index - 1);
    left.navi.update();
  },

  clear() {
    this.paths = [];
    this.index = 0;
    this.original = "";

    left.textarea_el.setValue('');
    left.dictionary.update();
    left.refresh();
  },

  load_path(path) {
    if (!path) {
      this.original = left.textarea_el.value;
      return;
    }

    fs.readFile(path, 'utf-8', (err, data) => {
      if (err) {
        alert("An error ocurred reading the file :" + err.message);
        return;
      }
      left.project.load(data, path);
      left.scroll_to(0, 0)
      left.refresh();
    });
  },

  load(content, path) {
    if (is_json(content)) {
      var obj = JSON.parse(content);
      content = this.format_json(obj);
    }

    this.original = content;

    left.textarea_el.setValue(content);
    left.dictionary.update();
    left.refresh();
    left.stats_el.setContent("<b>Loaded</b> " + path);
  },

  show_file(index, force = false) {
    if (this.has_changes() && !force) {
      left.project.alert();
      return;
    }

    var path = left.project.paths[left.project.index];
    var parts = path.replace(/\\/g, "/").split("/")
    var file_name = parts[parts.length - 1];

    // document.title = file_name ? `Left — ${file_name}` : "Left"
    this.index = clamp(index, 0, this.paths.length - 1);

    this.load_path(this.paths[this.index]);
    left.navi.update();
  },

  has_extension(str) {
    if (str.indexOf(".") < 0) {
      return false;
    }
    var parts = str.split(".");
    return parts[parts.length - 1].length <= 2 ? true : false;
  },

  has_changes() {
    return left.textarea_el.value != left.project.original && left.textarea_el.value != left.splash();
  },

  alert() {
    setTimeout(function() {
      left.stats_el.setContent(
        `<b>Unsaved Changes</b> ${left.project.paths.length > 0 ? left.project.paths[left.project.index] : 'Save(C-s) or Discard changes(C-d).'}`
      )
    }, 400);
  },

  format_json(obj) {
    return JSON.stringify(obj, null, "  ");
  },

  should_confirm() {
    if (left.textarea_el.value.length > 0) {
      return true;
    }
  }
}

function is_json(text) {
  try {
    JSON.parse(text);
    return true;
  } catch (error) {
    return false;
  }
}

function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v;
}
