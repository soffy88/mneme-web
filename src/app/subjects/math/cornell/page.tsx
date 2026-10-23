'use client';

import { useRouter } from 'next/navigation';
import { listTopicSummaries } from '@/lib/cornell/topics';

export default function CornellIndexPage() {
  const router = useRouter();
  const topics = listTopicSummaries();

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px 48px' }}>
      <button
        type="button"
        onClick={() => router.push('/subjects/math')}
        style={{
          fontSize: 12,
          padding: '4px 10px',
          borderRadius: 8,
          border: '1px solid var(--mn-border)',
          background: 'var(--mn-surface)',
          color: 'var(--mn-ink-2)',
          cursor: 'pointer',
          marginBottom: 14,
        }}
      >
        ← 数学
      </button>

      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--mn-blue)', margin: 0 }}>
        康奈尔笔记
      </h1>
      <p style={{ fontSize: 13, color: 'var(--mn-ink-3)', margin: '6px 0 18px', lineHeight: 1.55 }}>
        线索提问 → 闭卷回忆 → 对照笔记 → 自报进度。
        进度保存在本机；自报「已掌握」不是系统掌握度，真掌握请去做练习或 JOL 自测。
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {topics.map((t) => (
          <button
            key={t.topicId}
            type="button"
            onClick={() => router.push(`/subjects/math/cornell/${t.topicId}`)}
            style={{
              textAlign: 'left',
              padding: '14px 16px',
              borderRadius: 12,
              border: '1px solid var(--mn-border)',
              background: 'var(--mn-surface)',
              boxShadow: 'var(--mn-shadow-xs)',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--mn-ink)' }}>
              {t.title}
            </div>
            {t.subtitle && (
              <div style={{ fontSize: 12, color: 'var(--mn-ink-3)', marginTop: 2 }}>
                {t.subtitle}
              </div>
            )}
            <div style={{ fontSize: 11, color: 'var(--mn-ink-3)', marginTop: 8 }}>
              {t.grade ?? t.subject} · {t.cueCount} 问 · {t.moduleCount} 模块
            </div>
          </button>
        ))}
        {topics.length === 0 && (
          <p style={{ fontSize: 13, color: 'var(--mn-ink-3)' }}>暂无课题</p>
        )}
      </div>
    </div>
  );
}
