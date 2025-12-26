"use client"

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BackButton } from '../components/BackButton';
import { SpeedConfig } from '../types';

const SPEEDS: SpeedConfig[] = [
  { name: '慢速', pixelsPerFrame: 2 },
  { name: '中速', pixelsPerFrame: 5 },
  { name: '快速', pixelsPerFrame: 10 },
  { name: '极速', pixelsPerFrame: 20 },
];

export default function ResponseTimeTestPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [speed, setSpeed] = useState(SPEEDS[1]);
  const [showUFO, setShowUFO] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let x = 0;
    const height = canvas.height;
    const objectHeight = 40;
    const objectWidth = showUFO ? 80 : 40;
    let animationId: number;

    const animate = () => {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }

      const y = (height - objectHeight) / 2;

      if (showUFO) {
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.ellipse(x + objectWidth / 2, y + objectHeight / 2, objectWidth / 2, objectHeight / 3, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#4ade80';
        ctx.beginPath();
        ctx.ellipse(x + objectWidth / 2, y + objectHeight / 3, objectWidth / 4, objectHeight / 5, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(x, y, objectWidth, objectHeight);
      }

      x += speed.pixelsPerFrame;
      if (x > canvas.width) x = -objectWidth;

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [speed, showUFO]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <BackButton />

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>响应时间测试（拖影测试）</CardTitle>
            <CardDescription>
              观察移动物体的拖影程度，评估屏幕响应时间
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <canvas
              ref={canvasRef}
              width={800}
              height={150}
              className="w-full h-36 rounded-lg"
            />

            <div className="flex flex-wrap gap-2">
              {SPEEDS.map(s => (
                <Button
                  key={s.name}
                  variant={speed.name === s.name ? 'default' : 'outline'}
                  onClick={() => setSpeed(s)}
                >
                  {s.name}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="ufo-mode"
                checked={showUFO}
                onCheckedChange={setShowUFO}
              />
              <Label htmlFor="ufo-mode">UFO图案模式</Label>
            </div>

            <Alert>
              <AlertDescription>
                💡 <strong>判断标准：</strong>
                <ul className="mt-2 space-y-1">
                  <li>• 拖影越少说明响应时间越快</li>
                  <li>• 优秀的屏幕（1ms响应）几乎看不到拖影</li>
                  <li>• 普通屏幕（5ms+）会有明显的残影拖尾</li>
                  <li>• 游戏玩家建议选择低响应时间的显示器</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
