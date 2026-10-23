/**
 * 康奈尔云同步适配层。
 * 失败静默降级 localStorage；不写系统掌握度。
 */

import * as api from '@/lib/api-client';
import { TOKEN_EXPIRED_ERROR } from '@/lib/api-client';
import { getUserId } from '@/lib/auth-store';
import type { CornellState } from './types';
import {
  CornellMergeError,
  mergeCornellState,
  parseIncomingState,
  saveState,
} from './state';

const AUTO_KEY = 'cornell_cloud_auto_push';

export function isAutoPushEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(AUTO_KEY) === '1';
  } catch {
    return false;
  }
}

export function setAutoPushEnabled(on: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AUTO_KEY, on ? '1' : '0');
  } catch {
    /* ignore */
  }
}

export type CloudResult =
  | { ok: true; state: CornellState; source: 'cloud' | 'merged' }
  | { ok: false; error: string; unauthorized?: boolean };

function stateFromApi(raw: unknown): CornellState {
  if (!raw || typeof raw !== 'object') {
    throw new CornellMergeError('云端响应非法');
  }
  const o = raw as Record<string, unknown>;
  // API 返回 { topic_id, version, state, updated_at }
  if (o.state && typeof o.state === 'object') {
    return parseIncomingState(JSON.stringify(o.state));
  }
  return parseIncomingState(JSON.stringify(o));
}

/** 拉取云端并与本地并集合并；无云端记录时返回 null（不算失败）。 */
export async function pullAndMerge(local: CornellState): Promise<CloudResult | null> {
  const sid = getUserId();
  if (!sid) return { ok: false, error: '未登录，无法云同步', unauthorized: true };
  const res = await api.getCornellProgress(sid, local.topicId);
  if (!res.ok) {
    if (res.error.includes('404') || res.error.toLowerCase().includes('no cloud')) {
      return null;
    }
    return {
      ok: false,
      error: res.error,
      unauthorized: res.error === TOKEN_EXPIRED_ERROR,
    };
  }
  try {
    const remote = stateFromApi(res.data);
    const merged = mergeCornellState(local, remote);
    const saved = saveState(merged);
    return { ok: true, state: saved, source: 'merged' };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : '合并失败',
    };
  }
}

/** 推送本地到云端（服务端并集），返回合并后的权威 state。 */
export async function pushState(local: CornellState): Promise<CloudResult> {
  const sid = getUserId();
  if (!sid) return { ok: false, error: '未登录，无法云同步', unauthorized: true };
  const res = await api.putCornellProgress(
    sid,
    local.topicId,
    local as unknown as Record<string, unknown>,
  );
  if (!res.ok) {
    return {
      ok: false,
      error: res.error,
      unauthorized: res.error === TOKEN_EXPIRED_ERROR,
    };
  }
  try {
    const remote = stateFromApi(res.data);
    const saved = saveState(remote);
    return { ok: true, state: saved, source: 'cloud' };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : '解析云端响应失败',
    };
  }
}

/** 删除云端进度（本地不动）。 */
export async function deleteCloud(topicId: string): Promise<{ ok: boolean; error?: string }> {
  const sid = getUserId();
  if (!sid) return { ok: false, error: '未登录' };
  const res = await api.deleteCornellProgress(sid, topicId);
  if (!res.ok) return { ok: false, error: res.error };
  return { ok: true };
}
