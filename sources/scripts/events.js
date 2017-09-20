
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
  var file = files[0];
  
  if (file.type && !file.type.match(/text.*/)) { console.log("Not text", file.type); return false; }

  var path = file.path ? file.path : file.name;
  var reader = new FileReader();
  reader.onload = function(e){
    left.load(e.target.result,path)
  };
  reader.readAsText(file);
});

window.onbeforeunload = function(e)
{
  left.source.backup();
};


document.onkeyup = function key_up(e)
{
  if(left.operator.is_active){
    e.preventDefault();
    return;
  }
}

document.onkeydown = function key_down(e)
{
  // Operator
  if(e.key == "k" && (e.ctrlKey || e.metaKey)){
    e.preventDefault();
    left.operator.start();
    return;
  }

  if(left.operator.is_active){
    e.preventDefault();
    if(e.key == "Escape"){
      left.operator.stop();
    }
    else{
      left.operator.input(e);
    }
    return;
  }

  // Save
  if(e.key == "S" && (e.ctrlKey || e.metaKey)){
    e.preventDefault();
    left.export();
  }

  // Reset
  if((e.key == "Backspace" || e.key == "Delete") && e.ctrlKey && e.shiftKey){
    e.preventDefault();
    left.reset();
  }

  // Autocomplete
  if(e.keyCode == 9){
    e.preventDefault();
    if(left.suggestion && left.suggestion.toLowerCase() != left.active_word().toLowerCase()){ left.autocomplete(); }
    else if(left.synonyms){ left.replace_active_word_with(left.synonyms[left.synonym_index % left.synonyms.length]); }
  }

  if(e.key == "]" && (e.ctrlKey || e.metaKey)){
    e.preventDefault();
    left.go_to_next();
  }

  if(e.key == "[" && (e.ctrlKey || e.metaKey)){
    e.preventDefault();
    left.go_to_prev();
  }

  if(e.key == "n" && (e.ctrlKey || e.metaKey)){
    e.preventDefault();
    left.clear();
  }

  if(e.key == "o" && (e.ctrlKey || e.metaKey)){
    e.preventDefault();
    left.open();
  }

  if(e.key == "s" && (e.ctrlKey || e.metaKey)){
    e.preventDefault();
    left.save();
  }

  // Slower Refresh
  if(e.key == "Enter"){
    left.dictionary.update();
    left.source.backup();
    left.theme.save();
  }

  // Reset index on space
  if(e.key == " " || e.key == "Enter"){
    left.synonym_index = 0;
  }

  left.refresh();
};

document.addEventListener('wheel', function(e)
{
  e.preventDefault();
  left.textarea_el.scrollTop += e.wheelDeltaY * -0.25;
  left.navi.update_scrollbar();
}, false);

document.oninput = function on_input(e)
{
  left.refresh();
}

document.onmouseup = function on_mouseup(e)
{
  left.operator.stop();
  left.refresh();
}