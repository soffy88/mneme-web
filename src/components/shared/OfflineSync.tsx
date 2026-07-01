'use client';

import { useEffect } from 'react';
import { flushQueue } from '@/lib/offlineQueue';

// 联网自动回传离线提交队列：挂载时试一次，之后每次 online 事件再试。
export function OfflineSync() {
  useEffect(() => {
    const run = () => { void flushQueue(); };
    run();
    window.addEventListener('online', run);
    return () => window.removeEventListener('online', run);
  }, []);
  return null;
}
