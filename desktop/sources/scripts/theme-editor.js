'use strict'

const fs = require('fs')
const { remote } = require('electron')
const { app, dialog } = remote

const Page = require('./page')
const Splash = require('./splash')

const ThemeAttrs = [
  'background',
  'f_high',
  'f_med',
  'f_low',
  'f_inv',
  'b_high',
  'b_med',
  'b_low',
  'b_inv',
]

function ColorPicker(_emitColorCallback) {
  this.container = document.createElement('div')
  this.container.setAttribute('id', 'canvas-container')
  this.canvas = document.createElement('canvas')
  this.container.appendChild(this.canvas)

  const button = document.createElement('button')
  button.innerText = 'Reset Color'
  button.addEventListener('click', () => this.resetColor())
  this.container.appendChild(button)
  this.ctx = this.canvas.getContext('2d')

  this.install = function(host, width, x, y) {
    host.appendChild(this.container)
    this.canvas.setAttribute('width', (width - 10) +'px')
    this.container.style.top = y+'px'
    this.container.style.left = x+'px'

    const gradient = this.ctx.createLinearGradient(0, 0, (width - 10), 0)
    gradient.addColorStop(0,    "rgb(255,   0,   0)")
    gradient.addColorStop(0.15, "rgb(255,   0, 255)")
    gradient.addColorStop(0.33, "rgb(0,     0, 255)")
    gradient.addColorStop(0.49, "rgb(0,   255, 255)")
    gradient.addColorStop(0.67, "rgb(0,   255,   0)")
    gradient.addColorStop(0.84, "rgb(255, 255,   0)")
    gradient.addColorStop(1,    "rgb(255,   0,   0)")
    this.ctx.fillStyle = gradient
    this.ctx.fillRect(0, 0, (width - 10), this.canvas.clientHeight)

    const shadeGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.clientHeight)
    shadeGradient.addColorStop(0,   "rgba(255, 255, 255, 1)");
    shadeGradient.addColorStop(0.5, "rgba(255, 255, 255, 0)");
    shadeGradient.addColorStop(0.5, "rgba(0,     0,   0, 0)");
    shadeGradient.addColorStop(1,   "rgba(0,     0,   0, 1)");
    this.ctx.fillStyle = shadeGradient;
    this.ctx.fillRect(0, 0, (width - 10), this.canvas.clientHeight)

    this.canvas.addEventListener('click', evt => {
      const bbox = this.canvas.getBoundingClientRect()
      const colorData = this.ctx.getImageData(evt.pageX - bbox.left, evt.pageY - bbox.top, 1, 1)
      this.emitColor(colorData)
    })
  }

  this.emitColor = function(colorData) {
    if (!_emitColorCallback) { return }
    _emitColorCallback(this.parseColor(colorData)) 
  }

  this.resetColor = function() {
    _emitColorCallback(null)
  }

  this.destroy = function() {
    this.container.remove()
  }

  this.parseColor = function(colorData) {
    console.log(colorData)
    return `rgb(${colorData.data[0]},${colorData.data[1]},${colorData.data[2]})`
  }
}

