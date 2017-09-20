function Dict()
{
  this.vocabulary = [];
  this.synonyms = null;
  this.is_suggestions_enabled = true;
  this.is_synonyms_enabled = true;

  this.start = function()
  {
    this.synonyms = SYN_DB;
    this.build_synonyms();
  }

  this.build_synonyms = function()
  {
    for(target_word in this.synonyms){
      var synonyms = this.synonyms[target_word];

      for(word_id in synonyms){
        var target_parent = synonyms[word_id];
        if(this.synonyms[target_parent] && this.synonyms[target_parent].constructor == Array){ 
          this.synonyms[target_parent].push(target_word);
        }
        else{
          this.synonyms[target_parent] = [target_word];
        }
      }
    }
  }

  this.find_suggestion = function(to_word)
  {
    if(!this.is_suggestions_enabled){ return null; }

    to_word = to_word.toLowerCase();

    for(word_id in this.vocabulary){
      var word = this.vocabulary[word_id];
      if(word.length < 4){ continue; }
      if(word.substr(0,to_word.length) == to_word){ return word; }
    }
    return null;
  }

  function squash(arr)
  {
    var tmp = [];
    for(var i = 0; i < arr.length; i++){
        if(tmp.indexOf(arr[i]) == -1){
        tmp.push(arr[i]);
        }
    }
    return tmp;
  }

  this.find_synonym = function(to_word)
  {
    to_word = to_word.toLowerCase();
    if(!this.is_synonyms_enabled && this.synonyms){ return null; }

    if(this.synonyms[to_word]){ return squash(this.synonyms[to_word]); }

    // If plurral
    var last_letter = to_word[to_word.length-1];
    if(last_letter == "s" && this.synonyms[to_word.substr(0,to_word.length-1)]){ return squash(this.synonyms[to_word.substr(0,to_word.length-1)]); }

    return null;
  }

  this.update = function()
  {
    this.vocabulary = [];

    var words = left.textarea_el.value.split(/[^A-Za-z]/);
    for(word_id in words){
      var word = words[word_id].toLowerCase();
      if(this.vocabulary.indexOf(word) < 0){
        this.vocabulary.push(word);
      }
    }
  }
}