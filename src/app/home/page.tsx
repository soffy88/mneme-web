'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserId } from '@/lib/auth-store';
import * as api from '@/lib/api-client';
import { StreakBadge } from '@/components/shared/StreakBadge';
import { Achievements } from '@/components/shared/Achievements';
import { EffortBoard } from '@/components/shared/EffortBoard';
import { InterleaveCard } from '@/components/shared/InterleaveCard';
import type { MissionRes, CompleteMissionRes, ReviewDueItem, DailyPlanRes } from '@/types/api';


const TYPE_META: Record<string, { icon: string; color: string; bg: string; action: string; href: string }> = {
  review:          { icon: '↺',  color: 'var(--mn-blue)',   bg: 'var(--mn-blue-dim)',   action: '开始复习', href: '/mastery' },
  socratic:        { icon: '◌',  color: '#6d28d9',          bg: '#ede9fe',              action: '开始对话', href: '/socratic' },
  upload:          { icon: '⊕',  color: 'var(--mn-blue)',   bg: 'var(--mn-blue-dim)',   action: '上传试卷', href: '/upload' },
  knowledge_focus: { icon: '✐',  color: 'var(--mn-orange)', bg: 'var(--mn-orange-dim)', action: '开始练习', href: '/practice' },
  rest:            { icon: '◐',  color: 'var(--mn-ink-3)',  bg: 'var(--mn-border)',     action: '',        href: '' },
  cold_start:      { icon: '👋', color: 'var(--mn-blue)',   bg: 'var(--mn-blue-dim)',   action: '做第一道题', href: '/practice' },
};

