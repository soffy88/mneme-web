'use client';

import { SubjectHub, type SubjectConfig } from '@/components/student/SubjectHub';

const CONFIG: SubjectConfig = {
  subject: 'chinese',
  title: '语文',
  emoji: '📝',
  sections: [
    {
      phase: '执行',
      color: '#16a34a',
      bg: '#f0fdf4',
      cards: [
        { icon: '✐', title: '知识体系', desc: '8040 个知识点，初中+高中全11册', href: '/subjects/chinese/lesson' },
        { icon: '古', title: '文言实词本', desc: '1616条实词 · 多义项结构', href: '/subjects/chinese/classical-words' },
        { icon: '成', title: '成语本', desc: '1136条成语 · 浏览+FSRS背诵', href: '/subjects/chinese/idioms' },
        { icon: '诗', title: '古诗文诵读', desc: '必背古诗文精讲', href: '/subjects/chinese/poetry' },
        { icon: '📖', title: '阅读理解引导', desc: '引导式文本分析', href: '/subjects/chinese/reading' },
        { icon: '◌', title: '苏格拉底答疑', desc: '引导而非直接告知', href: '/socratic' },
        { icon: '字', title: '字词典', desc: '成语·文化常识·汉字检索', href: '/subjects/chinese/dictionary', disabled: true },
        { icon: '📖', title: '教材阅读', desc: '高亮·笔记·知识点', href: '/library' },
      ],
    },
    {
      phase: '反思',
      color: 'var(--mn-orange)',
      bg: 'var(--mn-orange-dim)',
      cards: [
        { icon: '◈', title: '错题本', desc: '整理错误举一反三', href: '/error-journal?subject=chinese' },
        { icon: '↺', title: '变式复习', desc: '到期知识点变式巩固', href: '/practice?subject=chinese' },
        { icon: '◧', title: '真题模考', desc: '高考真题专项训练', href: '/subjects/chinese/exam', disabled: true },
      ],
    },
    {
      phase: '作文引导',
      color: '#6d28d9',
      bg: '#ede9fe',
      cards: [
        { icon: '✎', title: '作文引导', desc: '引导式作文分析反馈', href: '/essay' },
      ],
    },
  ],
};

export default function ChinesePage() {
  return <SubjectHub config={CONFIG} />;
}
