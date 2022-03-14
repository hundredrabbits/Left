'use strict'

function Options () {
  const root = document.documentElement
  //this.element = null
  this.colWidth = 80
  this.w = 500
  this.h = 500

  this.electron = require('electron');
    
  //this.c = document.querySelector("#calls")
  //this.timeout = false // holder for timeout id
  //this.delay = 250 // delay after event is "complete" to run callback
  //this.calls = 0

  this.setDimensions = function () {
    var window = this.electron.remote.getCurrentWindow();
    const { w, h } = window.getSize()
    console.log(window.getSize())
    this.w = window.getSize()[0]
    this.h = window.getSize()[1]
    // this.calls += 1;
    // this.c = calls;

    console.log("setDimensions: " + this.w +  " x " +  this.h )//+ ",,, " + this.calls)

    this.updateVariables()
  }

  this.start = function () {
    
    this.element = document.querySelector('textarea')
    console.log(this.element)
    console.log(root)
    // If localStorage has information about the font,
    // load the saved values and apply them
    if (localStorage.getItem('options')) {
      console.log(JSON.parse(localStorage.getItem('options')))
      const { colWidth, w, h } = JSON.parse(localStorage.getItem('options'))
      this.colWidth = colWidth
      this.w = w
      this.h = h

      this.updateVariables()
    }

    // window.addEventListener('resize', function() {
    //     clearTimeout(this.timeout);
    //     this.timeout = setTimeout(getDimensions, 250);
    //   });

  }

  this.setTAWidth = function (size) {
    console.log("setTAWidth: size")
    this.colWidth = size
    this.updateVariables()
  }

  // window.resize callback function


  // Update the CSS variables, save the values to localStorage
  this.updateVariables = function () {
    console.log("updating options ... ")
    this.element.style.setProperty('width', `${this.colWidth}ch`)
    // root.style.setProperty('width', `${this.w}px`)
    // root.style.setProperty('max-width', `${this.h}px`)

    // root.style.width = `${this.w}px`;


    // console.log(window)
    var window = this.electron.remote.getCurrentWindow();
    console.log("setting window: " + this.w +  " x " +  this.h)
    window.setSize(this.w, this.h)

    this.save()

    console.log("geting window: " + window.getSize())
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
