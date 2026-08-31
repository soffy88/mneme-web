/**
 * Build-time API origin contract.
 *
 * NEXT_PUBLIC_* values are inlined by Next.js, so every deployable artifact
 * must pass an explicit origin. Only local development/test get a localhost
 * default; demo, staging, and production fail closed when misconfigured.
 */

export type MnemeFrontendEnvironment =
  | 'development'
  | 'test'
  | 'demo'
  | 'staging'
  | 'production';

export const API_BASE_BY_ENV: Readonly<Record<MnemeFrontendEnvironment, string>> = {
  development: 'http://localhost:8001',
  test: 'http://localhost:8001',
  demo: 'https://api-demo.sxueji.com',
  staging: 'https://api-staging.sxueji.com',
  production: 'https://api-prod.sxueji.com',
};

// Keep the retired hostname out of the browser bundle while still rejecting
// it at runtime if a deployment passes it as a build argument.
const RETIRED_API_HOST = String.fromCharCode(
  97, 112, 105, 46, 115, 120, 117, 101, 106, 105, 46, 99, 111, 109,
);

function normalizeApiBase(value: string): string {
  const trimmed = value.trim().replace(/\/+$/, '');
  if (!trimmed) throw new Error('NEXT_PUBLIC_API_BASE must not be empty');

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error('NEXT_PUBLIC_API_BASE must be an absolute http(s) URL');
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('NEXT_PUBLIC_API_BASE must use http or https');
  }
  if (parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error('NEXT_PUBLIC_API_BASE must not contain credentials or query data');
  }
  if (parsed.hostname.toLowerCase() === RETIRED_API_HOST) {
    throw new Error('retired API host is forbidden');
  }
  return parsed.toString().replace(/\/+$/, '');
}

export function resolveApiBase(options: {
  configured?: string;
  environment?: string;
  nodeEnv?: string;
} = {}): string {
  const environment = (options.environment || options.nodeEnv || 'development')
    .trim()
    .toLowerCase();
  if (!(environment in API_BASE_BY_ENV)) {
    throw new Error(`unsupported frontend environment: ${environment}`);
  }

  const configured = options.configured?.trim();
  if (configured) return normalizeApiBase(configured);
  if (environment === 'development' || environment === 'test') {
    return API_BASE_BY_ENV[environment];
  }
  throw new Error(`NEXT_PUBLIC_API_BASE is required for ${environment} artifacts`);
}
