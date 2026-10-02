'use client';

/**
 * WordEnrichmentPanel —— 词根词缀 + 象形9000 的展示层。
 *
 * 这个组件存在的唯一理由：**不让「记忆联想」与「词源事实」同屏同权**。
 *
 * 库内 379 条词缀分解的权威来源只是散文里「词根/前缀/后缀」的标注，不是历史语言学
 * ——散文自身就常把词干/后缀写成「词根」（careless→less、chinese→ese、colour→col）。
 * 所以三档必须真的渲染出区别：
 *
 *   reference_confirmed  与教学参考词根表一致 → 当**词源**讲，可正常字重/颜色
 *   mnemonic_association 人为联想            → 必须带「记忆联想」标注
 *   disputed             与参考表冲突        → **默认不展示**（任何一方都可能错）
 *
 * 象形9000 的音标是粗 ASCII 转写（['erb]），不是标准 IPA，且 ownership_verified
 * 为 false 的条目多为 OCR 形近字误读，须降级 —— 两点都不许伪装成已校对内容。
 */

import { useEffect, useState } from 'react';
import * as mcp from '@/lib/mcp-client';
import type { WordEnrichment } from '@/lib/mcp-client';

const LABEL: Record<string, string> = {
  mnemonic_association: '记忆联想',
  disputed: '存疑',
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 8, fontSize: 13, lineHeight: 1.7 }}>
      <span style={{ flexShrink: 0, width: 52, color: '#94a3b8' }}>{label}</span>
      <span style={{ color: '#334155' }}>{value}</span>
    </div>
  );
}

function AffixBlock({ affix }: { affix: mcp.WordAffix }) {
  // disputed：与参考表冲突时任何一方都可能错，默认不展示而不是挑一个显示。
  if (!affix.should_display) return null;

  const bearing = affix.is_source_bearing;
  const label = LABEL[affix.etymology_status];
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 4,
      padding: '8px 10px', borderRadius: 8,
      // 联想档整块降饱和 + 虚线边，视觉上就与「词源」分开
      background: bearing ? '#f8fafc' : '#fffbeb',
      border: `1px ${bearing ? 'solid' : 'dashed'} ${bearing ? '#e2e8f0' : '#fcd34d'}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
        <span style={{
          fontSize: 14, fontWeight: bearing ? 700 : 600,
          color: bearing ? '#1e293b' : '#92400e',
          fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        }}>{affix.chain}</span>
        {label && (
          <span style={{
            fontSize: 10, padding: '1px 6px', borderRadius: 4,
            background: '#fef3c7', color: '#92400e', fontWeight: 700,
          }}>{label}</span>
        )}
      </div>
      {affix.meaning_cn && <Row label="含义" value={affix.meaning_cn} />}
      {affix.origin && <Row label="来源语" value={affix.origin} />}
      {!bearing && (
        <p style={{ fontSize: 11, color: '#92400e', margin: 0, lineHeight: 1.6 }}>
          这是记忆联想，不是历史词源 —— 仅作拆分提示，别当词源背。
        </p>
      )}
    </div>
  );
}

function XiangxingBlock({ x }: { x: mcp.WordXiangxing }) {
  const ok = x.ownership_verified;
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 4,
      padding: '8px 10px', borderRadius: 8,
      background: '#fff', border: `1px ${ok ? 'solid' : 'dashed'} ${ok ? '#e2e8f0' : '#fdba74'}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>
          象形9000
        </span>
        {x.ipa_ascii && (
          // 明确标注「近似读音」：粗 ASCII 转写不等于标准 IPA，学生照读会跑调。
          <span style={{ fontSize: 12, color: '#64748b' }}>近似读音 {x.ipa_ascii}</span>
        )}
        {!ok && (
          <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: '#fff7ed', color: '#c2410c', fontWeight: 700 }}>
            归属待校对
          </span>
        )}
      </div>
      <Row label="释义" value={x.meaning_cn} />
      {x.example_en && <Row label="例句" value={x.example_en} />}
      {x.example_cn && <Row label="译文" value={x.example_cn} />}
    </div>
  );
}

export default function WordEnrichmentPanel({ word }: { word: string }) {
  const [data, setData] = useState<WordEnrichment | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'none' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    setState('loading');
    mcp.mcp.getWordEnrichment(word)
      .then(d => {
        if (cancelled) return;
        setData(d);
        // 两层都没有就整块不渲染，不留空占位。
        setState(d.found && (d.affix || d.xiangxing) ? 'ready' : 'none');
      })
      .catch(() => { if (!cancelled) setState('error'); });
    return () => { cancelled = true; };
  }, [word]);

  if (state === 'loading') {
    return <p style={{ fontSize: 12, color: '#cbd5e1', margin: 0 }}>加载中…</p>;
  }
  if (state === 'error') {
    // 呈现层取不到不该打断词表本身
    return <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>增强信息暂时取不到</p>;
  }
  if (state === 'none' || !data) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
      {data.affix && <AffixBlock affix={data.affix} />}
      {data.xiangxing && <XiangxingBlock x={data.xiangxing} />}
    </div>
  );
}