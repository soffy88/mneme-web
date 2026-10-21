'use client';

import { useEffect, useRef, useState } from 'react';

// ── 解题草稿板（认知负荷②：工作记忆外化）──────────────────────────────
// 原理：工作记忆一次只装得下 3–4 个组块。多步题里把「已知条件 / 中间结果 /
// 目标」写到外部板上，大脑就不用耗能硬记，随时扫一眼就能确认——这是给
// 大脑扩内存，不是书写格式要求。
//
// - 中间结果支持「钉住」：钉住的值切题也不消失（localStorage 按 KU 持久化）；
// - 学生在答题框里写出「…=值」的步骤时，该值自动被记进中间结果栏并钉住
//   （第一步算出的值自动外化，不靠学生自觉）；
// - 未钉住的中间结果只属于当前题，切题自动清掉，避免旧值污染下一题。

export interface IntermediateItem {
  text: string;
  pinned: boolean;
  auto?: boolean;
}

interface ScratchState {
  givens: string;
  goal: string;
  intermediates: IntermediateItem[];
}

/** 从解题过程文本里提取「= 右边的值」作为中间结果（确定性规则，无 LLM）。 */
export function extractIntermediates(text: string): string[] {
  if (!text) return [];
  const out: string[] = [];
  for (const clause of text.split(/[\n，。；;、]/)) {
    const eq = clause.lastIndexOf('=');
    if (eq < 0) continue;
    const lhs = clause.slice(0, eq).trim();
    const rhs = clause.slice(eq + 1).trim();
    if (!lhs || !rhs) continue;
    if (rhs.length > 14 || !/\d/.test(rhs)) continue;
    if (/^[a-zA-Z]$/.test(rhs)) continue; // 「x=…」里等号左边是未知数时 rhs 才有意义，反之跳过纯字母
    if (!out.includes(rhs)) out.push(rhs);
  }
  return out;
}

const EMPTY: ScratchState = { givens: '', goal: '', intermediates: [] };

function loadState(key: string): ScratchState {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<ScratchState>;
    return {
      givens: typeof parsed.givens === 'string' ? parsed.givens : '',
      goal: typeof parsed.goal === 'string' ? parsed.goal : '',
      intermediates: Array.isArray(parsed.intermediates)
        ? parsed.intermediates.filter(
            (i): i is IntermediateItem =>
              !!i && typeof i.text === 'string' && typeof i.pinned === 'boolean',
          )
        : [],
    };
  } catch {
    return EMPTY;
  }
}

const labelStyle: React.CSSProperties = {
  fontSize: '11px', fontWeight: 700, color: 'var(--mn-ink-3)',
  letterSpacing: '0.05em', marginBottom: '6px',
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 10px', borderRadius: '8px',
  border: '1px solid var(--mn-border)', background: 'var(--mn-paper)',
  fontSize: '13px', color: 'var(--mn-ink)', lineHeight: 1.6,
  resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit',
};

