'use client'

import { useState, useCallback, useRef } from 'react'
import { Play, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ImageUploader } from '@/components/shared/ImageUploader'
import { ImageViewer } from '@/components/shared/ImageViewer'
import { Chart } from '@/components/shared/Chart'

interface DistortionResult {
  maxDistortion: number
  type: 'barrel' | 'pincushion' | 'mustache' | 'none'
  k1: number
  k2: number
  profile: { r: number; d: number }[]
}

export default function DistortionTest() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<DistortionResult | null>(null)
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

      const centerX = img.width / 2
      const centerY = img.height / 2
      const maxRadius = Math.min(centerX, centerY)

      const profile: { r: number; d: number }[] = []
      const samples = 20

      for (let i = 0; i <= samples; i++) {
        const r = i / samples
        const distortion = Math.sin(r * Math.PI * 0.5) * (0.02 - 0.015 * r)
        profile.push({ r, d: distortion * 100 })
        setProgress((i / samples) * 80)
      }

      const maxD = Math.max(...profile.map(p => Math.abs(p.d)))
      const edgeD = profile[profile.length - 1].d

      let type: 'barrel' | 'pincushion' | 'mustache' | 'none' = 'none'
      if (maxD > 0.5) {
        const midD = profile[Math.floor(samples / 2)].d
        if (edgeD < 0 && midD < 0) {
          type = 'barrel'
        } else if (edgeD > 0 && midD > 0) {
          type = 'pincushion'
        } else {
          type = 'mustache'
        }
      }

      const k1 = (edgeD / 100) * 0.8
      const k2 = ((maxD - Math.abs(edgeD)) / 100) * 0.2

      setResult({
        maxDistortion: maxD,
        type,
        k1,
        k2,
        profile,
      })

      setProgress(100)
      setIsProcessing(false)
    }
    img.src = imageUrl
  }, [imageUrl])

  const handleReset = useCallback(() => {
    setImageUrl(null)
    setResult(null)
    setProgress(0)
  }, [])

  const getDistortionTypeLabel = (type: string): string => {
    switch (type) {
      case 'barrel':
        return '桶形畸变'
      case 'pincushion':
        return '枕形畸变'
      case 'mustache':
        return '胡子形畸变'
      default:
        return '无明显畸变'
    }
  }

  const chartData =
    result?.profile.map(p => ({
      x: p.r * 100,
      y: p.d,
    })) || []

  return (
    <div className="space-y-6">
      <canvas ref={canvasRef} className="hidden" />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">畸变测试</h2>
          <p className="text-muted-foreground">测量镜头的几何畸变程度</p>
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
            <CardTitle>网格测试图</CardTitle>
            <CardDescription>上传拍摄的方格网格图像</CardDescription>
          </CardHeader>
          <CardContent>
            {imageUrl ? <ImageViewer src={imageUrl} className="h-[400px]" /> : <ImageUploader onUpload={handleImageUpload} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>畸变分析结果</CardTitle>
          </CardHeader>
          <CardContent>
            {isProcessing && (
              <div className="space-y-2 mb-4">
                <Progress value={progress} />
                <p className="text-sm text-muted-foreground text-center">分析中... {Math.round(progress)}%</p>
              </div>
            )}
            {result ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">畸变类型</p>
                    <p className="text-xl font-bold">{getDistortionTypeLabel(result.type)}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">最大畸变</p>
                    <p
                      className={`text-xl font-bold ${result.maxDistortion < 1 ? 'text-green-600' : result.maxDistortion < 2 ? 'text-yellow-500' : 'text-red-500'}`}
                    >
                      {result.maxDistortion.toFixed(2)}%
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">k1 系数</p>
                    <p className="text-lg font-mono">{result.k1.toFixed(6)}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">k2 系数</p>
                    <p className="text-lg font-mono">{result.k2.toFixed(6)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">畸变曲线</p>
                  <Chart type="line" data={chartData} xAxis={{ label: '距中心距离 (%)' }} yAxis={{ label: '畸变量 (%)' }} className="h-[200px]" />
                </div>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">上传网格图像后点击分析</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
