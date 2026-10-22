'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as api from '@/lib/api-client';
import { setToken, setUser } from '@/lib/auth-store';
import type { UserProfile } from '@/types/api';

type Mode = 'login' | 'register';
type Phase = 'email' | 'code' | 'loading';
/** 登录卡内的两种凭证方式。验证码通道始终可用，密码是可选通道。 */
type Method = 'code' | 'password';

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

// 登录后回跳：优先 ?next=（仅站内相对路径，防开放重定向），其次构建期
// NEXT_PUBLIC_POST_LOGIN_DEFAULT（公网部署只放出了 /placement，设为 /placement/prereq），
// 最后才是按角色的默认首页。
function postLoginTarget(fallback: string): string {
  if (typeof window !== 'undefined') {
    const next = new URLSearchParams(window.location.search).get('next');
    if (next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\')) return next;
  }
  return process.env.NEXT_PUBLIC_POST_LOGIN_DEFAULT || fallback;
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');

  // ── login state ──
  const [phase, setPhase] = useState<Phase>('email');
  const [method, setMethod] = useState<Method>('code');
  const [email, setEmail] = useState('');
  const [code,  setCode]  = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  // 验证码登录成功后，若该账号还没设过密码，展开一个就地设置面板（本站没有
  // 独立的账号设置页，放这里避免用户无处可设）。
  const [setupOpen, setSetupOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [setupMsg, setSetupMsg] = useState('');

  // ── register state（邀请制：管理员发码，学生凭码注册，不依赖邮件）──
  const [inviteCode, setInviteCode] = useState('');
  const [rUsername, setRUsername] = useState('');
  const [rPassword, setRPassword] = useState('');
  const [name,   setName]     = useState('');
  const [birth,  setBirth]    = useState('');
  const [grade,  setGrade]    = useState('');
  const [gEmail, setGEmail]   = useState('');
  const [gConsent, setGConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const switchMode = (m: Mode) => { setMode(m); setError(''); };
  const switchMethod = (m: Method) => { setMethod(m); setError(''); setPhase('email'); };

  /** 登录成功后统一收尾：落 token → 拉 /me 补全身份 → 按角色分流。 */
  const finishLogin = async (
    res: { data: { token: string; user: Partial<UserProfile> } },
    opts?: { promptPasswordSetup?: boolean },
  ) => {
    setToken(res.data.token);
    // login 响应 user 不含 role/grade/invite_code，补拉 /v1/auth/me 后按身份分流
    const me = await api.getMe();
    const user = { ...res.data.user, ...(me.ok ? me.data : {}) } as UserProfile;
    setUser(user);
    // 没设过密码时先停下来给一次设置机会（本站无账号设置页），并让用户自己决定
    // 是现在设还是直接进首页——不强制打断。
    if (opts?.promptPasswordSetup && user.has_password === false) {
      setSetupOpen(true);
      return;
    }
    router.replace(postLoginTarget(user.role === 'parent' ? '/parent/overview' : '/home'));
  };

  // ── login handlers ──
  const sendCode = async () => {
    if (!email.trim()) return;
    setPhase('loading'); setError('');
    const res = await api.sendEmailCode({ email: email.trim() });
    if (!res.ok) { setError(res.error); setPhase('email'); return; }
    setPhase('code');
  };
  const login = async () => {
    if (code.length < 4) return;
    setPhase('loading'); setError('');
    const res = await api.loginEmail({ email: email.trim(), code });
    if (!res.ok) { setError(res.error); setPhase('code'); return; }
    await finishLogin(res as never, { promptPasswordSetup: true });
  };
  const loginByPassword = async () => {
    if (!email.trim() || !password) return;
    setPhase('loading'); setError('');
    const res = await api.loginPassword({ email: email.trim(), password });
    if (!res.ok) {
      // 后端对「账号不存在」「密码错」「还没设过密码」故意返回**完全相同**的
      // 401/文案（防枚举已注册邮箱），所以前端无法分辨具体是哪种——只能把三条
      // 可能一起告诉用户，让 ta 自己判断，而不是显示一个无从下手的错误码。
      setError(
        `${res.error}。若你还没设过密码，请切到「验证码登录」用验证码登录，` +
        `登录后页面会直接让你设置密码。`,
      );
      setPhase('email');
      return;
    }
    await finishLogin(res as never);
  };
  const savePassword = async () => {
    setSetupMsg(''); setError('');
    const res = await api.setPassword(newPassword);
    if (!res.ok) { setSetupMsg(res.error); return; }
    setSetupMsg('密码已设置，之后可以用密码登录。');
    setNewPassword('');
    setTimeout(() => router.replace(postLoginTarget('/home')), 900);
  };

  // ── dev 快速登录（仅 dev 环境）──
  const devLogin = async () => {
    setPhase('loading'); setError('');
    const res = await api.loginEmail({ email: 'dev@mneme.local', code: '123456' });
    if (!res.ok) { setError(res.error); setPhase('email'); return; }
    setToken(res.data.token);
    const me = await api.getMe();
    const user = me.ok ? { ...res.data.user, ...me.data } : res.data.user;
    setUser(user);
    router.replace(postLoginTarget(user.role === 'parent' ? '/parent/overview' : '/home'));
  };

  // ── register handlers（邀请制：管理员发码，学生凭码注册，不依赖邮件）──
  const age = ageFromBirth(birth);
  const needGuardian = age !== null && age < 14;

  const registerReady =
    inviteCode.trim().length >= 6 && rUsername.trim() && rPassword.length >= 8 &&
    name.trim() && birth && grade &&
    (!needGuardian || (gEmail.trim() && gConsent));

  const register = async () => {
    setError('');
    if (needGuardian && (!gEmail.trim() || !gConsent)) {
      setError('未满 14 周岁，须填写监护人邮箱并勾选监护人同意');
      return;
    }
    if (!registerReady) { setError('请完整填写注册信息（密码至少 8 位）'); return; }
    setSubmitting(true);
    const res = await api.registerStudentInvite({
      invitation_code: inviteCode.trim().toUpperCase(),
      username: rUsername.trim(), password: rPassword,
      name: name.trim(), birth_date: birth, grade,
      ...(needGuardian ? { guardian_email: gEmail.trim(), guardian_consent: gConsent } : {}),
    });
    setSubmitting(false);
    if (!res.ok) { setError(res.error); return; }
    setToken(res.data.token);
    setUser(res.data.user);
    router.replace(postLoginTarget('/home'));
  };

  return (
    <div style={{
      minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--mn-paper)', padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

        {/* Brand */}
        <div style={{ textAlign: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="善学记 · 智慧学习助手"
            style={{ width: '224px', maxWidth: '72%', height: 'auto', display: 'block', margin: '0 auto 6px', borderRadius: '16px' }}
          />
          <p style={{ fontSize: '14px', color: 'var(--mn-ink-3)', lineHeight: 1.5 }}>
            认知状态追踪<br />每天进步一点点
          </p>
        </div>

        {/* Dev 快速登录 */}
        {IS_DEV && (
          <button
            type="button"
            onClick={devLogin}
            disabled={phase === 'loading'}
            style={{
              padding: '10px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
              border: '1.5px dashed var(--mn-border-2)', background: 'var(--mn-surface)',
              color: 'var(--mn-ink-2)', cursor: 'pointer', letterSpacing: '0.01em',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              transition: 'background var(--mn-duration-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--mn-surface-2)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--mn-surface)')}
          >
            <span style={{ opacity: 0.5 }}>⚡</span>
            开发者快速登录
            <span style={{ opacity: 0.4, fontSize: '11px', fontWeight: 400 }}>dev@mneme.local</span>
          </button>
        )}

        {/* Tab toggle */}
        <div style={{ display: 'flex', background: 'var(--mn-surface)', borderRadius: '12px', padding: '4px', border: '1px solid var(--mn-border)' }}>
          {(['login', 'register'] as Mode[]).map((m) => (
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
              {m === 'login' ? '登录' : '邀请码注册'}
            </button>
          ))}
        </div>

        {/* ── Login card ── */}
        {mode === 'login' && !setupOpen && (
          <div className="mn-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 凭证方式切换：验证码恒可用；密码是可选通道（后端未设密码时 401）。 */}
            <div style={{ display: 'flex', gap: '4px', padding: '4px', background: 'var(--mn-surface-2, var(--mn-surface))', borderRadius: '11px' }}>
              {([['code', '验证码登录'], ['password', '密码登录']] as [Method, string][]).map(([m, label]) => (
                <button
                  key={m} type="button" onClick={() => switchMethod(m)}
                  style={{
                    flex: 1, padding: '8px', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
                    border: 'none', cursor: 'pointer',
                    background: method === m ? 'var(--mn-blue)' : 'transparent',
                    color: method === m ? 'white' : 'var(--mn-ink-3)',
                    transition: 'all var(--mn-duration-fast)',
                  }}
                >{label}</button>
              ))}
            </div>

            {method === 'password' ? (
              <>
                <Field label="邮箱">
                  <input
                    type="email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" inputMode="email" autoComplete="email"
                    disabled={phase === 'loading'} style={inputStyle}
                  />
                </Field>
                <Field label="密码">
                  <input
                    type="password" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => { if (e.nativeEvent.isComposing) return; if (e.key === 'Enter') void loginByPassword(); }}
                    placeholder="至少 8 位" autoComplete="current-password"
                    disabled={phase === 'loading'} style={inputStyle}
                  />
                </Field>
                <p style={{ fontSize: '12px', color: 'var(--mn-ink-3)', margin: '-6px 0 0', lineHeight: 1.7 }}>
                  还没设过密码？切到「验证码登录」用验证码登录，登录后页面会直接让你设置密码。
                </p>
              </>
            ) : (
              <>
            {phase !== 'code' && (
              <Field label="邮箱">
                <input
                  type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => { if (e.nativeEvent.isComposing) return; if (e.key === 'Enter') void sendCode(); }}
                  placeholder="you@example.com" inputMode="email" autoComplete="email"
                  disabled={phase === 'loading'} style={inputStyle}
                />
              </Field>
            )}
            {phase === 'code' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--mn-ink-2)' }}>验证码</span>
                  <button type="button" onClick={() => setPhase('email')}
                    style={{ fontSize: '13px', color: 'var(--mn-blue)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                    {email} 修改
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
            ) : method === 'password' ? (
              <button type="button" className="mn-btn-primary" style={{ width: '100%' }}
                disabled={!email.trim() || !password} onClick={loginByPassword}>
                登录
              </button>
            ) : phase === 'email' ? (
              <button type="button" className="mn-btn-primary" style={{ width: '100%' }} disabled={!email.trim()} onClick={sendCode}>
                发送验证码
              </button>
            ) : (
              <button type="button" className="mn-btn-primary" style={{ width: '100%' }} disabled={code.length < 4} onClick={login}>
                登录
              </button>
            )}
          </div>
        )}

        {/* ── 登录后就地设置密码（仅当该账号尚未设过密码时出现）── */}
        {mode === 'login' && setupOpen && (
          <div className="mn-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--mn-ink)' }}>设置登录密码</div>
            <p style={{ fontSize: '13px', color: 'var(--mn-ink-3)', margin: '-6px 0 0', lineHeight: 1.7 }}>
              设置后可以用邮箱 + 密码登录，不用每次等验证码。验证码登录仍然保留。
            </p>
            <Field label="新密码">
              <input
                type="password" value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onKeyDown={(e) => { if (e.nativeEvent.isComposing) return; if (e.key === 'Enter') void savePassword(); }}
                placeholder="至少 8 位" autoComplete="new-password" style={inputStyle}
              />
            </Field>
            {setupMsg && (
              <div style={{ fontSize: '13px', color: setupMsg.startsWith('密码已设置') ? 'var(--mn-green, var(--mn-blue))' : 'var(--mn-red)', padding: '8px 12px', borderRadius: '8px', background: setupMsg.startsWith('密码已设置') ? 'var(--mn-blue-dim)' : 'var(--mn-red-dim)' }}>
                {setupMsg}
              </div>
            )}
            <button type="button" className="mn-btn-primary" style={{ width: '100%' }}
              disabled={newPassword.length < 8} onClick={savePassword}>
              保存并进入首页
            </button>
            <button type="button" className="mn-btn-secondary" style={{ width: '100%' }}
              onClick={() => router.replace(postLoginTarget('/home'))}>
              跳过，先用验证码登录
            </button>
          </div>
        )}

        {/* ── Register card ── */}
        {mode === 'register' && (
          <div className="mn-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--mn-ink-3)', lineHeight: 1.6, margin: 0 }}>
              善学记目前为邀请制。请输入管理员发放的邀请码，设置用户名和密码即可注册，
              无需邮箱验证。
            </p>

            <Field label="邀请码">
              <input
                type="text" value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="如 SXJ-ABCD-EFGH" autoComplete="off"
                style={{ ...inputStyle, letterSpacing: '0.08em' }}
              />
            </Field>

            <Field label="用户名">
              <input
                type="text" value={rUsername}
                onChange={(e) => setRUsername(e.target.value)}
                placeholder="登录用户名（字母/数字）" autoComplete="username"
                style={inputStyle}
              />
            </Field>

            <Field label="密码">
              <input
                type="password" value={rPassword}
                onChange={(e) => setRPassword(e.target.value)}
                placeholder="至少 8 位" autoComplete="new-password"
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
                <Field label="监护人邮箱">
                  <input type="email" value={gEmail} onChange={(e) => setGEmail(e.target.value)}
                    placeholder="监护人邮箱" inputMode="email" style={inputStyle} />
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

      </div>
    </div>
  );
}
