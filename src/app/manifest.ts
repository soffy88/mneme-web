import type { MetadataRoute } from 'next';

// PWA manifest — 让学生可"添加到主屏幕"，像 app 一样用（提升回访/习惯）。
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/home',
    name: 'Mneme 善学记',
    short_name: '善学记',
    description: '做题即时判分、错题自动入本、看见自己在变好',
    start_url: '/home',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    lang: 'zh-CN',
    dir: 'ltr',
    categories: ['education'],
    background_color: '#f8f6f2',
    theme_color: '#1e3a5f', // 与 --mn-blue 一致(此前 #2E63E0 不是品牌色)
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    // 桌面/PWA 长按快捷入口:高频动线一步直达
    shortcuts: [
      {
        name: '今日任务',
        short_name: '今日',
        description: '查看今日目标与复习安排',
        url: '/home',
        icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: '开始练习',
        short_name: '练习',
        description: '直接开始一组专项练习',
        url: '/practice',
        icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: '错题本',
        short_name: '错题',
        description: '回顾做错过的题',
        url: '/error-journal',
        icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
    ],
  };
}
