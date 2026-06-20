'use client';

import { useRouter } from 'next/navigation';

const SUBJECTS = [
  { slug: 'math',    emoji: '📐', title: '数学', desc: '函数、几何、概率…' },
  { slug: 'physics', emoji: '⚛️', title: '物理', desc: '力学、电磁、光学…' },
  { slug: 'english', emoji: '🔤', title: '英语', desc: '词汇、听力、阅读…' },
  { slug: 'chinese', emoji: '📝', title: '语文', desc: '文言、诗词、写作…' },
] as const;

export default function SubjectsHubPage() {
  const router = useRouter();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--mn-ink)' }}>
          学科中心
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--mn-ink-3)', marginTop: '4px' }}>
          选择学科，进入专属学习空间
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {SUBJECTS.map((s) => (
          <button
            key={s.slug}
            type="button"
            className="mn-card mn-card-interactive"
            onClick={() => router.push(`/subjects/${s.slug}`)}
            style={{
              width: '100%', textAlign: 'left', cursor: 'pointer',
              padding: '20px 16px',
              display: 'flex', flexDirection: 'column', gap: '8px',
            }}
          >
            <span style={{ fontSize: '32px', lineHeight: 1 }}>{s.emoji}</span>
            <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--mn-ink)', letterSpacing: '-0.02em' }}>
              {s.title}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--mn-ink-3)' }}>
              {s.desc}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
