/**
 * 免版权钢琴氛围：Web Audio 合成琶音（非录音版权曲）。
 * 演奏态播放，唤醒时 fadeOut；对话态静音。
 */

/** P2: 音符事件回调（每 tick 一个音符） */
export type NoteCallback = (event: {
  midi: number;
  step: number;
  bpm: number;
  trackName: string;
}) => void;

type Ambience = {
  start: () => void;
  stop: (fadeMs?: number) => void;
  setTrack: (index: number) => void;
  getProgress: () => number; // 0..1 假进度（按 bar 循环）
  /** P2: 注册音符回调（用于手部动画同步） */
  onNote: (cb: NoteCallback | null) => void;
  dispose: () => void;
};

export const TRACK_PRESETS = [
  // Moonlight Sonata 1st movement approximation: C# minor triplets
  // Notes: C#4, G#4, C#5 in triplet pattern, with bass notes
  { name: '月光 Moonlight', notes: [61, 68, 73, 61, 68, 73, 61, 68, 73, 61, 68, 73,
                                     59, 66, 71, 59, 66, 71, 59, 66, 71, 59, 66, 71], bpm: 56, vol: 0.11 },
  // Clair-ish: C# minor-ish soft notes (approximate, original pattern)
  { name: 'Moonlit Keys', notes: [61, 64, 68, 73, 68, 64, 61, 56], bpm: 52, vol: 0.09 },
  // Flowing: A major gentle
  { name: 'Quiet River', notes: [57, 61, 64, 69, 64, 61, 57, 52], bpm: 58, vol: 0.08 },
  // Canon-ish pattern simplified
  { name: 'Soft Canon', notes: [50, 57, 54, 50, 52, 59, 55, 52], bpm: 48, vol: 0.085 },
] as const;

function midiToFreq(m: number): number {
  return 440 * Math.pow(2, (m - 69) / 12);
}

export function createPianoAmbience(): Ambience {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let timer: ReturnType<typeof setInterval> | null = null;
  let trackIdx = 0;
  let step = 0;
  let startedAt = 0;
  let running = false;
  let noteCallback: NoteCallback | null = null; // P2

  const ensure = () => {
    if (ctx) return;
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
  };

  const playNote = (midi: number, when: number, dur: number, vol: number) => {
    if (!ctx || !master) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    // soft triangle + slight lowpass feel via gain envelope
    osc.type = 'triangle';
    osc.frequency.value = midiToFreq(midi);
    const t0 = when;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.03);
    g.gain.exponentialRampToValueAtTime(vol * 0.35, t0 + dur * 0.45);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  };

  const tick = () => {
    if (!ctx || !master || !running) return;
    const preset = TRACK_PRESETS[trackIdx % TRACK_PRESETS.length]!;
    const beat = 60 / preset.bpm;
    const now = ctx.currentTime;
    const midi = preset.notes[step % preset.notes.length]!;
    playNote(midi, now + 0.02, beat * 1.6, preset.vol);
    // soft fifth under every other note
    if (step % 2 === 0) {
      playNote(midi - 12, now + 0.02, beat * 2.2, preset.vol * 0.45);
    }
    // P2: 触发音符回调（手部动画同步）
    if (noteCallback) {
      noteCallback({
        midi,
        step,
        bpm: preset.bpm,
        trackName: preset.name,
      });
    }
    step += 1;
  };

  return {
    start() {
      ensure();
      if (!ctx || !master || running) return;
      void ctx.resume();
      running = true;
      startedAt = performance.now();
      step = 0;
      const preset = TRACK_PRESETS[trackIdx % TRACK_PRESETS.length]!;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value || 0.0001, ctx.currentTime);
      master.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 1.2);
      const beatMs = (60 / preset.bpm) * 1000;
      tick();
      timer = setInterval(tick, beatMs);
    },
    stop(fadeMs = 1200) {
      if (!ctx || !master) return;
      running = false;
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), t);
      master.gain.exponentialRampToValueAtTime(0.0001, t + fadeMs / 1000);
    },
    setTrack(index: number) {
      trackIdx = index;
      step = 0;
      startedAt = performance.now();
      if (running) {
        this.stop(200);
        window.setTimeout(() => this.start(), 220);
      }
    },
    getProgress() {
      const preset = TRACK_PRESETS[trackIdx % TRACK_PRESETS.length]!;
      const cycleMs = (60 / preset.bpm) * 1000 * preset.notes.length * 2;
      const elapsed = performance.now() - startedAt;
      return ((elapsed % cycleMs) / cycleMs) * 100;
    },
    onNote(cb: NoteCallback | null) {
      noteCallback = cb;
    },
    dispose() {
      this.stop(50);
      void ctx?.close();
      ctx = null;
      master = null;
    },
  };
}

export function trackMeta(index: number) {
  const p = TRACK_PRESETS[index % TRACK_PRESETS.length]!;
  return {
    id: p.name.toLowerCase().replace(/\s+/g, '-'),
    title: p.name,
    subtitle: 'Original soft piano · Web Audio (royalty-free)',
  };
}

export const TRACK_COUNT = TRACK_PRESETS.length;
