'use client'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { BackButton } from '../components/BackButton'
import { useDeviceOrientation, getAngleQuality } from '../hooks/useDeviceOrientation'

export default function ViewingAngleTestPage() {
  const { angle, isSupported, requestPermission, hasPermission } = useDeviceOrientation()
  const quality = getAngleQuality(angle.gamma)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <BackButton />

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>可视角度测试</CardTitle>
            <CardDescription>倾斜设备观察不同角度下的显示效果</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isSupported ? (
              <Alert variant="destructive">
                <AlertDescription>您的设备不支持陀螺仪，无法进行可视角度测试</AlertDescription>
              </Alert>
            ) : !hasPermission ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">需要获取陀螺仪权限才能进行测试</p>
                <Button onClick={requestPermission}>授权使用陀螺仪</Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="text-2xl font-bold">{angle.beta.toFixed(1)}°</div>
                    <div className="text-sm text-muted-foreground">前后倾斜</div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <div className={`text-2xl font-bold ${quality.color}`}>{Math.abs(angle.gamma).toFixed(1)}°</div>
                    <div className="text-sm text-muted-foreground">左右倾斜</div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="text-2xl font-bold">{angle.alpha.toFixed(1)}°</div>
                    <div className="text-sm text-muted-foreground">旋转角度</div>
                  </div>
                </div>

                <div className={`text-center text-lg font-medium ${quality.color}`}>{quality.text}</div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="aspect-square bg-red-500 rounded-lg" />
                  <div className="aspect-square bg-green-500 rounded-lg" />
                  <div className="aspect-square bg-blue-500 rounded-lg" />
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <div className="h-16 rounded-lg" style={{ background: 'linear-gradient(to right, #000000, #FFFFFF)' }} />
                </div>
              </>
            )}

            <Alert>
              <AlertDescription>
                💡 <strong>面板类型特点：</strong>
                <ul className="mt-2 space-y-1">
                  <li>
                    • <strong>IPS屏幕</strong>：可视角度约178°，侧看色彩几乎不变
                  </li>
                  <li>
                    • <strong>VA屏幕</strong>：可视角度较窄，侧看会明显变色变暗
                  </li>
                  <li>
                    • <strong>TN屏幕</strong>：可视角度最差，侧看色彩失真严重
                  </li>
                  <li>
                    • <strong>OLED屏幕</strong>：可视角度优秀，但大角度可能偏色
                  </li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
