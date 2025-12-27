'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Upload, Play, RotateCcw, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ImageUploader } from '@/components/shared/ImageUploader'
import { ImageViewer } from '@/components/shared/ImageViewer'
import { Chart } from '@/components/shared/Chart'
import { DataTable } from '@/components/shared/DataTable'
import { detectSlantedEdgeAngle, extractESF, computeLSF, findMTFValue } from '@/lib/image-processing/edge-detection'
import { computeMTFFromLSF } from '@/lib/image-processing/fft'
import type { Region, MTFMetrics } from '@/types'

interface MTFResult {
  position: string
  mtf50: number
  mtf30: number
  mtf10: number
  curve: { x: number; y: number }[]
}

export default function MTFAnalyzer() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageData, setImageData] = useState<ImageData | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<MTFResult[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleImageUpload = useCallback((files: File[]) => {
    const file = files[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    setImageUrl(url)
    setResults([])
    setSelectedRegion(null)

    const img = new Image()
    img.onload = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.drawImage(img, 0, 0)
      setImageData(ctx.getImageData(0, 0, img.width, img.height))
    }
    img.src = url
  }, [])

  const handleRegionSelect = useCallback((region: Region) => {
    setSelectedRegion(region)
  }, [])

  const analyzeRegion = useCallback(
    async (region: Region, position: string): Promise<MTFResult | null> => {
      if (!imageData || !canvasRef.current) return null

      const ctx = canvasRef.current.getContext('2d')
      if (!ctx) return null

      const { x, y, width, height } = region
      const roiData = ctx.getImageData(
        Math.max(0, Math.floor(x)),
        Math.max(0, Math.floor(y)),
        Math.min(width, imageData.width - x),
        Math.min(height, imageData.height - y)
      )

      const angle = detectSlantedEdgeAngle(roiData)
      const esf = extractESF(roiData, angle)
      const lsf = computeLSF(esf)
      const mtf = computeMTFFromLSF(lsf)

      const mtf50 = findMTFValue(mtf, 0.5)
      const mtf30 = findMTFValue(mtf, 0.3)
      const mtf10 = findMTFValue(mtf, 0.1)

      const nyquist = mtf.length / 2
      const curve = mtf.slice(0, nyquist).map((value, i) => ({
        x: i / nyquist,
        y: value,
      }))

      return {
        position,
        mtf50: mtf50 / nyquist,
        mtf30: mtf30 / nyquist,
        mtf10: mtf10 / nyquist,
        curve,
      }
    },
    [imageData]
  )

  const handleAnalyze = useCallback(async () => {
    if (!selectedRegion || !imageData) return

    setIsProcessing(true)
    setProgress(0)

    try {
      const result = await analyzeRegion(selectedRegion, '选定区域')
      setProgress(100)

      if (result) {
        setResults(prev => [...prev, result])
      }
    } catch (error) {
      console.error('MTF分析失败:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [selectedRegion, imageData, analyzeRegion])

  const handleAutoAnalyze = useCallback(async () => {
    if (!imageData) return

    setIsProcessing(true)
    setProgress(0)
    setResults([])

    const positions = [
      { name: '中心', x: 0.4, y: 0.4, w: 0.2, h: 0.2 },
      { name: '左上', x: 0.05, y: 0.05, w: 0.15, h: 0.15 },
      { name: '右上', x: 0.8, y: 0.05, w: 0.15, h: 0.15 },
      { name: '左下', x: 0.05, y: 0.8, w: 0.15, h: 0.15 },
      { name: '右下', x: 0.8, y: 0.8, w: 0.15, h: 0.15 },
    ]

    const newResults: MTFResult[] = []

    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i]
      const region: Region = {
        x: pos.x * imageData.width,
        y: pos.y * imageData.height,
        width: pos.w * imageData.width,
        height: pos.h * imageData.height,
      }

      try {
        const result = await analyzeRegion(region, pos.name)
        if (result) {
          newResults.push(result)
        }
      } catch (e) {
        console.error(`分析${pos.name}失败`, e)
      }

      setProgress(((i + 1) / positions.length) * 100)
    }

    setResults(newResults)
    setIsProcessing(false)
  }, [imageData, analyzeRegion])

  const handleReset = useCallback(() => {
    setImageUrl(null)
    setImageData(null)
    setSelectedRegion(null)
    setResults([])
    setProgress(0)
  }, [])

  const columns = [
    { key: 'position', header: '测量位置' },
    { key: 'mtf50', header: 'MTF50', render: (v: unknown) => `${((v as number) * 100).toFixed(1)}%` },
    { key: 'mtf30', header: 'MTF30', render: (v: unknown) => `${((v as number) * 100).toFixed(1)}%` },
    { key: 'mtf10', header: 'MTF10', render: (v: unknown) => `${((v as number) * 100).toFixed(1)}%` },
  ]

  const chartData =
    results.length > 0
      ? results[0].curve.map((point, i) => {
          const data: Record<string, number> = { x: point.x }
          results.forEach((result, j) => {
            data[`y${j}`] = result.curve[i]?.y ?? 0
          })
          return data
        })
      : []

  const chartSeries = results.map((result, i) => ({
    key: `y${i}`,
    name: result.position,
    color: ['#1e40af', '#f97316', '#22c55e', '#ef4444', '#8b5cf6'][i % 5],
  }))

  return (
    <div className="space-y-6">
      <canvas ref={canvasRef} className="hidden" />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">MTF曲线测试</h2>
          <p className="text-muted-foreground">分析镜头锐度与解析力，计算MTF50/30/10值</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={!imageUrl}>
            <RotateCcw className="h-4 w-4 mr-2" />
            重置
          </Button>
          <Button onClick={handleAutoAnalyze} disabled={!imageData || isProcessing}>
            <Play className="h-4 w-4 mr-2" />
            自动分析
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>测试图像</CardTitle>
            <CardDescription>上传包含斜边的测试图像，按住Shift拖拽选择分析区域</CardDescription>
          </CardHeader>
          <CardContent>
            {imageUrl ? (
              <div className="space-y-4">
                <ImageViewer src={imageUrl} onRegionSelect={handleRegionSelect} className="h-[400px]" />
                {selectedRegion && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      已选区域: {Math.round(selectedRegion.width)} x {Math.round(selectedRegion.height)} px
                    </p>
                    <Button size="sm" onClick={handleAnalyze} disabled={isProcessing}>
                      分析选区
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <ImageUploader onUpload={handleImageUpload} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>MTF曲线</CardTitle>
            <CardDescription>空间频率响应曲线</CardDescription>
          </CardHeader>
          <CardContent>
            {isProcessing && (
              <div className="space-y-2 mb-4">
                <Progress value={progress} />
                <p className="text-sm text-muted-foreground text-center">分析中... {Math.round(progress)}%</p>
              </div>
            )}
            {results.length > 0 ? (
              <Chart
                type="line"
                data={chartData}
                series={chartSeries}
                xAxis={{ label: '空间频率 (Nyquist)' }}
                yAxis={{ label: 'MTF', domain: [0, 1] }}
                className="h-[300px]"
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">上传图像并分析后显示MTF曲线</div>
            )}
          </CardContent>
        </Card>
      </div>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>测量结果</CardTitle>
            <CardDescription>各测量位置的MTF数值</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={results} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
