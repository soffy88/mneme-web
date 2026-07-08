'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import * as api from '@/lib/api-client';
import { getUserId } from '@/lib/auth-store';
import KnowledgeMap from '@/components/student/KnowledgeMap';
import type { KnowledgeUnitItem } from '@/types/api';

export default function PhysicsLessonPage() {
  const router = useRouter();

  const handleJumpPractice = useCallback((kuId: string) => {
    router.push(`/subjects/physics/practice?ku_id=${encodeURIComponent(kuId)}`);
  }, [router]);

  const handleJumpForceAnalysis = useCallback((kuId: string) => {
    router.push(`/subjects/physics/force-analysis?ku_id=${encodeURIComponent(kuId)}`);
  }, [router]);

  const handleJumpReader = useCallback((fileId: string) => {
    router.push(`/reader/${encodeURIComponent(fileId)}`);
  }, [router]);

  const handleStartSocratic = useCallback(async (ku: KnowledgeUnitItem) => {
    const studentId = getUserId();
    if (!studentId) { router.push('/login'); return; }
    const res = await api.startSocraticForKu(ku.id, studentId);
    if (!res.ok) { alert('无法启动引导：' + res.error); return; }
    router.push(`/socratic?session_id=${res.data.session_id}&first_q=${encodeURIComponent(res.data.first_question)}`);
  }, [router]);

  return (
    <KnowledgeMap
      subject="physics"
      title="物理知识点地图"
      onBack={() => router.back()}
      onJumpPractice={handleJumpPractice}
      onJumpReader={handleJumpReader}
      onStartSocratic={handleStartSocratic}
      onJumpForceAnalysis={handleJumpForceAnalysis}
    />
  );
}
