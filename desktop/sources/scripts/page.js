'use strict'

const fs = require('fs'),
      crypto = require('crypto')
const { ipcRenderer } = require('electron')

const EOL = '\n',
      markdowns = ['.md', '.txt', '.log'],
      markers = {
        header: { mark: '#', symbol: '◎'},
        subheader: { mark: '##', symbol: '⦿'},
        comment: { mark: '--', symbol: '⁃'},
      }

function Page (text = '', path = null) {
  this.hash = (data) => crypto.createHash('sha256').update(data).digest('hex')

  this.text = text.replace(/\r?\n/g, '\n')
  this.digest = this.hash(text)
  this.last_modification = -1
  this.path = path
  this.lines = 0
  this.watchdog = true
  this.is_markdown = true

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

    const prev_modification = this.last_modification
    const new_text = this.load()

    // file was deleted in fs
    if (new_text === null)
      return true

    const changed = this.text === '' ? false : (this.hash(new_text) !== this.digest)

    // was this change done outside Left?
    if (prev_modification > 0 && prev_modification < this.last_modification && this.watchdog) {
      return (async () => {
        const path = await ipcRenderer.invoke('app-path')
        const response = await ipcRenderer.invoke(
          'show-dialog', 'showMessageBoxSync',
          {
            type: "question",
            title: "Confirm",
            message: "File was modified outside Left. Do you want to reload it?",
            buttons: ['Yes', 'No', 'Ignore future occurrencies'],
            icon: `${path}/icon.png`
          }
        )

        if (response === 0) {
          left.editor_el.value = new_text
          this.commit()
          return false // return false as it was reloaded
        } else if (response === 2)
          this.watchdog = !this.watchdog
      })()
    }

    return changed
  }

  this.commit = function (text = left.editor_el.value) {
    this.text = text
    this.digest = this.hash(text)
    this.update_lines()
  }

  this.reload = (force = false) => {
    if (!this.path) { return }

    if (force || !this.has_changes()) {
      this.commit(this.load())
    }
  }

  this.load = function () {
    if (!this.path) { return }

    this.is_markdown = markdowns.map(e => this.path.endsWith(e)).find(e => e)

    try {
      const data = fs.readFileSync(this.path, 'utf-8')
      this.last_modification = this.get_modification_time()
      return data
    } catch (err) {
      this.path = null
      return null
    }
  }

  this.update_lines =  () => {
    const lines = []

    if (!this.is_markdown) {
      for (let n = 1; n <= (this.text.match(/\n/g) || []).length; ++n)
          lines.push(n)
    } else {
      for (let n = 0, l = this.text.split(EOL); n < l.length; n++) {
        const line = l[n]

        if (line.startsWith(markers.subheader.mark)) { lines.push(markers.subheader.symbol) }
        else if (line.startsWith(markers.header.mark)) { lines.push(markers.header.symbol) }
        else if (line.startsWith(markers.comment.mark)) { lines.push(markers.comment.symbol) }
        else { lines.push('') }
      }
    }

    left.number_el.innerText = lines.join('\n')
  }

  this.markers = function () {
    const a = []
    const lines = this.text.split(EOL)

    if (!this.is_markdown) return a

    for (const id in lines) {
      const line = lines[id]
      let marker = []

      if (line.startsWith(markers.subheader.mark)) {
        marker = [ 'subheader', markers.subheader ]
      } else if (line.startsWith(markers.header.mark)) {
        marker = [ 'header', markers.header ]
      } else if (line.startsWith(markers.comment.mark)) {
        marker = [ 'comment', markers.comment ]
      }

      if (marker.length) {
        if (/^(#|-)+[\s\t]*$/.test(line))
          continue
        a.push({
          id: a.length,
          text: line.replace(new RegExp(`${marker[1].mark}+`), marker[1].symbol),
          line: parseInt(id),
          type: marker[0]
        })
      }
    }

    return a
  }

  this.get_modification_time = () =>  fs.statSync(this.path).mtime.getTime()
}

module.exports = Page
