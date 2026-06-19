'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserId } from '@/lib/auth-store';
import * as api from '@/lib/api-client';
import { MasteryRing } from '@/components/shared/MasteryRing';
import type { KnowledgePoint } from '@/types/api';


function SkeletonCard() {
  return (
    <div className="mn-card" style={{ padding: '16px', display: 'flex', gap: '14px', alignItems: 'center' }}>
      <div className="mn-skeleton" style={{ width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="mn-skeleton" style={{ height: '16px', width: '60%' }} />
        <div className="mn-skeleton" style={{ height: '4px', borderRadius: '99px' }} />
      </div>
    </div>
  );
}

function KCCard({ kc, onClick }: { kc: KnowledgePoint; onClick: () => void }) {
  const pct = Math.round(kc.effective_mastery * 100);

  return (
    <button
      type="button"
      className="mn-card mn-card-interactive"
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left',
        padding: '16px',
        display: 'flex', gap: '14px', alignItems: 'center',
      }}
    >
      {/* 圆环 — signature element */}
      <MasteryRing value={kc.effective_mastery} size={48} strokeWidth={6} />

      {/* 内容 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '15px', fontWeight: 600,
          color: 'var(--mn-ink)', letterSpacing: '-0.01em',
          marginBottom: '3px',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {kc.kc_name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* thin progress bar */}
          <div style={{ flex: 1, height: '3px', background: 'var(--mn-border)', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{
              width: `${pct}%`, height: '100%',
              background: pct >= 75 ? 'var(--mn-mastery-high)' : pct >= 50 ? 'var(--mn-mastery-mid)' : pct >= 25 ? 'var(--mn-mastery-low)' : 'var(--mn-mastery-weak)',
              borderRadius: '99px', transition: 'width 0.6s var(--mn-ease-out)',
            }} />
          </div>
          <span style={{ fontSize: '11px', color: 'var(--mn-ink-3)', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
            {kc.n_attempts} 次
          </span>
        </div>
      </div>

      {/* peer percentile badge */}
      {kc.peer_percentile !== null && (
        <div style={{
          flexShrink: 0,
          fontSize: '11px', fontWeight: 600,
          padding: '3px 7px', borderRadius: '99px',
          background: kc.peer_percentile > 0.7 ? 'var(--mn-green-dim)' : 'var(--mn-border)',
          color: kc.peer_percentile > 0.7 ? 'var(--mn-green)' : 'var(--mn-ink-3)',
        }}>
          超{Math.round(kc.peer_percentile * 100)}%
        </div>
      )}

      {/* arrow */}
      <span style={{ color: 'var(--mn-border-2)', fontSize: '16px', flexShrink: 0 }}>›</span>
    </button>
  );
}

export default function MasteryPage() {
  const router   = useRouter();
  const [kcs,     setKcs]     = useState<KnowledgePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const load = async () => {
    const sid = getUserId();
    if (!sid) { router.push('/login'); return; }
    setLoading(true); setError('');
    const res = await api.getMastery(sid);
    setLoading(false);
    if (res.ok) setKcs(res.data.knowledge_points);
    else setError(res.error);
  };

  useEffect(() => { void load(); }, []);

  /* summary stats */
  const weak = kcs.filter((k) => k.effective_mastery < 0.5).length;
  const strong = kcs.filter((k) => k.effective_mastery >= 0.75).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--mn-ink)' }}>
          掌握度
        </h1>
        {!loading && !error && kcs.length > 0 && (
          <p style={{ fontSize: '13px', color: 'var(--mn-ink-3)', marginTop: '4px' }}>
            共 {kcs.length} 个考点 · <span style={{ color: 'var(--mn-red)' }}>{weak} 个需加强</span>
            {strong > 0 && <> · <span style={{ color: 'var(--mn-green)' }}>{strong} 个已掌握</span></>}
          </p>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--mn-ink-3)' }}>
          <div style={{ fontSize: '14px', marginBottom: '12px' }}>加载失败</div>
          <button type="button" className="mn-btn-secondary" onClick={load}>重试</button>
        </div>
      ) : kcs.length === 0 ? (
        <div className="mn-card" style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📚</div>
          <div style={{ fontWeight: 600, color: 'var(--mn-ink)', marginBottom: '6px' }}>暂无掌握度数据</div>
          <div style={{ fontSize: '13px', color: 'var(--mn-ink-3)', marginBottom: '20px' }}>
            上传试卷或完成练习后，这里会出现你的学习地图。
          </div>
          <button type="button" className="mn-btn-primary" onClick={() => router.push('/upload')}>
            上传第一份试卷
          </button>
        </div>
      ) : (
        /* 两列 grid(平板以上) */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '10px',
        }}>
          {kcs.map((kc) => (
            <KCCard
              key={kc.kc_id}
              kc={kc}
              onClick={() => router.push(`/curve?kc=${kc.kc_id}&name=${encodeURIComponent(kc.kc_name)}`)}
            />
          ))}
        </div>
      )}

      {/* 练习入口 */}
      {!loading && !error && kcs.length > 0 && (
        <button
          type="button"
          className="mn-btn-primary"
          style={{ width: '100%' }}
          onClick={() => router.push(`/practice?kc=${kcs[0].kc_id}&name=${encodeURIComponent(kcs[0].kc_name)}`)}
        >
          练习最薄弱的考点
        </button>
      )}
    </div>
  );
}
