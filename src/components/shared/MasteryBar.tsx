/**
 * MasteryBar — 掌握度进度条。
 *
 * K12 场景:不用 "高可信/低可信" 这种认识论语言,改用学习友好文案。
 * 底层复用 @helios/blocks OConfidenceMeter 颜色 token。
 */
'use client';

import { OConfidenceMeter } from '@helios/blocks';

const LEVEL_LABEL: Record<string, string> = {
  high: '熟练掌握',
  moderate: '基本掌握',
  warn: '需要练习',
  low: '薄弱考点',
};

function levelOf(v: number): string {
  if (v >= 0.75) return 'high';
  if (v >= 0.5)  return 'moderate';
  if (v >= 0.25) return 'warn';
  return 'low';
}

export function MasteryBar({
  value,
  showLabel = true,
  compact = false,
  className,
}: {
  value: number;
  showLabel?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const level = levelOf(value);
  const label = LEVEL_LABEL[level];

  return (
    <OConfidenceMeter
      value={value}
      basis={showLabel ? label : undefined}
      hideBasis={!showLabel}
      compact={compact}
      barHeight={6}
      className={className}
    />
  );
}
