/* Spoken cues: the times of the words that name each mark, from the aligned words of each edition. From ddwg-film v1.0.0 (c4e8aac), picture/film.js. */

import { L } from "../timeline.js";

export const units = (v) => v.replace(/[^\p{L}\p{N}]/gu, "").toLowerCase();
export const phraseEnd = new Map();
const cueCache = new Map();
/* Clause boundaries of a segment's text, as counts of letters and digits before each boundary. The words are aligned
 * to the written text, so its letters are counted, not those of the spoken forms. */
const clauseCache = new Map();
function clauseEnds(s) {
  if (!clauseCache.has(s.id)) {
    const ends = [];
    let n = 0;
    for (const ch of s.text) {
      if (/[\p{L}\p{N}]/u.test(ch)) n += units(ch).length;
      else if (/[，。；：！？,.;:!?—]/u.test(ch)) ends.push(n);
    }
    clauseCache.set(s.id, ends);
  }
  return clauseCache.get(s.id);
}
/* Spoken cues: the first (or last) word that begins the named phrase in this edition. */
export function cue(s, zh, english, { last = false, end = false } = {}) {
  const key = `${s.id}:${zh}:${english}:${last}:${end}`;
  if (cueCache.has(key)) return cueCache.get(key);
  const target = units(L(zh, english));
  const spoken = s.words.map((w) => units(w.text)).join("");
  const index = last ? spoken.lastIndexOf(target) : spoken.indexOf(target);
  if (index < 0 || !target) throw Error(`Missing spoken cue ${key}`);
  // A label keeps its emphasis until the clause that names it has been spoken, for at most 4.5 seconds.
  const clause = clauseEnds(s).find((n) => n >= index + target.length) ?? spoken.length;
  let cursor = 0,
    first = null,
    close = null,
    said = null;
  for (const w of s.words) {
    const n = units(w.text).length;
    if (first === null && cursor + n > index) first = w.start;
    if (close === null && cursor + n >= index + target.length) close = w.end;
    if (cursor + n >= clause) {
      said = w.end;
      break;
    }
    cursor += n;
  }
  if (first === null || close === null) throw Error(`Unresolved spoken cue ${key}`);
  phraseEnd.set(
    first,
    Math.max(phraseEnd.get(first) ?? 0, Math.min(said ?? close, first + 4.5), close),
  );
  const value = end ? close : first;
  cueCache.set(key, value);
  return value;
}
export const cues = (s, pairs) => pairs.map((pair) => cue(s, ...pair));
/* The first word of the named phrase spoken at or after `from`, for phrases the segment repeats. */
export function cueFrom(s, zh, english, from) {
  const target = units(L(zh, english));
  let spoken = "";
  const starts = s.words.map((w) => {
    const at = spoken.length;
    spoken += units(w.text);
    return at;
  });
  const k = s.words.findIndex((w) => w.start >= from - 1e-6);
  const index = spoken.indexOf(target, k < 0 ? spoken.length : starts[k]);
  if (index < 0 || !target)
    throw Error(`Missing spoken cue ${s.id}:${zh}:${english} after ${from}`);
  let i = starts.length - 1;
  while (starts[i] > index) i--;
  return s.words[i].start;
}
