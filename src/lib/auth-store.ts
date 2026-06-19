/**
 * auth-store — JWT token + 当前用户 简单管理。
 *
 * 只在客户端用(localStorage)。
 * Next.js App Router 的 Server Component 里不调这里。
 */
import type { UserProfile } from '@/types/api';

const KEY = 'mneme_token';
const USER_KEY = 'mneme_user';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(KEY);
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, token);
}

export function setUser(user: UserProfile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as UserProfile; } catch { return null; }
}

/** 当前登录用户 id。未登录返回 null(不回退任何 mock id)。 */
export function getUserId(): string | null {
  return getUser()?.id ?? null;
}

export function clearToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
  localStorage.removeItem(USER_KEY);
}

export function authHeader(): Record<string, string> {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}
