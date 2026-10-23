import { MnemeShell } from '@/components/layout/MnemeShell';

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return <MnemeShell>{children}</MnemeShell>;
}
