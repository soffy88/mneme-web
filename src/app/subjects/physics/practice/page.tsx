'use client';
import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// 兼容重定向：带 ku_id 转发到通用练习引擎(/practice/session)落到具体题目；
// 不带 ku_id（旧链接/无来源）落通用选题页。
function RedirectInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const kuId = searchParams.get('ku_id');
  useEffect(() => {
    if (kuId) router.replace(`/practice/session?subject=physics&ku_id=${encodeURIComponent(kuId)}`);
    else router.replace('/practice?subject=physics');
  }, [router, kuId]);
  return null;
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <RedirectInner />
    </Suspense>
  );
}
