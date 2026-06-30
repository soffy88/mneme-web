'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 物理专项练习走统一选题页（题库已就绪）。保留此路由做兼容重定向。
export default function Page() {
  const router = useRouter();
  useEffect(() => { router.replace('/practice?subject=physics'); }, [router]);
  return null;
}
