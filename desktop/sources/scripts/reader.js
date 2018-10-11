'use strict'

function Reader () {
  this.segment = { from: 0, to: 0, text: '', words: [] }
  this.queue = []
  this.index = 0
  this.speed = 175
  this.active = false

  this.start = function () {
    this.segment.from = left.textarea_el.selectionStart
    this.segment.to = left.textarea_el.selectionEnd
    this.segment.text = left.textarea_el.value.substr(this.segment.from, this.segment.to - this.segment.from).replace(/\n/g, ' ')
    this.segment.words = this.segment.text.split(' ')

    if (this.segment.words.length < 5) {
      this.stop()
      this.alert()
      return
    }

    left.controller.set('reader')
    this.active = true
    this.queue = this.segment.words
    this.index = 0

    // Small delay before starting the reader
    setTimeout(() => { this.run() }, 250)
  }

  this.alert = function (t) {
    setTimeout((t) => { left.stats.el.innerHTML = `<b>Reader</b> Select some text before starting the reader.` }, 400)
  }

  this.run = function () {
    if (left.reader.queue.length === 0) { left.reader.stop(); return }

    let words = left.reader.segment.text.split(' ')
    let word = left.reader.queue[0]
    let orp = left.reader.find_orp(word, words)

    let html = ': '
    html += "<span style='opacity:0'>" + left.reader.orp_pad(words, orp) + '</span>'
    html += "<span class='fm'>" + orp.before.trim() + "</span><span class='fh'>" + orp.key.trim() + "</span><span class='fm'>" + (word.length > 1 ? orp.after : '').trim() + '</span>'
    html += "<span style='float:right'>" + left.reader.queue.length + 'W ' + parseInt((left.reader.queue.length * 175) / 1000) + 'S ' + parseInt(((left.reader.index) / parseFloat(left.reader.queue.length + left.reader.index)) * 100) + '% ' + parseInt((1000 / left.reader.speed) * 60) + 'W/M</span>'
    left.stats.el.innerHTML = html

    left.reader.queue = left.reader.queue.splice(1, left.reader.queue.length - 1)
    left.reader.index += 1

    let range = words.splice(0, left.reader.index).join(' ').length
    left.select(left.reader.segment.from, left.reader.segment.from + range)
    left.go.scroll_to(0, left.reader.segment.from + range)

    setTimeout(left.reader.run, left.reader.speed)
  }

  this.stop = function () {
    if (!this.active) { return }

    left.controller.set('default')
    this.segment = { from: 0, to: 0, text: '', words: [] }
    this.queue = []
    this.index = 0
    this.active = false
    left.operator.stop()
    left.update()
  }

  this.find_orp = function (w, words) {
    let word = w.toLowerCase().trim()
    let index = parseInt(word.length / 2) - 1
    let before = word.substr(0, index)
    let after = word.substr(index + 1, word.length - index)

    return { before: before, key: word.substr(index, 1), after: after, index: index }
  }

  this.orp_pad = function (words, orp) {
    let longest = ''
    for (let i in words) {
      if (words[i].length < longest.length) { continue }
      longest = words[i]
    }

    let longestOrp = left.reader.find_orp(longest)
    let longestPad = longestOrp.index

    let pad = ''

    let i = 0
    while (i < longestPad - (orp.index)) {
      pad += '-'
      i += 1
    }
    return pad
  }
}

module.exports = Reader
