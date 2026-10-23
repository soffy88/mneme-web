import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { API_BASE_BY_ENV, resolveApiBase } from '../src/lib/env.ts';

test('production artifact is pinned to the same-origin API', () => {
  assert.equal(resolveApiBase({ environment: 'production' }), 'https://sxueji.com');
  assert.equal(
    resolveApiBase({ configured: 'https://sxueji.com', environment: 'production' }),
    'https://sxueji.com',
  );
});

test('demo and staging stay isolated from the production origin', () => {
  const demo = resolveApiBase({ configured: 'https://api-demo.sxueji.com', environment: 'demo' });
  const staging = resolveApiBase({
    configured: 'https://api-staging.sxueji.com',
    environment: 'staging',
  });
  const production = resolveApiBase({ environment: 'production' });
  assert.equal(new Set([demo, staging, production]).size, 3);
});

// Regression guard for the 2026-10-01 outage: the Dockerfile ARG is ENV-injected
// and Next's dotenv does not overwrite an existing process.env, so the ARG
// default silently wins over .env.production. When the two drifted apart the
// bundle shipped a host with no DNS record and every API call failed.
test('.env.production and the Dockerfile ARG cannot drift apart', async () => {
  const read = (relative) =>
    readFile(new URL(`../${relative}`, import.meta.url), 'utf8');
  const envProduction = await read('.env.production');
  const dockerfile = await read('Dockerfile');

  const fromEnv = /NEXT_PUBLIC_API_BASE=(\S+)/.exec(envProduction)?.[1];
  const fromDockerfile =
    /^ARG NEXT_PUBLIC_API_BASE=(\S+)/m.exec(dockerfile)?.[1];

  assert.ok(fromEnv, '.env.production must define NEXT_PUBLIC_API_BASE');
  assert.ok(fromDockerfile, 'Dockerfile must define ARG NEXT_PUBLIC_API_BASE');
  assert.equal(fromDockerfile, fromEnv, 'Dockerfile ARG and .env.production must agree');
  assert.equal(fromEnv, API_BASE_BY_ENV.production);
});

test('legacy API host and legacy variable cannot be used', () => {
  assert.throws(() => resolveApiBase({ configured: 'https://api.sxueji.com' }), /forbidden/);
  assert.throws(() => resolveApiBase({ configured: 'https://api.sxueji.com/v1' }), /forbidden/);
});

test('browser callers do not have independent API-base fallbacks', async () => {
  const files = [
    'src/components/reader/DocumentViewer.tsx',
    'src/components/reader/TextbookChat.tsx',
  ];
  for (const relative of files) {
    const source = await readFile(new URL(`../${relative}`, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /process\.env\.NEXT_PUBLIC_(?:API_BASE|MNEME_API_BASE)/);
    assert.doesNotMatch(source, /api\.sxueji\.com/);
  }
});
