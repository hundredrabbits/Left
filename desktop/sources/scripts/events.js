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

  // Reset index on space
  if(e.key == " " || e.key == "Enter"){
    left.selection.index = 0;
  }

  if(e.key.substring(0,5) == "Arrow"){
    setTimeout(() => left.refresh(), 0) //force the refresh event to happen after the selection updates
    return;
  }

  // Slower Refresh
  if(e.key == "Enter" && left.textarea_el.value.length > 50000 || left.textarea_el.value.length < 50000 ){
    setTimeout(() => {left.dictionary.update(),left.refresh()}, 0)
    return;
  }
};

document.onkeyup = (e) =>
{
  if(e.keyCode == 16){ // Shift
    left.selection.index = 0;
  }
  if(e.keyCode == 9){ // Tab
    return;
  }
  left.refresh();
}

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

  var files = e.dataTransfer.files;

  for(id in files){
    var file = files[id];
    if(!file.path){ continue;}
    if(file.type && !file.type.match(/text.*/)) { console.log(`Skipped ${file.type} : ${file.path}`); continue; }
    if(file.path && file.path.substr(-3,3) == "thm"){ continue; }

    left.project.pages.push(new Page(left.project.load(file.path),file.path));
  }

  left.refresh();
  left.navi.next_page();
});

document.onclick = function on_click(e) =>
{
  left.selection.index = 0;
  left.operator.stop();
  left.reader.stop();
  left.refresh();
}
