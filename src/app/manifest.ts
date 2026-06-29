import type { MetadataRoute } from 'next';

// PWA manifest — 让学生可"添加到主屏幕"，像 app 一样用（提升回访/习惯）。
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Mneme 善学记',
    short_name: '善学记',
    description: '做题即时判分、错题自动入本、看见自己在变好',
    start_url: '/home',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#0066ff',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
  };
}
