'use strict'

function Navi () {
  this.el = document.createElement('navi')

  this.install = function (host) {
    host.appendChild(this.el)
  }

  this.update = function () {
    let html = ''
    let current = this.marker()

    for (let pid in left.project.pages) {
      let page = left.project.pages[pid]
      if (!page) { continue }
      html += `<ul class="${left.project.index === parseInt(pid) ? 'active' : ''}">`
      html += this._page(parseInt(pid), page)
      let markers = page.markers()
      for (let i in markers) {
        let marker = markers[i]
        html += this._marker(pid, current, marker, markers)
      }
      html += '</ul>'
    }
    this.el.innerHTML = html
  }

  this._page = function (id, page) {
    return `<li class='page ${page.has_changes() ? 'changes' : ''}' onclick='left.go.to_page(${id})'>${page.name()}</li>`
  }

  this._marker = function (pid, current, marker, markers) {
    return `<li class='marker ${marker.type} ${current && current.line === marker.line ? 'active' : ''}' onclick='left.go.to_page(${pid}, ${marker.line})'><span>${marker.text}</span></li>`
  }

  this.next_page = function () {
    let page = clamp(parseInt(left.project.index) + 1, 0, left.project.pages.length - 1)
    left.go.to_page(page, 0)
  }

  this.prev_page = function () {
    let page = clamp(parseInt(left.project.index) - 1, 0, left.project.pages.length - 1)
    left.go.to_page(page, 0)
  }

  this.next_marker = function () {
    let page = clamp(parseInt(left.project.index), 0, left.project.pages.length - 1)
    let marker = this.marker()

    if (!marker) { return }

    let markers = left.project.page().markers()
    let nextIndex = clamp(marker.id + 1, 0, markers.length - 1)

    left.go.to_page(page, markers[nextIndex].line)
  }

  this.prev_marker = function () {
    let page = clamp(parseInt(left.project.index), 0, left.project.pages.length - 1)
    let marker = this.marker()

    if (!marker) { return }

    let markers = left.project.page().markers()
    let nextIndex = clamp(marker.id - 1, 0, markers.length - 1)

    left.go.to_page(page, markers[nextIndex].line)
  }

  this.marker = function () {
    if (!left.project.page()) { return [] }

    let markers = left.project.page().markers()
    let pos = left.active_line_id()

    if (markers.length < 1) { return }

    for (const id in markers) {
      let marker = markers[id]
      if (marker.line > pos) { return markers[parseInt(id) - 1] }
    }
    return markers[markers.length - 1]
  }

  this.on_scroll = function () {
    let scrollDistance = left.textarea_el.scrollTop
    let scrollMax = left.textarea_el.scrollHeight - left.textarea_el.offsetHeight
    let scrollPerc = Math.min(1, (scrollMax === 0) ? 0 : (scrollDistance / scrollMax))
    let naviOverflowPerc = Math.max(0, (left.navi.el.scrollHeight / window.innerHeight) - 1)

    left.navi.el.style.transform = 'translateY(' + (-100 * scrollPerc * naviOverflowPerc) + '%)'
  }

  this.toggle = function () {
    document.body.classList.toggle('mobile')
  }

  function clamp (v, min, max) { return v < min ? min : v > max ? max : v }
}

module.exports = Navi
