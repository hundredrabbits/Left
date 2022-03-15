'use strict'

function Options () {
  this.electron = require('electron');
  const root = document.documentElement
  this.colWidth = 80
  this.w = 500
  this.h = 500


  this.setDimensions = function () {
    var window = this.electron.remote.getCurrentWindow();
    const { w, h } = window.getSize()
    this.w = window.getSize()[0]
    this.h = window.getSize()[1]
    this.updateVariables()
  }

  this.start = function () {
    this.element = document.querySelector('textarea')

    // If localStorage has information about the options,
    // load the saved values and apply them
    if (localStorage.getItem('options')) {
      console.log(JSON.parse(localStorage.getItem('options')))
      const { colWidth, w, h } = JSON.parse(localStorage.getItem('options'))
      this.colWidth = colWidth
      this.w = w
      this.h = h
      this.updateVariables()
    }
  }

  this.setTextAreaColumns = function (size) {
    this.colWidth = size
    this.updateVariables()
  }

  // Update the CSS variables, save the values to localStorage
  this.updateVariables = function () {
    this.element.style.setProperty('width', `${this.colWidth}ch`)
    var window = this.electron.remote.getCurrentWindow();
    window.setSize(this.w, this.h)
    window.center()
    this.save()
  }

  // Save the font-related values to localStorage
  this.save = function () {
    localStorage.setItem('options', JSON.stringify({
      colWidth: this.colWidth, 
      w: this.w,
      h: this.h
    }))
  }
}

module.exports = Options
