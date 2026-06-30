// 单词间隔重复（本地 localStorage，SM-2 / FSRS 简化版）+ 发音。
// 无后端依赖：每个单词记 {interval天, ease, due毫秒, reps}，按到期优先排队。

export type Rating = 'again' | 'hard' | 'good' | 'easy';

export interface SrsState { interval: number; ease: number; due: number; reps: number }

const KEY = 'mneme_vocab_srs';
const DAY = 86400000;

function load(): Record<string, SrsState> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(KEY) ?? '{}'); } catch { return {}; }
}
function save(m: Record<string, SrsState>) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(KEY, JSON.stringify(m)); } catch { /* quota */ }
}

export function getAll(): Record<string, SrsState> { return load(); }

/** 更新一个单词的排程。now 由调用方传入（避免 SSR）。 */
export function rate(word: string, rating: Rating, now: number): void {
  const m = load();
  const s: SrsState = m[word] ?? { interval: 0, ease: 2.5, due: now, reps: 0 };
  let { interval, ease, reps } = s;
  if (rating === 'again') { interval = 0; ease = Math.max(1.3, ease - 0.2); reps = 0; }
  else if (rating === 'hard') { interval = Math.max(1, interval * 1.2); ease = Math.max(1.3, ease - 0.15); reps += 1; }
  else if (rating === 'good') { interval = reps === 0 ? 1 : interval * ease; reps += 1; }
  else { interval = (reps === 0 ? 2 : interval * ease * 1.3); ease = Math.min(3.0, ease + 0.15); reps += 1; }
  const due = rating === 'again' ? now + 10 * 60000 : now + Math.round(interval * DAY);
  m[word] = { interval, ease, due, reps };
  save(m);
}

/** 统计：到期数 / 学过数 / 新词数。 */
export function stats(words: string[], now: number) {
  const m = load();
  let due = 0, learned = 0;
  for (const w of words) {
    const s = m[w];
    if (!s) continue;
    learned += 1;
    if (s.due <= now) due += 1;
  }
  return { due, learned, fresh: words.length - learned };
}

/** 排队：到期(含逾期)优先、再新词；各自打乱，截到 limit。 */
export function buildQueue(words: string[], now: number, limit = 20): string[] {
  const m = load();
  const dueList: string[] = [], freshList: string[] = [];
  for (const w of words) {
    const s = m[w];
    if (!s) freshList.push(w);
    else if (s.due <= now) dueList.push(w);
  }
  const shuffle = (a: string[]) => a.map(x => [Math.sin(x.length * 999 + x.charCodeAt(0)), x] as const).sort((p, q) => p[0] - q[0]).map(t => t[1]);
  return [...shuffle(dueList), ...shuffle(freshList)].slice(0, limit);
}

/** 浏览器发音（Web Speech，无需音频文件）。 */
export function speak(word: string): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.lang = 'en-US';
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  } catch { /* unsupported */ }
}
