'use client';

export function StreakBadge({ days, size = 'md' }: { days: number; size?: 'sm' | 'md' | 'lg' }) {
  const fontSize = size === 'lg' ? '15px' : size === 'sm' ? '11px' : '13px';
  const padding  = size === 'lg' ? '8px 14px' : size === 'sm' ? '3px 8px' : '5px 10px';
  const flame    = size === 'sm' ? '14px' : size === 'lg' ? '20px' : '16px';

  return (
    <div
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding, borderRadius: '99px',
        background: 'var(--mn-amber-dim)',
        border: '1.5px solid #f5c060',
        color: 'var(--mn-amber)',
        fontWeight: 700, fontSize,
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-0.01em',
        userSelect: 'none',
      }}
      aria-label={`连续打卡 ${days} 天`}
    >
      <span style={{ fontSize: flame, lineHeight: 1 }}>🔥</span>
      <span>{days}</span>
      <span style={{ fontWeight: 400, opacity: 0.8 }}>天</span>
    </div>
  );
}
