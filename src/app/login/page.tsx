'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as api from '@/lib/api-client';
import { setToken, setUser } from '@/lib/auth-store';

type Phase = 'phone' | 'code' | 'loading';

export default function LoginPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('phone');
  const [phone, setPhone] = useState('');
  const [code,  setCode]  = useState('');
  const [error, setError] = useState('');

  const sendCode = async () => {
    if (!phone.trim()) return;
    setPhase('loading'); setError('');
    const res = await api.sendCode({ phone });
    if (!res.ok) { setError(res.error); setPhase('phone'); return; }
    setPhase('code');
  };

  const login = async () => {
    if (code.length < 4) return;
    setPhase('loading'); setError('');
    const res = await api.login({ phone, code });
    if (!res.ok) { setError(res.error); setPhase('code'); return; }
    setToken(res.data.token);
    setUser(res.data.user);
    router.replace('/home');
  };

  return (
    <div style={{
      minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--mn-paper)', padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

        {/* Brand */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '20px',
            background: 'var(--mn-blue)', color: 'white',
            fontSize: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', boxShadow: '0 4px 16px rgba(30,58,95,.25)',
          }}>◎</div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--mn-ink)', marginBottom: '6px' }}>
            善学记
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--mn-ink-3)', lineHeight: 1.5 }}>
            认知状态追踪<br />每天进步一点点
          </p>
        </div>

        {/* Form card */}
        <div className="mn-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {phase !== 'code' && (
            <label style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--mn-ink-2)' }}>手机号</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') void sendCode(); }}
                placeholder="13800138000"
                inputMode="numeric"
                disabled={phase === 'loading'}
                style={{
                  padding: '13px 14px', borderRadius: '12px', fontSize: '17px',
                  border: '1.5px solid var(--mn-border-2)', background: 'var(--mn-surface)',
                  color: 'var(--mn-ink)', outline: 'none', letterSpacing: '0.04em',
                  fontVariantNumeric: 'tabular-nums',
                  transition: 'border-color var(--mn-duration-fast)',
                }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--mn-blue)'; }}
                onBlur={(e) =>  { e.target.style.borderColor = 'var(--mn-border-2)'; }}
              />
            </label>
          )}

          {phase === 'code' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--mn-ink-2)' }}>验证码</span>
                <button type="button" onClick={() => setPhase('phone')}
                  style={{ fontSize: '13px', color: 'var(--mn-blue)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                  {phone} 修改
                </button>
              </div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyDown={(e) => { if (e.key === 'Enter') void login(); }}
                placeholder="6 位验证码"
                inputMode="numeric"
                maxLength={6}
                autoFocus
                style={{
                  padding: '13px 14px', borderRadius: '12px', fontSize: '22px',
                  border: '1.5px solid var(--mn-blue)', background: 'var(--mn-surface)',
                  color: 'var(--mn-ink)', outline: 'none',
                  letterSpacing: '0.3em', fontVariantNumeric: 'tabular-nums', textAlign: 'center',
                }}
              />
              <p style={{ fontSize: '12px', color: 'var(--mn-ink-3)', textAlign: 'center', margin: '-8px 0 0' }}>
                dev 模式：验证码固定 <strong style={{ color: 'var(--mn-blue)' }}>123456</strong>
              </p>
            </>
          )}

          {error && (
            <div style={{ fontSize: '13px', color: 'var(--mn-red)', padding: '8px 12px', borderRadius: '8px', background: 'var(--mn-red-dim)' }}>
              {error}
            </div>
          )}

          {phase === 'loading' ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '14px' }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2.5px solid var(--mn-blue-dim)', borderTopColor: 'var(--mn-blue)', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontSize: '14px', color: 'var(--mn-ink-3)' }}>请稍候…</span>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : phase === 'phone' ? (
            <button type="button" className="mn-btn-primary" style={{ width: '100%' }}
              disabled={!phone.trim()} onClick={sendCode}>
              发送验证码
            </button>
          ) : (
            <button type="button" className="mn-btn-primary" style={{ width: '100%' }}
              disabled={code.length < 4} onClick={login}>
              登录
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
