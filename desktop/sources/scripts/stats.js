'use strict'

const EOL = '\n'

function Stats () {
  this.el = document.createElement('stats')

  this.install = function (host) {
    host.appendChild(this.el)
  }

  this.update = function (special = '') {
    if (left.insert.is_active) {
      this.el.innerHTML = left.insert.status()
      return
    }

    if (left.textarea_el.selectionStart !== left.textarea_el.selectionEnd) {
      this.el.innerHTML = this._selection()
    } else if (left.synonyms) {
      this.el.innerHTML = ''
      this.el.appendChild(this._synonyms())
    } else if (left.selection.word && left.suggestion) {
      this.el.innerHTML = this._suggestion()
    } else if (left.selection.url) {
      this.el.innerHTML = this._url()
    } else {
      this.el.innerHTML = this._default()
    }
  }

  this._default = function () {
    let stats = this.parse(left.selected())
    let date = new Date()
    return `${stats.l}L ${stats.w}W ${stats.v}V ${stats.c}C ${stats.p}% <span class='right'>${date.getHours()}:${date.getMinutes()}</span>`
  }

  this.incrementSynonym = function () {
    left.selection.index = (left.selection.index + 1) % left.synonyms.length
  }

  this.list = null
  this.isSynonymsActive = false

  this.nextSynonym = function () {
    this.isSynonymsActive = true

    // Save the previous word element
    const previousWord = this.list.children[left.selection.index]

    // Increment the index
    this.incrementSynonym()

    // Get the current word element, add/remove appropriate active class
    const currentWord = this.list.children[left.selection.index]
    previousWord.classList.remove('active')
    currentWord.classList.add('active')

    currentWord.scrollIntoView({
      behavior: 'smooth'
    })
  }

  this.applySynonym = function () {
    if (!this.isSynonymsActive) { return }

    // Replace the current word with the selected synonym
    left.replace_active_word_with(left.synonyms[left.selection.index % left.synonyms.length])
  }

  this._synonyms = function () {
    left.selection.index = 0

    const ul = document.createElement('ul')

    left.synonyms.forEach((syn) => {
      const li = document.createElement('li')
      li.textContent = syn
      ul.appendChild(li)
    })

    ul.children[0].classList.add('active')
    this.el.scrollLeft = 0
    this.list = ul

    return ul
  }

  this._suggestion = function () {
    return `<t>${left.selection.word}<b>${left.suggestion.substr(left.selection.word.length, left.suggestion.length)}</b></t>`
  }

  this._selection = function () {
    return `<b>[${left.textarea_el.selectionStart},${left.textarea_el.selectionEnd}]</b> ${this._default()}`
  }

  this._url = function () {
    let date = new Date()
    return `Open <b>${left.selection.url}</b> with &lt;c-b&gt; <span class='right'>${date.getHours()}:${date.getMinutes()}</span>`
  }

  this.on_scroll = function () {
    let scrollDistance = left.textarea_el.scrollTop
    let scrollMax = left.textarea_el.scrollHeight - left.textarea_el.offsetHeight
    let ratio = Math.min(1, (scrollMax === 0) ? 0 : (scrollDistance / scrollMax))
    let progress = ['|', '|', '|', '|', '|', '|', '|', '|', '|', '|'].map((v, i) => { return i < ratio * 10 ? '<b>|</b>' : v }).join('')

    this.el.innerHTML = `${progress} ${(ratio * 100).toFixed(2)}%`
  }

  this.parse = function (text = left.textarea_el.value) {
    text = text.length > 5 ? text.trim() : left.textarea_el.value

    let h = {}
    let words = text.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ')
    for (const id in words) {
      h[words[id]] = 1
    }

    let stats = {}
    stats.l = text.split(EOL).length // lines_count
    stats.w = text.split(' ').length // words_count
    stats.c = text.length // chars_count
    stats.v = Object.keys(h).length
    stats.p = stats.c > 0 ? clamp((left.textarea_el.selectionEnd / stats.c) * 100, 0, 100).toFixed(2) : 0
    return stats
  }

  function clamp (v, min, max) { return v < min ? min : v > max ? max : v }
}

module.exports = Stats
