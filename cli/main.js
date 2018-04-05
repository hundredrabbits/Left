// 'use strict';

const blessed = require('blessed');
left = require('./sources/scripts/left.js');

const scr = blessed.screen({
  smartCSR: true,
  autopadding: true,
  title: 'Left',
  fullUnicode: true,
});

const appTitle = blessed.text({
  width: '100%-2',
  height: 1,
  top: 1,
  left: 1,
  content: '{bold}TEAL 0.1.0{/bold}',
  tags: true
});

const naviEl = blessed.list({
  width: '30%-1',
  height: '100%-3',
  left: 1,
  top: 2,
  border: {
    type: 'line',
  },
  style: {
    border: {
      fg: 'white',
    }
  },
});

// naviEl.add(': LEFT');
// naviEl.add('  WELCOME');

const textArea = blessed.textarea({
  width: '70%-1',
  height: '100%-3',
  top: 2,
  left: '30%',
  // bottom: 0,
  keys: true,
  vi: true,
  hoverText: 'Enter commands here...',
  inputOnFocus: true,
  border: {
    type: 'line',
  },
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
  bottom: 0,
  // content: '{bold}0L 0W 0V 0C NONEXISTENT.md{/bold}',
  tags: true
});

scr.append(appTitle);
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
