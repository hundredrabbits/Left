class Editor extends HTMLPreElement {
  constructor() {
    super();

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

      range.setStart(this.childNodes[0], f)
      if (f != t)
        range.setEnd(this.childNodes[0], t)
      selection.removeAllRanges()
      selection.addRange(range)
    } // TODO

    this.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { // avoid injecting DIV
        document.execCommand('insertHTML', false, '\n');
        e.preventDefault()
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
      }
    })
  }

  get selectionStart() { return this.getSelection()[0] }
  set selectionStart(pos) {
    this.setSelectionRange(pos, pos)
  }

  get selectionEnd() { return this.getSelection()[1] }

  get value() { return this.innerText }
  set value(data) {
    this.innerText = data
    this.innerHTML = this.innerHTML.replace(/<br\/*>/g, '\r');
  }

  getSelection() {
    const selection = window.getSelection()
    return [selection.baseOffset, selection.extentOffset]
  }
}
customElements.define('left-editor', Editor, {
  extends: 'pre'
})

module.exports = Editor
