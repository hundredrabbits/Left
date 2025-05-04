'use strict'

const Options = require("./options");

const EOL = '\n'

function Operator (options) {
  this.el = document.createElement('input'); this.el.id = 'operator'
  this.is_active = false
  this.index = 0
  this.Options = options

  this.el.addEventListener('keyup', (e) => { left.operator.on_change(e, false) })
  this.el.addEventListener('keydown', (e) => { left.operator.on_change(e, true) })

  this.install = function (host) {
    host.appendChild(this.el)
  }

  this.start = function (f = '') {
    console.log('started')
    left.controller.set('operator')
    this.is_active = true

    left.textarea_el.blur()
    this.el.value = f
    this.el.focus()

    this.update()
    left.update()
  }

  this.update = function () {
    this.el.className = this.is_active ? 'active' : 'inactive'

    if (!this.is_active) { return }

    this.passive()
  }

  this.stop = function () {
    if (!this.is_active) { return }

    console.log('stopped')
    left.controller.set('default')
    this.is_active = false

    this.el.value = ''
    this.el.blur()
    left.textarea_el.focus()

    this.update()
    left.update()
  }

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

  this.find_next = function () {
    if (!this.prev || !this.prev.includes('find:')) { return }
    const word = this.prev.replace('find:', '').trim()

    // Find next occurence
    this.find(word, true)
  }

  this.find = function (q, bang = false) {
    if (q.length < 3) { return }

    const results = left.find(q)

    if (results.length < 1) { return }

    const from = left.textarea_el.selectionStart
    let result = 0
    for (const id in results) {
      result = results[id]
      if (result > from) { break }
    }

    // Found final occurence, start from the top
    if (result === left.textarea_el.selectionStart) {
      left.textarea_el.setSelectionRange(0, 0)
      this.find(q, true)
      return
    }

    if (bang && result) {
      left.go.to(result, result + q.length)
      setTimeout(() => { left.operator.stop() }, 250)
    }
  }

  this.replace = function (q, bang = false) {
    if (q.indexOf('->') < 0) { return }

    const a = q.split('->')[0].trim()
    const b = q.split('->')[1].trim()

    if (a.length < 3) { return }
    if (b.length < 3) { return }

    const results = left.find(a)

    if (results.length < 1) { return }

    const from = left.textarea_el.selectionStart
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

    const linesCount = left.textarea_el.value.split(EOL).length - 1

    if (q === '' || target < 1 || target > linesCount || Number.isNaN(target)) {
      return
    }

    if (bang) {
      this.stop()
      left.go.to_line(target)
    }
  }

  this.setTextAreaColumns = function (size, bang = false) {
    if (size.length < 2) { return }
    this.Options.setTextAreaColumns(size)

    if (bang) {
      setTimeout(() => { left.operator.stop() }, 250)
    }
  }
}

module.exports = Operator
