document.onkeydown = function key_down(e)
{
  // Reset

  if((e.key == "Backspace" || e.key == "Delete") && e.ctrlKey && e.shiftKey){
    e.preventDefault();
    left.reset();
    return;
  }

  // Operator

  if(e.key == "k" && (e.ctrlKey || e.metaKey)){
    e.preventDefault();
    left.operator.start();
    return;
  }

  if(left.operator.is_active){
    e.preventDefault();
    left.operator.input(e);
    return;
  }

  // New/Open/Save

  if(e.key == "n" && (e.ctrlKey || e.metaKey)){
    e.preventDefault();
    if(left.source.should_confirm){
      dialog.showMessageBox({type: 'question',icon:app_path+'/icon.png',buttons: ['Yes', 'No'],title: 'Confirm',message: 'Unsaved data will be lost. Are you sure you want to continue?' }, function(response) { if (response === 0) { left.source.clear(); } })  
      return;
    }
    left.source.clear();
    return;
  }

  if(e.key == "o" && (e.ctrlKey || e.metaKey)){
    e.preventDefault();
    left.source.open();
    return;
  }

  if(e.key == "s" && (e.ctrlKey || e.metaKey)){
    e.preventDefault();
    left.source.save();
    return;
  }

  if(e.key == "S" && (e.ctrlKey || e.metaKey)){
    e.preventDefault();
    left.source.export();
    return;
  }

  // Autocomplete

  if(e.keyCode == 9){
    e.preventDefault();
    if(left.suggestion && left.suggestion.toLowerCase() != left.active_word().toLowerCase()){ 
      left.autocomplete(); 
    }
    else if(left.synonyms){
      var synonyms = left.dictionary.find_synonym(left.selection.word);
      left.replace_active_word_with(synonyms[left.selection.index % synonyms.length]); 
      left.update_stats();
    }
    left.selection.index += 1;
    return;
  }

  // Navi

  if(e.key == "]" && (e.ctrlKey || e.metaKey)){
    e.preventDefault();
    left.navi.next();
  }

  if(e.key == "[" && (e.ctrlKey || e.metaKey)){
    e.preventDefault();
    left.navi.prev();
  }

  // Slower Refresh
  if(e.key == "Enter" && left.textarea_el.value.length > 50000 || left.textarea_el.value.length < 50000 ){
    left.dictionary.update();
    left.source.backup();
  }

  // Reset index on space
  if(e.key == " " || e.key == "Enter"){
    left.selection.index = 0;
  }
  
  if(e.key.substring(0,5) == "Arrow"){
    setTimeout(() => left.refresh(), 0) //force the refresh event to happen after the selection updates
    return;
  }
  
  left.refresh();
};

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
    left.source.load(e.target.result,path)
  };

  if(left.source.should_confirm){
    dialog.showMessageBox({type: 'question',icon:app_path+'/icon.png',buttons: ['Yes', 'No'],title: 'Confirm',message: 'Unsaved data will be lost. Are you sure you want to continue?' }, function(response) { if (response === 0) { reader.readAsText(file); } })  
    return;
  }
});

window.onbeforeunload = function(e)
{
  left.source.backup();
}

document.addEventListener('wheel', function(e)
{
  e.preventDefault();
  left.textarea_el.scrollTop += e.wheelDeltaY * -0.25;
  left.navi.update_scrollbar();
}, false)

window.addEventListener('resize', function(e)
{
  if(window.innerWidth < 720){
    document.body.className = "mobile";
  }
  else{
    document.body.className = "";
  }
}, false);

document.oninput = function on_input(e)
{
  left.refresh();
}

document.onmouseup = function on_mouseup(e)
{
  left.selection.index = 0;
  left.operator.stop();
  left.refresh();
}