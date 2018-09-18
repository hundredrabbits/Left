"use strict";

function Dictionary()
{
  this.vocabulary = [];
  this.synonyms = {};
  this.is_suggestions_enabled = true;
  this.is_synonyms_enabled = true;

  this.start = function()
  {
    this.synonyms = SYN_DB;
    this.build_synonyms();
    this.update();
  }

  this.add_word = function(s)
  {
    let word = s.toLowerCase().trim();
    let regex = /[^a-z]/gi

    if(regex.test(word) || word.length < 4){ return; }

    this.vocabulary[this.vocabulary.length] = word    
  }

  this.build_synonyms = function()
  {
    let time = performance.now();
    
    for(let target_word in SYN_DB){
      let synonyms = SYN_DB[target_word];
      this.add_word(target_word)
      for(let word_id in synonyms){
        let target_parent = synonyms[word_id];
        if(this.synonyms[target_parent] && this.synonyms[target_parent].constructor == Array){ 
          this.synonyms[target_parent][this.synonyms[target_parent].length] = target_word;
        }
        else{
          this.synonyms[target_parent] = [target_word];
        }
      }
    }
    console.log(`Built ${Object.keys(this.synonyms).length} synonyms, in ${(performance.now() - time).toFixed(2)}ms.`);
  }

  this.find_suggestion = function(str)
  {
    let target = str.toLowerCase();

    for(let id in this.vocabulary){
      if(this.vocabulary[id].substr(0,target.length) != target){ continue; }
      return this.vocabulary[id];
    }
    return null;
  }

  this.find_synonym = function(str)
  {
    if(str.trim().length < 4){ return; }

    let target = str.toLowerCase();

    if(this.synonyms[target]){ 
      return uniq(this.synonyms[target]); 
    }

    if(target[target.length-1] == "s"){
      let singular = this.synonyms[target.substr(0,target.length-1)]
      if(this.synonyms[singular]){
        return uniq(this.synonyms[singular]);
      }
    }

    return null;
  }

  this.update = function()
  {
    let time = performance.now();
    let words = left.textarea_el.value.toLowerCase().split(/[^\w\-]+/);

    for(let word_id in words){
      this.add_word(words[word_id])
    }
    console.log(`Updated Dictionary in ${(performance.now() - time).toFixed(2)}ms.`);
  }

  function uniq(a1){ let a2 = []; for(let id in a1){ if(a2.indexOf(a1[id]) == -1){ a2[a2.length] = a1[id]; } } return a2; }
}