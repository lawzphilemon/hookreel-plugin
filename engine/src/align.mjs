// Matches the script's words to the words Whisper heard, so cues and captions follow the
// real recording. Plain erasable TypeScript: also imported by scripts/prepare-vo.mjs under Node.

                                                                      // seconds
                                                      

export const normWord = (w        ) => w.toLowerCase().replace(/[^a-z0-9]/g, "");

export const splitWords = (text        ) => {
  const words                                     = [];
  const re = /\S+/g;
  let m                        ;
  while ((m = re.exec(text))) words.push({ word: m[0], offset: m.index });
  return words;
};

const similarity = (a        , b        ) => {
  if (a === b) return 2;
  if (a.length >= 3 && b.length >= 3 && (a.startsWith(b.slice(0, 3)) || b.startsWith(a.slice(0, 3)))) return 1;
  return -1;
};

// Global alignment (Needleman-Wunsch). Returns, per script word, the index of the heard word or -1.
export const alignWords = (script          , heard          )           => {
  const n = script.length;
  const m = heard.length;
  const GAP = -1;
  const score             = Array.from({ length: n + 1 }, (_, i) => Array.from({ length: m + 1 }, (_, j) => (i + j) * GAP));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      score[i][j] = Math.max(
        score[i - 1][j - 1] + similarity(script[i - 1], heard[j - 1]),
        score[i - 1][j] + GAP,
        score[i][j - 1] + GAP,
      );
    }
  }
  const map = new Array        (n).fill(-1);
  let i = n;
  let j = m;
  while (i > 0 && j > 0) {
    const s = similarity(script[i - 1], heard[j - 1]);
    if (score[i][j] === score[i - 1][j - 1] + s) {
      if (s > 0) map[i - 1] = j - 1;
      i--;
      j--;
    } else if (score[i][j] === score[i - 1][j] + GAP) {
      i--;
    } else {
      j--;
    }
  }
  return map;
};

// Start/end time for every script word. Unmatched words are spread evenly between their neighbours.
export const scriptWordTimes = (scriptText        , heard             , total        )             => {
  const script = splitWords(scriptText).map((w) => normWord(w.word));
  const clean = heard.filter((h) => normWord(h.text));
  const map = alignWords(script, clean.map((h) => normWord(h.text)));
  const times                      = map.map((j) => (j >= 0 ? { start: clean[j].start, end: clean[j].end } : null));
  for (let i = 0; i < times.length; i++) {
    if (times[i]) continue;
    let k = i;
    while (k < times.length && !times[k]) k++;
    const from = i > 0 ? times[i - 1] .end : 0;
    const to = k < times.length ? times[k] .start : total;
    const step = (to - from) / (k - i);
    for (let x = i; x < k; x++) times[x] = { start: from + step * (x - i), end: from + step * (x - i + 1) };
  }
  return times              ;
};
