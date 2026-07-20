import type { Metadata } from 'next';
import { ThemeProvider, LangProvider } from '@helios/blocks';
import './globals.css';
import { RegisterSW } from '@/components/shared/RegisterSW';
import { OfflineSync } from '@/components/shared/OfflineSync';

export const metadata: Metadata = {
  metadataBase: new URL('https://sxueji.com'),
  title: 'Mneme 善学记',
  description: 'K12 认知状态追踪 — 善学记',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    shortcut: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  openGraph: {
    title: '善学记 · 智慧学习助手',
    description: '做题即时判分、错题自动入本、看见自己在变好 — KT+FSRS 学习成长档案',
    url: 'https://sxueji.com',
    siteName: '善学记',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: '善学记 · 智慧学习助手' }],
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '善学记 · 智慧学习助手',
    description: '做题即时判分、错题自动入本、看见自己在变好',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <RegisterSW />
        <OfflineSync />
        <ThemeProvider theme="mneme-friendly">
          <LangProvider lang="zh">
            {/* 学生端产品用纯中文(ToC 国内);家长端同理。如需双语改 zh-en */}
            {children}
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
