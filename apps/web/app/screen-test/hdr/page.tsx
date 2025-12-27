'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { BackButton } from '../components/BackButton'

export default function HDRTestPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <BackButton />

      <div className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>HDR显示效果测试</CardTitle>
            <CardDescription>测试屏幕的高动态范围显示能力</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black p-6 rounded-lg">
                <div className="text-white text-center">
                  <div className="font-medium">纯黑区域</div>
                  <div className="text-xs text-gray-400 mt-1">应该完全黑暗（OLED）或接近黑暗（LCD）</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg">
                <div className="text-black text-center">
                  <div className="font-medium">纯白区域</div>
                  <div className="text-xs text-gray-600 mt-1">应该足够明亮且不刺眼</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>高光细节测试</Label>
              <div
                className="h-24 rounded-lg"
                style={{
                  background: 'linear-gradient(to right, #FFFFFF, #FFFFEE, #FFFFCC, #FFFF99, #FFFF66, #FFFF33, #FFFF00)',
                }}
              />
              <p className="text-xs text-muted-foreground">应该能够区分从纯白到亮黄的所有层次</p>
            </div>

            <div className="space-y-2">
              <Label>暗部细节测试</Label>
              <div
                className="h-24 rounded-lg"
                style={{
                  background:
                    'linear-gradient(to right, #000000, #050505, #0A0A0A, #0F0F0F, #141414, #191919, #1E1E1E, #232323, #282828, #2D2D2D, #323232)',
                }}
              />
              <p className="text-xs text-muted-foreground">应该能够区分从纯黑到深灰的所有层次</p>
            </div>

            <div className="space-y-2">
              <Label>对比度测试</Label>
              <div className="h-24 rounded-lg overflow-hidden flex">
                <div className="flex-1 bg-black" />
                <div className="flex-1 bg-white" />
              </div>
              <p className="text-xs text-muted-foreground">黑白分界线应该清晰锐利，无光晕或渗色</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>高动态范围渐变</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div
              className="h-16 rounded-lg"
              style={{
                background: 'linear-gradient(to right, #000000 0%, #111111 10%, #333333 30%, #666666 50%, #999999 70%, #CCCCCC 90%, #FFFFFF 100%)',
              }}
            />
            <p className="text-xs text-muted-foreground">HDR屏幕应该能同时保留高光和暗部的细节，普通SDR屏幕在极端亮度下会丢失细节</p>
          </CardContent>
        </Card>

        <Alert>
          <AlertDescription>
            💡 <strong>HDR测试说明：</strong>
            <ul className="mt-2 space-y-1">
              <li>• 确保系统已开启HDR模式（如果支持）</li>
              <li>• HDR屏幕的峰值亮度通常在400-1000尼特以上</li>
              <li>• OLED屏幕的黑色表现最佳（纯黑）</li>
              <li>• 优秀的HDR屏幕对比度可达100万:1以上</li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
