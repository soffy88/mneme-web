/**
 * Aria Director 客户端：行动 + 人像布局 + 手部参数。
 */
import { MNEME_API_BASE } from './env';
import { authHeader, getUserId } from './auth-store';

export type AriaAction =
  | 'play_piano'
  | 'look_at_user'
  | 'speak'
  | 'think'
  | 'return_to_piano'
  | 'idle';

export type DirectorEvent = 'tick' | 'wake' | 'user_message';

export type AriaLayout = {
  left_pct: number;
  bottom_pct: number;
  width_pct: number;
  height_pct: number;
  scale: number;
  anchor_x_pct: number;
  anchor_y_pct: number;
};

export type AriaHands = {
  style: 'play' | 'idle' | 'gesture' | 'rest';
  intensity: number;
  rate: number;
  reach_x_pct: number;
  reach_y_pct: number;
};

/** P2: 手部编排参数（从后端 hand_choreo 字段获取） */
export type HandChoreoParams = {
  left_x_pct: number;
  left_y_pct: number;
  left_rotation: number;
  left_scale: number;
  right_x_pct: number;
  right_y_pct: number;
  right_rotation: number;
  right_scale: number;
  finger_spread: number;
  wrist_bounce: number;
  attack_intensity: number;
  transition_ms: number;
  active_hand: 'left' | 'right' | 'both';
  pattern_label: string;
};

export type DirectorState = {
  mode: string;
  last_action: string;
  emotion: string;
  layout?: AriaLayout | null;
  hands?: AriaHands | null;
};

export type DirectorCommand = {
  action: AriaAction;
  utterance: string | null;
  emotion: string;
  hold_ms: number;
  reason: string;
  source: string;
  layout?: AriaLayout;
  hands?: AriaHands;
  /** P1: 场景感知简短描述 */
  perception_brief?: string;
  /** P2: 手部编排参数（GSAP 动画用） */
  hand_choreo?: HandChoreoParams | null;
};

export type AriaRuntimeConfig = {
  backend: string;
  nim_base_url: string | null;
  lipsync_base_url?: string | null;
  features: {
    director: boolean;
    audio2face?: boolean;
    autonomous_tick: boolean;
    cinema_layer?: boolean;
    gsap_keys?: boolean;
    lipsync_viseme?: boolean;
    lipsync_gpu?: boolean;
    tts_edge?: boolean;
    clip_pool?: boolean;
  };
  note?: string;
};

const LAYOUT_PRESETS: Record<string, AriaLayout> = {
  play_piano: {
    left_pct: 38,
    bottom_pct: 0,
    width_pct: 58,
    height_pct: 92,
    scale: 1.08,
    anchor_x_pct: 78,
    anchor_y_pct: 100,
  },
  return_to_piano: {
    left_pct: 38,
    bottom_pct: 0,
    width_pct: 58,
    height_pct: 92,
    scale: 1.08,
    anchor_x_pct: 78,
    anchor_y_pct: 100,
  },
  look_at_user: {
    left_pct: 18,
    bottom_pct: 4,
    width_pct: 64,
    height_pct: 86,
    scale: 1.02,
    anchor_x_pct: 42,
    anchor_y_pct: 100,
  },
  speak: {
    left_pct: 16,
    bottom_pct: 4,
    width_pct: 66,
    height_pct: 88,
    scale: 1.04,
    anchor_x_pct: 40,
    anchor_y_pct: 100,
  },
  think: {
    left_pct: 22,
    bottom_pct: 5,
    width_pct: 60,
    height_pct: 84,
    scale: 1.0,
    anchor_x_pct: 45,
    anchor_y_pct: 100,
  },
  idle: {
    left_pct: 20,
    bottom_pct: 4,
    width_pct: 62,
    height_pct: 85,
    scale: 1.01,
    anchor_x_pct: 44,
    anchor_y_pct: 100,
  },
};

const HANDS_PRESETS: Record<string, AriaHands> = {
  play_piano: { style: 'play', intensity: 0.85, rate: 1.15, reach_x_pct: -4, reach_y_pct: 2 },
  return_to_piano: { style: 'play', intensity: 0.7, rate: 1.0, reach_x_pct: -3, reach_y_pct: 1 },
  look_at_user: { style: 'idle', intensity: 0.25, rate: 0.6, reach_x_pct: 0, reach_y_pct: 0 },
  speak: { style: 'gesture', intensity: 0.45, rate: 0.9, reach_x_pct: 2, reach_y_pct: 0 },
  think: { style: 'rest', intensity: 0.15, rate: 0.4, reach_x_pct: 0, reach_y_pct: 0 },
  idle: { style: 'idle', intensity: 0.2, rate: 0.5, reach_x_pct: 0, reach_y_pct: 0 },
};

