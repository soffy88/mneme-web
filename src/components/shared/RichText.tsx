'use client';

import { Fragment, useMemo } from 'react';
import katex from 'katex';

// 混排文本：把 $...$ / $$...$$ 段渲染成 KaTeX，其余按纯文本（含中文）原样显示。
// 题库题干是"中文 + 内联 LaTeX"，不能整段当公式渲染（会花），需逐段解析。

function renderMath(tex: string, block: boolean): string {
  try {
    return katex.renderToString(tex, { displayMode: block, throwOnError: false, strict: false, trust: false });
  } catch {
    return tex;
  }
}

export function RichText({ children, style }: { children: string | null | undefined; style?: React.CSSProperties }) {
  const text = children ?? '';
  const parts = useMemo(() => {
    const out: Array<{ t: 'text' | 'math'; v: string; block?: boolean }> = [];
    const re = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) out.push({ t: 'text', v: text.slice(last, m.index) });
      if (m[1] != null) out.push({ t: 'math', v: m[1], block: true });
      else out.push({ t: 'math', v: m[2] ?? '', block: false });
      last = re.lastIndex;
    }
    if (last < text.length) out.push({ t: 'text', v: text.slice(last) });
    return out;
  }, [text]);

  return (
    <span style={{ whiteSpace: 'pre-wrap', ...style }}>
      {parts.map((p, i) =>
        p.t === 'text'
          ? <Fragment key={i}>{p.v}</Fragment>
          : <span key={i} dangerouslySetInnerHTML={{ __html: renderMath(p.v, !!p.block) }} />,
      )}
    </span>
  );
}
