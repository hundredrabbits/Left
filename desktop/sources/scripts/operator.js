'use strict'

const { ipcRenderer } = require('electron')

const EOL = '\n'

function Operator () {
  this.el = document.createElement('input'); this.el.id = 'operator'
  this.is_active = false
  this.index = 0

  this.el.addEventListener('keyup', (e) => { left.operator.on_change(e, false) })
  this.el.addEventListener('keydown', (e) => { left.operator.on_change(e, true) })

  this.install = function (host) {
    host.appendChild(this.el)
  }

  ipcRenderer.on('left-operator-start', (_, f = '') => {
    console.log('started')
    ipcRenderer.invoke('controller-set', 'operator')
    this.is_active = true

    left.editor_el.blur()
    this.el.value = f
    this.el.focus()

    this.update()
    left.update()
  })

  this.update = function () {
    this.el.className = this.is_active ? 'active' : 'inactive'

    if (!this.is_active) { return }

    this.passive()
  }

  this.stop = function () {
    if (!this.is_active) { return }

    // console.log('stopped')
    ipcRenderer.invoke('controller-set', 'default')
    this.is_active = false

    this.el.value = ''
    this.el.blur()
    left.editor_el.focus()

    this.update()
    left.update()
  }
  ipcRenderer.on('left-operator-stop', () => this.stop())

  this.on_change = function (e, down = false) {
    if (!this.is_active) { return }

    if (e.key === 'ArrowUp' && down) {
      this.el.value = this.prev
      e.preventDefault()
      return
    }

    if (!down && (e.key === 'Enter' || e.code === 'Enter')) {
      this.active()
      e.preventDefault()
      e.stopPropagation()
    } else if (!down) {
      this.passive()
    }
  }

  this.passive = function () {
    if (this.el.value.indexOf(' ') < 0) { return }

    const cmd = this.el.value.split(' ')[0].replace(':', '').trim()
    const params = this.el.value.replace(cmd, '').replace(':', '').trim()

    if (!this[cmd]) { console.info(`Unknown command ${cmd}.`); return }

    this[cmd](params)
  }

  this.active = function () {
    if (this.el.value.indexOf(' ') < 0) { return }

    this.prev = this.el.value

    const cmd = this.el.value.split(' ')[0].replace(':', '').trim()
    const params = this.el.value.replace(cmd, '').replace(':', '').trim()

    if (!this[cmd]) { console.info(`Unknown command ${cmd}.`); return }

    this[cmd](params, true)
  }

  ipcRenderer.on('left-operator-find-next', () => {
    if (!this.prev || !this.prev.includes('find:')) { return }
    const word = this.prev.replace('find:', '').trim()

    // Find next occurence
    this.find(word, true)
  })

  this.find = function (q, bang = false) {
    if (q.length < 3) { return }

    const results = left.find(q)

    if (results.length < 1) { return }

    const from = left.editor_el.selectionStart
    let result = 0
    for (const id in results) {
      result = results[id]
      if (result > from) { break }
    }

    // Found final occurence, start from the top
    if (result === left.editor_el.selectionStart) {
      left.editor_el.setSelectionRange(0, 0)
      this.find(q, true)
      return
    }

    if (bang && result)
      left.go.to(result, result + q.length)
  }

  this.replace = function (q, bang = false) {
    if (q.indexOf('->') < 0) { return }

    const a = q.split('->')[0].trim()
    const b = q.split('->')[1].trim()

    if (a.length < 3) { return }
    if (b.length < 3) { return }

    const results = left.find(a)

    if (results.length < 1) { return }

    const from = left.editor_el.selectionStart
    let result = 0
    for (const id in results) {
      result = results[id]
      if (result > from) { break }
    }

    if (bang) {
      left.go.to(result, result + a.length)
      setTimeout(() => { left.replace_selection_with(b) }, 500)
      this.stop()
    }
  }

  this.goto = function (q, bang = false) {
    const target = parseInt(q, 10)

    const linesCount = left.editor_el.value.split(EOL).length - 1

    if (q === '' || target < 1 || target > linesCount || Number.isNaN(target)) {
      return
    }

    if (bang) {
      this.stop()
      left.go.to_line(target)
    }
  }
}

module.exports = Operator
