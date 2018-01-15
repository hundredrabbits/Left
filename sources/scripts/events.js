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
  
  left.project.open(path)
});

document.addEventListener('wheel', function(e)
{
  e.preventDefault();
  left.textarea_el.scrollTop += e.wheelDeltaY * -0.25;
  left.navi.update_scrollbar();
}, false)

window.addEventListener('resize', function(e)
{
  if(window.innerWidth < 800){
    document.body.className = "mobile";
  }
  else{
    document.body.className = "";
  }
}, false);

document.onmouseup = function on_mouseup(e)
{
  left.selection.index = 0;
  left.operator.stop();
  left.refresh();
}