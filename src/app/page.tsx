import { redirect } from 'next/navigation';

export default function RootPage() {
  // 实际项目:检查 cookie/token 决定跳哪里
  // starter 直接跳 /home(mock 模式不需要真登录)
  redirect('/home');
}
