'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { BackButton } from '../components/BackButton'
import { DEAD_PIXEL_COLORS } from '../lib/colors'
import { Maximize, ChevronLeft, ChevronRight } from 'lucide-react'

export default function DeadPixelTestPage() {
  const [colorIndex, setColorIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const currentColor = DEAD_PIXEL_COLORS[colorIndex]

  const enterFullscreen = async () => {
    if (containerRef.current && document.fullscreenEnabled) {
      try {
        await containerRef.current.requestFullscreen()
        setIsFullscreen(true)
      } catch (error) {
        console.error('Fullscreen request failed:', error)
      }
    }
  }

  const nextColor = () => {
    setColorIndex(prev => (prev + 1) % DEAD_PIXEL_COLORS.length)
  }

  const prevColor = () => {
    setColorIndex(prev => (prev - 1 + DEAD_PIXEL_COLORS.length) % DEAD_PIXEL_COLORS.length)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowRight') {
        e.preventDefault()
        nextColor()
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prevColor()
      }
      if (e.key === 'Escape') {
        setIsFullscreen(false)
      }
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    window.addEventListener('keydown', handleKeyDown)
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <BackButton />

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>坏点检测</CardTitle>
            <CardDescription>通过纯色背景检测屏幕坏点、亮点、暗点</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              ref={containerRef}
              className="w-full h-64 md:h-96 rounded-lg cursor-pointer transition-colors duration-200 flex items-center justify-center relative"
              style={{ backgroundColor: currentColor.value }}
              onClick={isFullscreen ? nextColor : undefined}
            >
              {!isFullscreen && (
                <Button onClick={enterFullscreen} variant="secondary" className="gap-2">
                  <Maximize className="h-4 w-4" />
                  开始全屏检测
                </Button>
              )}
              {isFullscreen && <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">点击切换颜色 | ESC 退出</div>}
            </div>

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={prevColor} className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                上一个
              </Button>
              <div className="text-center">
                <div className="font-medium">{currentColor.name}</div>
                <div className="text-sm text-muted-foreground">{currentColor.description}</div>
              </div>
              <Button variant="outline" onClick={nextColor} className="gap-2">
                下一个
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {DEAD_PIXEL_COLORS.map((color, index) => (
                <button
                  key={color.value}
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${
                    index === colorIndex ? 'border-primary scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setColorIndex(index)}
                  title={color.name}
                />
              ))}
            </div>

            <Alert>
              <AlertDescription>
                💡 <strong>检测方法：</strong>
                <ul className="mt-2 space-y-1">
                  <li>• 点击全屏后，仔细观察屏幕各个区域</li>
                  <li>• 白色背景下寻找黑点/暗点</li>
                  <li>• 黑色背景下寻找亮点/白点</li>
                  <li>• RGB背景下检测对应颜色子像素</li>
                  <li>• 使用方向键或点击切换颜色</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
