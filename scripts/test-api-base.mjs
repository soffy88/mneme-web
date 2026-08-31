import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { API_BASE_BY_ENV, resolveApiBase } from '../src/lib/api-base.ts';

test('production artifact uses the dedicated production API', () => {
  assert.equal(
    resolveApiBase({ configured: 'https://api-prod.sxueji.com', environment: 'production' }),
    'https://api-prod.sxueji.com',
  );
  assert.throws(
    () => resolveApiBase({ environment: 'production' }),
    /required for production artifacts/,
  );
  assert.notEqual(API_BASE_BY_ENV.production, 'https://api.sxueji.com');
});

test('demo, staging, and production routes are isolated', () => {
  const routes = [
    resolveApiBase({ configured: 'https://api-demo.sxueji.com', environment: 'demo' }),
    resolveApiBase({ configured: 'https://api-staging.sxueji.com', environment: 'staging' }),
    resolveApiBase({ configured: 'https://api-prod.sxueji.com', environment: 'production' }),
  ];
  assert.equal(new Set(routes).size, 3);
  for (const environment of ['demo', 'staging', 'production']) {
    assert.throws(() => resolveApiBase({ environment }), /required/);
  }
});

test('legacy host and legacy variable cannot be used', () => {
  assert.throws(() => resolveApiBase({ configured: 'https://api.sxueji.com' }), /forbidden/);
  assert.throws(() => resolveApiBase({ configured: 'https://api.sxueji.com/v1' }), /forbidden/);
  assert.throws(
    () => resolveApiBase({ configured: 'https://api-prod.sxueji.com?route=legacy' }),
    /query data/,
  );
});

test('browser callers have no independent API-base fallback', async () => {
  const files = [
    'src/components/reader/DocumentViewer.tsx',
    'src/components/reader/TextbookChat.tsx',
  ];
  for (const relative of files) {
    const source = await readFile(new URL(`../${relative}`, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /process\.env\.NEXT_PUBLIC_(?:API_BASE|MNEME_API_BASE)/);
    assert.doesNotMatch(source, /localhost:800[01]/);
  }
});
