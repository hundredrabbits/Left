"use strict";

document.onkeydown = function key_down(e)
{
  left.last_char = e.key

  // Faster than Electron
  if(e.keyCode == 9){
    if(e.shiftKey){
      left.select_synonym();
    }
    else{
      left.select_autocomplete();
    }
    e.preventDefault();
    return;
  }
  // Faster than Electron
  if(e.metaKey || e.ctrlKey){
    if(e.keyCode == 221){
      left.navi.next_marker();
      e.preventDefault();
      return;
    }
    if(e.keyCode == 291){
      left.navi.prev_marker();
      e.preventDefault();
      return;
    }
  }

  // Reset index on space
  if(e.key == " " || e.key == "Enter"){
    left.selection.index = 0;
  }

  if(e.key.substring(0,5) == "Arrow"){
    setTimeout(() => left.update(), 0) //force the refresh event to happen after the selection updates
    return;
  }

  // Slower Refresh
  if(e.key == "Enter"){
    setTimeout(() => { left.dictionary.update(); left.update()}, 16)
    return;
  }
};

document.onkeyup = (e) =>
{
  if(e.keyCode == 16){ // Shift
    left.selection.index = 0;
    left.update();
    return;
  }
  if(e.keyCode != 9){
    left.update();  
  }
}

// Selection Change
let last_selection = null;

window.addEventListener('mousemove',function(e)
{
  if(last_selection && last_selection.start == left.textarea_el.selectionStart && last_selection.end == left.textarea_el.selectionEnd){
    return;
  }
  left.update();
  last_selection = {start:left.textarea_el.selectionStart,end:left.textarea_el.selectionEnd}
});

window.addEventListener('dragover',function(e)
{
  e.stopPropagation();
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
});

window.addEventListener('drop', function(e)
{
  e.stopPropagation();
  e.preventDefault();

  const files = e.dataTransfer.files;

  for(const id in files){
    const file = files[id];
    if(!file.path){ continue;}
    if(file.type && !file.type.match(/text.*/)) { console.log(`Skipped ${file.type} : ${file.path}`); continue; }
    if(file.path && file.path.substr(-3,3) == "thm"){ continue; }
    
    left.project.add(file.path)
  }

  left.reload();
  left.navi.next_page();
});

document.onclick = function on_click(e)
{
  left.selection.index = 0;
  left.operator.stop();
  left.reader.stop();
  left.update();
}
