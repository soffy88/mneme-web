'use client';

// CitationNote —— Book Engine 引用三态标注（W3 Part B B4，honesty-first 的实体）。
// 收编自 mneme-studio。后端已滤 <0.60 挂接，前端只区分两态：
//   verified            —— 人工确认过（绿）
//   inferred_unverified —— 电脑猜的，还没人核对过（黄，默认态）
// 文案给学生/家长看，点开（<details>）才展示 pdf_id/页码/字符区间等技术细节。

import type { BookCitation } from '@/lib/mcp-client';

const STATE_COPY: Record<
  BookCitation['citation_state'],
  { label: string; hint: string; bg: string; fg: string }
> = {
  verified: {
    label: '✓ 老师核对过',
    hint: '这段引用的课本原文，已经有人核对过是真的对应这个知识点。',
    bg: 'var(--o-color-success-subtle,#e6f7e6)',
    fg: 'var(--o-color-success,#0a0)',
  },
  inferred_unverified: {
    label: '📖 电脑猜的，没人核对过',
    hint: '这段引用是电脑自动从课本里找出来的，猜的不一定对，还没有老师核对过。',
    bg: 'var(--o-color-warning-subtle,#fdf3d9)',
    fg: 'var(--o-color-warning,#b70)',
  },
};

export function CitationNote({ citation }: { citation: BookCitation }) {
  const copy = STATE_COPY[citation.citation_state];
  const bookName = citation.textbook_meta?.book_name || '课本';
  const pageLabel = citation.page_number ? `第 ${citation.page_number} 页` : '页码未知';

  return (
    <details
      className="rounded-lg border text-sm"
      style={{ borderColor: copy.bg }}
      data-testid="citation-note"
      data-citation-state={citation.citation_state}
    >
      <summary
        className="cursor-pointer rounded-lg px-3 py-1.5 list-none flex items-center gap-2"
        style={{ background: copy.bg, color: copy.fg }}
      >
        <span>{copy.label}</span>
        <span className="text-xs opacity-70">出处：{bookName} {pageLabel}</span>
      </summary>
      <div className="px-3 py-2 space-y-2 text-[var(--o-color-fg-muted,#666)]">
        <p>{copy.hint}</p>
        <blockquote className="border-l-2 pl-2 text-xs whitespace-pre-wrap">
          {citation.content.slice(0, 200)}
          {citation.content.length > 200 ? '…' : ''}
        </blockquote>
        <p className="font-mono text-[11px] opacity-60" data-testid="citation-technical">
          pdf_id={citation.pdf_id} · page={citation.page_number ?? '-'} · char_span=[
          {citation.char_start ?? '-'},{citation.char_end ?? '-'}) · score={citation.score.toFixed(2)}
        </p>
      </div>
    </details>
  );
}
