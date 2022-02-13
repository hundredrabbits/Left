const { ipcRenderer } = require('electron')

class Editor extends HTMLPreElement {
  constructor() {
    super();

    this.soft_wrap = false

    this.setAttribute('id', 'editor')
    this.setAttribute('is', 'left-editor')
    this.setAttribute('autocomplete', 'off')
    this.setAttribute('autocorrect', 'off')
    this.setAttribute('autocapitalize', 'off')
    this.setAttribute('spellcheck', false)
    this.setAttribute('contenteditable', true)

    this.setSelectionRange = (f, t) => {
      const range = document.createRange()
      const selection = document.getSelection()

      if (!this.childNodes.length)
        return
      range.setStart(this.childNodes[0], f)
      range.setEnd(this.childNodes[0], !t ? f : t)
      if (selection.rangeCount > 0)
        selection.removeAllRanges()
      selection.addRange(range)
    }

    this.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { // avoid injecting DIV
        //left.inject('\n');
        document.execCommand('insertHTML', false, '\n')
        e.preventDefault()
        return
      }

      if ((e.ctrlKey || e.metaKey) &&
        (e.key.toUpperCase() == 'B' || //CmdOrCtrl+B
        e.key.toUpperCase() == 'I')    //CmdOrCtrl+I
        ) {
        // use accelerators instead of contenteditable commands
          ipcRenderer.invoke(
            'call-accelerator',
            `CmdOrCtrl+${e.key.toUpperCase()}`
          )
          e.preventDefault()
          return
      }

      if (["'", '"', "{", "("].find(c => c === e.key)) {
        const sels = this.selectionStart
        const sele = this.selectionEnd
        let data = ''
        let chars = []

        if (sels != sele)
          data = this.innerHTML.substr(sels, sele)

        switch (e.key) {
          case '"': case "'":  case "`": chars = [e.key, e.key]; break;
          case '{': chars = [e.key, '}']; break;
          case "(": chars = [e.key, ')']; break;
        }

        if (!data) {
          left.inject(chars.join(''))
          this.setSelectionRange(sele + 1)
        } else {
          this.setSelectionRange(sels)
          left.inject(chars[0])
          this.setSelectionRange(sele+1)
          left.inject(chars[1])
        }
        e.preventDefault()
      }
    })

    ipcRenderer.on('left-editor-toggle-soft-wrap', () => {
      this.soft_wrap = !this.soft_wrap
      left.editor_el.style.whiteSpace = (this.soft_wrap ? 'pre-wrap' : '')
    })
  }

  get value() { return this.textContent }
  set value(data) {
    this.textContent = data
    this.normalize()
  }

  get selectionStart() {
    const p = this.getSelection()
    return p[0] > p[1] ? p[1] : p[0]
  }
  set selectionStart(pos) {
    this.setSelectionRange(pos, pos)
  }

  get selectionEnd() {
    const p = this.getSelection()
    return p[1] < p[0] ? p[0] : p[1]
  }

  getSelection() {
    const selection = window.getSelection()
    return [selection.baseOffset, selection.extentOffset]
  }

  normalize() {
    return this.innerHTML = this.innerHTML
      .replace(/<br\/*>/ig, '\n')
      .replace(/(<([^>]+)>)/ig, '')
  }
}
customElements.define('left-editor', Editor, {
  extends: 'pre'
})

module.exports = Editor
