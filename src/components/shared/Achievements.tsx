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

  return (
    <div>
      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--mn-ink-2)', marginBottom: '10px' }}>成就</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {items.map((a) => {
          const earned = a.level > 0;
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
              {a.next_target != null ? (
                <>
                  <div style={{ height: 4, borderRadius: 2, background: 'var(--mn-border)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'var(--mn-blue)', borderRadius: 2 }} />
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--mn-ink-3)', marginTop: '4px' }}>
                    距下一档还差 {a.next_target - a.value}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: '11px', color: 'var(--mn-green)', fontWeight: 600 }}>✓ 已满级</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
