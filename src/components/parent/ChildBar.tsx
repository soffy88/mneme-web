'use client';

import { useEffect, useState } from 'react';
import * as api from '@/lib/api-client';
import type { ChildInfo } from '@/types/api';

const SEL_KEY = 'mneme_parent_child';

/**
 * 家长端孩子选择条：加载已绑定孩子 + 切换 + 凭 invite_code 绑定新孩子。
 * 选中的 student_id 通过 onSelect 上抛，并持久化到 localStorage 供各 tab 共享。
 */
export function ChildBar({ selectedId, onSelect }: { selectedId: string | null; onSelect: (id: string) => void }) {
  const [children, setChildren] = useState<ChildInfo[] | null>(null);
  const [showBind, setShowBind] = useState(false);
  const [code, setCode]   = useState('');
  const [msg, setMsg]     = useState('');
  const [binding, setBinding] = useState(false);

  const load = async () => {
    const res = await api.getChildren();
    if (!res.ok) { setChildren([]); return; }
    setChildren(res.data);
    if (res.data.length && !res.data.some((c) => c.student_id === selectedId)) {
      const stored = typeof window !== 'undefined' ? localStorage.getItem(SEL_KEY) : null;
      const pick = res.data.find((c) => c.student_id === stored)?.student_id ?? res.data[0].student_id;
      onSelect(pick);
    }
  };
  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const select = (id: string) => {
    if (typeof window !== 'undefined') localStorage.setItem(SEL_KEY, id);
    onSelect(id);
  };

  const bind = async () => {
    if (!code.trim()) return;
    setBinding(true); setMsg('');
    const res = await api.bindChild(code.trim().toUpperCase());
    setBinding(false);
    if (!res.ok) { setMsg(res.error); return; }
    setCode(''); setShowBind(false);
    await load();
    select(res.data.student_id);
  };

  return (
    <div className="mn-card" style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {(children ?? []).map((c) => {
          const on = c.student_id === selectedId;
          return (
            <button
              key={c.student_id}
              type="button"
              onClick={() => select(c.student_id)}
              style={{
                padding: '6px 12px', borderRadius: '99px', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer',
                border: on ? '1.5px solid var(--mn-blue)' : '1px solid var(--mn-border)',
                background: on ? 'var(--mn-blue-dim)' : 'var(--mn-surface)',
                color: on ? 'var(--mn-blue)' : 'var(--mn-ink-2)',
              }}
            >
              {c.name}{c.grade ? ` · ${c.grade}` : ''}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => { setShowBind((v) => !v); setMsg(''); }}
          style={{
            padding: '6px 12px', borderRadius: '99px', fontSize: '13px', fontWeight: 600,
            cursor: 'pointer', border: '1px dashed var(--mn-border-2)', background: 'transparent',
            color: 'var(--mn-ink-3)',
          }}
        >
          + 绑定孩子
        </button>
      </div>

      {children !== null && children.length === 0 && !showBind && (
        <div style={{ fontSize: '12px', color: 'var(--mn-ink-3)' }}>
          还未绑定孩子。点击「绑定孩子」，输入孩子注册后生成的邀请码。
        </div>
      )}

      {showBind && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => { if (e.nativeEvent.isComposing) return; if (e.key === 'Enter') void bind(); }}
              placeholder="孩子的邀请码（如 A1B2C3）"
              style={{
                flex: 1, padding: '10px 12px', borderRadius: '10px', fontSize: '14px',
                border: '1.5px solid var(--mn-border-2)', background: 'var(--mn-surface)',
                color: 'var(--mn-ink)', outline: 'none', letterSpacing: '0.08em',
              }}
            />
            <button type="button" className="mn-btn-primary" style={{ whiteSpace: 'nowrap' }}
              disabled={binding || !code.trim()} onClick={bind}>
              {binding ? '绑定中…' : '绑定'}
            </button>
          </div>
          {msg && <div style={{ fontSize: '12px', color: 'var(--mn-red)' }}>{msg}</div>}
        </div>
      )}
    </div>
  );
}
