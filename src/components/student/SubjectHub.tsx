'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserId } from '@/lib/auth-store';
import * as api from '@/lib/api-client';
import type { DailyPlanRes } from '@/types/api';

// ── Types ────────────────────────────────────────────────────

export interface ModuleCard {
  icon: string;
  title: string;
  desc: string;
  href: string;
  disabled?: boolean;
}

export interface SubjectSection {
  phase: string;
  color: string;
  bg: string;
  cards: ModuleCard[];
}

export interface SubjectConfig {
  subject: string;
  title: string;
  emoji: string;
  sections: SubjectSection[];
}

// ── Daily plan widget ────────────────────────────────────────

const TASK_META: Record<string, { color: string; bg: string; label: string }> = {
  review:        { color: 'var(--mn-blue)',   bg: 'var(--mn-blue-dim)',   label: '复习' },
  weak_practice: { color: 'var(--mn-orange)', bg: 'var(--mn-orange-dim)', label: '练习' },
  error_review:  { color: '#dc2626',          bg: '#fef2f2',              label: '错题' },
  new_learn:     { color: '#16a34a',          bg: '#f0fdf4',              label: '新学' },
};

function DailyPlanWidget({ subject }: { subject: string }) {
  const router = useRouter();
  const [plan, setPlan]       = useState<DailyPlanRes | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sid = getUserId();
    if (!sid) { router.push('/login'); return; }
    api.getDailyPlan(sid, subject).then((res) => {
      setLoading(false);
      if (res.ok) setPlan(res.data);
    });
  }, [subject, router]);

  return (
    <div className="mn-card" style={{ padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14px' }}>
        <span style={{
          fontSize: '12px', fontWeight: 600, color: 'var(--mn-blue)',
          padding: '2px 8px', borderRadius: '99px', background: 'var(--mn-blue-dim)',
        }}>今日任务</span>
        {plan?.exam_countdown_days != null && (
          <span style={{ fontSize: '11px', color: 'var(--mn-ink-3)', marginLeft: 'auto' }}>
            高考倒计时 {plan.exam_countdown_days} 天
          </span>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="mn-skeleton" style={{ height: '44px', borderRadius: '8px' }} />
          ))}
        </div>
      ) : !plan || plan.tasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--mn-ink-3)', fontSize: '14px' }}>
          今日任务已全部完成，继续保持！🎉
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {plan.tasks.map((task, i) => {
            const m = TASK_META[task.type] ?? TASK_META.review;
            const goTask = () => {
              // 错题回顾：跳错题本并按学科过滤（error-journal 页/接口均已支持 subject 过滤）
              if (task.type === 'error_review') { router.push(`/error-journal?subject=${subject}`); return; }
              // 数学有真题练习闭环，直接跳具体知识点；其它科目暂无该闭环
              // （/subjects/physics/practice 只是空壳重定向，/subjects/{subject}/lesson 是整个
              // 知识地图不聚焦到具体任务），先导到按学科过滤的选题页，至少不会跳错学科/跳错引擎。
              if (subject === 'math' && task.ku_ids && task.ku_ids.length) {
                router.push(`/subjects/math/practice?ku_id=${encodeURIComponent(task.ku_ids[0])}`);
                return;
              }
              router.push(`/practice?subject=${subject}`);
            };
            return (
              <button key={i} type="button" onClick={goTask} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '10px',
                background: 'var(--mn-surface)', border: '1px solid var(--mn-border)',
                cursor: 'pointer', width: '100%', textAlign: 'left',
              }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0,
                  background: m.bg, color: m.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 700,
                }}>
                  {m.label}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '14px', fontWeight: 600, color: 'var(--mn-ink)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {task.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--mn-ink-3)', marginTop: '1px' }}>
                    {task.reason}
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--mn-ink-3)', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                  ⏱{task.estimated_minutes}分
                </span>
                <span style={{ color: 'var(--mn-ink-3)', fontSize: '14px', flexShrink: 0 }}>›</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Module card ──────────────────────────────────────────────

