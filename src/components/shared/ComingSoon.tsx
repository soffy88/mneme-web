'use client';

import { useRouter } from 'next/navigation';

export function ComingSoon({ title }: { title: string }) {
  const router = useRouter();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'var(--mn-surface)', border: '1px solid var(--mn-border)',
            fontSize: '18px', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          ←
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--mn-ink)' }}>
          {title}
        </h1>
      </div>

      <div className="mn-card" style={{ padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</div>
        <div style={{ fontWeight: 700, fontSize: '18px', color: 'var(--mn-ink)', marginBottom: '8px' }}>
          功能建设中
        </div>
        <div style={{ fontSize: '14px', color: 'var(--mn-ink-3)', lineHeight: 1.6 }}>
          该功能正在开发中，敬请期待。<br />
          学习科学加持，值得等待。
        </div>
      </div>

      <button
        type="button"
        className="mn-btn-secondary"
        onClick={() => router.back()}
        style={{ width: '100%' }}
      >
        返回上一页
      </button>
    </div>
  );
}
