'use strict'

const { ipcRenderer } = require('electron')

const EOL = '\n'

function Insert () {
  this.is_active = false

  ipcRenderer.on('left-insert-start', () => {
    ipcRenderer.invoke('controller-set', 'insert')
    this.is_active = true
    left.update()
  })

  this.stop = function () {
    ipcRenderer.invoke('controller-set', 'default')
    this.is_active = false
    left.update()
  }
  ipcRenderer.on('left-insert-stop', () => this.stop())

  ipcRenderer.on('left-insert-time', () => {
    left.inject(new Date().toLocaleTimeString() + ' ')
    this.stop()
  })

  ipcRenderer.on('left-insert-date', () => {
    const date = new Date()
    const strArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const d = date.getDate()
    const m = strArray[date.getMonth()]
    const y = date.getFullYear()

    left.inject(
      '' + (d <= 9 ? '0' + d : d) + '-' + m + '-' + y
    )
    this.stop()
  })

  ipcRenderer.on('left-insert-path', () => {
    if (left.project.paths().length === 0) { this.stop(); return }

    left.inject(
      left.project.index < left.project.paths().length
      ? left.project.paths()[left.project.index]
      : ''
    )
    this.stop()
  })

  ipcRenderer.on('left-insert-header', () => {
    const isMultiline = left.selected().match(/[^\r\n]+/g)

    if (left.prev_character() === EOL && !isMultiline) {
      left.inject('# ')
    } else if (isMultiline) {
      left.inject_multiline('# ')
    } else {
      left.inject_line('# ')
    }
    this.stop()
  })

  ipcRenderer.on('left-insert-subheader', () => {
    const isMultiline = left.selected().match(/[^\r\n]+/g)

    if (left.prev_character() === EOL && !isMultiline) {
      left.inject('## ')
    } else if (isMultiline) {
      left.inject_multiline('## ')
    } else {
      left.inject_line('## ')
    }
    this.stop()
  })

  ipcRenderer.on('left-insert-comment', () => {
    const isMultiline = left.selected().match(/[^\r\n]+/g)

    if (left.prev_character() === EOL && !isMultiline) {
      left.inject('-- ')
    } else if (isMultiline) {
      left.inject_multiline('-- ')
    } else {
      left.inject_line('-- ')
    }
    this.stop()
  })

  ipcRenderer.on('left-insert-list', () => {
    const isMultiline = left.selected().match(/[^\r\n]+/g)

    if (left.prev_character() === EOL && !isMultiline) {
      left.inject('- ')
    } else if (isMultiline) {
      left.inject_multiline('- ')
    } else {
      left.inject_line('- ')
    }
    this.stop()
  })

  ipcRenderer.on('left-insert-line', () => {
    if (left.prev_character() !== EOL) {
      left.inject(EOL)
    }
    left.inject('===================== \n')
    this.stop()
  })

  this.status = function () {
    return `<b>Insert Mode</b> c-D <i>Date</i> c-T <i>Time</i> ${left.project.paths().length > 0 ? 'c-P <i>Path</i> ' : ''}c-H <i>Header</i> c-/ <i>Comment</i> Esc <i>Exit</i>.`
  }
}

module.exports = Insert
