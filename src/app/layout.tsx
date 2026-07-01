import type { Metadata } from 'next';
import { ThemeProvider, LangProvider } from '@helios/blocks';
import './globals.css';
import { RegisterSW } from '@/components/shared/RegisterSW';
import { OfflineSync } from '@/components/shared/OfflineSync';

export const metadata: Metadata = {
  title: 'Mneme 善学记',
  description: 'K12 认知状态追踪 — 善学记',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
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