export function ScratchBoard({
  storageKey,
  questionKey,
  answerText,
}: {
  /** 按 KU 隔离持久化（同一知识点的多步题共用一块板）。 */
  storageKey: string;
  /** 当前题序号/标识：变化时清掉未钉住的中间结果。 */
  questionKey: string | number;
  /** 学生在答题框里写的过程文本：出现「=值」时自动记中间结果。 */
  answerText: string;
}) {
  const lsKey = `mneme-scratch:${storageKey}`;
  const [open, setOpen] = useState(true);
  const [state, setState] = useState<ScratchState>(EMPTY);
  const [manual, setManual] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const prevQuestion = useRef<string | number>(questionKey);
  const seenAuto = useRef<Set<string>>(new Set());

  // 载入持久化状态
  useEffect(() => {
    setState(loadState(lsKey));
    setHydrated(true);
  }, [lsKey]);

  // 持久化
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(lsKey, JSON.stringify(state));
    } catch { /* 存储不可用时静默降级为内存态 */ }
  }, [lsKey, state, hydrated]);

  // 切题：未钉住的中间结果清掉，钉住的保留（跨题外化）
  useEffect(() => {
    if (prevQuestion.current === questionKey) return;
    prevQuestion.current = questionKey;
    seenAuto.current = new Set();
    setState(s => ({ ...s, intermediates: s.intermediates.filter(i => i.pinned) }));
  }, [questionKey]);

  // 自动外化：答题过程里新出现的「=值」自动钉进中间结果栏
  useEffect(() => {
    const found = extractIntermediates(answerText);
    const fresh = found.filter(v => !seenAuto.current.has(v));
    if (fresh.length === 0) return;
    fresh.forEach(v => seenAuto.current.add(v));
    setState(s => {
      const known = new Set(s.intermediates.map(i => i.text));
      const add = fresh
        .filter(v => !known.has(v))
        .map<IntermediateItem>(v => ({ text: v, pinned: true, auto: true }));
      return add.length ? { ...s, intermediates: [...s.intermediates, ...add] } : s;
    });
  }, [answerText]);

  const togglePin = (idx: number) =>
    setState(s => ({
      ...s,
      intermediates: s.intermediates.map((it, i) =>
        i === idx ? { ...it, pinned: !it.pinned } : it,
      ),
    }));

  const removeItem = (idx: number) =>
    setState(s => ({ ...s, intermediates: s.intermediates.filter((_, i) => i !== idx) }));

  const addManual = () => {
    const v = manual.trim();
    if (!v) return;
    setManual('');
    setState(s =>
      s.intermediates.some(i => i.text === v)
        ? s
        : { ...s, intermediates: [...s.intermediates, { text: v, pinned: true }] },
    );
  };

  return (
    <div style={{
      background: 'var(--mn-surface)', border: '1px solid var(--mn-border)',
      borderRadius: '14px', padding: '14px 16px',
    }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          fontSize: '13px', fontWeight: 700, color: 'var(--mn-ink)', textAlign: 'left',
        }}
      >
        <span>📋 解题草稿板</span>
        <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--mn-ink-3)', flex: 1 }}>
          写下来，脑子就不用硬记了
        </span>
        <span style={{ color: 'var(--mn-ink-3)', fontSize: '12px' }}>{open ? '收起 ▴' : '展开 ▾'}</span>
      </button>

      {open && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px', marginTop: '12px',
        }}>
          {/* 已知条件 */}
          <div>
            <div style={labelStyle}>已知条件</div>
            <textarea
              value={state.givens}
              onChange={e => setState(s => ({ ...s, givens: e.target.value }))}
              placeholder={'题目告诉我们什么？\n如：全书 96 页，已读 36 页'}
              rows={3}
              style={inputStyle}
            />
          </div>

          {/* 中间结果（可钉住） */}
          <div>
            <div style={labelStyle}>中间结果（📌 = 切题也不消失）</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
              {state.intermediates.length === 0 && (
                <span style={{ fontSize: '12px', color: 'var(--mn-ink-3)', lineHeight: 1.6 }}>
                  算出一步就记一步，如「剩下 = 60 页」；在答题框写「96-36=60」也会自动记下
                </span>
              )}
              {state.intermediates.map((it, i) => (
                <span
                  key={`${it.text}-${i}`}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '4px 6px 4px 10px', borderRadius: '99px', fontSize: '13px',
                    fontWeight: 600,
                    background: it.pinned ? 'var(--mn-blue-dim, #eff6ff)' : 'var(--mn-paper)',
                    border: it.pinned
                      ? '1.5px solid var(--mn-blue)'
                      : '1px solid var(--mn-border)',
                    color: 'var(--mn-ink)',
                  }}
                >
                  {it.text}
                  {it.auto && (
                    <span style={{ fontSize: '10px', fontWeight: 500, color: 'var(--mn-ink-3)' }}>自动</span>
                  )}
                  <button
                    type="button"
                    title={it.pinned ? '取消钉住' : '钉住'}
                    onClick={() => togglePin(i)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', padding: 0, opacity: it.pinned ? 1 : 0.35 }}
                  >📌</button>
                  <button
                    type="button"
                    title="删除"
                    onClick={() => removeItem(i)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', padding: 0, color: 'var(--mn-ink-3)' }}
                  >✕</button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                value={manual}
                onChange={e => setManual(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addManual(); }}
                placeholder="手动记一个中间结果"
                style={{ ...inputStyle, resize: 'none', flex: 1 }}
              />
              <button
                type="button"
                onClick={addManual}
                style={{
                  padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--mn-border)',
                  background: 'var(--mn-paper)', fontSize: '13px', fontWeight: 600,
                  color: 'var(--mn-blue)', cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >记下</button>
            </div>
          </div>

          {/* 目标 */}
          <div>
            <div style={labelStyle}>目标</div>
            <textarea
              value={state.goal}
              onChange={e => setState(s => ({ ...s, goal: e.target.value }))}
              placeholder={'最后要求什么？\n如：平均每天读多少页'}
              rows={3}
              style={inputStyle}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ScratchBoard;
