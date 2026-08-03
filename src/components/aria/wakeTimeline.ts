/**
 * 唤醒 master timeline（导演式标签，非 delay 链散落）。
 * phases: start → hands_leave → head_up → eye_contact → smile → done
 */
export type WakePhase =
  | 'start'
  | 'hands_leave'
  | 'head_up'
  | 'eye_contact'
  | 'smile'
  | 'done';

/** 累计时间点（ms）——总时长 ~2.5s，含可读停留 */
export const WAKE_CUES: { t: number; phase: WakePhase }[] = [
  { t: 0, phase: 'start' },
  { t: 350, phase: 'hands_leave' },
  { t: 700, phase: 'head_up' },
  { t: 1500, phase: 'eye_contact' }, // 眼神停留 ≥0.5s
  { t: 2100, phase: 'smile' },
  { t: 2500, phase: 'done' },
];

export function runWakeTimeline(
  onPhase: (phase: WakePhase, progress01: number) => void,
  onDone: () => void,
): () => void {
  const t0 = performance.now();
  let raf = 0;
  let last: WakePhase | null = null;
  let cancelled = false;

  const total = WAKE_CUES[WAKE_CUES.length - 1]!.t;

  const frame = (now: number) => {
    if (cancelled) return;
    const elapsed = now - t0;
    let phase: WakePhase = 'start';
    for (const c of WAKE_CUES) {
      if (elapsed >= c.t) phase = c.phase;
    }
    const p = Math.min(1, elapsed / total);
    if (phase !== last) {
      last = phase;
      onPhase(phase, p);
    } else {
      onPhase(phase, p);
    }
    if (elapsed >= total) {
      onDone();
      return;
    }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return () => {
    cancelled = true;
    cancelAnimationFrame(raf);
  };
}

export const WAKE_PHASE_LABEL: Record<WakePhase, string> = {
  start: 'She hears you…',
  hands_leave: 'Hands leave the keys',
  head_up: 'Looking up…',
  eye_contact: 'Eye contact',
  smile: 'A soft smile',
  done: '',
};
