'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserId } from '@/lib/auth-store';
import * as api from '@/lib/api-client';
import { ChildBar } from '@/components/parent/ChildBar';
import type { ParentAlert, AlertLevel } from '@/types/api';


const LEVEL: Record<AlertLevel, { icon: string; color: string; bg: string; border: string }> = {
  notice:    { icon: 'ℹ',  color: 'var(--mn-blue)',   bg: 'var(--mn-blue-dim)',   border: 'rgba(30,58,95,.15)' },
  attention: { icon: '⚠',  color: 'var(--mn-orange)', bg: 'var(--mn-orange-dim)', border: 'rgba(194,85,13,.2)' },
  important: { icon: '🔴', color: 'var(--mn-red)',    bg: 'var(--mn-red-dim)',    border: 'rgba(185,28,28,.2)' },
};

export default function AlertsPage() {
  const router = useRouter();
  const [childId, setChildId] = useState<string | null>(null);
  const [alerts,  setAlerts]  = useState<ParentAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const load = async (sid: string) => {
    const parentId = getUserId();          // 家长 JWT 的 sub
    if (!parentId) { router.push('/login'); return; }
    setLoading(true); setError('');
    const res = await api.getParentAlerts(sid, parentId);
    setLoading(false);
    if (res.ok) setAlerts(res.data.alerts);
    else setError(res.error);
  };

  useEffect(() => { if (childId) void load(childId); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [childId]);

  const unread = alerts.filter((a) => !a.is_read).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--mn-ink)' }}>风险预警</h1>
        {unread > 0 && (
          <span style={{
            fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px',
            background: 'var(--mn-red)', color: 'white',
          }}>{unread}</span>
        )}
      </div>

      <ChildBar selectedId={childId} onSelect={setChildId} />

      {!childId ? (
        <div style={{ textAlign: 'center', padding: '32px 0', fontSize: '13px', color: 'var(--mn-ink-3)' }}>
          请先在上方选择或绑定孩子。
        </div>
      ) : loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[...Array(3)].map((_, i) => <div key={i} className="mn-skeleton" style={{ height: '72px', borderRadius: '14px' }} />)}
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '40px 0', fontSize: '13px', color: 'var(--mn-ink-3)' }}>
          {error} — <button type="button" onClick={() => childId && load(childId)} style={{ color: 'var(--mn-blue)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>重试</button>
        </div>
      ) : !alerts.length ? (
        <div className="mn-card" style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🌟</div>
          <div style={{ fontWeight: 600, color: 'var(--mn-ink)', marginBottom: '4px' }}>一切正常</div>
          <div style={{ fontSize: '13px', color: 'var(--mn-ink-3)' }}>继续保持 · 有变化我会通知你</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {alerts.map((alert) => {
            const lv = LEVEL[alert.alert_level];
            return (
              <div
                key={alert.id}
                className="mn-card"
                style={{
                  padding: '14px 16px',
                  display: 'flex', gap: '12px', alignItems: 'flex-start',
                  opacity: alert.is_read ? 0.65 : 1,
                  borderLeft: `4px solid ${lv.color}`,
                  borderRadius: '0 14px 14px 0',
                  background: alert.is_read ? 'var(--mn-surface)' : lv.bg,
                }}
              >
                <span style={{ fontSize: '18px', flexShrink: 0, marginTop: '1px' }}>{lv.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{
                      fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '99px',
                      background: lv.color, color: 'white', textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>
                      {{ notice: '留意', attention: '关注', important: '重要' }[alert.alert_level]}
                    </span>
                    {!alert.is_read && (
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--mn-red)', flexShrink: 0 }} />
                    )}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--mn-ink)', lineHeight: 1.5, marginBottom: '4px' }}>
                    {alert.content}
                  </div>
                  {alert.conversation_script && (
                    <div style={{ marginTop: 6, marginBottom: 6, padding: '10px 12px', borderRadius: 10, background: 'var(--mn-blue-dim, #eff6ff)', borderLeft: '3px solid var(--mn-blue)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--mn-blue)', marginBottom: 3 }}>💬 对话时机{alert.support_action ? ` · ${alert.support_action}` : ''}</div>
                      <div style={{ fontSize: 13, color: 'var(--mn-ink-2)', lineHeight: 1.6 }}>{alert.conversation_script}</div>
                    </div>
                  )}
                  <div style={{ fontSize: '11px', color: 'var(--mn-ink-3)', fontVariantNumeric: 'tabular-nums' }}>
                    {new Date(alert.created_at).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
