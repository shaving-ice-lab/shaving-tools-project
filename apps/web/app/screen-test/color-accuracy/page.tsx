'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { BackButton } from '../components/BackButton'
import { COLOR_CHECKER_COLORS } from '../lib/colors'

export default function ColorAccuracyTestPage() {
  const [showLabels, setShowLabels] = useState(true)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <BackButton />

      <div className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>色彩准确度测试 - ColorChecker 24色卡</CardTitle>
            <CardDescription>对比标准色卡评估屏幕色彩还原能力</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-6 gap-1">
              {COLOR_CHECKER_COLORS.map((color, index) => (
                <div key={index} className="aspect-square rounded flex items-end justify-center pb-1" style={{ backgroundColor: color.value }}>
                  {showLabels && <span className="text-[10px] text-white drop-shadow-lg text-center leading-tight">{color.name}</span>}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Switch id="show-labels" checked={showLabels} onCheckedChange={setShowLabels} />
              <Label htmlFor="show-labels">显示色块名称</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>灰阶测试</CardTitle>
            <CardDescription>检查从纯黑到纯白的过渡是否平滑</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-16 rounded-lg overflow-hidden">
              {Array.from({ length: 16 }, (_, i) => {
                const value = Math.round((i / 15) * 255)
                return <div key={i} className="flex-1 h-full" style={{ backgroundColor: `rgb(${value}, ${value}, ${value})` }} />
              })}
            </div>
            <p className="text-sm text-muted-foreground mt-2">优秀的屏幕应该能够区分所有灰阶级别，没有明显的断层或色偏</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>色彩渐变测试</CardTitle>
            <CardDescription>检查色彩过渡是否平滑，是否存在色带</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground mb-1">红色渐变</div>
              <div className="h-12 rounded" style={{ background: 'linear-gradient(to right, #000000, #FF0000)' }} />
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">绿色渐变</div>
              <div className="h-12 rounded" style={{ background: 'linear-gradient(to right, #000000, #00FF00)' }} />
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">蓝色渐变</div>
              <div className="h-12 rounded" style={{ background: 'linear-gradient(to right, #000000, #0000FF)' }} />
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">彩虹渐变</div>
              <div
                className="h-12 rounded"
                style={{ background: 'linear-gradient(to right, #FF0000, #FFFF00, #00FF00, #00FFFF, #0000FF, #FF00FF)' }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
