'use client'

import { useState, useCallback, useRef } from 'react'
import { Play, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ImageUploader } from '@/components/shared/ImageUploader'
import { ImageViewer } from '@/components/shared/ImageViewer'
import { mean } from '@/lib/image-processing/statistics'

interface VignettingResult {
  cornerFalloff: number
  edgeFalloff: number
  uniformityScore: number
  centerBrightness: number
  cornerBrightness: number
}

export default function VignettingTest() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<VignettingResult | null>(null)
  const [heatmapUrl, setHeatmapUrl] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const heatmapRef = useRef<HTMLCanvasElement>(null)

  const handleImageUpload = useCallback((files: File[]) => {
    const file = files[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    setImageUrl(url)
    setResult(null)
    setHeatmapUrl(null)
  }, [])

  const sampleRegion = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number): number => {
    const data = ctx.getImageData(x - size / 2, y - size / 2, size, size)
    const values: number[] = []
    for (let i = 0; i < data.data.length; i += 4) {
      const gray = 0.299 * data.data[i] + 0.587 * data.data[i + 1] + 0.114 * data.data[i + 2]
      values.push(gray)
    }
    return mean(values)
  }

  const handleAnalyze = useCallback(async () => {
    if (!imageUrl) return

    setIsProcessing(true)
    setProgress(0)

    const img = new Image()
    img.onload = () => {
      const canvas = canvasRef.current
      const heatmap = heatmapRef.current
      if (!canvas || !heatmap) return

      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.drawImage(img, 0, 0)

      const sampleSize = Math.min(img.width, img.height) * 0.05
      const centerX = img.width / 2
      const centerY = img.height / 2

      const centerBrightness = sampleRegion(ctx, centerX, centerY, sampleSize)

      const corners = [
        { x: sampleSize, y: sampleSize },
        { x: img.width - sampleSize, y: sampleSize },
        { x: sampleSize, y: img.height - sampleSize },
        { x: img.width - sampleSize, y: img.height - sampleSize },
      ]

      const edges = [
        { x: centerX, y: sampleSize },
        { x: centerX, y: img.height - sampleSize },
        { x: sampleSize, y: centerY },
        { x: img.width - sampleSize, y: centerY },
      ]

      setProgress(20)

      const cornerValues = corners.map(c => sampleRegion(ctx, c.x, c.y, sampleSize))
      const edgeValues = edges.map(e => sampleRegion(ctx, e.x, e.y, sampleSize))

      const avgCorner = mean(cornerValues)
      const avgEdge = mean(edgeValues)

      const cornerFalloff = ((centerBrightness - avgCorner) / centerBrightness) * 100
      const edgeFalloff = ((centerBrightness - avgEdge) / centerBrightness) * 100

      setProgress(50)

      heatmap.width = img.width
      heatmap.height = img.height
      const hctx = heatmap.getContext('2d')
      if (!hctx) return

      const gridSize = 20
      const cellWidth = img.width / gridSize
      const cellHeight = img.height / gridSize

      for (let gy = 0; gy < gridSize; gy++) {
        for (let gx = 0; gx < gridSize; gx++) {
          const x = (gx + 0.5) * cellWidth
          const y = (gy + 0.5) * cellHeight
          const brightness = sampleRegion(ctx, x, y, cellWidth * 0.8)
          const ratio = brightness / centerBrightness

          const hue = Math.max(0, Math.min(240, ratio * 240))
          hctx.fillStyle = `hsl(${hue}, 70%, 50%)`
          hctx.fillRect(gx * cellWidth, gy * cellHeight, cellWidth, cellHeight)
        }
        setProgress(50 + (gy / gridSize) * 40)
      }

      setHeatmapUrl(heatmap.toDataURL())

      const uniformityScore = 100 - (cornerFalloff + edgeFalloff) / 2

      setResult({
        cornerFalloff,
        edgeFalloff,
        uniformityScore,
        centerBrightness,
        cornerBrightness: avgCorner,
      })

      setProgress(100)
      setIsProcessing(false)
    }
    img.src = imageUrl
  }, [imageUrl])

  const handleReset = useCallback(() => {
    setImageUrl(null)
    setResult(null)
    setHeatmapUrl(null)
    setProgress(0)
  }, [])

  const falloffToEV = (falloff: number): number => {
    return Math.log2(100 / (100 - falloff))
  }

  return (
    <div className="space-y-6">
      <canvas ref={canvasRef} className="hidden" />
      <canvas ref={heatmapRef} className="hidden" />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">暗角测试</h2>
          <p className="text-muted-foreground">测量镜头边缘相对于中心的光量衰减</p>
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
            <CardTitle>均匀光源图像</CardTitle>
            <CardDescription>上传拍摄的均匀灰卡或白墙图像</CardDescription>
          </CardHeader>
          <CardContent>
            {imageUrl ? <ImageViewer src={imageUrl} className="h-[350px]" /> : <ImageUploader onUpload={handleImageUpload} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>亮度热力图</CardTitle>
            <CardDescription>亮度分布可视化（红=暗，蓝=亮）</CardDescription>
          </CardHeader>
          <CardContent>
            {isProcessing && (
              <div className="space-y-2 mb-4">
                <Progress value={progress} />
                <p className="text-sm text-muted-foreground text-center">分析中... {Math.round(progress)}%</p>
              </div>
            )}
            {heatmapUrl ? (
              <img src={heatmapUrl} alt="热力图" className="w-full h-auto rounded-lg" />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground bg-muted rounded-lg">分析后显示热力图</div>
            )}
          </CardContent>
        </Card>
      </div>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>暗角分析结果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">角落亮度衰减</p>
                <p
                  className={`text-2xl font-bold ${result.cornerFalloff < 10 ? 'text-green-600' : result.cornerFalloff < 20 ? 'text-yellow-500' : 'text-red-500'}`}
                >
                  -{result.cornerFalloff.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground">≈ {falloffToEV(result.cornerFalloff).toFixed(1)} EV</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">边缘亮度衰减</p>
                <p
                  className={`text-2xl font-bold ${result.edgeFalloff < 5 ? 'text-green-600' : result.edgeFalloff < 10 ? 'text-yellow-500' : 'text-red-500'}`}
                >
                  -{result.edgeFalloff.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground">≈ {falloffToEV(result.edgeFalloff).toFixed(1)} EV</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">均匀性评分</p>
                <p
                  className={`text-2xl font-bold ${result.uniformityScore > 90 ? 'text-green-600' : result.uniformityScore > 80 ? 'text-yellow-500' : 'text-red-500'}`}
                >
                  {result.uniformityScore.toFixed(0)}
                </p>
                <p className="text-sm text-muted-foreground">/ 100</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">中心/角落亮度</p>
                <p className="text-xl font-bold">
                  {result.centerBrightness.toFixed(0)} / {result.cornerBrightness.toFixed(0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
