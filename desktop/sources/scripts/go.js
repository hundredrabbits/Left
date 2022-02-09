'use strict'

const { ipcRenderer } = require('electron')
const EOL = '\n'

function Go () {
  this.to_page = function (id = 0, line = 0) {
    left.project.index = clamp(parseInt(id), 0, left.project.pages.length - 1)

    console.log(`Go to page:${left.project.index}/${left.project.pages.length}`)

    const page = left.project.page()

    if (!page) { console.warn('Missing page', this.index); return }

    left.load(page.text)
    left.go.to_line(line)
    left.update()
  }

  this.to_line = function (id) {
    const lineArr = left.editor_el.value.split(EOL, parseInt(id) + 1)
    const arrJoin = lineArr.join(EOL)
    const from = arrJoin.length - lineArr[id].length
    const to = arrJoin.length

    this.to(from, to)
  }

  this.to = function (from, to, scroll = true) {
    if (left.editor_el.setSelectionRange) {
      left.editor_el.setSelectionRange(from, to)
    } else if (left.editor_el.createTextRange) {
      const range = left.editor_el.createTextRange()
      range.collapse(true)
      range.moveEnd('character', to)
      range.moveStart('character', from)
      range.select()
    }
    left.editor_el.focus()

    if (scroll) {
      this.scroll_to(from, to)
    }

    return from === -1 ? null : from
  }

  ipcRenderer.on('left-go-to-next', async (_, str, scroll = true) => {
    const ta = left.editor_el
    const text = ta.value
    const range = text.substr(ta.selectionStart, text.length - ta.selectionStart)
    const next = ta.selectionStart + range.indexOf(EOL)
    this.to(next, next, scroll)
  })

  this.scroll_to = function (from, to) {
    const textVal = left.editor_el.value
    const div = document.createElement('div')
    div.innerHTML = textVal.slice(0, to)
    document.body.appendChild(div)
    animateScrollTo(left.editor_el, div.offsetHeight - 60, 200)
    div.remove()
  }

  function animateScrollTo (element, to, duration) {
    const start = element.scrollTop
    const change = to - start
    let currentTime = 0
    const increment = 20 // Equal to line-height

    const animate = function () {
      currentTime += increment
      const val = Math.easeInOutQuad(currentTime, start, change, duration)
      element.scrollTop = val
      if (!left.reader.active) left.stats.on_scroll()
      if (currentTime < duration) {
        requestAnimationFrame(animate, increment)
      }
    }
    requestAnimationFrame(animate)
  }

  // t = current time
  // b = start value
  // c = change in value
  // d = duration

  Math.easeInOutQuad = function (t, b, c, d) {
    t /= d / 2
    if (t < 1) return c / 2 * t * t + b
    t--
    return -c / 2 * (t * (t - 2) - 1) + b
  }

  function clamp (v, min, max) { return v < min ? min : v > max ? max : v }
}

module.exports = Go
