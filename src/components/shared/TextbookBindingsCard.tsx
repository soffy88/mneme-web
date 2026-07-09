'use client';

import { useEffect, useState } from 'react';
import * as api from '@/lib/api-client';
import type { TextbookBindings, TextbookOption } from '@/types/api';

const SUBJECTS: Array<{ key: keyof TextbookBindings; label: string }> = [
  { key: 'math', label: '数学' },
  { key: 'physics', label: '物理' },
  { key: 'chinese', label: '语文' },
  { key: 'english', label: '英语' },
];

/**
 * 用户教材绑定（N.4）。学生按学科分别选一本教材（可不选=不限，全教材混排）；
 * 绑定后每日计划的新知识点推荐只从这本教材里出。数据来自
 * GET/POST /v1/users/{sid}/textbook-bindings + GET /v1/textbooks?subject=X。
 */
export function TextbookBindingsCard({ studentId }: { studentId: string }) {
  const [bindings, setBindings] = useState<TextbookBindings | null>(null);
  const [options, setOptions] = useState<Partial<Record<string, TextbookOption[]>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    void (async () => {
      const [bRes, ...oRes] = await Promise.all([
        api.getTextbookBindings(studentId),
        ...SUBJECTS.map((s) => api.listTextbooks(s.key)),
      ]);
      if (!alive) return;
      if (bRes.ok) setBindings(bRes.data);
      const opts: Partial<Record<string, TextbookOption[]>> = {};
      SUBJECTS.forEach((s, i) => {
        const r = oRes[i];
        if (r?.ok) opts[s.key] = r.data;
      });
      setOptions(opts);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [studentId]);

  if (loading || !bindings) return null;
  // 每个学科都没有可选教材时（比如尚未导入该学科教材），整张卡片没有意义
  if (SUBJECTS.every((s) => !options[s.key]?.length)) return null;

  const save = async (subject: keyof TextbookBindings, textbookId: string) => {
    setSaving(subject);
    setError('');
    const res = await api.setTextbookBindings(studentId, { [subject]: textbookId || null } as TextbookBindings);
    setSaving(null);
    if (res.ok) { setBindings(res.data); setSaved(true); setTimeout(() => setSaved(false), 2000); }
    else setError(res.error);
  };

  const selectStyle: React.CSSProperties = {
    padding: '7px 10px', borderRadius: 8, border: '1px solid var(--mn-border)',
    fontSize: 13, color: 'var(--mn-ink)', background: 'var(--mn-surface)', maxWidth: 220,
  };

  return (
    <div className="mn-card" style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: '18px' }}>📘</span>
        <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--mn-ink)' }}>我的教材</div>
      </div>
      <div style={{ fontSize: '12px', color: 'var(--mn-ink-3)', lineHeight: 1.5, marginTop: '-6px' }}>
        绑定后，每日计划推荐的新知识点只来自这本教材；不选=不限，多本教材混排推荐。
      </div>

      {SUBJECTS.filter((s) => options[s.key]?.length).map((s) => (
        <div key={s.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <span style={{ fontSize: '13px', color: 'var(--mn-ink-2)' }}>{s.label}</span>
          <select
            value={bindings[s.key] ?? ''}
            disabled={saving === s.key}
            onChange={(e) => void save(s.key, e.target.value)}
            style={{ ...selectStyle, opacity: saving === s.key ? 0.6 : 1 }}
          >
            <option value="">不限（全部教材混排）</option>
            {options[s.key]?.map((tb) => (
              <option key={tb.textbook_id} value={tb.textbook_id}>
                {tb.book_name}{tb.edition ? `（${tb.edition}）` : ''}
              </option>
            ))}
          </select>
        </div>
      ))}

      {error && <div style={{ fontSize: '12px', color: 'var(--mn-red)' }}>{error}</div>}
      {saved && <div style={{ fontSize: '12px', color: 'var(--mn-ink-3)', alignSelf: 'flex-end' }}>已保存 ✓</div>}
    </div>
  );
}
