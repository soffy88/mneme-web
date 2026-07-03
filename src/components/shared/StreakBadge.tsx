'use client';

export function StreakBadge({ days, freezes, size = 'md' }: { days: number; freezes?: number; size?: 'sm' | 'md' | 'lg' }) {
  const fontSize = size === 'lg' ? '15px' : size === 'sm' ? '11px' : '13px';
  const padding  = size === 'lg' ? '8px 14px' : size === 'sm' ? '3px 8px' : '5px 10px';
  const flame    = size === 'sm' ? '14px' : size === 'lg' ? '20px' : '16px';

  const shields = Math.max(0, freezes ?? 0);
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
      aria-label={`连续打卡 ${days} 天${shields ? `，护盾 ${shields} 张` : ''}`}
    >
      <span style={{ fontSize: flame, lineHeight: 1 }}>🔥</span>
      <span>{days}</span>
      <span style={{ fontWeight: 400, opacity: 0.8 }}>天</span>
      {shields > 0 && (
        <span
          style={{ marginLeft: '3px', paddingLeft: '6px', borderLeft: '1px solid #f5c060', opacity: 0.95 }}
          title={`连胜护盾 ${shields} 张：缺一天自动保住连胜`}
        >
          🛡️{shields}
        </span>
      )}
    </div>
  );
}
