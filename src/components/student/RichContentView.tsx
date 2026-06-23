'use client';

/**
 * RichContentView — 渲染 KU 的 rich_content 结构化"讲透"内容。
 *
 * 支持:
 * - 行内 LaTeX: $...$
 * - 块级 LaTeX: $$...$$
 * - 按 ku_type 展示不同字段分组
 * - 易错点高亮
 * - 默认折叠次要字段
 */

import { useState, Fragment } from 'react';
import { MathRender } from '@/components/shared/MathRender';

// ── LaTeX 文本渲染 ────────────────────────────────────────────────

function RichText({ text }: { text: string }) {
  if (!text) return null;

  // Split on $$...$$ first (block), then $...$ (inline)
  const blockParts = text.split(/(\$\$[\s\S]*?\$\$)/g);
  return (
    <span>
      {blockParts.map((part, i) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const latex = part.slice(2, -2);
          return <MathRender key={i} latex={latex} block />;
        }
        // handle inline $...$
        const inlineParts = part.split(/(\$[^$\n]+?\$)/g);
        return (
          <Fragment key={i}>
            {inlineParts.map((s, j) => {
              if (s.startsWith('$') && s.endsWith('$') && s.length > 2) {
                return <MathRender key={j} latex={s.slice(1, -1)} />;
              }
              return <span key={j}>{s}</span>;
            })}
          </Fragment>
        );
      })}
    </span>
  );
}

// ── 通用子组件 ────────────────────────────────────────────────────

const S = {
  sectionLabel: {
    fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em',
    color: 'var(--mn-ink-3)', marginBottom: '6px',
    textTransform: 'uppercase' as const,
  },
  body: {
    fontSize: '13px', color: 'var(--mn-ink)', lineHeight: 1.75,
  },
  bullet: (warn: boolean) => ({
    padding: '5px 10px', borderRadius: '8px', fontSize: '13px', lineHeight: 1.65,
    background: warn ? 'rgba(255,59,48,0.06)' : 'var(--mn-surface)',
    borderLeft: warn ? '3px solid #ff3b30' : '3px solid var(--mn-border)',
    color: 'var(--mn-ink)',
  }),
  formulaBox: {
    padding: '10px 14px', borderRadius: '10px', fontSize: '15px',
    background: 'rgba(10,132,255,0.06)', border: '1px solid rgba(10,132,255,0.2)',
    color: 'var(--mn-ink)', lineHeight: 1.8,
  },
  intuitionBox: {
    padding: '10px 14px', borderRadius: '10px',
    background: 'rgba(52,199,89,0.07)', border: '1px solid rgba(52,199,89,0.2)',
    fontSize: '13px', color: 'var(--mn-ink)', lineHeight: 1.75,
  },
};

function BulletList({ items, warn = false }: { items: string[]; warn?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      {items.map((item, i) => (
        <div key={i} style={S.bullet(warn)}>
          <RichText text={item} />
        </div>
      ))}
    </div>
  );
}

function Section({
  label, children, defaultOpen = true,
}: { label: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '4px', width: '100%',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: '6px',
        }}
      >
        <span style={S.sectionLabel}>{label}</span>
        <span style={{ fontSize: '10px', color: 'var(--mn-ink-3)', marginLeft: 'auto' }}>
          {open ? '▾' : '▸'}
        </span>
      </button>
      {open && children}
    </div>
  );
}

function TextField({ value }: { value: string }) {
  return <div style={S.body}><RichText text={value} /></div>;
}

// ── 布局配置 per ku_type ──────────────────────────────────────────

type RC = Record<string, string | string[]>;
type SectionDef = {
  label: string;
  keys: string[];
  defaultOpen?: boolean;
  warn?: boolean;
};

