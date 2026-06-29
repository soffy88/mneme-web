'use client';

import { SubjectHub, type SubjectConfig } from '@/components/student/SubjectHub';

const CONFIG: SubjectConfig = {
  subject: 'english',
  title: '英语',
  emoji: '🔤',
  sections: [
    {
      phase: '执行',
      color: '#16a34a',
      bg: '#f0fdf4',
      cards: [
        { icon: '📚', title: '单词本', desc: '高考词汇记忆', href: '/subjects/english/vocabulary', disabled: true },
        { icon: '🎧', title: '听力练习', desc: '真题听力专项', href: '/subjects/english/listening', disabled: true },
        { icon: '✐', title: '语法讲解', desc: '语法考点精讲', href: '/subjects/english/grammar', disabled: true },
        { icon: '📖', title: '阅读理解引导', desc: '引导式文本分析', href: '/subjects/english/reading' },
        { icon: '◌', title: '苏格拉底答疑', desc: '引导而非直接告知', href: '/socratic' },
        { icon: '📖', title: '教材阅读', desc: '高亮·笔记·知识点', href: '/library' },
      ],
    },
    {
      phase: '反思',
      color: 'var(--mn-orange)',
      bg: 'var(--mn-orange-dim)',
      cards: [
        { icon: '◈', title: '错题本', desc: '整理错误举一反三', href: '/error-journal?subject=english' },
        { icon: '↺', title: '变式复习', desc: '到期知识点变式巩固', href: '/practice?subject=english', disabled: true },
        { icon: '◧', title: '真题模考', desc: '高考真题专项训练', href: '/subjects/english/exam', disabled: true },
      ],
    },
    {
      phase: '口语陪练',
      color: '#0891b2',
      bg: '#e0f2fe',
      cards: [
        { icon: '◉', title: '口语陪练', desc: 'AI真人对话练习', href: '/speaking', disabled: true },
      ],
    },
  ],
};

export default function EnglishPage() {
  return <SubjectHub config={CONFIG} />;
}
