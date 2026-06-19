'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserId } from '@/lib/auth-store';
import * as api from '@/lib/api-client';
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

export default function ErrorJournalPage() {
  const router = useRouter();
  const [data,      setData]      = useState<ErrorJournalRes | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [filterTag, setFilterTag] = useState('');

  const load = async (tag?: string) => {
    const sid = getUserId();
    if (!sid) { router.push('/login'); return; }
    setLoading(true);
    const res = await api.getErrorJournal(sid, tag ? { error_type: tag } : undefined);
    setLoading(false);
    if (res.ok) setData(res.data);
    else setError(res.error);
  };

  useEffect(() => { void load(); }, []);

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

      {/* 分布图 */}
      {data && <DistributionBar dist={data.distribution} />}

      {/* 筛选 tab */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
        {ALL_TYPES.map((tag) => (
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
          {items.length === 0
            ? '还没有错题记录，继续加油！'
            : '这个类型暂时没有错题 ✨'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map((item) => (
            <div
              key={item.question_id}
              className="mn-card"
              style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}
            >
              {/* 错误类型标签 */}
              <span style={{
                padding: '3px 9px', borderRadius: '99px', fontSize: '12px', fontWeight: 600,
                background: ERROR_TAG_BG[item.error_tag] ?? 'var(--mn-surface)',
                color: ERROR_TAG_COLOR[item.error_tag] ?? 'var(--mn-ink-2)',
                border: '1px solid var(--mn-border)',
                flexShrink: 0,
              }}>
                {ERROR_TAG_LABEL[item.error_tag] ?? item.error_tag}
              </span>

              {/* KC 名 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--mn-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.kc_id}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--mn-ink-3)', marginTop: '2px' }}>
                  {fmtDate(item.wrong_at)}
                </div>
              </div>

              {/* 举一反三按钮 */}
              {item.can_practice_variant && (
                <button
                  type="button"
                  className="mn-btn-secondary"
                  onClick={() => router.push(`/practice?kc=${encodeURIComponent(item.kc_id)}`)}
                  style={{ fontSize: '12px', padding: '6px 12px', flexShrink: 0 }}
                >
                  举一反三
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
