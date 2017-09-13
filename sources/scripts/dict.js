function Dict()
{
  this.vocabulary = [];
  this.synonyms = {};
  this.synonyms_db = SYN_DB;
  this.is_suggestions_enabled = true;
  this.is_synonyms_enabled = true;

  this.build_synonyms = function()
  {
    for(word in this.synonyms_db){

      var synonyms = this.synonyms_db[word];
      if(!this.synonyms[word]){ this.synonyms[word] = synonyms; }

      for(syn_id in synonyms){
        var synonym = synonyms[syn_id];
        if(!this.synonyms[synonym]){ this.synonyms[synonym] = []; }
        if(this.synonyms[synonym].constructor == Array && this.synonyms[synonym].indexOf(word) == -1){ this.synonyms[synonym].push(word); }
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

  this.find_synonym = function(to_word)
  {
    if(!this.is_synonyms_enabled){ return null; }

    if(this.synonyms[to_word]){ return this.synonyms[to_word]; }
    if(this.synonyms[to_word.substr(0,to_word.length-1)]){ return this.synonyms[to_word.substr(0,to_word.length-1)]; }

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

  this.build_synonyms();
}