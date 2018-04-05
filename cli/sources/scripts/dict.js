const SYN_DB = require('./synonyms.js');

module.exports = {
  vocabulary: [],
  synonyms: null,
  is_suggestions_enabled: true,
  is_synonyms_enabled: true,

  start() {
    this.synonyms = SYN_DB;
    this.build_synonyms();
  },

  build_synonyms() {
    for (target_word in this.synonyms) {
      var synonyms = this.synonyms[target_word];

      for (word_id in synonyms) {
        var target_parent = synonyms[word_id];
        if (this.synonyms[target_parent] && this.synonyms[target_parent].constructor == Array) {
          this.synonyms[target_parent].push(target_word);
        } else {
          this.synonyms[target_parent] = [target_word];
        }
      }
    }
  },

  find_suggestion(to_word) {
    if (!left.options.suggestions) {
      return null;
    }

    to_word = to_word.toLowerCase();

    for (word_id in this.vocabulary) {
      var word = this.vocabulary[word_id];
      if (word.length < 4) {
        continue;
      }
      if (word.substr(0, to_word.length) == to_word) {
        return word;
      }
    }
    return null;
  },

  squash(arr) {
    var tmp = [];
    for (var i = 0; i < arr.length; i++) {
      if (tmp.indexOf(arr[i]) == -1) {
        tmp.push(arr[i]);
      }
    }
    return tmp;
  },

  find_synonym(to_word) {
    to_word = to_word.toLowerCase();
    if (!left.options.synonyms && this.synonyms) {
      return null;
    }

    if (this.synonyms[to_word]) {
      return squash(this.synonyms[to_word]);
    }

    // If plurral
    var last_letter = to_word[to_word.length - 1];
    if (last_letter == "s" && this.synonyms[to_word.substr(0, to_word.length - 1)]) {
      return squash(this.synonyms[to_word.substr(0, to_word.length - 1)]);
    }

    return null;
  },

  update() {
    this.vocabulary = [""];

    var words = left.textarea_el.value.split(/[^\w\-]+/);
    for (word_id in words) {
      var word = words[word_id].toLowerCase();
      if (this.vocabulary.indexOf(word) < 0) {
        this.vocabulary.push(word);
      }
    }
  }
}
