'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getUserId } from '@/lib/auth-store';
import * as api from '@/lib/api-client';
import { RichText } from '@/components/shared/RichText';
import type { ErrorJournalItem, PracticeItem } from '@/types/api';

function PrintPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subject = searchParams.get('subject') ?? undefined;

  const [items,           setItems]           = useState<ErrorJournalItem[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState('');
  const [hideAnswers,     setHideAnswers]     = useState(false);
  const [includeVariants, setIncludeVariants] = useState(false);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [variants,        setVariants]        = useState<Record<string, PracticeItem | null>>({});

  useEffect(() => {
    const sid = getUserId();
    if (!sid) { router.push('/login'); return; }
    api.getErrorJournal(sid, { subject, limit: 50 }).then((r) => {
      setLoading(false);
      if (r.ok) setItems(r.data.items);
      else setError(r.error);
    });
  }, [router, subject]);

  const fetchVariants = useCallback(async () => {
    setVariantsLoading(true);
    const pairs = await Promise.all(
      items.filter((it) => it.can_practice_variant).map(async (it) => {
        const res = await api.generatePractice(it.kc_id, 1, 0.5);
        return [it.question_id, res.ok ? (res.data.items[0] ?? null) : null] as const;
      })
    );
    setVariants(Object.fromEntries(pairs));
    setVariantsLoading(false);
  }, [items]);

  const onToggleVariants = (checked: boolean) => {
    setIncludeVariants(checked);
    if (checked && Object.keys(variants).length === 0) void fetchVariants();
  };

  if (loading) return <div style={{ padding: '48px', textAlign: 'center', color: 'var(--mn-ink-3)' }}>加载中…</div>;
  if (error) return <div style={{ padding: '48px', textAlign: 'center', color: 'var(--mn-red)' }}>加载失败 — {error}</div>;

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '24px 16px 60px', fontFamily: 'var(--mn-font-body)' }}>
      <div className="no-print" style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px',
        padding: '14px 16px', borderRadius: '12px', background: 'var(--mn-surface)',
        border: '1px solid var(--mn-border)', marginBottom: '20px',
      }}>
        <button type="button" onClick={() => router.back()}
          style={{ background: 'none', border: 'none', color: 'var(--mn-ink-2)', cursor: 'pointer', fontSize: '14px' }}>
          ← 返回
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--mn-ink-2)', cursor: 'pointer' }}>
          <input type="checkbox" checked={hideAnswers} onChange={(e) => setHideAnswers(e.target.checked)} />
          隐藏答案（供重做）
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--mn-ink-2)', cursor: 'pointer' }}>
          <input type="checkbox" checked={includeVariants} onChange={(e) => onToggleVariants(e.target.checked)} />
          包含变式题{variantsLoading ? '（生成中…）' : ''}
        </label>
        <button
          type="button"
          onClick={() => window.print()}
          className="mn-btn-primary"
          style={{ marginLeft: 'auto', padding: '8px 18px', fontSize: '13px' }}
        >
          🖨 打印/另存为 PDF
        </button>
      </div>

      <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--mn-ink)', margin: '0 0 4px' }}>
        错题重做单
      </h1>
      <p style={{ fontSize: '12px', color: 'var(--mn-ink-3)', margin: '0 0 20px' }}>
        共 {items.length} 道{subject ? ` · ${subject}` : ''}
      </p>

      {items.length === 0 ? (
        <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--mn-ink-3)' }}>暂无错题</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {items.map((item, i) => {
            const variant = variants[item.question_id];
            return (
              <div key={item.question_id} style={{ pageBreakInside: 'avoid', borderBottom: '1px solid var(--mn-border)', paddingBottom: '14px' }}>
                <div style={{ fontSize: '11px', color: 'var(--mn-ink-3)', marginBottom: '6px' }}>
                  第 {i + 1} 题 · {item.kc_name ?? item.kc_id}
                  {(item.wrong_count ?? 1) > 1 && ` · 错过${item.wrong_count}次`}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--mn-ink)', lineHeight: 1.7 }}>
                  <RichText>{item.question_text}</RichText>
                </div>
                {!hideAnswers && (
                  <div style={{ marginTop: '8px', fontSize: '13px' }}>
                    {item.student_answer && (
                      <div style={{ color: 'var(--mn-ink-2)' }}>你的答案：<RichText>{item.student_answer}</RichText></div>
                    )}
                    {item.correct_answer && (
                      <div style={{ color: 'var(--mn-green, #16a34a)', marginTop: '2px' }}>正确答案：<RichText>{item.correct_answer}</RichText></div>
                    )}
                  </div>
                )}

                {includeVariants && item.can_practice_variant && (
                  <div style={{ marginTop: '12px', paddingLeft: '12px', borderLeft: '2px solid var(--mn-border)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--mn-ink-3)', marginBottom: '4px' }}>变式题</div>
                    {variant === undefined ? (
                      <div style={{ fontSize: '12px', color: 'var(--mn-ink-3)' }}>生成中…</div>
                    ) : variant === null ? (
                      <div style={{ fontSize: '12px', color: 'var(--mn-ink-3)' }}>暂未生成成功</div>
                    ) : (
                      <>
                        <div style={{ fontSize: '14px', color: 'var(--mn-ink)', lineHeight: 1.7 }}>
                          <RichText>{`$$${variant.question_latex}$$`}</RichText>
                        </div>
                        {!hideAnswers && (
                          <div style={{ fontSize: '13px', color: 'var(--mn-green, #16a34a)', marginTop: '6px' }}>
                            答案：<RichText>{`$$${variant.answer}$$`}</RichText>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @media print {
          .no-print { display: none !important; }
          header, nav { display: none !important; }
          body { background: #fff; }
        }
      `}</style>
    </div>
  );
}

export default function ErrorJournalPrintPage() {
  return (
    <Suspense fallback={<div style={{ padding: '48px', textAlign: 'center', color: 'var(--mn-ink-3)' }}>加载中…</div>}>
      <PrintPageInner />
    </Suspense>
  );
}
