"use client"

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BackButton } from '../components/BackButton';
import { PWM_CONFIGS } from '../lib/colors';
import { Play, Pause } from 'lucide-react';

export default function PWMFlickerTestPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [selectedFreq, setSelectedFreq] = useState(240);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const selectedConfig = PWM_CONFIGS.find(c => c.frequency === selectedFreq);

  useEffect(() => {
    if (!isRunning || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isWhite = true;
    const intervalMs = 1000 / (selectedFreq * 2);

    const interval = setInterval(() => {
      ctx.fillStyle = isWhite ? '#FFFFFF' : '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      isWhite = !isWhite;
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isRunning, selectedFreq]);

  useEffect(() => {
    if (!isRunning && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#808080';
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, [isRunning]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return '';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <BackButton />

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>PWM频闪检测</CardTitle>
            <CardDescription>
              用手机相机对准屏幕拍摄，如果看到条纹则说明存在PWM频闪
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {PWM_CONFIGS.map(config => (
                <Button
                  key={config.frequency}
                  variant={selectedFreq === config.frequency ? 'default' : 'outline'}
                  onClick={() => setSelectedFreq(config.frequency)}
                  className="flex-col h-auto py-2"
                >
                  <span>{config.name}</span>
                  <span className={`text-xs ${getRiskColor(config.risk)}`}>
                    {config.risk === 'high' ? '高风险' : config.risk === 'medium' ? '中风险' : '低风险'}
                  </span>
                </Button>
              ))}
            </div>

            {selectedConfig && (
              <div className="text-sm text-muted-foreground">
                {selectedConfig.description}
              </div>
            )}

            <canvas
              ref={canvasRef}
              width={400}
              height={300}
              className="w-full h-64 border rounded-lg"
            />

            <Button
              className="w-full gap-2"
              onClick={() => setIsRunning(!isRunning)}
              variant={isRunning ? 'destructive' : 'default'}
            >
              {isRunning ? (
                <>
                  <Pause className="h-4 w-4" />
                  停止测试
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  开始测试
                </>
              )}
            </Button>

            <Alert>
              <AlertDescription>
                💡 <strong>检测方法：</strong>
                <ul className="mt-2 space-y-1">
                  <li>• 将手机相机快门速度调至 1/1000s 或更快</li>
                  <li>• 对准测试区域拍摄</li>
                  <li>• 如果照片中出现明显的黑色条纹，说明屏幕使用了低频PWM调光</li>
                  <li>• 高频PWM（960Hz+）或DC调光对眼睛更友好</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
