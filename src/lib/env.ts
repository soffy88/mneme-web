// ── env ──────────────────────────────────────────────────────
// 兼容两种变量名:NEXT_PUBLIC_API_BASE(后端约定)/ NEXT_PUBLIC_MNEME_API_BASE(历史)
export const MNEME_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  process.env.NEXT_PUBLIC_MNEME_API_BASE ??
  'http://localhost:8001';
export const USE_MOCK =
  (process.env.NEXT_PUBLIC_USE_MOCK ?? 'false').toLowerCase() === 'true';
