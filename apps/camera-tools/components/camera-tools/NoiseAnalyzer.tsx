'use client'

import { useState, useCallback, useRef } from 'react'
import { Play, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ImageUploader } from '@/components/shared/ImageUploader'
import { ImageViewer } from '@/components/shared/ImageViewer'
import { Chart } from '@/components/shared/Chart'
import { DataTable } from '@/components/shared/DataTable'
import { calculateNoise } from '@/lib/image-processing/statistics'

interface NoiseResult {
  iso: number
  luminanceNoise: number
  chromaNoise: number
  snr: number
}

export default function NoiseAnalyzer() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [currentISO, setCurrentISO] = useState<number>(100)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<NoiseResult[]>([])
  const [currentResult, setCurrentResult] = useState<NoiseResult | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleImageUpload = useCallback((files: File[]) => {
    const file = files[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    setImageUrl(url)
    setCurrentResult(null)
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

      const centerX = img.width * 0.3
      const centerY = img.height * 0.3
      const sampleWidth = img.width * 0.4
      const sampleHeight = img.height * 0.4

      const imageData = ctx.getImageData(0, 0, img.width, img.height)

      setProgress(50)

      const noiseData = calculateNoise(imageData, centerX, centerY, sampleWidth, sampleHeight)

      const result: NoiseResult = {
        iso: currentISO,
        luminanceNoise: noiseData.luminanceNoise,
        chromaNoise: noiseData.chromaNoise,
        snr: noiseData.snr,
      }

      setCurrentResult(result)
      setResults(prev => {
        const existing = prev.findIndex(r => r.iso === currentISO)
        if (existing >= 0) {
          const newResults = [...prev]
          newResults[existing] = result
          return newResults.sort((a, b) => a.iso - b.iso)
        }
        return [...prev, result].sort((a, b) => a.iso - b.iso)
      })

      setProgress(100)
      setIsProcessing(false)
    }
    img.src = imageUrl
  }, [imageUrl, currentISO])

  const handleReset = useCallback(() => {
    setImageUrl(null)
    setResults([])
    setCurrentResult(null)
    setProgress(0)
    setCurrentISO(100)
  }, [])

  const getNoiseRating = (noise: number): { text: string; color: string } => {
    if (noise < 1) return { text: '优秀', color: 'text-green-600' }
    if (noise < 2) return { text: '良好', color: 'text-green-500' }
    if (noise < 4) return { text: '可接受', color: 'text-yellow-500' }
    if (noise < 8) return { text: '较差', color: 'text-orange-500' }
    return { text: '差', color: 'text-red-500' }
  }

  const columns = [
    { key: 'iso', header: 'ISO' },
    {
      key: 'luminanceNoise',
      header: '亮度噪点 σ',
      render: (v: unknown) => (v as number).toFixed(2),
    },
    {
      key: 'chromaNoise',
      header: '色度噪点 σ',
      render: (v: unknown) => (v as number).toFixed(2),
    },
    {
      key: 'snr',
      header: 'SNR (dB)',
      render: (v: unknown) => (v as number).toFixed(1),
    },
  ]

  const chartData = results.map(r => ({
    x: Math.log2(r.iso / 100),
    luminance: r.luminanceNoise,
    chroma: r.chromaNoise,
  }))

  const isoOptions = [100, 200, 400, 800, 1600, 3200, 6400, 12800, 25600, 51200]

  return (
    <div className="space-y-6">
      <canvas ref={canvasRef} className="hidden" />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">噪点分析</h2>
          <p className="text-muted-foreground">评估不同ISO下的图像噪点水平</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={!imageUrl}>
            <RotateCcw className="h-4 w-4 mr-2" />
            重置
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>测试图像</CardTitle>
            <CardDescription>上传均匀灰色区域的测试图像</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {imageUrl ? <ImageViewer src={imageUrl} className="h-[300px]" /> : <ImageUploader onUpload={handleImageUpload} />}

            {imageUrl && (
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">当前ISO:</label>
                <select
                  value={currentISO}
                  onChange={e => setCurrentISO(Number(e.target.value))}
                  className="px-3 py-2 border rounded-md bg-background"
                >
                  {isoOptions.map(iso => (
                    <option key={iso} value={iso}>
                      ISO {iso}
                    </option>
                  ))}
                </select>
                <Button onClick={handleAnalyze} disabled={isProcessing}>
                  <Play className="h-4 w-4 mr-2" />
                  分析
                </Button>
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
            <CardTitle>当前分析结果</CardTitle>
            <CardDescription>ISO {currentISO} 噪点数据</CardDescription>
          </CardHeader>
          <CardContent>
            {currentResult ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">亮度噪点</p>
                  <p className={`text-2xl font-bold ${getNoiseRating(currentResult.luminanceNoise).color}`}>
                    σ = {currentResult.luminanceNoise.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">{getNoiseRating(currentResult.luminanceNoise).text}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">色度噪点</p>
                  <p className={`text-2xl font-bold ${getNoiseRating(currentResult.chromaNoise).color}`}>
                    σ = {currentResult.chromaNoise.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">{getNoiseRating(currentResult.chromaNoise).text}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg col-span-2">
                  <p className="text-sm text-muted-foreground">信噪比 (SNR)</p>
                  <p className="text-3xl font-bold text-primary">{currentResult.snr.toFixed(1)} dB</p>
                  <p className="text-xs text-muted-foreground">{currentResult.snr > 40 ? '优秀' : currentResult.snr > 30 ? '良好' : '一般'}</p>
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">上传图像并分析后显示结果</div>
            )}
          </CardContent>
        </Card>
      </div>

      {results.length > 1 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>噪点曲线</CardTitle>
              <CardDescription>不同ISO下的噪点变化趋势</CardDescription>
            </CardHeader>
            <CardContent>
              <Chart
                type="line"
                data={chartData}
                series={[
                  { key: 'luminance', name: '亮度噪点', color: '#1e40af' },
                  { key: 'chroma', name: '色度噪点', color: '#f97316' },
                ]}
                xAxis={{ label: 'ISO (log2 scale)', tickFormatter: v => `${100 * Math.pow(2, v)}` }}
                yAxis={{ label: '噪点 σ' }}
                className="h-[300px]"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ISO对比数据</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={results} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
