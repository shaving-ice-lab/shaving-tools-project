'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { BackButton } from '../components/BackButton'
import { COLOR_GAMUTS } from '../lib/colors'

export default function ColorGamutTestPage() {
  const [activeGamut, setActiveGamut] = useState('sRGB')

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <BackButton />

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>色域覆盖测试</CardTitle>
            <CardDescription>比较不同色域标准下的颜色显示能力</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={activeGamut} onValueChange={setActiveGamut}>
              <TabsList className="w-full">
                {COLOR_GAMUTS.map(gamut => (
                  <TabsTrigger key={gamut.name} value={gamut.name} className="flex-1">
                    {gamut.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {COLOR_GAMUTS.map(gamut => (
                <TabsContent key={gamut.name} value={gamut.name}>
                  <p className="text-sm text-muted-foreground mb-4">{gamut.description}</p>
                  <div className="grid grid-cols-3 gap-4">
                    {gamut.colors.map(color => (
                      <div
                        key={color.name}
                        className="aspect-video rounded-lg flex items-end justify-center pb-2"
                        style={{ backgroundColor: color.value }}
                      >
                        <span className="text-white text-sm drop-shadow-lg">{color.name}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            <div className="mt-6">
              <h3 className="font-medium mb-3">色域对比</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-2">sRGB 红</div>
                  <div className="h-20 rounded-lg" style={{ backgroundColor: '#FF0000' }} />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-2">P3 红</div>
                  <div className="h-20 rounded-lg" style={{ backgroundColor: 'color(display-p3 1 0 0)' }} />
                </div>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                💡 <strong>如何判断：</strong>
                <ul className="mt-2 space-y-1">
                  <li>• 如果P3色域的红色和sRGB红色看起来完全一样，说明您的屏幕不支持广色域</li>
                  <li>• 支持广色域的屏幕会显示更加鲜艳饱和的颜色</li>
                  <li>• P3色域覆盖比sRGB大约多25%的色彩空间</li>
                  <li>• 专业显示器和新款手机通常支持P3色域</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
