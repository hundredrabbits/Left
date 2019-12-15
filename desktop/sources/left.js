'use strict'

const Theme = require('./scripts/lib/theme')
const Controller = require('./scripts/lib/controller')
const Dictionary = require('./scripts/dictionary')
const Operator = require('./scripts/operator')
const Navi = require('./scripts/navi')
const Stats = require('./scripts/stats')
const Go = require('./scripts/go')
const Project = require('./scripts/project')
const Reader = require('./scripts/reader')
const Insert = require('./scripts/insert')
const Font = require('./scripts/font')

const EOL = '\n'

function Left () {
  this.theme = new Theme({ background: '#222', f_high: '#eee', f_med: '#888', f_low: '#666', f_inv: '#00f', b_high: '#f9a', b_med: '#a9f', b_low: '#000', b_inv: '#af9' })
  this.controller = new Controller()
  this.dictionary = new Dictionary()
  this.operator = new Operator()
  this.navi = new Navi()
  this.stats = new Stats()
  this.go = new Go()
  this.project = new Project()
  this.reader = new Reader()
  this.insert = new Insert()
  this.font = new Font()

  this.textarea_el = document.createElement('textarea')
  this.drag_el = document.createElement('drag')

  this.selection = { word: null, index: 1 }

  this.words_count = null
  this.lines_count = null
  this.chars_count = null
  this.suggestion = null
  this.synonyms = null
  this.last_char = 's' // this is not a typo. it's bad code, but it has to be a length one string

  this.install = function (host = document.body) {
    this.navi.install(host)
    this.stats.install(host)
    this.operator.install(host)

    host.appendChild(this.textarea_el)
    host.appendChild(this.drag_el)

    host.className = window.location.hash.replace('#', '')

    this.textarea_el.setAttribute('autocomplete', 'off')
    this.textarea_el.setAttribute('autocorrect', 'off')
    this.textarea_el.setAttribute('autocapitalize', 'off')
    this.textarea_el.setAttribute('spellcheck', 'false')
    this.textarea_el.setAttribute('type', 'text')

    this.textarea_el.addEventListener('scroll', () => {
      if (!this.reader.active) { this.stats.on_scroll() }
    })

    // Trigger update when selection changes
    this.textarea_el.addEventListener('select', (e) => {
      if (!this.reader.active) { this.update() }
    })

    this.textarea_el.addEventListener('input', () => {
      this.project.page().commit()
    })

    this.theme.install(host)
  }

  this.start = function () {
    this.theme.start()
    this.font.start()
    this.dictionary.start()
    this.project.start()

    this.go.to_page()

    this.textarea_el.focus()
    this.textarea_el.setSelectionRange(0, 0)

    this.dictionary.update()
    this.update()
  }

  this.update = (hard = false) => {
    const nextChar = this.textarea_el.value.substr(this.textarea_el.selectionEnd, 1)

    this.selection.word = this.active_word()
    this.suggestion = (nextChar === '' || nextChar === ' ' || nextChar === EOL) ? this.dictionary.find_suggestion(this.selection.word) : null
    this.synonyms = this.dictionary.find_synonym(this.selection.word)
    this.selection.url = this.active_url()

    this.project.update()
    this.navi.update()
    this.stats.update()
  }

  //

  this.select_autocomplete = () => {
    if (this.selection.word.trim() !== '' && this.suggestion && this.suggestion.toLowerCase() !== this.active_word().toLowerCase()) {
      this.autocomplete()
    } else {
      this.inject('\u00a0\u00a0')
    }
  }

  this.select_synonym = () => {
    if (this.synonyms) {
      this.replace_active_word_with(this.synonyms[this.selection.index % this.synonyms.length])
      this.stats.update()
      this.selection.index = (this.selection.index + 1) % this.synonyms.length
    }
  }

  this.select = (from, to) => {
    this.textarea_el.setSelectionRange(from, to)
  }

  this.select_word = (target) => {
    const from = this.textarea_el.value.split(target)[0].length
    this.select(from, from + target.length)
  }

  this.select_line = function (id) {
    const lineArr = this.textarea_el.value.split(EOL, parseInt(id) + 1)
    const arrJoin = lineArr.join(EOL)

    const from = arrJoin.length - lineArr[id].length
    const to = arrJoin.length

    this.select(from, to)
  }

  this.reload = function (force = false) {
    this.project.page().reload(force)
    this.load(this.project.page().text)
  }

  this.load = function (text) {
    this.textarea_el.value = text || ''
    this.update()
  }

  // Location tools

  this.selected = function () {
    const from = this.textarea_el.selectionStart
    const to = this.textarea_el.selectionEnd
    const length = to - from
    return this.textarea_el.value.substr(from, length)
  }

  this.active_word_location = (position = this.textarea_el.selectionEnd) => {
    let from = position - 1

    // Find beginning of word
    while (from > -1) {
      const char = this.textarea_el.value[from]
      if (!char || !char.match(/[a-z]/i)) {
        break
      }
      from -= 1
    }

    // Find end of word
    let to = from + 1
    while (to < from + 30) {
      const char = this.textarea_el.value[to]
      if (!char || !char.match(/[a-z]/i)) {
        break
      }
      to += 1
    }

    from += 1

    return { from: from, to: to }
  }

  this.active_line_id = () => {
    const segments = this.textarea_el.value.substr(0, this.textarea_el.selectionEnd).split(EOL)
    return segments.length - 1
  }

  this.active_line = () => {
    const text = this.textarea_el.value
    const lines = text.split(EOL)
    return lines[this.active_line_id()]
  }

  this.active_word = () => {
    const l = this.active_word_location()
    return this.textarea_el.value.substr(l.from, l.to - l.from)
  }

  this.active_url = function () {
    const words = this.active_line().split(' ')
    for (const id in words) {
      if (words[id].indexOf('://') > -1 || words[id].indexOf('www.') > -1) {
        return words[id]
      }
    }
    return null
  }

  this.prev_character = () => {
    const l = this.active_word_location()
    return this.textarea_el.value.substr(l.from - 1, 1)
  }

  this.replace_active_word_with = (word) => {
    const l = this.active_word_location()
    const w = this.textarea_el.value.substr(l.from, l.to - l.from)

    // Preserve capitalization
    if (w.substr(0, 1) === w.substr(0, 1).toUpperCase()) {
      word = word.substr(0, 1).toUpperCase() + word.substr(1, word.length)
    }

    this.textarea_el.setSelectionRange(l.from, l.to)

    document.execCommand('insertText', false, word)

    this.textarea_el.focus()
  }

  this.replace_selection_with = function (characters) {
    document.execCommand('insertText', false, characters)
    this.update()
  }

  // del is an optional arg for deleting the line, used in actions
  this.replace_line = function (id, newText, del = false) {
    const lineArr = this.textarea_el.value.split(EOL, parseInt(id) + 1)
    const arrJoin = lineArr.join(EOL)

    const from = arrJoin.length - lineArr[id].length
    const to = arrJoin.length

    // splicing the string
    const newTextValue = this.textarea_el.value.slice(0, del ? from - 1 : from) + newText + this.textarea_el.value.slice(to)

    // the cursor automatically moves to the changed position, so we have to set it back
    let cursorStart = this.textarea_el.selectionStart
    let cursorEnd = this.textarea_el.selectionEnd
    const oldLength = this.textarea_el.value.length
    const oldScroll = this.textarea_el.scrollTop
    // setting text area
    this.load(newTextValue)
    // adjusting the cursor position for the change in length
    const lengthDif = this.textarea_el.value.length - oldLength
    if (cursorStart > to) {
      cursorStart += lengthDif
      cursorEnd += lengthDif
    }
    // setting the cursor position
    if (this.textarea_el.setSelectionRange) {
      this.textarea_el.setSelectionRange(cursorStart, cursorEnd)
    } else if (this.textarea_el.createTextRange) {
      const range = this.textarea_el.createTextRange()
      range.collapse(true)
      range.moveEnd('character', cursorEnd)
      range.moveStart('character', cursorStart)
      range.select()
    }
    // setting the scroll position
    this.textarea_el.scrollTop = oldScroll
    // this function turned out a lot longer than I was expecting. Ah well :/
  }

  this.inject = function (characters = '__') {
    const pos = this.textarea_el.selectionStart
    this.textarea_el.setSelectionRange(pos, pos)
    document.execCommand('insertText', false, characters)
    this.update()
  }

  this.inject_line = (characters = '__') => {
    this.select_line(this.active_line_id())
    this.inject(characters)
  }

  this.inject_multiline = function (characters = '__') {
    const lines = this.selected().match(/[^\r\n]+/g)
    let text = ''
    for (const id in lines) {
      const line = lines[id]
      text += `${characters}${line}\n`
    }
    this.replace_selection_with(text)
  }

  this.find = (word) => {
    const text = this.textarea_el.value.toLowerCase()
    const parts = text.split(word.toLowerCase())
    const a = []
    let sum = 0

    for (const id in parts) {
      const p = parts[id].length
      a.push(sum + p)
      sum += p + word.length
    }

    a.splice(-1, 1)

    return a
  }

  this.autocomplete = () => {
    this.inject(this.suggestion.substr(this.selection.word.length, this.suggestion.length) + ' ')
  }

  this.open_url = function (target = this.active_url()) {
    if (!target) { return }

    this.select_word(target)
    setTimeout(() => { require('electron').shell.openExternal(target) }, 500)
  }

  this.reset = () => {
    this.theme.reset()
    this.font.reset()
    this.update()
  }
}

module.exports = Left
