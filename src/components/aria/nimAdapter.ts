/**
 * 数字人运行时适配器（可插拔）。
 *
 * - mock_scene：本站多姿态场景（当前默认）
 * - nim：NVIDIA ACE / Audio2Face NIM（配置 ARIA_NIM_BASE_URL 后启用）
 *
 * 真正的「自由身体动作 + 实时脸」需要 NIM 微服务在线；
 * 本适配器定义契约，便于接上后不改 Director。
 */

import type { AriaAction } from '@/lib/aria-director';

export type AvatarPose =
  | 'play_piano'
  | 'look_at_user'
  | 'speak'
  | 'think'
  | 'idle';

/** 把 Director 行动映射到可渲染姿态 */
export function actionToPose(action: AriaAction): AvatarPose {
  switch (action) {
    case 'play_piano':
    case 'return_to_piano':
      return 'play_piano';
    case 'look_at_user':
      return 'look_at_user';
    case 'speak':
      return 'speak';
    case 'think':
      return 'think';
    case 'idle':
    default:
      return 'idle';
  }
}

/**
 * NIM Audio2Face：把 TTS 音频推到 NIM 生成 blendshape / 视频流。
 * 无端点时 no-op；有端点时 POST /v1/audio2face（示例路径，按你的 NIM 部署改）。
 */
export async function nimDriveFace(opts: {
  baseUrl: string;
  audioWavBase64?: string;
  text?: string;
}): Promise<{ streamUrl?: string; ok: boolean; detail?: string }> {
  if (!opts.baseUrl) return { ok: false, detail: 'no_nim_base' };
  try {
    const res = await fetch(`${opts.baseUrl}/v1/proxy/audio2face`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audio_b64: opts.audioWavBase64,
        text: opts.text,
      }),
    });
    if (!res.ok) return { ok: false, detail: `http_${res.status}` };
    const data = (await res.json()) as { stream_url?: string };
    return { ok: true, streamUrl: data.stream_url };
  } catch (e) {
    return { ok: false, detail: e instanceof Error ? e.message : 'nim_error' };
  }
}
