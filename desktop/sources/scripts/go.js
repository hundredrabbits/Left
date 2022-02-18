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
    const nid = parseInt(id)
    if ((left.editor_el.value.match(new RegExp(EOL, 'g')) || []).length < nid)
      return

    const lineArr = left.editor_el.value.split(EOL, !nid ? 1 : nid)
    const textUntil = lineArr.join(EOL).length

    this.to(
      !nid ? 0 : textUntil - lineArr.pop().length,
      textUntil, id)
  }

  this.to = function (from, to, line = 0) {
    if (line === -1) {
      line = left.editor_el.value.substr(0, to).split(EOL).length + 1
    }
    this.scroll_to_line(line)
    left.editor_el.setSelectionRange(from, to)

    return from === -1 ? null : from
  }

  ipcRenderer.on('left-go-to-next', async (_, str, scroll = true) => {
    const ta = left.editor_el
    const text = ta.value
    const range = text.substr(ta.selectionStart, text.length - ta.selectionStart)
    const next = ta.selectionStart + range.indexOf(EOL)
    this.to(next, next, scroll)
  })

  this.scroll_to_line = function (line) {
    const height = parseInt(window.getComputedStyle(left.editor_el, null)
                        .getPropertyValue('height').replace('px',''))
    const line_height = parseInt(window.getComputedStyle(left.editor_el, null)
                        .getPropertyValue('line-height').replace('px',''))
    const pos = line * line_height
    animateScrollTo(left.editor_el, pos - (height/2), 200)
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
