/* Mneme service worker — 离线/弱网可用（手写，无额外构建依赖）。
 * 策略：
 *  - 静态资源(_next/static, 图片, 字体, manifest, icon)：cache-first（装一次后离线秒开）。
 *  - 导航请求(页面)：network-first → 失败回退缓存 → 再失败给离线兜底页。
 *  - 公共题库读(GET /v1/question-bank, /v1/practice/topics)：network-first → 缓存回退
 *    （已加载过的主题离线也能再练；这些是公开题，无 PII）。
 *  - 其余 API / POST / 鉴权 / SSE：network-only（不缓存，离线则失败由前端处理）。
 */
const VERSION = 'mneme-v1';
const STATIC_CACHE = `${VERSION}-static`;
const PAGE_CACHE = `${VERSION}-pages`;
const API_CACHE = `${VERSION}-api`;

const OFFLINE_HTML =
  '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
  '<title>离线</title><body style="font-family:system-ui;display:flex;height:100vh;margin:0;align-items:center;' +
  'justify-content:center;flex-direction:column;color:#1e3a5f;background:#f8f6f2">' +
  '<div style="font-size:40px">📡</div><div style="font-weight:700;margin-top:8px">当前离线</div>' +
  '<div style="font-size:13px;color:#888;margin-top:4px">已缓存的练习仍可继续；联网后自动恢复</div></body>';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  );
});

function isStatic(url) {
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname === '/manifest.webmanifest' ||
    /\.(png|jpg|jpeg|svg|webp|ico|woff2?|ttf|css|js)$/.test(url.pathname)
  );
}

function isCacheableApi(url) {
  return (
    url.pathname.startsWith('/v1/question-bank') ||
    url.pathname.startsWith('/v1/practice/topics')
  );
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return; // 不缓存 POST/PUT 等
  const url = new URL(request.url);

  // 1) 静态资源：cache-first
  if (isStatic(url)) {
    event.respondWith(
      caches.match(request).then((hit) =>
        hit ||
        fetch(request).then((res) => {
          const copy = res.clone();
          caches.open(STATIC_CACHE).then((c) => c.put(request, copy));
          return res;
        }),
      ),
    );
    return;
  }

  // 2) 页面导航：network-first → 缓存 → 离线兜底
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(PAGE_CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() =>
          caches.match(request).then(
            (hit) => hit || new Response(OFFLINE_HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8' } }),
          ),
        ),
    );
    return;
  }

  // 3) 公共题库读：network-first → 缓存回退（离线再练已加载主题）
  if (isCacheableApi(url)) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(API_CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request)),
    );
    return;
  }

  // 4) 其余（含鉴权 API / SSE）：network-only
});
