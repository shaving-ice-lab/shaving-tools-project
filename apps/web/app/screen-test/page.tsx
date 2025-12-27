'use client'

import { Monitor, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TestCard } from './components/TestCard'
import { TEST_CONFIGS } from './lib/test-configs'

export default function ScreenTestPage() {
  const categories = [
    { id: 'pixel', name: '像素检测', tests: TEST_CONFIGS.filter(t => t.category === 'pixel') },
    { id: 'color', name: '色彩测试', tests: TEST_CONFIGS.filter(t => t.category === 'color') },
    { id: 'motion', name: '动态测试', tests: TEST_CONFIGS.filter(t => t.category === 'motion') },
    { id: 'display', name: '显示测试', tests: TEST_CONFIGS.filter(t => t.category === 'display') },
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-4">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-xl bg-primary/10">
          <Monitor className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">屏幕显示测试工具</h1>
          <p className="text-muted-foreground mt-1">专业级屏幕质量检测与分析</p>
        </div>
      </div>

      <div className="space-y-8">
        {categories.map(category => (
          <section key={category.id}>
            <h2 className="text-xl font-semibold mb-4 text-muted-foreground">{category.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.tests.map(test => (
                <TestCard key={test.id} config={test} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-12 p-6 rounded-lg bg-muted/50">
        <h3 className="font-semibold mb-2">使用说明</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• 建议在暗室环境下进行测试以获得最佳效果</li>
          <li>• 部分测试支持全屏模式，点击进入后按 ESC 退出</li>
          <li>• 坏点检测时请仔细观察屏幕各个区域</li>
          <li>• PWM测试需要使用相机拍摄屏幕</li>
        </ul>
      </div>
    </div>
  )
}
