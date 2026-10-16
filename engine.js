/* readforme engine: splits text into sentences and words (with their positions, for highlighting),
   picks a sensible voice and estimates reading time. Works in the browser and in Node (for tests). */
(function (root) {
  'use strict';

  // Words that end in a full stop but don't end a sentence.
  var ABBR = /(?:^|\s)(mr|mrs|ms|dr|prof|sr|jr|st|no|vs|etc|e\.g|i\.e|approx|dept|govt|rs|inc|ltd|co|fig|vol|pp|smt|shri|kum|lt|col|gen|capt|mt|ave|rd)\.$/i;

  // Sentences with their start and end offsets in the original text.
  // Breaks after . ! ? (and closing quotes or brackets), and at blank lines or single line breaks.
  function sentences(text) {
    text = String(text || '');
    var out = [], start = 0, i = 0, n = text.length;
    function push(end) {
      var s = start, e = end;
      while (s < e && /\s/.test(text[s])) s++;
      while (e > s && /\s/.test(text[e - 1])) e--;
      if (e > s && /[A-Za-z0-9\u00C0-\uFFFF]/.test(text.slice(s, e))) out.push({ text: text.slice(s, e), start: s, end: e });
      start = end;
    }
    while (i < n) {
      var ch = text[i];
      if (ch === '\n') { push(i); i++; start = i; continue; }
      if (ch === '.' || ch === '!' || ch === '?' || ch === '\u0964') {
        var j = i + 1;
        while (j < n && /[.!?]/.test(text[j])) j++;
        while (j < n && /["'\u2019\u201D)\]]/.test(text[j])) j++;
        var atEnd = j >= n || /\s/.test(text[j]);
        if (atEnd) {
          var before = text.slice(start, i + 1);
          var decimal = ch === '.' && /\d$/.test(text.slice(0, i)) && /^\d/.test(text.slice(i + 1));
          var abbr = ch === '.' && j === i + 1 && ABBR.test(before);
          var initial = ch === '.' && j === i + 1 && /(?:^|\s)[A-Z]\.$/.test(before) && /^\s+[A-Z]/.test(text.slice(j));
          if (!decimal && !abbr && !initial) { push(j); i = j; continue; }
        }
        i = j; continue;
      }
      i++;
    }
    push(n);
    return out;
  }

  // Words inside a sentence, with offsets relative to the sentence.
  function words(sentence) {
    var out = [], re = /\S+/g, m;
    while ((m = re.exec(sentence))) out.push({ start: m.index, end: m.index + m[0].length });
    return out;
  }

  // Which word a speech "boundary" event at charIndex falls in.
  // The last word starting at or before charIndex (a boundary in the gap before a word belongs to the previous one).
  function wordAt(list, charIndex) {
    var k = 0;
    for (var i = 0; i < list.length; i++) if (list[i].start <= charIndex) k = i;
    return list.length ? k : -1;
  }

  // Prefer the saved voice, then Indian English, then any English, then whatever exists.
  function pickVoice(voices, savedName) {
    voices = voices || [];
    if (!voices.length) return null;
    var by = function (fn) { for (var i = 0; i < voices.length; i++) if (fn(voices[i])) return voices[i]; return null; };
    return (savedName && by(function (v) { return v.name === savedName; })) ||
      by(function (v) { return /^en[-_]IN/i.test(v.lang) && v.localService; }) ||
      by(function (v) { return /^en[-_]IN/i.test(v.lang); }) ||
      by(function (v) { return /^en[-_]GB/i.test(v.lang) && v.localService; }) ||
      by(function (v) { return /^en/i.test(v.lang) && v.localService; }) ||
      by(function (v) { return /^en/i.test(v.lang); }) ||
      by(function (v) { return v.default; }) || voices[0];
  }

  // Order voices for the menu: Indian, then other English, then the rest; each group by name.
  function sortVoices(voices) {
    var rank = function (v) { return /^en[-_]IN/i.test(v.lang) ? 0 : /^hi/i.test(v.lang) ? 1 : /^en/i.test(v.lang) ? 2 : 3; };
    return (voices || []).slice().sort(function (a, b) { return rank(a) - rank(b) || a.name.localeCompare(b.name); });
  }

  // Minutes to read aloud at a given rate (1 = about 160 words a minute).
  function minutes(text, rate) {
    var n = (String(text || '').match(/\S+/g) || []).length;
    return n ? Math.max(1, Math.round(n / (160 * (rate || 1)))) : 0;
  }

  var api = { sentences: sentences, words: words, wordAt: wordAt, pickVoice: pickVoice, sortVoices: sortVoices, minutes: minutes };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ReadForMe = api;
})(this);
