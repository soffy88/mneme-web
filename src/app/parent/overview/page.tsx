'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserId } from '@/lib/auth-store';
import * as api from '@/lib/api-client';
import { StreakBadge } from '@/components/shared/StreakBadge';
import { ChildBar } from '@/components/parent/ChildBar';
import type { WeeklyDigestRes } from '@/types/api';


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
  const [data,    setData]    = useState<WeeklyDigestRes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const load = async (sid: string) => {
    const parentId = getUserId();
    if (!parentId) { router.push('/login'); return; }
    setLoading(true); setError('');
    const res = await api.getWeeklyDigest(sid);
    setLoading(false);
    if (res.ok) setData(res.data);
    else setError(res.error);
  };

  useEffect(() => { if (childId) void load(childId); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [childId]);

  const acc = data?.accuracy_7d != null ? `${Math.round(data.accuracy_7d * 100)}%` : '—';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--mn-ink)' }}>成长周报</h1>
        {data && <StreakBadge days={data.current_streak} size="sm" />}
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
          <div className="mn-card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px', borderLeft: `4px solid ${data.active_today ? 'var(--mn-green)' : 'var(--mn-orange)'}` }}>
            <span style={{ fontSize: '28px', flexShrink: 0 }}>{data.active_today ? '😊' : '💤'}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--mn-ink)', marginBottom: '2px', lineHeight: 1.4 }}>
                {data.headline}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--mn-ink-3)' }}>
                {data.active_today ? '今天已经练习过了' : '今天还没开始练习'}
              </div>
            </div>
          </div>

          {/* stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Stat value={data.current_streak} label="连续学习天数" />
            <Stat value={`${data.days_active_7d}/7`} label="本周活跃天数" />
            <Stat value={data.n_interactions_7d} label="本周练习题数" />
            <Stat value={data.distinct_kcs_7d} label="本周覆盖知识点" />
            <Stat value={acc} label="本周正确率" />
            <Stat value={data.effort_gains_7d} label="有效努力次数" />
          </div>

          <p style={{ fontSize: '11px', textAlign: 'center', color: 'var(--mn-ink-3)', lineHeight: 1.6 }}>
            以上仅显示学习趋势，不含题目细节，保护孩子隐私。
          </p>
        </>
      ) : null}
    </div>
  );
}
