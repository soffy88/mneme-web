import { ParentShell } from '@/components/layout/MnemeShell';

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return <ParentShell>{children}</ParentShell>;
}
