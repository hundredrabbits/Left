'use strict'

const fs = require('fs'),
      crypto = require('crypto')
const { ipcRenderer } = require('electron')

const EOL = '\n',
      markdowns = ['.md', '.txt', '.log'],
      markers = {
        header: { mark: '#', symbol: '◎'},
        subheader: { mark: '##', symbol: '⦿'},
        comment: { mark: '--', symbol: '▶︎'},
      }
const hash = (data) => crypto.createHash('sha256').update(data).digest('hex')

function Page (text = '', path = null) {
  this.text = text.replace(/\r?\n/g, '\n')
  this.digest = hash(text)
  this.path = path
  this.is_markdown = true
  this.lines = 0
  this.size = 0
  this.watchdog = true

  this.name = function () {
    if (!this.path) { return 'Untitled' }

    if (!markdowns.map(e => this.path.endsWith(e)).find(e => e))
      this.is_markdown = false

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

    left.number_el.innerHTML = ''
    if (!this.is_markdown) {
      for (let n = 0; n < this.text.split(EOL).length; lines.push(++n)) ;
    } else {
      for (let n = 0, l = this.text.split(EOL); n < l.length; n++) {
        const line = l[n]

        if (line.startsWith(markers.subheader.mark)) { lines.push(markers.subheader.symbol) }
        else if (line.startsWith(markers.header.mark)) { lines.push(markers.header.symbol) }
        else if (line.startsWith(markers.comment.mark)) { lines.push(markers.comment.symbol) }
        else { lines.push('') }
      }
    }

    left.number_el.innerHTML = lines.join('\n')
  }

  this.markers = function () {
    const a = []
    const lines = this.text.split(EOL)
    for (const id in lines) {
      const line = lines[id].trim()
      let marker = []

      if (line.startsWith(markers.subheader.mark)) {
        marker = [ 'subheader', markers.subheader ]
      } else if (line.startsWith(markers.header.mark)) {
        marker = [ 'header', markers.header ]
      } else if (line.startsWith(markers.comment.mark)) {
        marker = [ 'comment', markers.comment ]
      }

      if (marker.length) {
        console.log(line.replace(marker[1].mark, marker[1].symbol).trim())
        a.push({
          id: a.length,
          text: line.replace(new RegExp(`${marker[1].mark}+`), marker[1].symbol).trim(),
          line: parseInt(id),
          type: marker[0]
        })
      }
    }
    return a
  }
}

module.exports = Page
