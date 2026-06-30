'use client';

import { useEffect } from 'react';

// 注册 service worker（离线/弱网可用）。仅生产环境注册，避免开发热更新被缓存干扰。
export function RegisterSW() {
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') return;
    const onLoad = () => navigator.serviceWorker.register('/sw.js').catch(() => { /* 注册失败不影响使用 */ });
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);
  return null;
}
