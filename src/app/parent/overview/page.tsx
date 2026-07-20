'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserId } from '@/lib/auth-store';
import * as api from '@/lib/api-client';
import { StreakBadge } from '@/components/shared/StreakBadge';
import { ChildBar } from '@/components/parent/ChildBar';
import type { ParentOverviewRes } from '@/types/api';


function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="mn-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--mn-ink)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--mn-ink-3)' }}>{label}</div>
    </div>
  );
}

export default function ParentOverviewPage() {
  const router = useRouter();
  const [childId, setChildId] = useState<string | null>(null);
  const [data,    setData]    = useState<ParentOverviewRes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const load = async (sid: string) => {
    const parentId = getUserId();
    if (!parentId) { router.push('/login'); return; }
    setLoading(true); setError('');
    const res = await api.getParentOverview(sid);
    setLoading(false);
    if (res.ok) setData(res.data);
    else setError(res.error);
  };

  useEffect(() => { if (childId) void load(childId); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [childId]);



  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--mn-ink)' }}>成长周报</h1>
        {data && <StreakBadge days={data.streak?.current_streak || 0} size="sm" />}
      </div>

      <ChildBar selectedId={childId} onSelect={setChildId} />

      {!childId ? (
        <div style={{ textAlign: 'center', padding: '32px 0', fontSize: '13px', color: 'var(--mn-ink-3)' }}>
          请先在上方选择或绑定孩子。
        </div>
      ) : loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[...Array(3)].map((_, i) => <div key={i} className="mn-skeleton" style={{ height: '80px', borderRadius: '16px' }} />)}
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '40px 0', fontSize: '13px', color: 'var(--mn-ink-3)' }}>
          {error} — <button type="button" onClick={() => childId && load(childId)} style={{ color: 'var(--mn-blue)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>重试</button>
        </div>
      ) : data ? (
        <>
          {/* 摘要卡 */}
          <div className="mn-card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px', borderLeft: `4px solid var(--mn-green)` }}>
            <span style={{ fontSize: '28px', flexShrink: 0 }}>📊</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--mn-ink)', marginBottom: '2px', lineHeight: 1.4 }}>
                {data.headline}
              </div>
            </div>
          </div>

          {/* AI 分析报告 (L2 Profile) */}
          <div className="mn-card" style={{ padding: '20px', background: 'var(--mn-surface-2)', border: '1px solid var(--mn-border)' }}>
            <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--mn-ink)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>🤖</span> AI 认知画像分析
            </div>
            <div style={{ fontSize: '14px', color: 'var(--mn-ink-2)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {data.learner_profile || "暂无足够的学习数据生成画像，请鼓励孩子继续练习。"}
            </div>
          </div>

          {/* stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Stat value={data.streak?.current_streak || 0} label="连续坚持天数" />
            <Stat value={data.mastered_kc_count} label="已掌握知识点" />
            <Stat value={data.total_kc_practiced} label="累计练习知识点" />
            <Stat value={data.weak_kc_count} label="薄弱知识点" />
            <Stat value={data.recent_sessions} label="近期苏格拉底辅导" />
          </div>

          <p style={{ fontSize: '11px', textAlign: 'center', color: 'var(--mn-ink-3)', lineHeight: 1.6 }}>
            以上仅显示学习趋势，不含题目细节，保护孩子隐私。
          </p>
        </>
      ) : null}
    </div>
  );
}
