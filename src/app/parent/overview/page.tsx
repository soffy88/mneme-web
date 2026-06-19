'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserId } from '@/lib/auth-store';
import * as api from '@/lib/api-client';
import { StreakBadge } from '@/components/shared/StreakBadge';
import type { ParentOverviewRes, EmotionState } from '@/types/api';


const EMOTION: Record<EmotionState, { icon: string; label: string; color: string; bg: string }> = {
  stable:  { icon: '😊', label: '情绪稳定',  color: 'var(--mn-green)',  bg: 'var(--mn-green-dim)' },
  anxious: { icon: '😟', label: '有些焦虑',  color: 'var(--mn-orange)', bg: 'var(--mn-orange-dim)' },
  low:     { icon: '😔', label: '情绪偏低',  color: 'var(--mn-orange)', bg: 'var(--mn-orange-dim)' },
  crisis:  { icon: '⚠️', label: '需要关注',  color: 'var(--mn-red)',    bg: 'var(--mn-red-dim)' },
};

function Stat({ value, label, note, noteColor }: { value: string | number; label: string; note?: string; noteColor?: string }) {
  return (
    <div className="mn-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--mn-ink)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--mn-ink-3)' }}>{label}</div>
      {note && <div style={{ fontSize: '12px', fontWeight: 600, color: noteColor ?? 'var(--mn-ink-3)' }}>{note}</div>}
    </div>
  );
}

export default function ParentOverviewPage() {
  const router = useRouter();
  const [data,    setData]    = useState<ParentOverviewRes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const load = async () => {
    const sid = getUserId();
    if (!sid) { router.push('/login'); return; }
    setLoading(true); setError('');
    const res = await api.getParentOverview(sid);
    setLoading(false);
    if (res.ok) setData(res.data);
    else setError(res.error);
  };
  useEffect(() => { void load(); }, []);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {[...Array(3)].map((_, i) => <div key={i} className="mn-skeleton" style={{ height: '80px', borderRadius: '16px' }} />)}
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', padding: '40px 0', fontSize: '13px', color: 'var(--mn-ink-3)' }}>
      {error} — <button type="button" onClick={load} style={{ color: 'var(--mn-blue)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>重试</button>
    </div>
  );

  if (!data) return null;

  const emo = EMOTION[data.emotion];
  const trendPositive = data.weak_kc_trend <= 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--mn-ink)' }}>成长摘要</h1>
        <StreakBadge days={data.streak} size="sm" />
      </div>

      {/* 情绪卡 */}
      <div className="mn-card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px', borderLeft: `4px solid ${emo.color}` }}>
        <span style={{ fontSize: '28px', flexShrink: 0 }}>{emo.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--mn-ink)', marginBottom: '2px' }}>
            今日状态：{emo.label}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--mn-ink-3)' }}>
            今天已学习 {data.study_minutes_today} 分钟
          </div>
        </div>
      </div>

      {/* stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <Stat
          value={data.weak_kc_count}
          label="当前薄弱考点"
          note={data.weak_kc_trend === 0 ? undefined : trendPositive ? `↓ 减少了 ${Math.abs(data.weak_kc_trend)} 个` : `↑ 增加了 ${data.weak_kc_trend} 个`}
          noteColor={trendPositive ? 'var(--mn-green)' : 'var(--mn-red)'}
        />
        <Stat value={data.streak} label="连续打卡天数" />
        <Stat value={`${data.study_minutes_today}m`} label="今日学习时长" />
      </div>

      {/* 最大进步 */}
      {data.top_improved_kc && (
        <div className="mn-card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px', flexShrink: 0 }}>⭐</span>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--mn-green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>近期最大进步</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--mn-ink)' }}>{data.top_improved_kc}</div>
          </div>
        </div>
      )}

      <p style={{ fontSize: '11px', textAlign: 'center', color: 'var(--mn-ink-3)', lineHeight: 1.6 }}>
        以上仅显示学习趋势，不含题目细节，保护孩子隐私。
      </p>
    </div>
  );
}