function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="mn-skeleton" style={{ height: '24px', width: '80px' }} />
        <div className="mn-skeleton" style={{ height: '28px', width: '80px', borderRadius: '99px' }} />
      </div>
      <div className="mn-skeleton" style={{ height: '160px', borderRadius: '16px' }} />
      <div className="mn-skeleton" style={{ height: '64px', borderRadius: '16px' }} />
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [data,       setData]       = useState<MissionRes | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [completing, setCompleting] = useState(false);
  const [done,       setDone]       = useState<CompleteMissionRes | null>(null);
  const [error,      setError]      = useState('');
  const [reviewDue,  setReviewDue]  = useState<ReviewDueItem[]>([]);
  const [dailyPlan,  setDailyPlan]  = useState<DailyPlanRes | null>(null);
  const [studentId,  setStudentId]  = useState<string | null>(null);

  const load = async () => {
    const sid = getUserId();
    if (!sid) { router.push('/login'); return; }
    setStudentId(sid);
    setLoading(true);
    // 首屏只等快接口（mission+plan），复习卡异步加载，绝不阻塞首屏
    const [missionRes, planRes] = await Promise.all([
      api.getMission(sid),
      api.getDailyPlan(sid),   // 无 subject → 多科汇总
    ]);
    setLoading(false);
    if (missionRes.ok) setData(missionRes.data);
    else setError(missionRes.error);
    if (planRes.ok)   setDailyPlan(planRes.data);
    // review/due 慢（变式生成），不挡首屏，回来再补
    void api.getReviewDue(sid).then((r) => { if (r.ok) setReviewDue(r.data); });
  };

  useEffect(() => { void load(); }, []);

  const complete = async () => {
    if (!data?.mission.id || completing) return;
    setCompleting(true);
    const res = await api.completeMission(data.mission.id);
    setCompleting(false);
    if (!res.ok) return;
    setDone(res.data);
    setData((d) => d ? { ...d, streak: res.data.streak } : d);
  };

  if (loading) return <Skeleton />;

  if (error) return (
    <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--mn-ink-3)', fontSize: '14px' }}>
      加载失败 — <button type="button" onClick={load} style={{ color: 'var(--mn-blue)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>重试</button>
    </div>
  );

  if (!data) return null;

  const { mission, streak } = data;
  const isRest = mission.mission_type === 'rest';
  const meta   = TYPE_META[mission.mission_type] ?? TYPE_META.review;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--mn-ink)', lineHeight: 1.2 }}>
            今日目标
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--mn-ink-3)', marginTop: '2px' }}>
            第 {streak.current_streak} 天
          </p>
        </div>
        <StreakBadge days={streak.current_streak} />
      </div>

      {/* Mission card */}
      {isRest ? (
        <div className="mn-card" style={{ padding: '32px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🌙</div>
          <div style={{ fontWeight: 700, fontSize: '18px', color: 'var(--mn-ink)', marginBottom: '6px' }}>
            今天做得够多了
          </div>
          <div style={{ fontSize: '14px', color: 'var(--mn-ink-3)' }}>好好休息，明天继续 ✨</div>
        </div>
      ) : done ? (
        /* 完成状态 */
        <div className="mn-card" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>🎉</div>
          <div style={{ fontWeight: 700, fontSize: '18px', color: 'var(--mn-green)', marginBottom: '6px' }}>
            完成！连续 {done.streak.current_streak} 天
          </div>
          <div style={{ fontSize: '13px', color: 'var(--mn-ink-3)', marginTop: '4px' }}>
            {done.next_preview}
          </div>
        </div>
      ) : (
        /* 目标卡片 */
        <div className="mn-card" style={{ overflow: 'hidden' }}>
          {/* 顶部色条 */}
          <div style={{ height: '4px', background: meta.color }} />

          <div style={{ padding: '20px' }}>
            {/* 类型标签 */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '3px 10px', borderRadius: '99px',
              background: meta.bg, color: meta.color,
              fontSize: '12px', fontWeight: 600, marginBottom: '14px' }}>
              <span>{meta.icon}</span>
              <span>
                {{ review:'复习', socratic:'苏格拉底对话', upload:'上传试卷', knowledge_focus:'专项练习', rest:'', cold_start:'新手上路' }[mission.mission_type]}
              </span>
            </div>

            {/* 考点名 */}
            <div style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--mn-ink)', lineHeight: 1.3, marginBottom: '6px' }}>
              {mission.mission_type === 'cold_start'
                ? '欢迎来到善学记 👋 先做一道题，看看它怎么帮你'
                : (mission.content.kc_name ?? mission.content.description ?? dailyPlan?.tasks?.[0]?.title ?? '今天先做一组专项练习')}
            </div>
            {mission.content.kc_name && (
              <div style={{ fontSize: '14px', color: 'var(--mn-ink-2)', marginBottom: '6px' }}>
                {mission.content.description}
              </div>
            )}

            {/* 元信息 */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px', marginBottom: '20px' }}>
              <span style={{ fontSize: '12px', color: 'var(--mn-ink-3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                ⏱ {mission.estimated_minutes} 分钟
              </span>
              {mission.requires_active_recall && (
                <span style={{ fontSize: '12px', color: 'var(--mn-ink-3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ◎ 主动回忆
                </span>
              )}
              {mission.interleaved && (
                <span style={{ fontSize: '12px', color: 'var(--mn-ink-3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ⇄ 交错练习
                </span>
              )}
            </div>

            {/* 操作按钮 */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="mn-btn-primary"
                style={{ flex: 1 }}
                onClick={() => {
                  // mission 内容为空时，目标卡直接对接今日计划首个任务（去做，而非泛化跳转）
                  const t0 = dailyPlan?.tasks?.[0];
                  if (!mission.content?.kc_name && t0) {
                    if (t0.subject === 'math' && t0.ku_ids?.length) { router.push(`/subjects/math/practice?ku_id=${encodeURIComponent(t0.ku_ids[0])}`); return; }
                    if (t0.type === 'error_review') { router.push('/error-journal'); return; }
                  }
                  router.push(meta.href);
                }}
              >
                {meta.action}
              </button>
              <button
                type="button"
                className="mn-btn-secondary"
                disabled={completing}
                onClick={complete}
                style={{ minWidth: '88px' }}
              >
                {completing ? '…' : '标记完成'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 今日复习卡片（仅在有待复习内容时显示） */}
      {reviewDue.length > 0 && (
        <button
          type="button"
          className="mn-card-interactive"
          onClick={() => router.push(`/subjects/math/practice?ku_id=${encodeURIComponent(reviewDue[0].kc_id)}`)}
          style={{
            width: '100%', textAlign: 'left', background: 'none',
            border: '1.5px solid var(--mn-blue)', borderRadius: '16px',
            padding: '16px 18px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '14px',
          }}
        >
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'var(--mn-blue-dim)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', flexShrink: 0,
          }}>↺</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--mn-blue)' }}>
              今日复习
            </div>
            <div style={{ fontSize: '13px', color: 'var(--mn-ink-2)', marginTop: '2px' }}>
              {reviewDue.length} 个知识点到了复习时间
            </div>
          </div>
          <span style={{ color: 'var(--mn-ink-3)', fontSize: '16px' }}>›</span>
        </button>
      )}

      {/* 最长连续天数 */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '12px 16px', borderRadius: '12px',
        background: 'var(--mn-surface)', border: '1px solid var(--mn-border)',
      }}>
        <span style={{ fontSize: '18px' }}>🏆</span>
        <div style={{ fontSize: '13px' }}>
          <span style={{ color: 'var(--mn-ink-2)' }}>最长连续 </span>
          <span style={{ fontWeight: 700, color: 'var(--mn-ink)', fontVariantNumeric: 'tabular-nums' }}>
            {streak.longest_streak}
          </span>
          <span style={{ color: 'var(--mn-ink-2)' }}> 天 — 继续加油！</span>
        </div>
      </div>

      {/* 今日全科任务汇总 */}
      {dailyPlan && dailyPlan.tasks.length > 0 && (
        <div className="mn-card" style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{
              fontSize: '12px', fontWeight: 600, color: '#16a34a',
              padding: '2px 8px', borderRadius: '99px', background: '#f0fdf4',
            }}>全科今日任务</span>
            <span style={{ fontSize: '11px', color: 'var(--mn-ink-3)', marginLeft: 'auto' }}>
              共 {dailyPlan.tasks.length} 项
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {dailyPlan.tasks.slice(0, 5).map((t, i) => {
              const colors: Record<string, string> = {
                review: 'var(--mn-blue)', weak_practice: 'var(--mn-orange)',
                error_review: '#dc2626',  new_learn: '#16a34a',
              };
              const labels: Record<string, string> = {
                math: '数学', physics: '物理', english: '英语', chinese: '语文',
              };
              const color = colors[t.type] ?? 'var(--mn-ink-3)';
              const goTask = () => {
                // 仅数学有真题练习闭环；其它科目导到已存在的页面，避免 404/占位死链
                if (t.subject === 'math') {
                  if (t.ku_ids && t.ku_ids.length) router.push(`/subjects/math/practice?ku_id=${encodeURIComponent(t.ku_ids[0])}`);
                  else if (t.type === 'error_review') router.push('/error-journal');
                  else router.push('/practice');
                  return;
                }
                if (t.type === 'error_review') { router.push('/error-journal'); return; }
                if (t.subject === 'physics' || t.subject === 'chinese') router.push(`/subjects/${t.subject}/lesson`);
                else router.push(`/subjects/${t.subject}`);
              };
              return (
                <button key={i} type="button" onClick={goTask} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 10px', borderRadius: '8px',
                  background: 'var(--mn-surface)', border: '1px solid var(--mn-border)',
                  cursor: 'pointer', width: '100%', textAlign: 'left',
                }}>
                  <div style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: color, flexShrink: 0,
                  }} />
                  <span style={{ fontSize: '12px', color: 'var(--mn-ink-3)', flexShrink: 0 }}>
                    {labels[t.subject] ?? t.subject}
                  </span>
                  <span style={{
                    fontSize: '13px', color: 'var(--mn-ink)', flex: 1,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{t.title}</span>
                  <span style={{ fontSize: '11px', color: 'var(--mn-ink-3)', flexShrink: 0 }}>
                    ⏱{t.estimated_minutes}分
                  </span>
                  <span style={{ color: 'var(--mn-ink-3)', fontSize: '14px', flexShrink: 0 }}>›</span>
                </button>
              );
            })}
            {dailyPlan.tasks.length > 5 && (
              <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--mn-ink-3)', paddingTop: '2px' }}>
                还有 {dailyPlan.tasks.length - 5} 项，进入各学科页查看
              </div>
            )}
          </div>
        </div>
      )}

      {/* 学科中心入口 */}
      <div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--mn-ink-3)', marginBottom: '10px', letterSpacing: '0.02em' }}>
          学科中心
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[
            { slug: 'math',    emoji: '📐', label: '数学' },
            { slug: 'physics', emoji: '⚛️', label: '物理' },
            { slug: 'english', emoji: '🔤', label: '英语' },
            { slug: 'chinese', emoji: '📝', label: '语文' },
          ].map((s) => (
            <button
              key={s.slug}
              type="button"
              className="mn-card mn-card-interactive"
              onClick={() => router.push(`/subjects/${s.slug}`)}
              style={{
                width: '100%', textAlign: 'left', cursor: 'pointer',
                padding: '14px 14px',
                display: 'flex', alignItems: 'center', gap: '10px',
              }}
            >
              <span style={{ fontSize: '20px', lineHeight: 1 }}>{s.emoji}</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--mn-ink)' }}>{s.label}</span>
              <span style={{ marginLeft: 'auto', color: 'var(--mn-ink-3)', fontSize: '14px' }}>›</span>
            </button>
          ))}
        </div>
      </div>

      {/* 交错复习池（M-B · 训练识别力） */}
      {studentId && <InterleaveCard studentId={studentId} />}

      {/* 努力收益（M-F · 对抗努力错觉） */}
      {studentId && <EffortBoard studentId={studentId} />}

      {/* 成就（动机钩子） */}
      <Achievements />

      {/* 我的错题本入口 */}
      <button
        type="button"
        className="mn-card-interactive"
        onClick={() => router.push('/error-journal')}
        style={{
          width: '100%', textAlign: 'left', background: 'none',
          border: '1px solid var(--mn-border)', borderRadius: '16px',
          padding: '16px 18px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '14px',
        }}
      >
        <div style={{
          width: '38px', height: '38px', borderRadius: '10px',
          background: 'var(--mn-surface)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', flexShrink: 0,
        }}>◈</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--mn-ink)' }}>
            我的错题本
          </div>
          <div style={{ fontSize: '13px', color: 'var(--mn-ink-3)', marginTop: '2px' }}>
            整理错误，举一反三
          </div>
        </div>
        <span style={{ color: 'var(--mn-ink-3)', fontSize: '16px' }}>›</span>
      </button>

    </div>
  );
}
