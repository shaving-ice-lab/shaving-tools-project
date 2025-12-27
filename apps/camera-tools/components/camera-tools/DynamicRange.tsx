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
import { mean, standardDeviation, signalToNoiseRatio } from '@/lib/image-processing/statistics'

interface GrayStep {
  step: number
  ev: number
  brightness: number
  noise: number
  snr: number
  valid: boolean
}

export default function DynamicRange() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [steps, setSteps] = useState<GrayStep[]>([])
  const [summary, setSummary] = useState<{
    totalRange: number
    highlightHeadroom: number
    shadowRange: number
  } | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleImageUpload = useCallback((files: File[]) => {
    const file = files[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    setImageUrl(url)
    setSteps([])
    setSummary(null)
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

      const numSteps = 21
      const stepWidth = img.width / numSteps
      const sampleHeight = img.height * 0.6
      const sampleY = img.height * 0.2

      const graySteps: GrayStep[] = []
      const SNR_THRESHOLD = 1

      for (let i = 0; i < numSteps; i++) {
        const x = i * stepWidth + stepWidth * 0.1
        const width = stepWidth * 0.8

        const data = ctx.getImageData(x, sampleY, width, sampleHeight)
        const grayValues: number[] = []

        for (let j = 0; j < data.data.length; j += 4) {
          const gray = 0.299 * data.data[j] + 0.587 * data.data[j + 1] + 0.114 * data.data[j + 2]
          grayValues.push(gray)
        }

        const brightness = mean(grayValues)
        const noise = standardDeviation(grayValues)
        const snr = signalToNoiseRatio(brightness, noise)

        const ev = (numSteps - 1 - i) * 0.5 - 5

        graySteps.push({
          step: i + 1,
          ev,
          brightness,
          noise,
          snr,
          valid: snr > SNR_THRESHOLD && brightness > 5 && brightness < 250,
        })

        setProgress(((i + 1) / numSteps) * 100)
      }

      const validSteps = graySteps.filter(s => s.valid)
      const highlightSteps = validSteps.filter(s => s.ev > 0)
      const shadowSteps = validSteps.filter(s => s.ev < 0)

      const totalRange = validSteps.length * 0.5
      const highlightHeadroom = highlightSteps.length * 0.5
      const shadowRange = shadowSteps.length * 0.5

      setSteps(graySteps)
      setSummary({ totalRange, highlightHeadroom, shadowRange })
      setIsProcessing(false)
    }
    img.src = imageUrl
  }, [imageUrl])

  const handleReset = useCallback(() => {
    setImageUrl(null)
    setSteps([])
    setSummary(null)
    setProgress(0)
  }, [])

  const columns = [
    { key: 'step', header: '灰阶' },
    { key: 'ev', header: 'EV值', render: (v: unknown) => `${(v as number) > 0 ? '+' : ''}${(v as number).toFixed(1)}` },
    { key: 'brightness', header: '亮度', render: (v: unknown) => (v as number).toFixed(1) },
    { key: 'noise', header: '噪点σ', render: (v: unknown) => (v as number).toFixed(2) },
    { key: 'snr', header: 'SNR (dB)', render: (v: unknown) => (v as number).toFixed(1) },
    {
      key: 'valid',
      header: '有效',
      render: (v: unknown) => ((v as boolean) ? '✓' : '✗'),
    },
  ]

  const chartData = steps.map(step => ({
    x: step.ev,
    y: step.snr,
    brightness: step.brightness,
  }))

  return (
    <div className="space-y-6">
      <canvas ref={canvasRef} className="hidden" />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">动态范围测试</h2>
          <p className="text-muted-foreground">测量相机从高光到暗部的可用动态范围</p>
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
            <CardTitle>灰阶测试图</CardTitle>
            <CardDescription>上传21级灰阶测试图（如Stouffer T4110）</CardDescription>
          </CardHeader>
          <CardContent>
            {imageUrl ? <ImageViewer src={imageUrl} className="h-[400px]" /> : <ImageUploader onUpload={handleImageUpload} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>动态范围结果</CardTitle>
            <CardDescription>可用动态范围统计</CardDescription>
          </CardHeader>
          <CardContent>
            {isProcessing && (
              <div className="space-y-2 mb-4">
                <Progress value={progress} />
                <p className="text-sm text-muted-foreground text-center">分析中... {Math.round(progress)}%</p>
              </div>
            )}
            {summary ? (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">总动态范围</p>
                  <p className="text-3xl font-bold text-primary">{summary.totalRange.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">EV</p>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">高光余量</p>
                  <p className="text-3xl font-bold">+{summary.highlightHeadroom.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">EV</p>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">暗部范围</p>
                  <p className="text-3xl font-bold">-{summary.shadowRange.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">EV</p>
                </div>
              </div>
            ) : null}
            {steps.length > 0 ? (
              <Chart type="line" data={chartData} xAxis={{ label: 'EV值' }} yAxis={{ label: 'SNR (dB)', domain: [0, 50] }} className="h-[200px]" />
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">上传灰阶图像后点击分析</div>
            )}
          </CardContent>
        </Card>
      </div>

      {steps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>各灰阶数据</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={steps} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
