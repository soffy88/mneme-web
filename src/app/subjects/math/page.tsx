'use client';

import { SubjectHub, type SubjectConfig } from '@/components/student/SubjectHub';

const CONFIG: SubjectConfig = {
  subject: 'math',
  title: '数学',
  emoji: '📐',
  sections: [
    {
      phase: '执行',
      color: '#16a34a',
      bg: '#f0fdf4',
      cards: [
        { icon: '✐', title: '知识点讲解', desc: '分考点精讲例题', href: '/subjects/math/lesson' },
        { icon: '∑', title: '公式手册', desc: '高考公式速查', href: '/subjects/math/formula' },
        { icon: '✏', title: '专题练习', desc: '按考点分层练习', href: '/subjects/math/practice' },
        { icon: '⊕', title: '拍照解题', desc: '拍下题目秒出解析', href: '/upload' },
        { icon: '◌', title: '苏格拉底答疑', desc: '引导而非直接告知', href: '/socratic' },
      ],
    },
    {
      phase: '反思',
      color: 'var(--mn-orange)',
      bg: 'var(--mn-orange-dim)',
      cards: [
        { icon: '◈', title: '错题本', desc: '整理错误举一反三', href: '/error-journal?subject=math' },
        { icon: '↺', title: '变式复习', desc: '到期知识点变式巩固', href: '/practice?subject=math' },
        { icon: '◧', title: '真题模考', desc: '高考真题专项训练', href: '/subjects/math/exam' },
      ],
    },
  ],
};

export default function MathPage() {
  return <SubjectHub config={CONFIG} />;
}
