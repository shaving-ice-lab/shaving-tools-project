import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '屏幕显示测试工具 - Shaving Tools',
  description: '专业级屏幕质量检测与分析工具，支持坏点检测、刷新率测试、PWM频闪检测等多种测试模式',
}

export default function ScreenTestLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background">{children}</div>
}
