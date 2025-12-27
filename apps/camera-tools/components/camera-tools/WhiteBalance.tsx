'use client'

import { useState, useCallback, useRef } from 'react'
import { Play, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ImageUploader } from '@/components/shared/ImageUploader'
import { ImageViewer } from '@/components/shared/ImageViewer'
import { DataTable } from '@/components/shared/DataTable'
import { rgbToLab, estimateColorTemperature, deltaE2000 } from '@/lib/image-processing/color-space'
import { mean } from '@/lib/image-processing/statistics'
import type { Lab } from '@/types'

interface WhiteBalanceResult {
  measuredTemp: number
  referenceTemp: number
  tempDeviation: number
  tintDeviation: number
  avgRGB: { r: number; g: number; b: number }
  avgLab: Lab
}

export default function WhiteBalance() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [referenceTemp, setReferenceTemp] = useState<number>(5500)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<WhiteBalanceResult | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleImageUpload = useCallback((files: File[]) => {
    const file = files[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    setImageUrl(url)
    setResult(null)
  }, [])

  const handleAnalyze = useCallback(async () => {
    if (!imageUrl) return

    setIsProcessing(true)
    setProgress(0)

    const img = new Image()
    img.onload = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.drawImage(img, 0, 0)

      const centerX = img.width * 0.25
      const centerY = img.height * 0.25
      const sampleWidth = img.width * 0.5
      const sampleHeight = img.height * 0.5

      const data = ctx.getImageData(centerX, centerY, sampleWidth, sampleHeight)

      setProgress(30)

      let totalR = 0,
        totalG = 0,
        totalB = 0
      const pixels = data.data.length / 4

      for (let i = 0; i < data.data.length; i += 4) {
        totalR += data.data[i]
        totalG += data.data[i + 1]
        totalB += data.data[i + 2]
      }

      const avgR = totalR / pixels
      const avgG = totalG / pixels
      const avgB = totalB / pixels

      setProgress(60)

      const measuredTemp = estimateColorTemperature({ r: avgR, g: avgG, b: avgB })
      const avgLab = rgbToLab(avgR, avgG, avgB)

      const neutralGray: Lab = { l: avgLab.l, a: 0, b: 0 }
      const tintDeviation = Math.sqrt(avgLab.a ** 2 + avgLab.b ** 2)

      setResult({
        measuredTemp,
        referenceTemp,
        tempDeviation: measuredTemp - referenceTemp,
        tintDeviation,
        avgRGB: { r: avgR, g: avgG, b: avgB },
        avgLab,
      })

      setProgress(100)
      setIsProcessing(false)
    }
    img.src = imageUrl
  }, [imageUrl, referenceTemp])

  const handleReset = useCallback(() => {
    setImageUrl(null)
    setResult(null)
    setProgress(0)
  }, [])

  const tempPresets = [
    { name: '钨丝灯', temp: 2700 },
    { name: '暖白光', temp: 3200 },
    { name: '荧光灯', temp: 4000 },
    { name: '日光', temp: 5500 },
    { name: '阴天', temp: 6500 },
    { name: '阴影', temp: 7500 },
  ]

  return (
    <div className="space-y-6">
      <canvas ref={canvasRef} className="hidden" />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">白平衡测试</h2>
          <p className="text-muted-foreground">评估相机白平衡准确性</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={!imageUrl}>
            <RotateCcw className="h-4 w-4 mr-2" />
            重置
          </Button>
          <Button onClick={handleAnalyze} disabled={!imageUrl || isProcessing}>
            <Play className="h-4 w-4 mr-2" />
            开始分析
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>灰卡图像</CardTitle>
            <CardDescription>上传拍摄的18%灰卡或白平衡卡图像</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {imageUrl ? <ImageViewer src={imageUrl} className="h-[300px]" /> : <ImageUploader onUpload={handleImageUpload} />}

            {imageUrl && (
              <div className="space-y-2">
                <label className="text-sm font-medium">参考色温 (K):</label>
                <div className="flex flex-wrap gap-2">
                  {tempPresets.map(preset => (
                    <Button
                      key={preset.temp}
                      variant={referenceTemp === preset.temp ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setReferenceTemp(preset.temp)}
                    >
                      {preset.name} ({preset.temp}K)
                    </Button>
                  ))}
                </div>
                <input
                  type="number"
                  value={referenceTemp}
                  onChange={e => setReferenceTemp(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  min={2000}
                  max={10000}
                />
              </div>
            )}

            {isProcessing && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-muted-foreground text-center">分析中... {Math.round(progress)}%</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>分析结果</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">测量色温</p>
                    <p className="text-2xl font-bold">{result.measuredTemp.toFixed(0)} K</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">色温偏差</p>
                    <p
                      className={`text-2xl font-bold ${Math.abs(result.tempDeviation) < 200 ? 'text-green-600' : Math.abs(result.tempDeviation) < 500 ? 'text-yellow-500' : 'text-red-500'}`}
                    >
                      {result.tempDeviation > 0 ? '+' : ''}
                      {result.tempDeviation.toFixed(0)} K
                    </p>
                    <p className="text-xs text-muted-foreground">{result.tempDeviation > 0 ? '偏暖' : result.tempDeviation < 0 ? '偏冷' : '准确'}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">色调偏移 (Tint)</p>
                    <p
                      className={`text-2xl font-bold ${result.tintDeviation < 3 ? 'text-green-600' : result.tintDeviation < 5 ? 'text-yellow-500' : 'text-red-500'}`}
                    >
                      {result.tintDeviation.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">{result.avgLab.a > 1 ? '偏绿' : result.avgLab.a < -1 ? '偏品红' : '正常'}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">平均RGB</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-red-500">R:{result.avgRGB.r.toFixed(0)}</span>
                      <span className="text-green-500">G:{result.avgRGB.g.toFixed(0)}</span>
                      <span className="text-blue-500">B:{result.avgRGB.b.toFixed(0)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Lab值</p>
                  <p className="font-mono">
                    L: {result.avgLab.l.toFixed(1)} &nbsp; a: {result.avgLab.a.toFixed(2)} &nbsp; b: {result.avgLab.b.toFixed(2)}
                  </p>
                </div>

                <div
                  className="h-16 rounded-lg border"
                  style={{
                    backgroundColor: `rgb(${result.avgRGB.r}, ${result.avgRGB.g}, ${result.avgRGB.b})`,
                  }}
                />
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">上传灰卡图像后点击分析</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
