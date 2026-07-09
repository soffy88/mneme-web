'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import KnowledgeMap from '@/components/student/KnowledgeMap';
import type { KnowledgeUnitItem } from '@/types/api';

export default function ChineseLessonPage() {
  const router = useRouter();

  const handleJumpPractice = useCallback((kuId: string) => {
    router.push(`/practice/session?subject=chinese&ku_id=${encodeURIComponent(kuId)}`);
  }, [router]);

  const handleJumpReader = useCallback((fileId: string) => {
    router.push(`/reader/${encodeURIComponent(fileId)}`);
  }, [router]);

  const handleJumpReadingGuide = useCallback((kuId: string) => {
    router.push(`/subjects/chinese/reading?ku_id=${encodeURIComponent(kuId)}`);
  }, [router]);

  return (
    <KnowledgeMap
      subject="chinese"
      title="语文知识点地图"
      onBack={() => router.back()}
      onJumpPractice={handleJumpPractice}
      onJumpReader={handleJumpReader}
      onJumpReadingGuide={handleJumpReadingGuide}
    />
  );
}
