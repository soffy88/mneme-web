'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import CornellPlayer from '@/components/cornell/CornellPlayer';
import { getTopic } from '@/lib/cornell/topics';

export default function CornellTopicPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = use(params);
  const router = useRouter();
  const content = getTopic(topicId);

  if (!content) {
    return (
      <div style={{ maxWidth: 480, margin: '48px auto', padding: 16, textAlign: 'center' }}>
        <p style={{ color: 'var(--mn-ink-2)', marginBottom: 12 }}>未找到课题「{topicId}」</p>
        <button
          type="button"
          onClick={() => router.push('/subjects/math/cornell')}
          style={{
            fontSize: 13,
            padding: '8px 14px',
            borderRadius: 8,
            border: '1px solid var(--mn-border)',
            background: 'var(--mn-surface)',
            cursor: 'pointer',
          }}
        >
          返回列表
        </button>
      </div>
    );
  }

  return <CornellPlayer content={content} />;
}
