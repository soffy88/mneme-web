'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as api from '@/lib/api-client';
import { setToken, setUser } from '@/lib/auth-store';

type Mode = 'login' | 'register' | 'parent';
type Phase = 'phone' | 'code' | 'loading';

const IS_DEV = process.env.NODE_ENV === 'development';

const GRADES = ['小学', '初一', '初二', '初三', '高一', '高二', '高三'];

/** 由出生日期算周岁（仅用于前端预校验，后端为权威）。 */
function ageFromBirth(birth: string): number | null {
  if (!birth) return null;
  const b = new Date(birth);
  if (Number.isNaN(b.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age -= 1;
  return age;
}

const inputStyle: React.CSSProperties = {
  padding: '13px 14px', borderRadius: '12px', fontSize: '16px',
  border: '1.5px solid var(--mn-border-2)', background: 'var(--mn-surface)',
  color: 'var(--mn-ink)', outline: 'none', width: '100%',
  transition: 'border-color var(--mn-duration-fast)',
};

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--mn-ink-2)' }}>{label}</span>
      {children}
    </label>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');

  // ── login state ──
  const [phase, setPhase] = useState<Phase>('phone');
  const [phone, setPhone] = useState('');
  const [code,  setCode]  = useState('');
  const [error, setError] = useState('');

  // ── register state ──
  const [rPhone, setRPhone]   = useState('');
  const [rCode,  setRCode]    = useState('');
  const [name,   setName]     = useState('');
  const [birth,  setBirth]    = useState('');
  const [grade,  setGrade]    = useState('');
  const [gPhone, setGPhone]   = useState('');
  const [gConsent, setGConsent] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ── parent register state ──
  const [pPhone,  setPPhone]  = useState('');
  const [pCode,   setPCode]   = useState('');
  const [pName,   setPName]   = useState('');
  const [pInvite, setPInvite] = useState('');
  const [pCodeSent, setPCodeSent] = useState(false);

  const switchMode = (m: Mode) => { setMode(m); setError(''); };

  // ── login handlers ──
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
    // login 响应 user 不含 role/grade/invite_code，补拉 /v1/auth/me 后按身份分流
    const me = await api.getMe();
    const user = me.ok ? { ...res.data.user, ...me.data } : res.data.user;
    setUser(user);
    router.replace(user.role === 'parent' ? '/parent/overview' : '/home');
  };

  // ── register handlers ──
  const age = ageFromBirth(birth);
  const needGuardian = age !== null && age < 14;

  const sendRegCode = async () => {
    if (!rPhone.trim()) return;
    setError('');
    const res = await api.sendCode({ phone: rPhone });
    if (!res.ok) { setError(res.error); return; }
    setCodeSent(true);
  };

  const registerReady =
    rPhone.trim() && rCode.length >= 4 && name.trim() && birth && grade &&
    (!needGuardian || (gPhone.trim() && gConsent));

  const register = async () => {
    setError('');
    if (needGuardian && (!gPhone.trim() || !gConsent)) {
      setError('未满 14 周岁，须填写监护人手机号并勾选监护人同意');
      return;
    }
    if (!registerReady) { setError('请完整填写注册信息'); return; }
    setSubmitting(true);
    const res = await api.registerStudent({
      phone: rPhone, code: rCode, name: name.trim(),
      birth_date: birth, grade,
      ...(needGuardian ? { guardian_phone: gPhone.trim(), guardian_consent: gConsent } : {}),
    });
    setSubmitting(false);
    if (!res.ok) { setError(res.error); return; }
    setToken(res.data.token);
    setUser(res.data.user);
    router.replace('/home');
  };

  // ── parent register handlers ──
  const sendParentCode = async () => {
    if (!pPhone.trim()) return;
    setError('');
    const res = await api.sendCode({ phone: pPhone });
    if (!res.ok) { setError(res.error); return; }
    setPCodeSent(true);
  };

  const parentReady =
    pPhone.trim() && pCode.length >= 4 && pName.trim() && pInvite.trim();

  const registerParent = async () => {
    setError('');
    if (!parentReady) { setError('请完整填写注册信息'); return; }
    setSubmitting(true);
    const res = await api.registerParent({
      phone: pPhone, code: pCode, name: pName.trim(),
      invite_code: pInvite.trim().toUpperCase(),
    });
    setSubmitting(false);
    if (!res.ok) { setError(res.error); return; }
    setToken(res.data.token);
    // 后端注册响应 user 不带 role，显式标记为家长
    setUser({ ...res.data.user, role: 'parent' });
    router.replace('/parent/overview');
  };

  return (
    <div style={{
      minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--mn-paper)', padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

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

        {/* Tab toggle */}
        <div style={{ display: 'flex', background: 'var(--mn-surface)', borderRadius: '12px', padding: '4px', border: '1px solid var(--mn-border)' }}>
          {(['login', 'register', 'parent'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              style={{
                flex: 1, padding: '9px', borderRadius: '9px', fontSize: '14px', fontWeight: 700,
                border: 'none', cursor: 'pointer',
                background: mode === m ? 'var(--mn-blue)' : 'transparent',
                color: mode === m ? 'white' : 'var(--mn-ink-3)',
                transition: 'all var(--mn-duration-fast)',
              }}
            >
              {m === 'login' ? '登录' : m === 'register' ? '学生注册' : '家长注册'}
            </button>
          ))}
        </div>

        {/* ── Login card ── */}
        {mode === 'login' && (
          <div className="mn-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {phase !== 'code' && (
              <Field label="手机号">
                <input
                  type="tel" value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => { if (e.nativeEvent.isComposing) return; if (e.key === 'Enter') void sendCode(); }}
                  placeholder="13800138000" inputMode="numeric"
                  disabled={phase === 'loading'} style={inputStyle}
                />
              </Field>
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
                  type="text" value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyDown={(e) => { if (e.nativeEvent.isComposing) return; if (e.key === 'Enter') void login(); }}
                  placeholder="6 位验证码" inputMode="numeric" maxLength={6} autoFocus
                  style={{ ...inputStyle, fontSize: '22px', borderColor: 'var(--mn-blue)', letterSpacing: '0.3em', textAlign: 'center' }}
                />
                {IS_DEV && (
                  <p style={{ fontSize: '12px', color: 'var(--mn-ink-3)', textAlign: 'center', margin: '-8px 0 0' }}>
                    dev 模式：验证码固定 <strong style={{ color: 'var(--mn-blue)' }}>123456</strong>
                  </p>
                )}
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
              <button type="button" className="mn-btn-primary" style={{ width: '100%' }} disabled={!phone.trim()} onClick={sendCode}>
                发送验证码
              </button>
            ) : (
              <button type="button" className="mn-btn-primary" style={{ width: '100%' }} disabled={code.length < 4} onClick={login}>
                登录
              </button>
            )}
          </div>
        )}

        {/* ── Register card ── */}
        {mode === 'register' && (
          <div className="mn-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Field label="手机号">
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="tel" value={rPhone}
                  onChange={(e) => setRPhone(e.target.value)}
                  placeholder="13800138000" inputMode="numeric"
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button type="button" className="mn-btn-secondary" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                  disabled={!rPhone.trim()} onClick={sendRegCode}>
                  {codeSent ? '重发' : '发送验证码'}
                </button>
              </div>
            </Field>

            <Field label="验证码">
              <input
                type="text" value={rCode}
                onChange={(e) => setRCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder={IS_DEV ? '6 位验证码（dev: 123456）' : '6 位验证码'} inputMode="numeric" maxLength={6}
                style={inputStyle}
              />
            </Field>

            <Field label="姓名">
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="真实姓名" style={inputStyle} />
            </Field>

            <Field label="出生日期">
              <input type="date" value={birth} onChange={(e) => setBirth(e.target.value)}
                max={new Date().toISOString().slice(0, 10)} style={inputStyle} />
            </Field>

            <Field label="年级">
              <select value={grade} onChange={(e) => setGrade(e.target.value)} style={inputStyle}>
                <option value="">请选择年级</option>
                {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>

            {/* 监护人同意（<14 岁动态出现，合规硬阻断） */}
            {needGuardian && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '14px', borderRadius: '12px', background: 'var(--mn-orange-dim)', border: '1px solid rgba(194,85,13,.25)' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--mn-orange)' }}>
                  未满 14 周岁，需监护人同意
                </div>
                <Field label="监护人手机号">
                  <input type="tel" value={gPhone} onChange={(e) => setGPhone(e.target.value)}
                    placeholder="监护人手机号" inputMode="numeric" style={inputStyle} />
                </Field>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--mn-ink-2)', lineHeight: 1.5, cursor: 'pointer' }}>
                  <input type="checkbox" checked={gConsent} onChange={(e) => setGConsent(e.target.checked)} style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>本人为该学生的监护人，已阅读并同意《个人信息处理及隐私政策》，同意为孩子注册并使用本服务。</span>
                </label>
              </div>
            )}

            {error && (
              <div style={{ fontSize: '13px', color: 'var(--mn-red)', padding: '8px 12px', borderRadius: '8px', background: 'var(--mn-red-dim)' }}>
                {error}
              </div>
            )}

            <button type="button" className="mn-btn-primary" style={{ width: '100%' }}
              disabled={submitting || !registerReady} onClick={register}>
              {submitting ? '注册中…' : '注册并进入'}
            </button>
          </div>
        )}

        {/* ── Parent register card ── */}
        {mode === 'parent' && (
          <div className="mn-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--mn-ink-3)', lineHeight: 1.6, margin: 0 }}>
              输入孩子注册后生成的邀请码（孩子首页「家长监督」卡可查看），注册即绑定，可查看学习周报。
            </p>
            <Field label="手机号">
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="tel" value={pPhone}
                  onChange={(e) => setPPhone(e.target.value)}
                  placeholder="13800138000" inputMode="numeric"
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button type="button" className="mn-btn-secondary" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                  disabled={!pPhone.trim()} onClick={sendParentCode}>
                  {pCodeSent ? '重发' : '发送验证码'}
                </button>
              </div>
            </Field>

            <Field label="验证码">
              <input
                type="text" value={pCode}
                onChange={(e) => setPCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder={IS_DEV ? '6 位验证码（dev: 123456）' : '6 位验证码'} inputMode="numeric" maxLength={6}
                style={inputStyle}
              />
            </Field>

            <Field label="姓名">
              <input type="text" value={pName} onChange={(e) => setPName(e.target.value)} placeholder="您的称呼" style={inputStyle} />
            </Field>

            <Field label="孩子的邀请码">
              <input
                type="text" value={pInvite}
                onChange={(e) => setPInvite(e.target.value)}
                placeholder="如 A1B2C3"
                style={{ ...inputStyle, letterSpacing: '0.08em' }}
              />
            </Field>

            {error && (
              <div style={{ fontSize: '13px', color: 'var(--mn-red)', padding: '8px 12px', borderRadius: '8px', background: 'var(--mn-red-dim)' }}>
                {error}
              </div>
            )}

            <button type="button" className="mn-btn-primary" style={{ width: '100%' }}
              disabled={submitting || !parentReady} onClick={registerParent}>
              {submitting ? '注册中…' : '注册并绑定孩子'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
