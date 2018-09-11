"use strict";

function Go()
{
  this.to_page = function(id = 0,line = 0)
  {
    left.project.index = clamp(parseInt(id),0,left.project.pages.length-1);

    console.log(`Go to page:${left.project.index}/${left.project.pages.length}`)

    let page = left.project.page();

    if(!page){ console.warn("Missing page",this.index); return; }
    if(page.has_external_changes()){ page.refresh(); }

    left.textarea_el.value = page.text;
    left.go.to_line(line);
    left.refresh();
  }

  this.to_line = function(id)
  {
    let lineArr = left.textarea_el.value.split("\n",parseInt(id)+1)
    let arrJoin = lineArr.join("\n")
    let from = arrJoin.length-lineArr[id].length;
    let to = arrJoin.length;

    this.to(from,to)
  }

  this.to = function(from,to)
  {
    if(left.textarea_el.setSelectionRange){
      left.textarea_el.setSelectionRange(from,to);
    }
    else if(left.textarea_el.createTextRange){
      let range = left.textarea_el.createTextRange();
      range.collapse(true);
      range.moveEnd('character',to);
      range.moveStart('character',from);
      range.select();
    }
    left.textarea_el.focus();
    this.scroll_to(from,to);

    return from == -1 ? null : from;
  }

  this.to_word = function(word,from = 0, tries = 0, starting_with = false, ending_with = false)
  {
    let target = word;

    if(starting_with){ target = target.substr(0,target.length-1); }
    if(ending_with){ target = target.substr(1,target.length-1); }

    if(left.textarea_el.value.substr(from,length).indexOf(target) == -1 || tries < 1){ console.log("failed"); return; }

    let length = left.textarea_el.value.length - from;
    let segment = left.textarea_el.value.substr(from,length)
    let location = segment.indexOf(target);
    let char_before = segment.substr(location-1,1);
    let char_after = segment.substr(location+target.length,1);

    // Check for full word
    if(!starting_with && !ending_with && !char_before.match(/[a-z]/i) && !char_after.match(/[a-z]/i)){
      left.select(location+from,location+from+target.length);
      let perc = (left.textarea_el.selectionEnd/parseFloat(left.chars_count));
      let offset = 60;
      left.textarea_el.scrollTop = (left.textarea_el.scrollHeight * perc) - offset;
      return location;
    }
    else if(starting_with && !char_before.match(/[a-z]/i) && char_after.match(/[a-z]/i)){
      left.select(location+from,location+from+target.length);
      let perc = (left.textarea_el.selectionEnd/parseFloat(left.chars_count));
      let offset = 60;
      left.textarea_el.scrollTop = (left.textarea_el.scrollHeight * perc) - offset;
      return location;
    }
    else if(ending_with && char_before.match(/[a-z]/i) && !char_after.match(/[a-z]/i)){
      left.select(location+from,location+from+target.length);
      let perc = (left.textarea_el.selectionEnd/parseFloat(left.chars_count));
      let offset = 60;
      left.textarea_el.scrollTop = (left.textarea_el.scrollHeight * perc) - offset;
      return location;
    }

    this.to_word(word,location+target.length,tries-1, starting_with,ending_with);
  }

  this.scroll_to = function(from,to)
  {
    let text_val = left.textarea_el.value;
    let div = document.createElement("div");
    div.innerHTML = text_val.slice(0,to);
    document.body.appendChild(div);
    animate_scroll_to(left.textarea_el,div.offsetHeight - 60, 200);
    div.remove();
  }

  function animate_scroll_to(element, to, duration)
  {
    let start = element.scrollTop;
    let change = to - start;
    let currentTime = 0;
    let increment = 20; // Equal to line-height

    let animate = function()
    {
      currentTime += increment;
      let val = Math.easeInOutQuad(currentTime, start, change, duration);
      element.scrollTop = val;
      if (!left.reader.active) left.stats.on_scroll();
      if(currentTime < duration){
        requestAnimationFrame(animate, increment);
      }
    };
    requestAnimationFrame(animate);
  }

  //t = current time
  //b = start value
  //c = change in value
  //d = duration

  Math.easeInOutQuad = function(t, b, c, d)
  {
    t /= d/2;
    if(t < 1) return c/2*t*t + b;
    t--;
    return -c/2 * (t*(t-2) - 1) + b;
  };

  function clamp(v, min, max) { return v < min ? min : v > max ? max : v; }
}