const SCHEMA: Record<string, SectionDef[]> = {
  concept: [
    { label: '直觉引入', keys: ['intuition'], defaultOpen: true },
    { label: '关键点', keys: ['key_points'], defaultOpen: true },
    { label: '精确定义', keys: ['definition'], defaultOpen: true },
    { label: '正例', keys: ['examples'], defaultOpen: false },
    { label: '反例与区别', keys: ['counter_examples'], defaultOpen: false },
    { label: '⚠️ 易错点', keys: ['common_mistakes'], defaultOpen: true, warn: true },
    { label: '联系', keys: ['connections'], defaultOpen: false },
    { label: '考查方式', keys: ['application'], defaultOpen: false },
  ],
  formula: [
    { label: '公式', keys: ['formula'], defaultOpen: true },
    { label: '推导思路', keys: ['derivation'], defaultOpen: false },
    { label: '适用条件', keys: ['conditions'], defaultOpen: true },
    { label: '常见变形', keys: ['variants'], defaultOpen: false },
    { label: '典型场景', keys: ['typical_uses'], defaultOpen: false },
    { label: '⚠️ 易错点', keys: ['common_mistakes'], defaultOpen: true, warn: true },
  ],
  method: [
    { label: '适用场景', keys: ['when_to_use'], defaultOpen: true },
    { label: '解题步骤', keys: ['steps'], defaultOpen: true },
    { label: '关键点', keys: ['key_points'], defaultOpen: true },
    { label: '例题', keys: ['example'], defaultOpen: false },
    { label: '⚠️ 易错点', keys: ['common_mistakes'], defaultOpen: true, warn: true },
  ],
  physical_concept: [
    { label: '直觉引入', keys: ['intuition'], defaultOpen: true },
    { label: '关键点', keys: ['key_points'], defaultOpen: true },
    { label: '物理定义', keys: ['definition'], defaultOpen: true },
    { label: '情景举例', keys: ['examples'], defaultOpen: false },
    { label: '易混概念', keys: ['counter_examples'], defaultOpen: false },
    { label: '⚠️ 易错点', keys: ['common_mistakes'], defaultOpen: true, warn: true },
    { label: '关联量', keys: ['connections'], defaultOpen: false },
  ],
  physical_law: [
    { label: '物理图像', keys: ['physical_picture'], defaultOpen: true },
    { label: '规律表述', keys: ['statement'], defaultOpen: true },
    { label: '适用条件', keys: ['conditions'], defaultOpen: true },
    { label: '典型解题', keys: ['typical_uses'], defaultOpen: false },
    { label: '⚠️ 易错点', keys: ['common_mistakes'], defaultOpen: true, warn: true },
    { label: '重要推论', keys: ['corollaries'], defaultOpen: false },
    { label: '联系', keys: ['connections'], defaultOpen: false },
  ],
  experiment: [
    { label: '设计思路', keys: ['design_rationale'], defaultOpen: true },
    { label: '考查热点', keys: ['exam_hotspots'], defaultOpen: true },
    { label: '⚠️ 易错操作', keys: ['common_mistakes'], defaultOpen: true, warn: true },
    { label: '数据处理', keys: ['data_processing'], defaultOpen: false },
  ],
  physical_model: [
    { label: '建模动机', keys: ['motivation'], defaultOpen: true },
    { label: '适用条件', keys: ['conditions'], defaultOpen: true },
    { label: '简化假设', keys: ['assumptions'], defaultOpen: false },
    { label: '典型场景', keys: ['typical_scenarios'], defaultOpen: false },
    { label: '局限性', keys: ['limitations'], defaultOpen: false },
  ],
};

// ── 主组件 ────────────────────────────────────────────────────────

export function RichContentView({
  kuType,
  richContent,
}: {
  kuType: string;
  richContent: RC;
}) {
  const sections = SCHEMA[kuType] ?? SCHEMA['concept'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{
        fontSize: '10px', fontWeight: 700, color: 'var(--mn-blue)',
        letterSpacing: '0.08em', padding: '4px 0',
        borderBottom: '1px solid var(--mn-border)',
      }}>
        讲透
      </div>

      {sections.map(({ label, keys, defaultOpen = true, warn = false }) => {
        const values = keys.flatMap(k => {
          const v = richContent[k];
          if (!v) return [];
          return [{ key: k, val: v }];
        });
        if (values.length === 0) return null;

        return (
          <Section key={label} label={label} defaultOpen={defaultOpen}>
            {values.map(({ key, val }) => {
              if (key === 'formula' || key === 'statement') {
                return (
                  <div key={key} style={S.formulaBox}>
                    <RichText text={val as string} />
                  </div>
                );
              }
              if (key === 'intuition' || key === 'physical_picture' || key === 'motivation') {
                return (
                  <div key={key} style={S.intuitionBox}>
                    <RichText text={val as string} />
                  </div>
                );
              }
              if (Array.isArray(val)) {
                return <BulletList key={key} items={val} warn={warn} />;
              }
              return <TextField key={key} value={val as string} />;
            })}
          </Section>
        );
      })}
    </div>
  );
}