export function layoutForAction(action: string): AriaLayout {
  return { ...(LAYOUT_PRESETS[action] ?? LAYOUT_PRESETS.idle) };
}

export function handsForAction(action: string): AriaHands {
  return { ...(HANDS_PRESETS[action] ?? HANDS_PRESETS.idle) };
}

export async function fetchAriaRuntime(): Promise<AriaRuntimeConfig> {
  try {
    const res = await fetch(`${MNEME_API_BASE}/v1/aria/runtime`);
    if (res.ok) return (await res.json()) as AriaRuntimeConfig;
  } catch {
    /* fallthrough */
  }
  return {
    backend: 'cinema',
    nim_base_url: null,
    features: { director: true, autonomous_tick: true },
  };
}

export async function requestAriaAct(opts: {
  event: DirectorEvent;
  message?: string;
  history: { role: string; content: string }[];
  state: DirectorState;
}): Promise<DirectorCommand> {
  const sid = getUserId();
  if (!sid) {
    return localDirect(opts.event, opts.message, opts.state);
  }
  try {
    const res = await fetch(`${MNEME_API_BASE}/v1/aria/act`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({
        student_id: sid,
        event: opts.event,
        message: opts.message ?? null,
        history: opts.history,
        state: opts.state,
      }),
    });
    if (res.ok) {
      const data = (await res.json()) as DirectorCommand;
      if (data?.action) {
        if (!data.layout) data.layout = layoutForAction(data.action);
        if (!data.hands) data.hands = handsForAction(data.action);
        return data;
      }
    }
  } catch {
    /* fallthrough */
  }
  return localDirect(opts.event, opts.message, opts.state);
}

function localDirect(
  event: DirectorEvent,
  message?: string,
  state?: DirectorState,
): DirectorCommand {
  const base = (action: AriaAction, extra: Partial<DirectorCommand> = {}): DirectorCommand => ({
    action,
    utterance: null,
    emotion: 'gentle',
    hold_ms: 3000,
    reason: 'local',
    source: 'local',
    layout: layoutForAction(action),
    hands: handsForAction(action),
    ...extra,
  });

  if (event === 'wake') {
    return base('speak', {
      utterance:
        "Oh — hello. I was just finishing a phrase. I'm Aria. Would you like to talk for a while?",
      emotion: 'warm',
      hold_ms: 2500,
      reason: 'local_wake',
    });
  }
  if (event === 'user_message' && message?.trim()) {
    // 简易本地纠位置
    const lay = { ...(state?.layout ?? layoutForAction(state?.last_action || 'idle')) };
    const m = message.toLowerCase();
    let nudged = false;
    if (/left|左边|往左|向左/.test(m)) {
      lay.left_pct = Math.max(0, lay.left_pct - 6);
      nudged = true;
    }
    if (/right|右边|往右|向右/.test(m)) {
      lay.left_pct = Math.min(70, lay.left_pct + 6);
      nudged = true;
    }
    if (/bigger|更大|放大|大一点/.test(m)) {
      lay.scale = Math.min(1.4, lay.scale + 0.08);
      nudged = true;
    }
    if (/smaller|更小|缩小|小一点/.test(m)) {
      lay.scale = Math.max(0.7, lay.scale - 0.08);
      nudged = true;
    }
    if (/bench|琴凳|弹琴|piano|play/.test(m) && /sit|坐|位置|move|调/.test(m)) {
      return base('play_piano', {
        utterance: 'Alright — sitting at the bench now.',
        reason: 'local_seat',
      });
    }
    if (nudged) {
      return base((state?.last_action as AriaAction) || 'idle', {
        utterance: 'Alright — I adjusted my position for you.',
        layout: lay,
        hands: state?.hands ?? handsForAction(state?.last_action || 'idle'),
        reason: 'local_nudge',
      });
    }
    return base('speak', {
      utterance:
        'I hear you. Softly now — the last chord still rings. Tell me more in English if you like.',
      emotion: 'curious',
      reason: 'local_talk',
    });
  }
  return base('play_piano', {
    emotion: 'focused',
    hold_ms: 6000,
    reason: 'local_tick',
  });
}
