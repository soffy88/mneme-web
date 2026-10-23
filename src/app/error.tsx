'use client';

import { useEffect } from 'react';

/**
 * 路由级错误边界（Next App Router 约定文件）。
 * 页面组件抛错时展示，替换整棵路由子树；根布局与导航壳保持可用。
 * 全站此前没有任何 error.tsx —— 一个页面渲染异常就是整页白屏。
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // digest 是 Next 服务端错误指纹，便于生产环境对账。
    console.error('[route-error]', error.digest ?? '', error);
  }, [error]);

  return (
    <div
      role="alert"
      style={{
        minHeight: '50svh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        textAlign: 'center',
        padding: '24px',
      }}
    >
      <div style={{ fontSize: '42px', lineHeight: 1 }} aria-hidden>
        🫧
      </div>
      <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--mn-ink)', margin: 0 }}>
        页面出了点小状况
      </h1>
      <p style={{ fontSize: '13px', color: 'var(--mn-ink-3)', margin: 0, maxWidth: '320px', lineHeight: 1.7 }}>
        别担心，你的学习数据都在。点「再试一次」重新加载，或先回首页。
      </p>
      <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
        <button type="button" className="mn-btn-primary" onClick={() => reset()}>
          再试一次
        </button>
        <button
          type="button"
          className="mn-btn-secondary"
          onClick={() => {
            window.location.href = '/home';
          }}
        >
          回首页
        </button>
      </div>
    </div>
  );
}
