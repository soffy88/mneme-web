import {
  resolveApiBase,
  type MnemeFrontendEnvironment,
} from './api-base';

export { API_BASE_BY_ENV, resolveApiBase } from './api-base';

export const MNEME_FRONTEND_ENV = (
  process.env.NEXT_PUBLIC_MNEME_ENV
  ?? (process.env.NODE_ENV === 'production' ? 'production' : process.env.NODE_ENV ?? 'development')
) as MnemeFrontendEnvironment;

if (process.env.NEXT_PUBLIC_MNEME_API_BASE?.trim()) {
  throw new Error('NEXT_PUBLIC_MNEME_API_BASE is retired; set NEXT_PUBLIC_API_BASE');
}

export const MNEME_API_BASE = resolveApiBase({
  configured: process.env.NEXT_PUBLIC_API_BASE,
  environment: MNEME_FRONTEND_ENV,
});

export const USE_MOCK =
  (process.env.NEXT_PUBLIC_USE_MOCK ?? 'false').toLowerCase() === 'true';
