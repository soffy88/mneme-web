/**
 * Aria Director 客户端：行为决策（3D VRM 渲染路径）。
 * 骨骼动画/定位由前端 AriaVRM.tsx 内部处理，Director 只返回行为指令。
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

export type DirectorState = {
  mode: string;
  last_action: string;
  emotion: string;
};

export type DirectorCommand = {
  action: AriaAction;
  utterance: string | null;
  emotion: string;
  hold_ms: number;
  reason: string;
  source: string;
  perception_brief?: string;
};

export type AriaRuntimeConfig = {
  backend: string;
  nim_base_url: string | null;
  features: {
    director: boolean;
    autonomous_tick: boolean;
    tts_edge?: boolean;
    perception?: boolean;
  };
  note?: string;
};

export async function fetchAriaRuntime(): Promise<AriaRuntimeConfig> {
  try {
    const res = await fetch(`${MNEME_API_BASE}/v1/aria/runtime`);
    if (res.ok) return (await res.json()) as AriaRuntimeConfig;
  } catch {
    /* fallthrough */
  }
  return {
    backend: 'vrm_3d',
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
      if (data?.action) return data;
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
    const m = message.toLowerCase();
    if (/bye|goodbye|play|piano|music|弹琴/.test(m)) {
      return base('return_to_piano', {
        utterance: "Alright. I'll return to the keys — listen if you like.",
        reason: 'local_release',
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
