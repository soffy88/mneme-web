// 离线提交队列：弱网/离线时答题"先存后传"，联网自动回传。
// 用 localStorage（提交体小、条数少，够用且简单；无需 IndexedDB）。
import * as api from './api-client';
import type { PracticeSubmitReq } from '@/types/api';

const KEY = 'mn:offlineQueue';

function read(): PracticeSubmitReq[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function write(q: PracticeSubmitReq[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(q));
  } catch {
    /* 存储满/隐私模式：忽略 */
  }
}

export function queueSize(): number {
  return read().length;
}

export function enqueuePractice(sub: PracticeSubmitReq): void {
  const q = read();
  q.push(sub);
  write(q);
}

// 回传队列：逐条重放提交，成功即移除。返回成功同步条数。
// 遇到网络错误则停止（保留剩余，下次再试）。
export async function flushQueue(): Promise<number> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return 0;
  let q = read();
  let synced = 0;
  while (q.length > 0) {
    const item = q[0];
    const res = await api.submitPracticeAnswer(item);
    if (res.ok) {
      q = q.slice(1);
      write(q);
      synced += 1;
    } else if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      break; // 又离线了，留着下次
    } else {
      // 服务端拒绝（如题已删）：丢弃该条避免卡死队列
      q = q.slice(1);
      write(q);
    }
  }
  return synced;
}

// 判断一次提交失败是否属于"离线"（应入队而非报错）。
export function isOffline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false;
}
