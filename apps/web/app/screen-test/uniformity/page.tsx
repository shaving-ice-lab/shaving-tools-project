'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { BackButton } from '../components/BackButton'

export default function UniformityTestPage() {
  const [brightness, setBrightness] = useState(50)
  const [showGrid, setShowGrid] = useState(true)

  const grayValue = Math.round((brightness / 100) * 255)
  const bgColor = `rgb(${grayValue}, ${grayValue}, ${grayValue})`

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <BackButton />

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>亮度均匀性测试</CardTitle>
            <CardDescription>在暗室中观察屏幕各区域亮度是否一致</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="w-full h-64 md:h-96 rounded-lg relative" style={{ backgroundColor: bgColor }}>
              {showGrid && (
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                  {Array.from({ length: 9 }, (_, i) => (
                    <div key={i} className="border border-white/20 flex items-center justify-center">
                      <span className="text-white/50 text-sm">区域 {i + 1}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>亮度级别</Label>
                <span className="text-muted-foreground">{brightness}%</span>
              </div>
              <Slider value={[brightness]} onValueChange={([v]) => setBrightness(v)} min={0} max={100} step={1} />
            </div>

            <div className="flex items-center gap-2">
              <Switch id="show-grid" checked={showGrid} onCheckedChange={setShowGrid} />
              <Label htmlFor="show-grid">显示九宫格</Label>
            </div>

            <Alert>
              <AlertDescription>
                💡 <strong>检测要点：</strong>
                <ul className="mt-2 space-y-1">
                  <li>• 在5%左右的低亮度下，如果四角出现明显亮光，说明存在漏光问题（IPS屏幕常见）</li>
                  <li>• 调至50%灰度观察是否有云状不均匀（阴阳屏）</li>
                  <li>• 各区域亮度应该一致，无明显明暗差异</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