function ThemeEditor (_themeEngine) {
  this.el = document.createElement('theme-editor')
  this.el.classList.toggle('hidden')
  this.colorPicker = null
  this._activeAttr = null
  this._clickListener = function() {}

  this.el.innerHTML =
   `
   <h3>Theme Editor</h3>
     <ul>
       <li>
         Application Background
         <div id="background" class="color-box"></div>
       </li>
       <li>
         Foreground (High contrast)
         <div id="f_high" class="color-box"></div>
       </li>
       <li>
         Foreground (Med contrast)
         <div id="f_med" class="color-box"></div>
       </li>
       <li>
         Foreground (Low contrast)
         <div id="f_low" class="color-box"></div>
       </li>
       <li>
         Foreground (Inverted)
         <div id="f_inv" class="color-box"></div>
       </li>
       <li>
         Background (High contrast)
         <div id="b_high" class="color-box"></div>
       </li>
       <li>
         Background (Med contrast)
         <div id="b_med" class="color-box"></div>
       </li>
       <li>
         Background (Low contrast)
         <div id="b_low" class="color-box"></div>
       </li>
       <li>
         Background (Inverted)
         <div id="b_inv" class="color-box"></div>
       </li>
     </ul>

     <button id="save-theme">Save Theme</button>
     <button id="reset-theme">Reset Theme</button>
     <button id="close-editor">&times; Close</button>
   `

  this.install = function (host) {
    host.appendChild(this.el)

    this.getAllThemeBoxes().forEach(box => {
      box.addEventListener('click', () => this.openColorPicker(box.id))
    })

    document.addEventListener('click', evt => {
      if (!this.colorPicker) { return false; }
      if (this.colorPicker.container.contains(evt.target) || this.getAllThemeBoxes().includes(evt.target)) { return false; }
      this.colorPicker.destroy()
    })

    document.querySelector('theme-editor #reset-theme').addEventListener('click', evt => {
      this.getAllThemeBoxes().forEach(m => this.switchToDefault(m.id))
    })

    document.querySelector('theme-editor #save-theme').addEventListener('click', evt => {
      this.saveTheme()
    })

    document.querySelector('theme-editor #close-editor').addEventListener('click', evt => this.toggle())
  }

  this.start = function() {
    this.defaultTheme = { ... _themeEngine.active }
    this.activeTheme = { ..._themeEngine.active }
  }

  this.update = function() {
   this.getAllThemeBoxes().forEach(box => {
    box.style.backgroundColor = this.activeTheme[box.id]
   })
  }

  this.openColorPicker = function(themeAttr) {
    const boxEl = this.getThemeDOM(themeAttr)
    if (this.colorPicker) {
      this.colorPicker.destroy()
    }

    this._activeAttr = themeAttr

    const bbox = this.el.getBoundingClientRect()
    this.colorPicker = new ColorPicker(this.onChooseColor.bind(this))
    this.colorPicker.install(this.el, bbox.width, bbox.left, boxEl.getBoundingClientRect().bottom)
  }

  this.getThemeDOM = function(themeAttr) {
    return document.querySelector('theme-editor #' + themeAttr)
  }

  this.getAllThemeBoxes = function() {
    return ThemeAttrs.map(k => this.getThemeDOM(k))
  }

  this.onChooseColor = function(colorData) {
    this.activeTheme[this._activeAttr] = colorData || this.defaultTheme[this._activeAttr]
    this.update()
    _themeEngine.setTheme(this.activeTheme)
  }

  this.switchToDefault = function(themeAttr) {
    this.activeTheme[themeAttr] = this.defaultTheme[themeAttr]
    this.update()
    _themeEngine.setTheme(this.activeTheme)
  }

  this.toggle = function() {
    this.el.classList.toggle('hidden')
    this.update()
  }

  this.saveTheme = function() {
    const theme = `<svg width="96px" height="64px" xmlns="http://www.w3.org/2000/svg" baseProfile="full" version="1.1">
      <rect width='96' height='64'  id='background' fill='${this.activeTheme.background}'></rect>
      <!-- Foreground -->
      <circle cx='24' cy='24' r='8' id='f_high' fill='${this.activeTheme.f_high}'></circle>
      <circle cx='40' cy='24' r='8' id='f_med' fill='${this.activeTheme.f_med}'></circle>
      <circle cx='56' cy='24' r='8' id='f_low' fill='${this.activeTheme.f_low}'></circle>
      <circle cx='72' cy='24' r='8' id='f_inv' fill='${this.activeTheme.f_inv}'></circle>
      <!-- Background -->
      <circle cx='24' cy='40' r='8' id='b_high' fill='${this.activeTheme.b_high}'></circle>
      <circle cx='40' cy='40' r='8' id='b_med' fill='${this.activeTheme.b_med}'></circle>
      <circle cx='56' cy='40' r='8' id='b_low' fill='${this.activeTheme.b_low}'></circle>
      <circle cx='72' cy='40' r='8' id='b_inv' fill='${this.activeTheme.b_inv}'></circle>
    </svg>`

    let path = dialog.showSaveDialog(app.win)

    if (!new RegExp('/.svg$/').test(path)) { path+= '.svg' }

    if (!path) { console.log('Nothing to save'); return }

    fs.writeFile(path, theme, (err) => {
      if (err) { alert('An error ocurred creating the file ' + err.message); return }

      left.update()
      setTimeout(() => { left.stats.el.innerHTML = `Saved theme as ${path}` }, 200)
    })
  }
}

module.exports = ThemeEditor
