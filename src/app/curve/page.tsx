'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import * as api from '@/lib/api-client';
import { getUserId } from '@/lib/auth-store';
import { MasteryRing } from '@/components/shared/MasteryRing';
import type { CurvePoint } from '@/types/api';

const W = 300, H = 140, PX = 16, PY = 16;

const ERROR_LABEL: Record<string, string> = {
  conceptual: '概念不清', transfer: '迁移弱', careless: '粗心',
  logic_break: '逻辑断裂', dontknow: '不会',
};

function ringColor(pct: number) {
  if (pct >= 75) return 'var(--mn-mastery-high)';
  if (pct >= 50) return 'var(--mn-mastery-mid)';
  if (pct >= 25) return 'var(--mn-mastery-low)';
  return 'var(--mn-mastery-weak)';
}

function LineChart({ points }: { points: CurvePoint[] }) {
  if (points.length < 2) return null;
  const vals = points.map((p) => p.mastery);
  const maxV = Math.max(...vals, 0.01);
  const toX = (i: number) => PX + (i / (points.length - 1)) * (W - PX * 2);
  const toY = (v: number) => H - PY - (v / 1) * (H - PY * 2);

  // smooth path via cubic bezier
  const d = points.reduce((acc, p, i) => {
    const x = toX(i), y = toY(p.mastery);
    if (i === 0) return `M${x},${y}`;
    const px = toX(i - 1), py = toY(points[i - 1].mastery);
    const cpx = (px + x) / 2;
    return `${acc} C${cpx},${py} ${cpx},${y} ${x},${y}`;
  }, '');

  // fill area
  const fill = `${d} L${toX(points.length - 1)},${H - PY} L${toX(0)},${H - PY} Z`;

  const last = points[points.length - 1];
  const color = ringColor(Math.round(last.mastery * 100));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', overflow: 'visible' }}>
      <defs>
        <linearGradient id="curve-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* horizontal grid */}
      {[0.25, 0.5, 0.75, 1].map((v) => (
        <line key={v} x1={PX} x2={W - PX} y1={toY(v)} y2={toY(v)}
          stroke="var(--mn-border)" strokeWidth="1" strokeDasharray="3 4" />
      ))}
      {/* y labels */}
      {[0.25, 0.5, 0.75].map((v) => (
        <text key={v} x={PX - 4} y={toY(v) + 4} fontSize="9" fill="var(--mn-ink-3)" textAnchor="end">
          {Math.round(v * 100)}
        </text>
      ))}
      {/* area fill */}
      <path d={fill} fill="url(#curve-fill)" />
      {/* line */}
      <path d={d} fill="none" stroke={color} strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />
      {/* dots */}
      {points.map((p, i) => (
        <circle key={i} cx={toX(i)} cy={toY(p.mastery)} r="4"
          fill="var(--mn-surface)" stroke={color} strokeWidth="2.5" />
      ))}
      {/* x labels first/last */}
      <text x={toX(0)} y={H} fontSize="9" fill="var(--mn-ink-3)" textAnchor="middle">
        {points[0].month.slice(5)}月
      </text>
      <text x={toX(points.length - 1)} y={H} fontSize="9" fill="var(--mn-ink-3)" textAnchor="middle">
        {last.month.slice(5)}月
      </text>
    </svg>
  );
}

function CurveContent() {
  const params  = useSearchParams();
  const router  = useRouter();
  const kcId    = params?.get('kc')   ?? 'GDMATH-CONIC-01';
  const kcName  = params?.get('name') ?? '椭圆';
  const [points,  setPoints]  = useState<CurvePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const load = async () => {
    const sid = getUserId();
    if (!sid) { router.push('/login'); return; }
    setLoading(true); setError('');
    const res = await api.getMasteryCurve(sid, kcId);
    setLoading(false);
    if (res.ok) setPoints(res.data.points);
    else setError(res.error);
  };
  useEffect(() => { void load(); }, [kcId]);

  const latest = points.length ? points[points.length - 1].mastery : 0;
  const earliest = points.length ? points[0].mastery : 0;
  const delta = latest - earliest;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {!loading && points.length > 0 && <MasteryRing value={latest} size={56} strokeWidth={6} />}
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--mn-ink)' }}>{kcName}</h1>
          {!loading && points.length > 0 && (
            <p style={{ fontSize: '13px', color: 'var(--mn-ink-3)', marginTop: '2px' }}>
              {delta >= 0
                ? <span style={{ color: 'var(--mn-green)' }}>↑ 进步了 {Math.round(delta * 100)} 分</span>
                : <span style={{ color: 'var(--mn-red)' }}>↓ 下滑了 {Math.round(Math.abs(delta) * 100)} 分</span>}
              {' '} · {points.length} 个月
            </p>
          )}
          <p style={{ fontSize: '11px', color: 'var(--mn-ink-3)', marginTop: '3px' }}>
            永久学习档案 · 每月留存掌握度与错因，随时间增值
          </p>
        </div>
      </div>

      {loading ? (
        <div className="mn-skeleton" style={{ height: '160px', borderRadius: '16px' }} />
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '40px 0', fontSize: '13px', color: 'var(--mn-ink-3)' }}>
          {error} — <button type="button" onClick={load} style={{ color: 'var(--mn-blue)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>重试</button>
        </div>
      ) : points.length < 2 ? (
        <div className="mn-card" style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📈</div>
          <div style={{ fontWeight: 600, color: 'var(--mn-ink)', marginBottom: '6px' }}>数据还不够</div>
          <div style={{ fontSize: '13px', color: 'var(--mn-ink-3)' }}>多练几次，曲线就会出现。</div>
        </div>
      ) : (
        <>
          <div className="mn-card" style={{ padding: '16px 20px 12px' }}>
            <LineChart points={points} />
          </div>
          {/* 月度数据列表 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[...points].reverse().map((p) => {
              const pct = Math.round(p.mastery * 100);
              return (
                <div key={p.month} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 14px', borderRadius: '12px',
                  background: 'var(--mn-surface)', border: '1px solid var(--mn-border)',
                }}>
                  <span style={{ fontSize: '13px', color: 'var(--mn-ink-3)', minWidth: '48px', fontVariantNumeric: 'tabular-nums' }}>
                    {p.month.slice(2).replace('-', '/')}
                  </span>
                  <div style={{ flex: 1, height: '4px', background: 'var(--mn-border)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: ringColor(pct), borderRadius: '99px', transition: 'width 0.5s var(--mn-ease-out)' }} />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: ringColor(pct), fontVariantNumeric: 'tabular-nums', minWidth: '36px', textAlign: 'right' }}>
                    {pct}%
                  </span>
                  {p.dominant_error_type && ERROR_LABEL[p.dominant_error_type] && (
                    <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: 'var(--mn-red-dim)', color: 'var(--mn-red)', fontWeight: 600, flexShrink: 0 }}>
                      {ERROR_LABEL[p.dominant_error_type]}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default function CurvePage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-muted-foreground">加载中…</div>}>
      <CurveContent />
    </Suspense>
  );
}
