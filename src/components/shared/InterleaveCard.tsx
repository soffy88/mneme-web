'use client';

import { useEffect, useMemo, useState } from 'react';
import * as api from '@/lib/api-client';
import type { ReviewQueueItem } from '@/types/api';

/**
 * 交错复习池（M-B 机制可视化）。
 * 复习队列已被后端 interleave_select 排成"相邻题 KC 不同"，这里摊开 + 标出相邻是否不同，
 * 让学生看见"为什么不让你连着刷同一类"——交错练习训练"认出该用哪招"（对抗惰性知识）。
 * 数据来自 GET /v1/review-queue/{student_id}。无队列时不渲染。
 */
const PALETTE = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#f43f5e', '#0ea5e9', '#14b8a6', '#ec4899'];

// 优先用后端返回的 ku_name；缺失才从 ku_id 提取短名（取 -ku-/-kc- 之后，或末段）
function kcLabel(it: ReviewQueueItem): string {
  const m = it.ku_id.match(/-(?:ku|kc)-(.+)$/);
  const name = it.ku_name || (m ? m[1] : (it.ku_id.split('-').pop() ?? it.ku_id));
  return name.length > 10 ? name.slice(0, 10) + '…' : name;
}

export function InterleaveCard({ studentId }: { studentId: string }) {
  const [items, setItems] = useState<ReviewQueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api.getReviewQueue(studentId).then(r => {
      if (alive && r.ok) setItems(r.data);
    }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [studentId]);

  const colorOf = useMemo(() => {
    const map = new Map<string, string>();
    let i = 0;
    for (const it of items) if (!map.has(it.ku_id)) map.set(it.ku_id, PALETTE[i++ % PALETTE.length]);
    return map;
  }, [items]);

  const adjacentDifferent = useMemo(
    () => items.every((it, i) => i === 0 || it.ku_id !== items[i - 1].ku_id),
    [items],
  );

  if (loading || items.length === 0) return null;

  return (
    <div className="mn-card" style={{ padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--mn-ink)' }}>今日交错复习池</span>
        <span style={{ fontSize: 11, color: 'var(--mn-ink-3)' }}>{items.length} 题</span>
      </div>
      <p style={{ fontSize: 12, color: 'var(--mn-ink-3)', margin: '0 0 12px', lineHeight: 1.6 }}>
        刻意把不同知识点穿插排列——不让你连着刷同一类，训练「认出该用哪招」（对抗惰性知识）。
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {items.map((it, i) => {
          const c = colorOf.get(it.ku_id) ?? '#6366f1';
          return (
            <span key={i} title={it.ku_name || it.ku_id}
              style={{ padding: '4px 9px', borderRadius: 7, fontSize: 12, fontWeight: 600, color: c, background: `${c}1a` }}>
              {i + 1}. {kcLabel(it)}
            </span>
          );
        })}
      </div>
      <div style={{ fontSize: 12, marginTop: 10, color: adjacentDifferent ? '#16a34a' : '#d97706' }}>
        {adjacentDifferent ? '✓ 相邻题知识点都不同（已交错）' : '部分相邻题相同（可用知识点不足以完全交错）'}
      </div>
    </div>
  );
}
