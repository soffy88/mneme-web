/**
 * Aria Media Planner / Lipsync / TTS 客户端。
 */
import { MNEME_API_BASE } from './env';
import { authHeader, getUserId } from './auth-store';
import type { CinemaPlan, LipsyncMedia } from '@/components/aria/AriaCinemaLayer';

export type LipsyncResponse = {
  ok: boolean;
  mode: 'video' | 'viseme_css' | 'none';
  video_url?: string | null;
  still_url?: string | null;
  duration_ms?: number;
  backend?: string;
  note?: string;
};

export async function requestAriaLipsync(opts: {
  text: string;
  emotion?: string;
}): Promise<LipsyncMedia> {
  const sid = getUserId();
  const fallback: LipsyncMedia = {
    mode: 'viseme_css',
    stillUrl: '/aria/conversation.jpg?v=4',
    durationMs: Math.min(12000, 1800 + opts.text.length * 55),
  };
  if (!sid || !opts.text.trim()) return fallback;

  try {
    const res = await fetch(`${MNEME_API_BASE}/v1/aria/lipsync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({
        student_id: sid,
        text: opts.text,
        emotion: opts.emotion ?? 'warm',
      }),
    });
    if (!res.ok) return fallback;
    const data = (await res.json()) as LipsyncResponse;
    if (!data.ok) return fallback;
    return {
      mode: data.mode,
      videoUrl: data.video_url,
      stillUrl: data.still_url,
      durationMs: data.duration_ms,
    };
  } catch {
    return fallback;
  }
}

type MediaPlanResp = {
  action: string;
  still_url: string;
  still_pool?: string[];
  clip_url?: string | null;
  keys_overlay?: boolean;
  rotate_ms?: number;
  note?: string;
};

export async function requestAriaMediaPlan(action: string): Promise<CinemaPlan | null> {
  try {
    const res = await fetch(
      `${MNEME_API_BASE}/v1/aria/media-plan?action=${encodeURIComponent(action)}`,
    );
    if (!res.ok) return null;
    const data = (await res.json()) as MediaPlanResp;
    return {
      stillUrl: data.still_url,
      stillPool: data.still_pool?.length ? data.still_pool : [data.still_url],
      clipUrl: data.clip_url,
      rotateMs: data.rotate_ms ?? 0,
      keysOverlay: !!data.keys_overlay,
    };
  } catch {
    return null;
  }
}

export type TtsResult = {
  ok: boolean;
  audioB64?: string | null;
  mime?: string;
  backend?: string;
};

/** 服务端 edge-tts；失败则 ok=false（调用方 Web Speech） */
export async function requestAriaTts(text: string): Promise<TtsResult> {
  const sid = getUserId();
  if (!sid || !text.trim()) return { ok: false, backend: 'no_auth' };
  try {
    const res = await fetch(`${MNEME_API_BASE}/v1/aria/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ student_id: sid, text }),
    });
    if (!res.ok) return { ok: false, backend: `http_${res.status}` };
    const data = (await res.json()) as {
      ok: boolean;
      audio_b64?: string | null;
      mime?: string;
      backend?: string;
    };
    if (!data.ok || !data.audio_b64) return { ok: false, backend: data.backend };
    return {
      ok: true,
      audioB64: data.audio_b64,
      mime: data.mime || 'audio/mpeg',
      backend: data.backend,
    };
  } catch {
    return { ok: false, backend: 'network' };
  }
}

// ── P3: EchoMimic Drive ─────────────────────────────────────────────────────

export type EchoDriveResult = {
  ok: boolean;
  videoB64?: string | null;
  videoUrl?: string | null;
  durationMs?: number;
  cached?: boolean;
  backend?: string;
  degrade?: boolean;
  note?: string;
};

/** P3: 调用 EchoMimic V2 侧车生成半身驱动视频 */
export async function requestEchoDrive(opts: {
  audioB64: string;
  handPose?: Record<string, unknown> | null;
  emotion?: string;
  action?: string;
}): Promise<EchoDriveResult> {
  const sid = getUserId();
  if (!sid || !opts.audioB64) {
    return { ok: false, degrade: true, backend: 'no_auth' };
  }
  try {
    const res = await fetch(`${MNEME_API_BASE}/v1/aria/echo-drive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({
        student_id: sid,
        audio_b64: opts.audioB64,
        hand_pose: opts.handPose ?? null,
        emotion: opts.emotion ?? 'neutral',
        action: opts.action ?? 'play_piano',
      }),
    });
    if (!res.ok) {
      return { ok: false, degrade: true, backend: `http_${res.status}` };
    }
    const data = (await res.json()) as {
      ok: boolean;
      video_b64?: string | null;
      video_url?: string | null;
      duration_ms?: number;
      cached?: boolean;
      backend?: string;
      degrade?: boolean;
      note?: string;
    };
    return {
      ok: data.ok,
      videoB64: data.video_b64,
      videoUrl: data.video_url,
      durationMs: data.duration_ms,
      cached: data.cached,
      backend: data.backend,
      degrade: data.degrade,
      note: data.note,
    };
  } catch {
    return { ok: false, degrade: true, backend: 'network' };
  }
}

/** 播放 base64 mp3；返回 Promise 在结束后 resolve */
export function playAudioBase64(b64: string, mime = 'audio/mpeg'): Promise<void> {
  return new Promise((resolve) => {
    try {
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const blob = new Blob([bytes], { type: mime });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      const done = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      audio.onended = done;
      audio.onerror = done;
      void audio.play().catch(done);
    } catch {
      resolve();
    }
  });
}
