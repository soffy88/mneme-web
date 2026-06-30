'use client';

import { useEffect, useState } from 'react';
import * as api from '@/lib/api-client';
import type { EffortGain } from '@/types/api';

/**
 * 努力收益看板（M-F · 对抗"努力错觉"）。
 * 展示"做得吃力、但记忆稳定性提升最多"的题——把费劲翻译成"学得最牢"的正反馈。
 * 数据来自 GET /v1/effortful-gains/{student_id}。无数据时不渲染（由父组件决定占位）。
 */
export function EffortBoard({ studentId }: { studentId: string }) {
  const [gains, setGains] = useState<EffortGain[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api.getEffortfulGains(studentId).then(r => {
      if (alive && r.ok) setGains(r.data.top_gains);
    }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [studentId]);

  if (loading || gains.length === 0) return null;

  const max = Math.max(...gains.map(g => g.effortful_gain), 1e-6);

  return (
    <div className="mn-card" style={{ padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--mn-ink)' }}>努力收益</span>
        <span style={{ fontSize: 11, color: 'var(--mn-ink-3)' }}>越吃力 · 记忆越牢</span>
      </div>
      <p style={{ fontSize: 12, color: 'var(--mn-ink-3)', margin: '0 0 12px', lineHeight: 1.6 }}>
        这些题你做得吃力，但正因为难，记忆稳定性提升得最多——这种费劲，恰是学得最牢的信号。
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {gains.map((g, i) => (
          <div key={i} style={{ padding: 12, borderRadius: 10, border: '1px solid var(--mn-orange-dim, #fde9d7)', background: 'var(--mn-orange-dim, #fff7ed)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 13, color: 'var(--mn-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%' }}>
                {g.kc ?? '练习题'}
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--mn-orange, #c2550d)' }}>
                +{g.retention_delta.toFixed(1)} 天记忆
              </span>
            </div>
            <div style={{ height: 6, background: 'rgba(194,85,13,.15)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'var(--mn-orange, #c2550d)', borderRadius: 999, width: `${Math.round((g.effortful_gain / max) * 100)}%` }} />
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: 10, color: 'var(--mn-ink-3)', marginTop: 5 }}>
              <span>吃力度 {Math.round(g.struggle_score * 100)}%</span>
              <span>收益 {g.effortful_gain.toFixed(3)}</span>
              {g.occurred_at && <span>{g.occurred_at.slice(0, 10)}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
