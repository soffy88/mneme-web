import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('Docker build contract passes an explicit environment and API origin', async () => {
  const dockerfile = await readFile(new URL('../Dockerfile', import.meta.url), 'utf8');
  assert.match(dockerfile, /ARG NEXT_PUBLIC_MNEME_ENV=production/);
  assert.match(dockerfile, /ARG NEXT_PUBLIC_API_BASE=https:\/\/api-prod\.sxueji\.com/);
  assert.match(dockerfile, /ENV NEXT_PUBLIC_API_BASE=\$\{NEXT_PUBLIC_API_BASE\}/);
  assert.match(dockerfile, /RUN test -n "\$NEXT_PUBLIC_API_BASE"/);
});

test('artifact environment files remain distinct', async () => {
  const [demo, staging, production] = await Promise.all(
    ['.env.demo.example', '.env.staging.example', '.env.production'].map(
      name => readFile(new URL(`../${name}`, import.meta.url), 'utf8'),
    ),
  );
  assert.match(demo, /NEXT_PUBLIC_MNEME_ENV=demo/);
  assert.match(demo, /NEXT_PUBLIC_API_BASE=https:\/\/api-demo\.sxueji\.com/);
  assert.match(staging, /NEXT_PUBLIC_MNEME_ENV=staging/);
  assert.match(staging, /NEXT_PUBLIC_API_BASE=https:\/\/api-staging\.sxueji\.com/);
  assert.match(production, /NEXT_PUBLIC_MNEME_ENV=production/);
  assert.match(production, /NEXT_PUBLIC_API_BASE=https:\/\/api-prod\.sxueji\.com/);
});
