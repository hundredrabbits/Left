'use strict'

const Page = require('./page')

function Splash () {
  Page.call(this, `# Welcome

## Guide

Left is a simple, minimalist, open-source and cross-platform text editor.

- Create markers by beginning lines with #, ## or --.
- Navigate quickly between markers with <c-]> and <c-[>.
- Open a text file by dragging it, or with <c-o>.
- Highlight some text and press <c-k> to enable the speed reader.
- Press <tab> to auto-complete a previously used, or common, word.
- Press <shift tab> to scroll through the selected word's synonyms.
- Press <c-\\> to toggle the navigation.

-- Details

- L : stands for Lines.
- W : stands for Words.
- V : stands for Vocabulary, or unique words.
- C : stands for Characters.

-- Quick Inserts

You can quickly insert or transform text by activating the Insert Mode with <c-i>, followed by one of these shortcuts:

- <c-d> : Date
- <c-t> : Time
- <c-p> : Path
- <c-h> : Header
- <c-H> : Sub-Header
- <c-/> : Comment
- <c-l> : Line

## Sources

View sources: https://github.com/hundredrabbits/left

-- Themes

Download additional themes: http://hundredrabbits.itch.io/Left
`)

  this.name = function () {
    return 'splash'
  }

  this.has_changes = function () {
    return false
  }
}

module.exports = Splash
