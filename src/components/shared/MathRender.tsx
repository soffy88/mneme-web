/**
 * MathRender — KaTeX LaTeX 渲染。
 *
 * 用法:
 *   <MathRender latex="c=\sqrt{a^2-b^2}" block />
 *   <MathRender latex="x^2+y^2=1" />  // inline
 *
 * 注意:
 *   - SSE 流式场景下 LaTeX 可能是 partial chunk,不要在流未结束时渲染
 *   - 渲染失败时 fallback 显示原始 LaTeX 字符串,不崩溃
 *   - block=true 用 katex.renderToString + display mode(居中大公式)
 */
'use client';

import { useMemo } from 'react';
import katex from 'katex';

export function MathRender({
  latex,
  block = false,
  className,
}: {
  latex: string;
  block?: boolean;
  className?: string;
}) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, {
        displayMode: block,
        throwOnError: false,
        trust: false,
        strict: false,
      });
    } catch {
      return null;
    }
  }, [latex, block]);

  if (!html) {
    return (
      <code className={['font-mono text-sm opacity-70', className ?? ''].join(' ')}>
        {latex}
      </code>
    );
  }

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
      aria-label={`数学公式: ${latex}`}
    />
  );
}
