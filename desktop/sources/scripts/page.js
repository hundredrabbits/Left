'use strict'

const fs = require('fs')
const EOL = '\n'

function Page (text = '', path = null) {
  this.text = text.replace(/\r?\n/g, '\n')
  this.path = path

  this.name = function () {
    if (!this.path) { return 'Untitled' }

    const parts = this.path.replace(/\\/g, '/').split('/')
    return parts[parts.length - 1]
  }

  this.has_changes = function () {
    if (!this.path) {
      if (this.text && this.text.length > 0) { return true }
      return false
    }
    return this.load() !== this.text
  }

  this.commit = function (text = left.textarea_el.value) {
    this.text = text
  }

  this.reload = function (force = false) {
    if (!this.path) { return }

    if (!this.has_changes() || force) {
      this.commit(this.load())
    }
  }

  this.load = function () {
    if (!this.path) { return }
    let data
    try {
      data = fs.readFileSync(this.path, 'utf-8')
    } catch (err) {
      this.path = null
      return
    }
    return data
  }

  this.markers = function () {
    const a = []
    const lines = this.text.split(EOL)
    for (const id in lines) {
      const line = lines[id].trim()
      if (line.substr(0, 2) === '##') { a.push({ id: a.length, text: line.replace('##', '').trim(), line: parseInt(id), type: 'subheader' }) } else if (line.substr(0, 1) === '#') { a.push({ id: a.length, text: line.replace('#', '').trim(), line: parseInt(id), type: 'header' }) } else if (line.substr(0, 2) === '--') { a.push({ id: a.length, text: line.replace('--', '').trim(), line: parseInt(id), type: 'comment' }) }
    }
    return a
  }
}

module.exports = Page
