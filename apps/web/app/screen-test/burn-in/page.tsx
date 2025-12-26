"use client"

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BackButton } from '../components/BackButton';
import { BURN_IN_COLORS } from '../lib/colors';
import { Maximize } from 'lucide-react';

export default function BurnInTestPage() {
  const [testColor, setTestColor] = useState('#808080');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const enterFullscreen = async () => {
    if (containerRef.current && document.fullscreenEnabled) {
      try {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } catch (error) {
        console.error('Fullscreen request failed:', error);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <BackButton />

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>OLED烧屏检测</CardTitle>
            <CardDescription>
              检测OLED屏幕是否存在老化/烧屏痕迹
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              ref={containerRef}
              className="w-full h-64 md:h-96 rounded-lg flex items-center justify-center cursor-pointer"
              style={{ backgroundColor: testColor }}
              onClick={() => isFullscreen && document.exitFullscreen()}
            >
              {!isFullscreen && (
                <Button variant="secondary" onClick={enterFullscreen} className="gap-2">
                  <Maximize className="h-4 w-4" />
                  全屏检测
                </Button>
              )}
              {isFullscreen && (
                <div className="text-white/50 text-sm">
                  点击退出全屏
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {BURN_IN_COLORS.map(color => (
                <Button
                  key={color.value}
                  variant={testColor === color.value ? 'default' : 'outline'}
                  onClick={() => setTestColor(color.value)}
                >
                  {color.name}
                </Button>
              ))}
            </div>

            <Alert variant="destructive">
              <AlertDescription>
                ⚠️ <strong>检测要点：</strong>
                <ul className="mt-2 space-y-1">
                  <li>• 状态栏区域（电量、时间图标位置）</li>
                  <li>• 底部导航栏区域</li>
                  <li>• 键盘常用区域</li>
                  <li>• 社交App底部图标位置</li>
                </ul>
                如果在灰色背景下看到淡淡的图标轮廓，说明存在烧屏。
              </AlertDescription>
            </Alert>

            <Alert>
              <AlertDescription>
                💡 <strong>预防烧屏建议：</strong>
                <ul className="mt-2 space-y-1">
                  <li>• 避免长时间显示静态内容</li>
                  <li>• 使用深色主题减少OLED像素负担</li>
                  <li>• 适当降低屏幕亮度</li>
                  <li>• 使用屏幕保护程序</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
