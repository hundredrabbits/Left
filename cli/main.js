// 'use strict';

const blessed = require('blessed');
left = require('./sources/scripts/left.js');

const scr = blessed.screen({
  smartCSR: true,
  autopadding: true,
  title: 'Left',
  fullUnicode: true,
});

const naviEl = blessed.list({
  width: '30%-1',
  height: '100%-2',
  left: 2,
  top: 1,
  style: {
    border: {
      fg: 'white',
    }
  },
});

const textArea = blessed.textarea({
  width: '70%-1',
  height: '100%-2',
  top: 2,
  left: '30%',
  // bottom: 0,
  keys: true,
  vi: true,
  hoverText: 'Enter commands here...',
  inputOnFocus: true,
  style: {
    border: {
      fg: 'white',
    }
  },
});

const statsBar = blessed.text({
  width: '100%',
  height: 1,
  left: '30%+1',
  bottom: 2,
  // content: '{bold}0L 0W 0V 0C NONEXISTENT.md{/bold}',
  tags: true
});

scr.append(naviEl);
scr.append(textArea);
scr.append(statsBar);

// Quit on Escape, q, or Control-C.
scr.key(['escape', 'C-c'], (ch, key) => {
  process.exit(0);
});

left.textarea_el = textArea;
left.stats_el = statsBar;
left.navi.el = naviEl;
left.start();

scr.key(['space'], e => {
  left.refresh();
})

scr.on('keyup', e => {
  if (e.keyCode == 9) {
    return;
  }
  left.refresh();
});

// document.addEventListener('wheel', function(e) {
//   e.preventDefault();
//   left.textarea_el.scrollTop += e.wheelDeltaY * -0.25;
//   left.navi.update_scrollbar();
// }, false)

scr.on('keyup', e => {
  left.selection.index = 0;
  left.operator.stop();
  left.refresh();
});

scr.render();
