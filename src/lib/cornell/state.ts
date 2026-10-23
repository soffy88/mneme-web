/**
 * 康奈尔进度：load/save/merge/export。
 * 合并策略必须与 mneme `services/cornell_merge.py` 一致。
 * 红线：本模块不调用任何 API、不写掌握度。
 */

import {
  type CornellState,
  emptyState,
  storageKey,
} from './types';

export class CornellMergeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CornellMergeError';
  }
}

function boolMap(raw: unknown): Record<string, boolean> {
  if (raw == null) return {};
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    throw new CornellMergeError('mastered/collapsed must be objects');
  }
  const out: Record<string, boolean> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (v) out[k] = true;
  }
  return out;
}

function unionTrue(
  a: Record<string, boolean>,
  b: Record<string, boolean>,
): Record<string, boolean> {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  const out: Record<string, boolean> = {};
  for (const k of keys) {
    if (a[k] || b[k]) out[k] = true;
  }
  return out;
}

/** 与 services/cornell_merge.merge_cornell_state 同策略。 */
export function mergeCornellState(
  local: CornellState,
  incoming: CornellState,
): CornellState {
  if (!local?.topicId || !incoming?.topicId) {
    throw new CornellMergeError('topicId required on both states');
  }
  if (local.topicId !== incoming.topicId) {
    throw new CornellMergeError(
      `topicId mismatch: ${local.topicId} vs ${incoming.topicId}`,
    );
  }
  const tsL = local.updatedAt ?? '';
  const tsI = incoming.updatedAt ?? '';
  const newer = tsI >= tsL ? incoming : local;
  return {
    topicId: local.topicId,
    version: Math.max(local.version || 1, incoming.version || 1),
    mastered: unionTrue(boolMap(local.mastered), boolMap(incoming.mastered)),
    collapsed: unionTrue(boolMap(local.collapsed), boolMap(incoming.collapsed)),
    selfTest: !!newer.selfTest,
    showAnswers: !!newer.showAnswers,
    updatedAt: tsL || tsI ? (tsI >= tsL ? tsI : tsL) : newer.updatedAt,
  };
}

export function loadState(topicId: string, version: number): CornellState {
  if (typeof window === 'undefined') return emptyState(topicId, version);
  try {
    const raw = localStorage.getItem(storageKey(topicId, version));
    if (!raw) return emptyState(topicId, version);
    const parsed = JSON.parse(raw) as CornellState;
    if (parsed.topicId && parsed.topicId !== topicId) {
      return emptyState(topicId, version);
    }
    return {
      ...emptyState(topicId, version),
      ...parsed,
      topicId,
      version: parsed.version || version,
      mastered: boolMap(parsed.mastered),
      collapsed: boolMap(parsed.collapsed),
    };
  } catch {
    return emptyState(topicId, version);
  }
}

export function saveState(state: CornellState): CornellState {
  const next: CornellState = {
    ...state,
    updatedAt: new Date().toISOString(),
  };
  if (typeof window === 'undefined') return next;
  try {
    localStorage.setItem(
      storageKey(state.topicId, state.version),
      JSON.stringify(next),
    );
  } catch {
    /* quota / private mode */
  }
  return next;
}

export function resetState(topicId: string, version: number): CornellState {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(storageKey(topicId, version));
    } catch {
      /* ignore */
    }
  }
  return emptyState(topicId, version);
}

export function parseIncomingState(text: string): CornellState {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new CornellMergeError('JSON 解析失败');
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new CornellMergeError('进度必须是 JSON 对象');
  }
  const o = data as Record<string, unknown>;
  if (typeof o.topicId !== 'string' || !o.topicId) {
    throw new CornellMergeError('缺少 topicId');
  }
  return {
    topicId: o.topicId,
    version: typeof o.version === 'number' ? o.version : 1,
    mastered: boolMap(o.mastered),
    collapsed: boolMap(o.collapsed),
    selfTest: !!o.selfTest,
    showAnswers: !!o.showAnswers,
    updatedAt: typeof o.updatedAt === 'string' ? o.updatedAt : new Date(0).toISOString(),
  };
}

export function progressStats(state: CornellState, cueIds: string[]) {
  const total = cueIds.length;
  let mastered = 0;
  for (const id of cueIds) {
    if (state.mastered[id]) mastered += 1;
  }
  return { mastered, total, ratio: total === 0 ? 0 : mastered / total };
}
