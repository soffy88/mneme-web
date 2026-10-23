'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as api from '@/lib/api-client';
import { MNEME_API_BASE } from '@/lib/env';
import { getToken, getUser } from '@/lib/auth-store';
import type { ChildInfo } from '@/types/api';

// 家长：语音陪学设置（伙伴名字 / 开关 / 每日上限 / 单次上限）+ 孩子的对话记录（含安全标记）。
type Settings = { name: string; enabled: boolean; daily_cap_minutes: number; session_limit_minutes: number; used_seconds_today?: number };
type Log = { session_id: string; mode: string; role: string; content: string; flags: string[]; created_at: string };

const FLAG: Record<string, string> = {
  romance: '恋爱/角色扮演', off_topic: '离题', unsafe: '不当内容', self_harm: '⚠️ 情绪求助', pii: '个人信息已隐藏',
  daily_cap: '到达每日上限', session_limit: '到达单次上限', break: '休息提醒',
};

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const r = await fetch(`${MNEME_API_BASE}${path}`, {
    ...init, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken() ?? ''}` },
  });
  if (!r.ok) throw new Error(((await r.json().catch(() => ({}))) as { detail?: string }).detail ?? r.statusText);
  return r.json() as Promise<T>;
}

export default function CompanionSettingsPage() {
  const router = useRouter();
  const [kids, setKids] = useState<ChildInfo[]>([]);
  const [sid, setSid] = useState<string>('');
  const [s, setS] = useState<Settings | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) { router.push('/login?next=/placement/companion'); return; }
    const u = getUser();
    if (u?.role === 'student') { setKids([{ student_id: u.id, name: u.name, grade: '' }]); setSid(u.id); return; }
    void api.getChildren().then((r) => { if (r.ok) { setKids(r.data); if (r.data[0]) setSid(r.data[0].student_id); } });
  }, [router]);

  useEffect(() => {
    if (!sid) return;
    setMsg(null);
    void call<Settings>(`/v1/companion/${sid}/settings`).then(setS).catch((e) => setMsg(String(e.message)));
    void call<{ items: Log[] }>(`/v1/companion/${sid}/logs?limit=200`).then((r) => setLogs(r.items)).catch(() => setLogs([]));
  }, [sid]);

  async function save() {
    if (!s) return;
    try {
      const r = await call<Settings>(`/v1/companion/${sid}/settings`, {
        method: 'PUT', body: JSON.stringify({ name: s.name, enabled: s.enabled, daily_cap_minutes: s.daily_cap_minutes, session_limit_minutes: s.session_limit_minutes }),
      });
      setS({ ...s, ...r }); setMsg('已保存');
    } catch (e) { setMsg((e as Error).message); }
  }

  const isParent = getUser()?.role === 'parent';
  const field = { padding: '8px 10px', borderRadius: 8, border: '1px solid var(--mn-border)', fontSize: 14, width: 120 } as const;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--mn-ink)', margin: 0 }}>语音陪学 · 家长设置</h1>
      {kids.length > 1 && (
        <select value={sid} onChange={(e) => setSid(e.target.value)} style={field}>
          {kids.map((k) => <option key={k.student_id} value={k.student_id}>{k.name}</option>)}
        </select>
      )}
      {s && (
        <div className="mn-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label>伙伴名字 <input style={field} value={s.name} maxLength={8} disabled={!isParent} onChange={(e) => setS({ ...s, name: e.target.value })} /></label>
          <label><input type="checkbox" checked={s.enabled} disabled={!isParent} onChange={(e) => setS({ ...s, enabled: e.target.checked })} /> 允许使用语音陪学</label>
          <label>每日上限（分钟） <input type="number" min={0} max={240} style={field} value={s.daily_cap_minutes} disabled={!isParent} onChange={(e) => setS({ ...s, daily_cap_minutes: Number(e.target.value) })} /></label>
          <label>单次上限（分钟） <input type="number" min={5} max={90} style={field} value={s.session_limit_minutes} disabled={!isParent} onChange={(e) => setS({ ...s, session_limit_minutes: Number(e.target.value) })} /></label>
          <span style={{ fontSize: 12, color: 'var(--mn-ink-3)' }}>今天已用 {Math.round((s.used_seconds_today ?? 0) / 60)} 分钟</span>
          {isParent ? <button type="button" className="mn-btn-primary" onClick={() => void save()} style={{ alignSelf: 'flex-start' }}>保存</button>
            : <span style={{ fontSize: 12, color: 'var(--mn-ink-3)' }}>这些设置由家长修改。</span>}
        </div>
      )}
      {msg && <div style={{ fontSize: 13, color: 'var(--mn-ink-2)' }}>{msg}</div>}
      <div className="mn-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontWeight: 700, color: 'var(--mn-ink)' }}>对话记录（最近 200 条，个人信息已自动隐藏）</span>
        {logs.length === 0 && <span style={{ fontSize: 13, color: 'var(--mn-ink-3)' }}>暂无记录</span>}
        {logs.map((l, i) => (
          <div key={i} style={{ fontSize: 13, display: 'flex', gap: 8 }}>
            <span style={{ color: 'var(--mn-ink-3)', whiteSpace: 'nowrap' }}>{new Date(l.created_at).toLocaleString('zh-CN', { hour12: false })}</span>
            <span style={{ fontWeight: 600 }}>{l.role === 'student' ? '孩子' : '伙伴'}</span>
            <span style={{ flex: 1 }}>{l.content}</span>
            {l.flags.filter((f) => FLAG[f]).map((f) => <span key={f} style={{ fontSize: 11, color: f === 'self_harm' ? '#dc2626' : 'var(--mn-ink-3)' }}>[{FLAG[f]}]</span>)}
          </div>
        ))}
      </div>
    </div>
  );
}
