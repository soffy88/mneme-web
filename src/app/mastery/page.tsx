'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserId } from '@/lib/auth-store';
import * as api from '@/lib/api-client';
import { MasteryRing } from '@/components/shared/MasteryRing';
import type { KnowledgePoint, CalibrationRes } from '@/types/api';


/** JOL 自测校准卡：预测把握度 vs 实际正确率（努力错觉检测）。 */
function CalibrationCard() {
  const [cal, setCal] = useState<CalibrationRes | null>(null);

  useEffect(() => {
    const sid = getUserId();
    if (!sid) return;
    api.getCalibration(sid).then((res) => { if (res.ok) setCal(res.data); });
  }, []);

  if (!cal || cal.n === 0 || cal.mean_predicted === null || cal.accuracy === null) return null;

  const predicted = Math.round(cal.mean_predicted * 100);
  const actual    = Math.round(cal.accuracy * 100);
  const over      = cal.overconfidence ?? 0;
  const gap       = Math.round(Math.abs(over) * 100);
  const overconfident = over > 0.05;
  const underconfident = over < -0.05;

  const verdict = overconfident
    ? { label: `高估自己 ${gap}%`, color: 'var(--mn-orange)', tip: '感觉会的不一定真会 — 多做检索式自测，别被"努力错觉"骗了。' }
    : underconfident
    ? { label: `低估自己 ${gap}%`, color: 'var(--mn-blue)', tip: '你比自己想的更扎实，放心一点。' }
    : { label: '判断很准', color: 'var(--mn-green)', tip: '你对自己掌握程度的判断很准，继续保持。' };

  return (
    <div className="mn-card" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--mn-ink)' }}>自测校准</span>
        <span style={{ fontSize: '11px', fontWeight: 700, color: verdict.color, padding: '2px 8px', borderRadius: '99px', background: 'var(--mn-surface)', border: `1px solid ${verdict.color}` }}>
          {verdict.label}
        </span>
      </div>
      <div style={{ display: 'flex', gap: '20px' }}>
        <div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--mn-ink-2)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{predicted}%</div>
          <div style={{ fontSize: '11px', color: 'var(--mn-ink-3)', marginTop: '3px' }}>你预测的把握度</div>
        </div>
        <div style={{ fontSize: '20px', color: 'var(--mn-ink-3)', alignSelf: 'center' }}>vs</div>
        <div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--mn-ink)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{actual}%</div>
          <div style={{ fontSize: '11px', color: 'var(--mn-ink-3)', marginTop: '3px' }}>实际正确率</div>
        </div>
      </div>
      <div style={{ fontSize: '12px', color: 'var(--mn-ink-3)', lineHeight: 1.5 }}>
        {verdict.tip} <span style={{ color: 'var(--mn-ink-4, var(--mn-ink-3))' }}>（基于 {cal.n} 次自评，Brier {cal.brier}）</span>
      </div>
    </div>
  );
}

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
    if (res.ok) {
      // 后端返回裸 KnowledgePoint[]；mock 返回 { knowledge_points: [...] }
      const d = res.data as unknown;
      const pts = Array.isArray(d) ? (d as KnowledgePoint[]) : ((d as typeof res.data).knowledge_points ?? []);
      setKcs(pts);
    } else {
      setError(res.error);
    }
  };

  useEffect(() => { void load(); }, []);

  /* summary stats */
  const safeKcs = kcs ?? [];
  const weak   = safeKcs.filter((k) => k.effective_mastery < 0.5).length;
  const strong = safeKcs.filter((k) => k.effective_mastery >= 0.75).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--mn-ink)' }}>
          掌握度
        </h1>
        {!loading && !error && safeKcs.length > 0 && (
          <p style={{ fontSize: '13px', color: 'var(--mn-ink-3)', marginTop: '4px' }}>
            共 {safeKcs.length} 个考点 · <span style={{ color: 'var(--mn-red)' }}>{weak} 个需加强</span>
            {strong > 0 && <> · <span style={{ color: 'var(--mn-green)' }}>{strong} 个已掌握</span></>}
          </p>
        )}
      </div>

      {/* JOL 自测校准 */}
      <CalibrationCard />

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
      ) : safeKcs.length === 0 ? (
        <div className="mn-card" style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📚</div>
          <div style={{ fontWeight: 600, color: 'var(--mn-ink)', marginBottom: '6px' }}>暂无掌握度数据</div>
          <div style={{ fontSize: '13px', color: 'var(--mn-ink-3)', marginBottom: '20px' }}>
            做几道题后，这里会出现你的学习地图。
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button type="button" className="mn-btn-primary" onClick={() => router.push('/practice')}>
              去做几道题
            </button>
            <button type="button" className="mn-btn-secondary" onClick={() => router.push('/upload')}>
              上传试卷
            </button>
          </div>
        </div>
      ) : (
        /* 两列 grid(平板以上) */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '10px',
        }}>
          {safeKcs.map((kc) => (
            <KCCard
              key={kc.kc_id}
              kc={kc}
              onClick={() => router.push(`/curve?kc=${kc.kc_id}&name=${encodeURIComponent(kc.kc_name)}`)}
            />
          ))}
        </div>
      )}

      {/* 练习入口 */}
      {!loading && !error && safeKcs.length > 0 && (
        <button
          type="button"
          className="mn-btn-primary"
          style={{ width: '100%' }}
          onClick={() => router.push(`/subjects/math/practice?ku_id=${encodeURIComponent(safeKcs[0].kc_id)}`)}
        >
          练习最薄弱的考点
        </button>
      )}
    </div>
  );
}
