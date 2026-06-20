'use client';

import { SubjectHub, type SubjectConfig } from '@/components/student/SubjectHub';

const CONFIG: SubjectConfig = {
  subject: 'physics',
  title: '物理',
  emoji: '⚛️',
  sections: [
    {
      phase: '执行',
      color: '#16a34a',
      bg: '#f0fdf4',
      cards: [
        { icon: '✐', title: '知识点讲解', desc: '分考点精讲例题', href: '/subjects/physics/lesson' },
        { icon: '∑', title: '公式手册', desc: '物理公式速查', href: '/subjects/physics/formula' },
        { icon: '→', title: '受力分析引导', desc: '结构化受力分析', href: '/subjects/physics/force-analysis' },
        { icon: '✏', title: '专题练习', desc: '按考点分层练习', href: '/subjects/physics/practice' },
        { icon: '⊕', title: '拍照解题', desc: '拍下题目秒出解析', href: '/upload' },
      ],
    },
    {
      phase: '反思',
      color: 'var(--mn-orange)',
      bg: 'var(--mn-orange-dim)',
      cards: [
        { icon: '◈', title: '错题本', desc: '整理错误举一反三', href: '/error-journal?subject=physics' },
        { icon: '↺', title: '变式复习', desc: '到期知识点变式巩固', href: '/practice?subject=physics' },
        { icon: '◧', title: '真题模考', desc: '高考真题专项训练', href: '/subjects/physics/exam' },
      ],
    },
    {
      phase: '独立功能',
      color: '#6d28d9',
      bg: '#ede9fe',
      cards: [
        { icon: '🔬', title: '虚拟实验室', desc: '物理实验交互模拟', href: '/subjects/physics/lab' },
      ],
    },
  ],
};

export default function PhysicsPage() {
  return <SubjectHub config={CONFIG} />;
}
