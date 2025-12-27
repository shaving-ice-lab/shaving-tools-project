'use client'

import { useEffect, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { BackButton } from '../components/BackButton'
import { useFrameRate, getRefreshRateLabel } from '../hooks/useFrameRate'

export default function RefreshRateTestPage() {
  const stats = useFrameRate(60)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let x = 0
    const speed = 5
    const boxSize = 30
    let animationId: number

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = '#22c55e'
      ctx.fillRect(x, (canvas.height - boxSize) / 2, boxSize, boxSize)

      x += speed
      if (x > canvas.width) x = -boxSize

      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [])

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <BackButton />

      <div className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>屏幕刷新率测试</CardTitle>
            <CardDescription>使用 requestAnimationFrame 精准测量屏幕实际刷新率</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="text-6xl font-bold text-primary">{stats.avgFps} Hz</div>
              <div className="text-muted-foreground mt-2">{getRefreshRateLabel(stats.avgFps)}</div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted">
                <div className="text-2xl font-semibold">{stats.fps}</div>
                <div className="text-sm text-muted-foreground">当前FPS</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted">
                <div className="text-2xl font-semibold">{stats.avgFps}</div>
                <div className="text-sm text-muted-foreground">平均FPS</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted">
                <div className="text-2xl font-semibold">{stats.minDelta === Infinity ? '-' : stats.minDelta.toFixed(2)}ms</div>
                <div className="text-sm text-muted-foreground">最小帧时间</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted">
                <div className="text-2xl font-semibold">{stats.maxDelta === 0 ? '-' : stats.maxDelta.toFixed(2)}ms</div>
                <div className="text-sm text-muted-foreground">最大帧时间</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>动态指示器</CardTitle>
            <CardDescription>观察方块移动的流畅度，高刷新率屏幕会更加平滑</CardDescription>
          </CardHeader>
          <CardContent>
            <canvas ref={canvasRef} width={800} height={100} className="w-full h-24 bg-black rounded-lg" />
          </CardContent>
        </Card>

        <Alert>
          <AlertDescription>
            💡 <strong>注意事项：</strong>
            <ul className="mt-2 space-y-1">
              <li>• 确保浏览器没有被节流（非后台标签页）</li>
              <li>• 关闭省电模式以获得准确结果</li>
              <li>• 部分浏览器可能限制最大刷新率</li>
              <li>• 高刷屏幕：90Hz/120Hz/144Hz/165Hz</li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
