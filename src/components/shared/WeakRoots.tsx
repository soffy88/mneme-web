'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as api from '@/lib/api-client';
import type { WeakRoot } from '@/types/api';

/**
 * 前置断点 / 薄弱根因（M-G 下钻）：对薄弱知识点上溯前置，提示"先补根、再补叶"。
 * 数据来自 GET /v1/weak-roots/{student_id}。无断点时不渲染。
 */
export function WeakRoots({ studentId }: { studentId: string }) {
  const router = useRouter();
  const [roots, setRoots] = useState<WeakRoot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api.getWeakRoots(studentId).then(r => {
      if (alive && r.ok) setRoots(r.data.roots);
    }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [studentId]);

  if (loading || roots.length === 0) return null;

  return (
    <div className="mn-card" style={{ padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--mn-ink)' }}>前置断点（先补根）</span>
        <span style={{ fontSize: 11, color: 'var(--mn-ink-3)' }}>薄弱往往不在叶、在根</span>
      </div>
      <p style={{ fontSize: 12, color: 'var(--mn-ink-3)', margin: '0 0 12px', lineHeight: 1.6 }}>
        这些薄弱知识点，根源可能在更底层的前置没掌握——先补前置，叶子会顺带松动。
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {roots.map(r => (
          <div key={r.ku_id} style={{ padding: 12, borderRadius: 10, border: '1px solid var(--mn-border)', background: 'var(--mn-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: 'var(--mn-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{r.name}</span>
              <span style={{ fontSize: 11, color: 'var(--mn-ink-3)' }}>{Math.round(r.p_mastery * 100)}%</span>
            </div>
            <div style={{ paddingLeft: 10, borderLeft: '2px solid var(--mn-orange-dim, #fde9d7)', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {r.weak_prerequisites.map(p => (
                <button key={p.ku_id} type="button"
                  onClick={() => router.push(`/subjects/math/practice?ku_id=${encodeURIComponent(p.ku_id)}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0', fontSize: 12, color: 'var(--mn-ink-2)', width: '100%' }}>
                  <span style={{ color: 'var(--mn-orange, #c2550d)', flexShrink: 0 }}>↳ 先补</span>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                  <span style={{ fontSize: 10, color: 'var(--mn-ink-3)', flexShrink: 0 }}>
                    {p.status === 'unpracticed' ? '未练' : `${Math.round((p.p_mastery ?? 0) * 100)}%`}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
