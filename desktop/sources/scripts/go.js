'use strict'

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
    const lineArr = left.textarea_el.value.split(EOL, parseInt(id) + 1)
    const arrJoin = lineArr.join(EOL)
    const from = arrJoin.length - lineArr[id].length
    const to = arrJoin.length

    this.to(from, to)
  }

  this.to = function (from, to, scroll = true) {
    if (scroll) this.scroll_to(from, to)

    if (left.textarea_el.setSelectionRange) {
      left.textarea_el.setSelectionRange(from, to)
    } else if (left.textarea_el.createTextRange) {
      const range = left.textarea_el.createTextRange()
      range.collapse(true)
      range.moveEnd('character', to)
      range.moveStart('character', from)
      range.select()
    }

    return from === -1 ? null : from
  }

  this.to_next = function (str, scroll = true) {
    const ta = left.textarea_el
    const text = ta.value
    const range = text.substr(ta.selectionStart, text.length - ta.selectionStart)
    const next = ta.selectionStart + range.indexOf(EOL)
    this.to(next, next, scroll)
  }

  this.scroll_to = function (from, to) {
    const ta = left.textarea_el
    const text = ta.value
    const sliceText = text.slice(0, to)
    const scrollFrom = ta.scrollTop
    const taPaddingTop = 30

    // Textarea hack to get the proper scroll position of the selection
    // This relies on textarea behavior where it scrolls to the bottom when focused
    ta.scrollTop = 0
    ta.blur()
    ta.style.paddingTop = `${ta.clientHeight}px`
    ta.value = sliceText
    ta.focus()
    const scrollTo = ta.scrollTop - 60
    ta.style.paddingTop = `${taPaddingTop}px`
    ta.value = text

    // Reset scroll position and scroll to new position
    ta.scrollTop = scrollFrom
    animateScrollTo(ta, scrollTo, 200)
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
