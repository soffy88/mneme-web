'use client';

import { useEffect, useState } from 'react';
import * as api from '@/lib/api-client';
import { getUserId } from '@/lib/auth-store';
import type { Achievement } from '@/types/api';

export function Achievements() {
  const [items, setItems] = useState<Achievement[]>([]);

  useEffect(() => {
    const sid = getUserId();
    if (!sid) return;
    api.getAchievements(sid).then((r) => { if (r.ok) setItems(r.data.achievements); });
  }, []);

  if (!items.length) return null;

  // streak（🔥连续天数）是留存核心钩子，置顶并突出
  const streak = items.find((a) => a.id === 'streak');
  const rest   = items.filter((a) => a.id !== 'streak');

  return (
    <div>
      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--mn-ink-2)', marginBottom: '10px' }}>成就</div>

      {/* streak — 突出展示 */}
      {streak && (() => {
        const maxed = streak.next_target == null;
        const pct = streak.next_target ? Math.min(100, Math.round((streak.value / streak.next_target) * 100)) : 100;
        return (
          <div className="mn-card" style={{
            padding: '16px 18px', marginBottom: '10px',
            background: 'linear-gradient(135deg, var(--mn-orange-dim), var(--mn-surface))',
            border: '1.5px solid var(--mn-orange)',
            display: 'flex', alignItems: 'center', gap: '14px',
          }}>
            <span style={{ fontSize: '34px', lineHeight: 1 }}>{streak.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--mn-ink)' }}>{streak.name}</span>
                <span style={{ fontSize: '11px', color: 'var(--mn-ink-3)' }}>Lv.{streak.level}/{streak.max_level}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '2px 0 8px' }}>
                <span style={{ fontSize: '26px', fontWeight: 900, color: 'var(--mn-orange)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{streak.value}</span>
                <span style={{ fontSize: '12px', color: 'var(--mn-ink-3)' }}>{streak.unit}</span>
              </div>
              {maxed ? (
                <div style={{ fontSize: '12px', color: 'var(--mn-orange)', fontWeight: 700 }}>已满级 🏆</div>
              ) : (
                <>
                  <div style={{ height: 5, borderRadius: 3, background: 'var(--mn-border)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'var(--mn-orange)', borderRadius: 3 }} />
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--mn-ink-3)', marginTop: '4px' }}>
                    再坚持 {streak.next_target! - streak.value} {streak.unit} 解锁下一档
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })()}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {rest.map((a) => {
          const earned = a.level > 0;
          const maxed  = a.next_target == null;
          const pct = a.next_target ? Math.min(100, Math.round((a.value / a.next_target) * 100)) : 100;
          return (
            <div key={a.id} className="mn-card" style={{ padding: '14px', opacity: earned ? 1 : 0.75 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '22px', filter: earned ? 'none' : 'grayscale(1)' }}>{a.icon}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--mn-ink)' }}>
                    {a.name}{a.level > 0 ? ` ${'★'.repeat(a.level)}` : ''}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--mn-ink-3)' }}>{a.value} {a.unit}</div>
                </div>
              </div>
              {maxed ? (
                <div style={{ fontSize: '11px', color: 'var(--mn-green)', fontWeight: 700 }}>已满级 🏆</div>
              ) : (
                <>
                  <div style={{ height: 4, borderRadius: 2, background: 'var(--mn-border)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'var(--mn-blue)', borderRadius: 2 }} />
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--mn-ink-3)', marginTop: '4px' }}>
                    距下一档还差 {a.next_target! - a.value}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
