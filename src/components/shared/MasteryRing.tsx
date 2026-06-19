'use client';

/**
 * MasteryRing — conic-gradient 圆环掌握度显示。
 * 这是 mneme 的 signature element:圆环比进度条更有记忆点 + 更像游戏技能点。
 *
 * 颜色档自动:
 *   ≥75% green · 50–74% blue · 25–49% orange · <25% red
 */
function ringColor(pct: number) {
  if (pct >= 75) return 'var(--mn-mastery-high)';
  if (pct >= 50) return 'var(--mn-mastery-mid)';
  if (pct >= 25) return 'var(--mn-mastery-low)';
  return 'var(--mn-mastery-weak)';
}

export function MasteryRing({
  value,
  size = 48,
  strokeWidth = 6,
  showLabel = true,
}: {
  value: number;  // 0–1
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}) {
  const pct   = Math.round(Math.max(0, Math.min(1, value)) * 100);
  const color = ringColor(pct);
  const inner = size - strokeWidth * 2;

  return (
    <div
      role="meter"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`掌握度 ${pct}%`}
      style={{
        position: 'relative',
        width: size, height: size,
        borderRadius: '50%',
        background: `conic-gradient(${color} ${pct}%, var(--mn-border) 0)`,
        flexShrink: 0,
      }}
    >
      {/* inner white circle */}
      <div style={{
        position: 'absolute',
        top: strokeWidth, left: strokeWidth,
        width: inner, height: inner,
        borderRadius: '50%',
        background: 'var(--mn-surface)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {showLabel && (
          <span style={{
            fontSize: size < 36 ? '9px' : '11px',
            fontWeight: 700,
            color,
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
          }}>
            {pct}
          </span>
        )}
      </div>
    </div>
  );
}

/** MasteryBar — 保留兼容 alias,内部用 MasteryRing */
export function MasteryBar({
  value,
  compact = false,
  className,
}: {
  value: number;
  compact?: boolean;
  className?: string;
}) {
  const pct   = Math.round(Math.max(0, Math.min(1, value)) * 100);
  const color = ringColor(pct);

  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {!compact && <MasteryRing value={value} size={32} strokeWidth={5} />}
      {/* progress bar as secondary indicator */}
      <div style={{ flex: 1, height: compact ? 4 : 3, background: 'var(--mn-border)', borderRadius: '99px', overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: color,
          borderRadius: '99px',
          transition: 'width 0.5s var(--mn-ease-out)',
        }} />
      </div>
      {compact && (
        <span style={{ fontSize: '12px', fontWeight: 600, color, fontVariantNumeric: 'tabular-nums', minWidth: '28px' }}>
          {pct}%
        </span>
      )}
    </div>
  );
}