function CardBtn({ card }: { card: ModuleCard }) {
  const router = useRouter();
  if (card.disabled) {
    return (
      <div
        className="mn-card"
        style={{
          width: '100%', padding: '14px 12px', opacity: 0.45,
          display: 'flex', flexDirection: 'column', gap: '5px',
          cursor: 'not-allowed', position: 'relative',
        }}
      >
        <span style={{ fontSize: '20px', lineHeight: 1, filter: 'grayscale(1)' }}>{card.icon}</span>
        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--mn-ink)', lineHeight: 1.3 }}>
          {card.title}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--mn-ink-3)', lineHeight: 1.4 }}>
          {card.desc}
        </div>
        <span style={{
          position: 'absolute', top: 8, right: 8,
          fontSize: '10px', padding: '2px 6px', borderRadius: 10,
          background: '#f3f4f6', color: '#6b7280', fontWeight: 500,
        }}>即将上线</span>
      </div>
    );
  }
  return (
    <button
      type="button"
      className="mn-card mn-card-interactive"
      onClick={() => router.push(card.href)}
      style={{
        width: '100%', textAlign: 'left', cursor: 'pointer',
        padding: '14px 12px',
        display: 'flex', flexDirection: 'column', gap: '5px',
      }}
    >
      <span style={{ fontSize: '20px', lineHeight: 1 }}>{card.icon}</span>
      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--mn-ink)', lineHeight: 1.3 }}>
        {card.title}
      </div>
      <div style={{ fontSize: '11px', color: 'var(--mn-ink-3)', lineHeight: 1.4 }}>
        {card.desc}
      </div>
    </button>
  );
}

// ── SRL section ──────────────────────────────────────────────

function SectionBlock({ section }: { section: SubjectSection }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <div style={{ width: '3px', height: '14px', borderRadius: '2px', background: section.color }} />
        <span style={{ fontSize: '13px', fontWeight: 700, color: section.color, letterSpacing: '0.02em' }}>
          {section.phase}
        </span>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
        gap: '10px',
      }}>
        {section.cards.map((card) => (
          <CardBtn key={card.title} card={card} />
        ))}
      </div>
    </div>
  );
}

// ── SubjectHub (main export) ─────────────────────────────────

export function SubjectHub({ config }: { config: SubjectConfig }) {
  const router = useRouter();

  // item 10：题库有内容则自动解禁该科练习卡（练习栈本就学科无关）。
  const [practiceReady, setPracticeReady] = useState(false);
  useEffect(() => {
    let alive = true;
    api.listPracticeTopics(config.subject).then((r) => {
      if (alive && r.ok && r.data.topics.length > 0) setPracticeReady(true);
    });
    return () => { alive = false; };
  }, [config.subject]);

  // 练习路由卡：题库就绪时去掉 disabled
  const sections = practiceReady
    ? config.sections.map((s) => ({
        ...s,
        cards: s.cards.map((c) =>
          c.href.includes('/practice') ? { ...c, disabled: false } : c,
        ),
      }))
    : config.sections;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div>
        <h1 style={{
          fontSize: '24px', fontWeight: 800, letterSpacing: '-0.03em',
          color: 'var(--mn-ink)', lineHeight: 1.2,
        }}>
          {config.emoji} {config.title}
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--mn-ink-3)', marginTop: '4px' }}>
          选择模块开始学习
        </p>
      </div>

      {/* 计划区 */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <div style={{ width: '3px', height: '14px', borderRadius: '2px', background: 'var(--mn-blue)' }} />
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--mn-blue)', letterSpacing: '0.02em' }}>
            计划
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Daily plan */}
          <DailyPlanWidget subject={config.subject} />
          {/* Mastery map */}
          <button
            type="button"
            className="mn-card mn-card-interactive"
            onClick={() => router.push(`/mastery?subject=${config.subject}`)}
            style={{
              width: '100%', textAlign: 'left', cursor: 'pointer',
              padding: '14px 18px',
              display: 'flex', alignItems: 'center', gap: '14px',
            }}
          >
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'var(--mn-blue-dim)', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px',
            }}>
              ◑
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--mn-ink)' }}>掌握度地图</div>
              <div style={{ fontSize: '12px', color: 'var(--mn-ink-3)', marginTop: '2px' }}>
                查看各知识点掌握情况
              </div>
            </div>
            <span style={{ color: 'var(--mn-ink-3)', fontSize: '16px' }}>›</span>
          </button>
        </div>
      </div>

      {/* 执行 / 反思 / 独立功能 sections */}
      {sections.map((section) => (
        <SectionBlock key={section.phase} section={section} />
      ))}

    </div>
  );
}
