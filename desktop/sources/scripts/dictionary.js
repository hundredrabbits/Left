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
    var word = s.toLowerCase();
    var regex = /[^a-z]/gi

    if(regex.test(word)){ return; }

    this.vocabulary[this.vocabulary.length] = word    
  }

  this.build_synonyms = function()
  {
    var time = performance.now();

    for(target_word in SYN_DB){
      var synonyms = SYN_DB[target_word];
      this.add_word(target_word)
      for(word_id in synonyms){
        var target_parent = synonyms[word_id];
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

  this.find_suggestion = function(target)
  {
    if(!left.options.suggestions){ return null; }

    target = target.toLowerCase();

    for(word_id in this.vocabulary){
      var word = this.vocabulary[word_id];
      if(word.length < 4){ continue; }
      if(word.substr(0,target.length) == target){ return word; }
    }
    return null;
  }

  this.find_synonym = function(to_word)
  {
    if(!left.options.synonyms){ return null; }

    to_word = to_word.toLowerCase();

    if(this.synonyms[to_word]){ return uniq(this.synonyms[to_word]); }

    // If plurral
    var last_letter = to_word[to_word.length-1];
    if(last_letter == "s" && this.synonyms[to_word.substr(0,to_word.length-1)]){ return uniq(this.synonyms[to_word.substr(0,to_word.length-1)]); }

    return null;
  }

  this.update = function()
  {
    var time = performance.now();

    var words = left.textarea_el.value.toLowerCase().split(/[^\w\-]+/);

    for(word_id in words){
      this.add_word(words[word_id])
    }

    console.log(`Updated ${Object.keys(this.synonyms).length} words, in ${(performance.now() - time).toFixed(2)}ms.`);
  }

  function uniq(a1){ var a2 = []; for(id in a1){ if(a2.indexOf(a1[id]) == -1){ a2[a2.length] = a1[id]; } } return a2; }
}