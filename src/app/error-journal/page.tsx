'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getUserId } from '@/lib/auth-store';
import * as api from '@/lib/api-client';
import { RichText } from '@/components/shared/RichText';
import type { ErrorJournalRes, ErrorJournalDistribution } from '@/types/api';

const ERROR_TAG_LABEL: Record<string, string> = {
  careless:  '粗心',
  dontknow:  '不会',
  concept:   '概念',
  logic:     '逻辑',
  unknown:   '未知',
};

const ERROR_TAG_COLOR: Record<string, string> = {
  careless: 'var(--mn-blue)',
  dontknow: 'var(--mn-ink-2)',
  concept:  '#6d28d9',
  logic:    'var(--mn-orange)',
  unknown:  'var(--mn-ink-3)',
};

const ERROR_TAG_BG: Record<string, string> = {
  careless: 'var(--mn-blue-dim)',
  dontknow: 'var(--mn-surface)',
  concept:  '#ede9fe',
  logic:    'var(--mn-orange-dim)',
  unknown:  'var(--mn-border)',
};

function DistributionBar({ dist }: { dist: ErrorJournalDistribution[] }) {
  const total = dist.reduce((s, d) => s + d.error_count, 0);
  if (total === 0) return null;

  const typeTotals: Record<string, number> = {};
  for (const d of dist) {
    for (const [k, v] of Object.entries(d.error_types)) {
      typeTotals[k] = (typeTotals[k] ?? 0) + v;
    }
  }

  return (
    <div className="mn-card" style={{ padding: '16px 18px' }}>
      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--mn-ink-2)', marginBottom: '12px', letterSpacing: '0.02em' }}>
        错误类型分布
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {Object.entries(typeTotals).map(([tag, count]) => (
          <div key={tag} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px', borderRadius: '99px',
            background: ERROR_TAG_BG[tag] ?? 'var(--mn-surface)',
            border: '1px solid var(--mn-border)',
          }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: ERROR_TAG_COLOR[tag] ?? 'var(--mn-ink-3)',
              display: 'inline-block', flexShrink: 0,
            }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: ERROR_TAG_COLOR[tag] ?? 'var(--mn-ink-2)' }}>
              {ERROR_TAG_LABEL[tag] ?? tag}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--mn-ink-3)', fontVariantNumeric: 'tabular-nums' }}>
              {count}
            </span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '14px', display: 'flex', height: '6px', borderRadius: '99px', overflow: 'hidden', gap: '2px' }}>
        {Object.entries(typeTotals).map(([tag, count]) => (
          <div
            key={tag}
            style={{
              flex: count,
              background: ERROR_TAG_COLOR[tag] ?? 'var(--mn-ink-3)',
              opacity: 0.7,
            }}
          />
        ))}
      </div>
    </div>
  );
}

const ALL_TYPES = ['', 'careless', 'dontknow', 'concept', 'logic'];
const TYPE_LABELS: Record<string, string> = { '': '全部', careless: '粗心', dontknow: '不会', concept: '概念', logic: '逻辑' };

function ErrorJournalPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subject = searchParams.get('subject') ?? undefined;
  const [data,      setData]      = useState<ErrorJournalRes | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [askingId,  setAskingId]  = useState<string | null>(null);
  const [openId,    setOpenId]    = useState<string | null>(null);
  const [dueCount,  setDueCount]  = useState(0);
  const [dueKc,     setDueKc]     = useState<string | null>(null);

  const load = async (tag?: string) => {
    const sid = getUserId();
    if (!sid) { router.push('/login'); return; }
    setLoading(true);
    const res = await api.getErrorJournal(sid, { subject, ...(tag ? { error_type: tag } : {}) });
    setLoading(false);
    if (res.ok) setData(res.data);
    else setError(res.error);
  };

  useEffect(() => { void load(); }, []);

  // 到期重练：拉交错复习队列（间隔重复到期的知识点，快接口，不触发变式生成）
  useEffect(() => {
    const sid = getUserId();
    if (!sid) return;
    void api.getReviewQueue(sid).then((r) => {
      if (r.ok) { setDueCount(r.data.length); setDueKc(r.data[0]?.kc_id ?? null); }
    });
  }, []);

  const onTagChange = (tag: string) => {
    setFilterTag(tag);
    void load(tag);
  };

  const fmtDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="mn-skeleton" style={{ height: '90px', borderRadius: '16px' }} />
      {[1, 2, 3].map((i) => (
        <div key={i} className="mn-skeleton" style={{ height: '72px', borderRadius: '16px' }} />
      ))}
    </div>
  );

  if (error) return (
    <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--mn-ink-3)', fontSize: '14px' }}>
      加载失败 —{' '}
      <button type="button" onClick={() => void load(filterTag)} style={{ color: 'var(--mn-blue)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
        重试
      </button>
    </div>
  );

  const items = data?.items ?? [];
  const filtered = filterTag ? items.filter((i) => i.error_tag === filterTag) : items;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--mn-ink)', lineHeight: 1.2 }}>
          错题本
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--mn-ink-3)', marginTop: '2px' }}>
          整理错误，举一反三
        </p>
      </div>

      {/* 到期重练（间隔重复）：错题到记忆临界点时安排重练 */}
      {dueCount > 0 && (
        <button type="button"
          onClick={() => router.push(dueKc ? `/subjects/math/practice?ku_id=${encodeURIComponent(dueKc)}` : '/mastery')}
          style={{
            display: 'flex', alignItems: 'center', gap: '12px', width: '100%', textAlign: 'left',
            padding: '14px 16px', borderRadius: '14px', cursor: 'pointer',
            background: 'var(--mn-blue-dim, #eff6ff)', border: '1px solid var(--mn-blue)',
          }}>
          <span style={{ fontSize: '22px' }}>📅</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--mn-blue)' }}>{dueCount} 个知识点到期重练</div>
            <div style={{ fontSize: '12px', color: 'var(--mn-ink-3)', marginTop: '2px' }}>到了记忆临界点——现在重练记得最牢（间隔重复）</div>
          </div>
          <span style={{ color: 'var(--mn-blue)', fontSize: '16px' }}>›</span>
        </button>
      )}

      {/* 分布图 */}
      {data && <DistributionBar dist={data.distribution} />}

      {/* 筛选 tab */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
        {ALL_TYPES.filter((tag) => tag === '' || items.some((i) => i.error_tag === tag)).map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onTagChange(tag)}
            style={{
              padding: '6px 14px', borderRadius: '99px',
              fontSize: '13px', fontWeight: filterTag === tag ? 700 : 500,
              border: `1.5px solid ${filterTag === tag ? 'var(--mn-blue)' : 'var(--mn-border)'}`,
              background: filterTag === tag ? 'var(--mn-blue-dim)' : 'transparent',
              color: filterTag === tag ? 'var(--mn-blue)' : 'var(--mn-ink-2)',
              cursor: 'pointer', whiteSpace: 'nowrap',
              transition: 'all var(--mn-duration-fast)',
            }}
          >
            {TYPE_LABELS[tag]}
          </button>
        ))}
      </div>

      {/* 列表 */}
      {filtered.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--mn-ink-3)', fontSize: '14px' }}>
          {items.length === 0 ? (
            <>
              <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.4 }}>📭</div>
              <div style={{ marginBottom: '16px' }}>还没有错题——去做几道题，做错的会自动收进来</div>
              <button type="button" className="mn-btn-primary" onClick={() => router.push('/practice')}>去练习</button>
            </>
          ) : '这个类型暂时没有错题 ✨'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map((item) => (
            <div key={item.question_id} className="mn-card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* 头部：点击展开/收起 */}
              <button
                type="button"
                onClick={() => setOpenId(openId === item.question_id ? null : item.question_id)}
                style={{
                  width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer',
                  padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                    background: 'var(--mn-blue-dim)', color: 'var(--mn-blue)', flexShrink: 0,
                    maxWidth: '45%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {item.kc_name ?? item.kc_id}
                  </span>
                  {(item.wrong_count ?? 1) > 1 && (
                    <span style={{
                      padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                      background: 'var(--mn-orange-dim)', color: 'var(--mn-orange)', flexShrink: 0,
                    }}>错过{item.wrong_count}次</span>
                  )}
                  <span style={{ fontSize: '12px', color: 'var(--mn-ink-3)', marginLeft: 'auto', flexShrink: 0 }}>
                    {fmtDate(item.wrong_at)}
                  </span>
                  <span style={{
                    color: 'var(--mn-ink-3)', fontSize: '14px', flexShrink: 0,
                    transform: openId === item.question_id ? 'rotate(90deg)' : 'none', transition: 'transform .15s',
                  }}>›</span>
                </div>
                <div style={{
                  fontSize: '14px', color: 'var(--mn-ink)', lineHeight: 1.6,
                  ...(openId === item.question_id
                    ? {}
                    : { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }),
                }}>
                  {item.question_text ? <RichText>{item.question_text}</RichText> : '（暂无题干）'}
                </div>
              </button>

              {/* 展开：你的答案 + 正确答案 + 操作 */}
              {openId === item.question_id && (
                <div style={{
                  padding: '12px 16px 14px', display: 'flex', flexDirection: 'column', gap: '12px',
                  borderTop: '1px solid var(--mn-border)',
                }}>
                  {item.student_answer && (
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--mn-ink-3)', marginBottom: '3px', fontWeight: 600 }}>你的答案</div>
                      <div style={{ fontSize: '14px', color: 'var(--mn-red)' }}><RichText>{item.student_answer}</RichText></div>
                    </div>
                  )}
                  {item.correct_answer && (
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--mn-ink-3)', marginBottom: '3px', fontWeight: 600 }}>正确答案</div>
                      <div style={{ fontSize: '14px', color: 'var(--mn-green)' }}><RichText>{item.correct_answer}</RichText></div>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="mn-btn-secondary"
                      onClick={() => router.push(`/lesson?q=${encodeURIComponent(item.question_id)}`)}
                      style={{ fontSize: '12px', padding: '6px 12px' }}
                    >
                      📐 看讲解
                    </button>
                    <button
                      type="button"
                      className="mn-btn-secondary"
                      disabled={askingId === item.question_id}
                      onClick={async () => {
                        const sid = getUserId();
                        if (!sid) { router.push('/login'); return; }
                        setAskingId(item.question_id);
                        const res = await api.startSocratic(item.question_id, sid);
                        setAskingId(null);
                        if (res.ok) router.push(`/socratic?session_id=${res.data.session_id}&first_q=${encodeURIComponent(res.data.first_question)}`);
                      }}
                      style={{ fontSize: '12px', padding: '6px 12px', opacity: askingId === item.question_id ? 0.6 : 1 }}
                    >
                      {askingId === item.question_id ? '连接中…' : '问问AI'}
                    </button>
                    {item.can_practice_variant && (
                      <button
                        type="button"
                        className="mn-btn-secondary"
                        onClick={() => router.push(
                          item.subject === 'math'
                            ? `/subjects/math/practice?ku_id=${encodeURIComponent(item.kc_id)}${item.kc_name ? `&name=${encodeURIComponent(item.kc_name)}` : ''}`
                            : `/practice?subject=${encodeURIComponent(item.subject)}`
                        )}
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                      >
                        举一反三
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ErrorJournalPage() {
  return (
    <Suspense fallback={<div style={{ padding: '48px', textAlign: 'center', color: 'var(--mn-ink-3)' }}>加载中…</div>}>
      <ErrorJournalPageInner />
    </Suspense>
  );
}
