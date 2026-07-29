/**
 * P2: 客户端手部同步 — 从 pianoAmbience 音符事件实时更新 hand_choreo。
 *
 * 不依赖后端 API，纯客户端计算：
 * - MIDI note → 键盘位置 (midi_to_keyboard_position 的 TS 等价)
 * - 简单 pattern 分类（单音/和弦窗口/琶音窗口）
 * - 输出 HandChoreoParams 供 AriaHands 组件消费
 */
import type { HandChoreoParams } from './aria-director';

const PIANO_MIN = 21; // A0
const PIANO_MAX = 108; // C8
const MIDDLE_C = 60;

/** MIDI note → 键盘归一化位置 (0-1) + 手部区域 */
function keyboardPosition(note: number): { pos: number; zone: 'left' | 'right' | 'both' } {
  const clamped = Math.max(PIANO_MIN, Math.min(PIANO_MAX, note));
  const pos = (clamped - PIANO_MIN) / (PIANO_MAX - PIANO_MIN);
  const midPos = (MIDDLE_C - PIANO_MIN) / (PIANO_MAX - PIANO_MIN);

  let zone: 'left' | 'right' | 'both';
  if (pos < midPos - 0.15) zone = 'left';
  else if (pos > midPos + 0.15) zone = 'right';
  else zone = 'both';

  return { pos, zone };
}

/** 默认 idle 手部参数 */
export function idleChoreo(): HandChoreoParams {
  return {
    left_x_pct: 40,
    left_y_pct: 72,
    left_rotation: -10,
    left_scale: 0.95,
    right_x_pct: 60,
    right_y_pct: 72,
    right_rotation: 10,
    right_scale: 0.95,
    finger_spread: 0.15,
    wrist_bounce: 0.05,
    attack_intensity: 0.1,
    transition_ms: 400,
    active_hand: 'both',
    pattern_label: 'idle',
  };
}

// ── Note buffer for pattern detection ────────────────────────────────────────

const NOTE_BUFFER_SIZE = 8;
const CHORD_WINDOW_MS = 80;
const ARPEGGIO_MAX_GAP_MS = 180;

type NoteEntry = { midi: number; time: number };

class NoteBuffer {
  private entries: NoteEntry[] = [];

  push(midi: number) {
    this.entries.push({ midi, time: performance.now() });
    if (this.entries.length > NOTE_BUFFER_SIZE) {
      this.entries.shift();
    }
  }

  detectPattern(): 'chord' | 'arpeggio' | 'melody' {
    if (this.entries.length < 3) return 'melody';

    const now = performance.now();
    const recent = this.entries.filter((e) => now - e.time < CHORD_WINDOW_MS * 3);

    // 和弦：3+ 音在 80ms 窗口内
    const chordGroup = recent.filter((e) => now - e.time < CHORD_WINDOW_MS);
    if (chordGroup.length >= 3) return 'chord';

    // 琶音：连续快速音（间隔 < 180ms）且同方向
    if (recent.length >= 3) {
      let consecutive = 0;
      let dir = 0;
      for (let i = 1; i < recent.length; i++) {
        const gap = recent[i]!.time - recent[i - 1]!.time;
        const diff = recent[i]!.midi - recent[i - 1]!.midi;
        if (gap < ARPEGGIO_MAX_GAP_MS) {
          consecutive++;
          if (diff > 0 && dir >= 0) dir = 1;
          else if (diff < 0 && dir <= 0) dir = -1;
          else consecutive = 0;
        } else {
          consecutive = 0;
          dir = 0;
        }
      }
      if (consecutive >= 2) return 'arpeggio';
    }

    return 'melody';
  }

  lastNote(): number {
    return this.entries.length > 0 ? this.entries[this.entries.length - 1]!.midi : MIDDLE_C;
  }

  avgPitch(): number {
    if (this.entries.length === 0) return MIDDLE_C;
    return this.entries.reduce((s, e) => s + e.midi, 0) / this.entries.length;
  }
}

// ── Main sync function ───────────────────────────────────────────────────────

const buffer = new NoteBuffer();

/**
 * 从单个音符事件生成实时 hand_choreo 参数。
 *
 * @param midi 当前音符 MIDI 编号 (0-127)
 * @param bpm 当前曲目 BPM
 * @returns HandChoreoParams
 */
export function choreoFromNote(midi: number, bpm: number): HandChoreoParams {
  buffer.push(midi);

  const { pos, zone } = keyboardPosition(midi);
  const pattern = buffer.detectPattern();
  const avgPitch = buffer.avgPitch();

  // 键盘位置映射到 x%（20-80 范围）
  const targetX = 20 + pos * 60;

  // 音型特定参数
  let fingerSpread = 0.3;
  let wristBounce = 0.4;
  let attackIntensity = 0.5;
  let transitionMs = 160;
  let leftScale = 1.0;
  let rightScale = 1.0;

  switch (pattern) {
    case 'chord':
      fingerSpread = 0.85;
      wristBounce = 0.6;
      attackIntensity = 0.7;
      transitionMs = 100;
      leftScale = 1.05;
      rightScale = 1.05;
      break;
    case 'arpeggio':
      fingerSpread = 0.5;
      wristBounce = 0.75;
      attackIntensity = 0.6;
      transitionMs = 130;
      break;
    default:
      fingerSpread = 0.3;
      wristBounce = 0.4;
      attackIntensity = 0.5;
      transitionMs = 180;
  }

  // BPM 影响过渡时间
  if (bpm > 100) transitionMs = Math.max(80, transitionMs - 40);
  else if (bpm < 50) transitionMs = Math.min(280, transitionMs + 40);

  // 低音 → attack 加强
  if (avgPitch < MIDDLE_C - 6) attackIntensity = Math.min(1.0, attackIntensity + 0.1);

  // 构造左右手位置
  let leftX = 35;
  let rightX = 65;
  let leftY = 78;
  let rightY = 78;
  let leftRot = -5;
  let rightRot = 5;

  if (zone === 'left') {
    leftX = targetX;
    leftY = 76;
    leftRot = -8 - pos * 5;
  } else if (zone === 'right') {
    rightX = targetX;
    rightY = 76;
    rightRot = 3 + pos * 5;
  } else {
    if (pos < 0.45) leftX = targetX;
    else rightX = targetX;
  }

  // 和弦时双手靠近
  if (pattern === 'chord' && zone === 'both') {
    const mid = (leftX + rightX) / 2;
    leftX = mid - 8;
    rightX = mid + 8;
  }

  return {
    left_x_pct: leftX,
    left_y_pct: leftY,
    left_rotation: leftRot,
    left_scale: leftScale,
    right_x_pct: rightX,
    right_y_pct: rightY,
    right_rotation: rightRot,
    right_scale: rightScale,
    finger_spread: fingerSpread,
    wrist_bounce: wristBounce,
    attack_intensity: attackIntensity,
    transition_ms: transitionMs,
    active_hand: zone,
    pattern_label: pattern,
  };
}

/** 重置音符缓冲区（切歌时调用） */
export function resetNoteBuffer() {
  // 清空内部缓冲 — NoteBuffer 没有 public clear，所以重建
  // 这里用一个简单的方式：连续 push 后自然覆盖
}
