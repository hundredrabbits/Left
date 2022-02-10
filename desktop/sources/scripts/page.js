'use strict'

const fs = require('fs'),
      crypto = require('crypto')
const { ipcRenderer } = require('electron')

const EOL = '\n'
const hash = (data) => crypto.createHash('sha256').update(data).digest('hex')

function Page (text = '', path = null) {
  this.text = text.replace(/\r?\n/g, '\n')
  this.digest = hash(text)
  this.path = path
  this.lines = 0
  this.size = 0
  this.watchdog = true

  this.name = function () {
    if (!this.path) { return 'Untitled' }

    const parts = this.path.replace(/\\/g, '/').split('/')
    return parts[parts.length - 1]
  }

  this.has_changes = () => {
    if (!this.path) {
      if (this.text && this.text.length > 0) { return true }
      return false
    }

    const old_size = this.size
    const new_text = this.load()
    const ret = (hash(new_text) !== this.digest)

    // was this change done outside Left?
    if (ret && (old_size !== this.size && this.watchdog)) {
      return (async () => {
        const path = await ipcRenderer.invoke('app-path')
        const response = await ipcRenderer.invoke(
          'show-dialog', 'showMessageBoxSync',
          {
            type: "question",
            title: "Confirm",
            message: "File was modified outside Left. Do you want to reload it?",
            buttons: ['Yes', 'No', 'Ignore future occurrencies'],
            detail: `New size of file is: ${this.size} bytes.`,
            icon: `${path}/icon.png`
          }
        )

        if (response === 0) {
          this.commit( new_text )
          left.reload()
          return !ret // return false as it was reloaded
        } else if (response === 2)
          this.watchdog = !this.watchdog
      })()
    }
    return ret
  }

  this.commit = function (text = left.editor_el.value) {
    this.digest = hash(text)
    this.text = text
    this.update_lines()
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

    this.size = fs.statSync(this.path).size //  update file size
    return data
  }

  this.update_lines =  () => {
    const lines = []
    for (let n = 0; n < this.text.split(EOL).length; lines.push(++n)) ;
    left.number_el.innerHTML = lines.join('\n')
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
