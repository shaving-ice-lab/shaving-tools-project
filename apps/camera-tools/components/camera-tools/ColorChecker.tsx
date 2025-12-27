'use client'

import { useState, useCallback, useRef } from 'react'
import { Play, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ImageUploader } from '@/components/shared/ImageUploader'
import { ImageViewer } from '@/components/shared/ImageViewer'
import { DataTable } from '@/components/shared/DataTable'
import { rgbToLab, deltaE2000, calculateSaturationBias, calculateHueBias } from '@/lib/image-processing/color-space'
import { mean } from '@/lib/image-processing/statistics'
import type { Lab, ColorPatch } from '@/types'

const COLORCHECKER_REFERENCE: { name: string; lab: Lab }[] = [
  { name: '暗肤色', lab: { l: 37.986, a: 13.555, b: 14.059 } },
  { name: '浅肤色', lab: { l: 65.711, a: 18.13, b: 17.81 } },
  { name: '蓝天', lab: { l: 49.927, a: -4.88, b: -21.925 } },
  { name: '树叶', lab: { l: 43.139, a: -13.095, b: 21.905 } },
  { name: '蓝花', lab: { l: 55.112, a: 8.844, b: -25.399 } },
  { name: '青绿', lab: { l: 70.719, a: -33.397, b: -0.199 } },
  { name: '橙色', lab: { l: 62.661, a: 36.067, b: 57.096 } },
  { name: '紫蓝', lab: { l: 40.02, a: 10.41, b: -45.964 } },
  { name: '中红', lab: { l: 51.124, a: 48.239, b: 16.248 } },
  { name: '紫色', lab: { l: 30.325, a: 22.976, b: -21.587 } },
  { name: '黄绿', lab: { l: 72.532, a: -23.709, b: 57.255 } },
  { name: '橙黄', lab: { l: 71.941, a: 19.363, b: 67.857 } },
  { name: '蓝色', lab: { l: 28.778, a: 14.179, b: -50.297 } },
  { name: '绿色', lab: { l: 55.261, a: -38.342, b: 31.37 } },
  { name: '红色', lab: { l: 42.101, a: 53.378, b: 28.19 } },
  { name: '黄色', lab: { l: 81.733, a: 4.039, b: 79.819 } },
  { name: '品红', lab: { l: 51.935, a: 49.986, b: -14.574 } },
  { name: '青色', lab: { l: 51.038, a: -28.631, b: -28.638 } },
  { name: '白色', lab: { l: 96.539, a: -0.425, b: 1.186 } },
  { name: '灰1', lab: { l: 81.257, a: -0.638, b: -0.335 } },
  { name: '灰2', lab: { l: 66.766, a: -0.734, b: -0.504 } },
  { name: '灰3', lab: { l: 50.867, a: -0.153, b: -0.27 } },
  { name: '灰4', lab: { l: 35.656, a: -0.421, b: -1.231 } },
  { name: '黑色', lab: { l: 20.461, a: -0.079, b: -0.973 } },
]

export default function ColorChecker() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<ColorPatch[]>([])
  const [summary, setSummary] = useState<{
    avgDeltaE: number
    maxDeltaE: number
    saturationBias: number
    hueBias: number
  } | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleImageUpload = useCallback((files: File[]) => {
    const file = files[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    setImageUrl(url)
    setResults([])
    setSummary(null)
  }, [])

  const sampleColorFromRegion = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number): Lab => {
    const data = ctx.getImageData(x - size / 2, y - size / 2, size, size)
    let r = 0,
      g = 0,
      b = 0
    const pixels = data.data.length / 4

    for (let i = 0; i < data.data.length; i += 4) {
      r += data.data[i]
      g += data.data[i + 1]
      b += data.data[i + 2]
    }

    return rgbToLab(r / pixels, g / pixels, b / pixels)
  }

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

      const patches: ColorPatch[] = []
      const measured: Lab[] = []

      const cols = 6
      const rows = 4
      const patchWidth = img.width / cols
      const patchHeight = img.height / rows
      const sampleSize = Math.min(patchWidth, patchHeight) * 0.5

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const idx = row * cols + col
          if (idx >= COLORCHECKER_REFERENCE.length) continue

          const centerX = (col + 0.5) * patchWidth
          const centerY = (row + 0.5) * patchHeight

          const measuredLab = sampleColorFromRegion(ctx, centerX, centerY, sampleSize)
          const reference = COLORCHECKER_REFERENCE[idx]
          const dE = deltaE2000(reference.lab, measuredLab)

          patches.push({
            id: idx,
            name: reference.name,
            reference: reference.lab,
            measured: measuredLab,
            deltaE: dE,
          })

          measured.push(measuredLab)

          setProgress(((idx + 1) / COLORCHECKER_REFERENCE.length) * 100)
        }
      }

      const deltaEs = patches.map(p => p.deltaE)
      const avgDeltaE = mean(deltaEs)
      const maxDeltaE = Math.max(...deltaEs)
      const referenceLabs = COLORCHECKER_REFERENCE.map(r => r.lab)
      const saturationBias = calculateSaturationBias(measured, referenceLabs)
      const hueBias = calculateHueBias(measured, referenceLabs)

      setResults(patches)
      setSummary({ avgDeltaE, maxDeltaE, saturationBias, hueBias })
      setIsProcessing(false)
    }
    img.src = imageUrl
  }, [imageUrl])

  const handleReset = useCallback(() => {
    setImageUrl(null)
    setResults([])
    setSummary(null)
    setProgress(0)
  }, [])

  const getDeltaERating = (dE: number): { text: string; color: string } => {
    if (dE < 1) return { text: '优秀', color: 'text-green-600' }
    if (dE < 3) return { text: '良好', color: 'text-green-500' }
    if (dE < 5) return { text: '可接受', color: 'text-yellow-500' }
    if (dE < 10) return { text: '较差', color: 'text-orange-500' }
    return { text: '差', color: 'text-red-500' }
  }

  const columns = [
    { key: 'name', header: '色块名称' },
    {
      key: 'deltaE',
      header: 'ΔE2000',
      render: (v: unknown) => {
        const dE = v as number
        const rating = getDeltaERating(dE)
        return (
          <span className={rating.color}>
            {dE.toFixed(2)} ({rating.text})
          </span>
        )
      },
    },
    {
      key: 'reference',
      header: '参考Lab',
      render: (v: unknown) => {
        const lab = v as Lab
        return `L:${lab.l.toFixed(1)} a:${lab.a.toFixed(1)} b:${lab.b.toFixed(1)}`
      },
    },
    {
      key: 'measured',
      header: '测量Lab',
      render: (v: unknown) => {
        const lab = v as Lab
        return `L:${lab.l.toFixed(1)} a:${lab.a.toFixed(1)} b:${lab.b.toFixed(1)}`
      },
    },
  ]

  return (
    <div className="space-y-6">
      <canvas ref={canvasRef} className="hidden" />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">色彩准确度测试</h2>
          <p className="text-muted-foreground">使用X-Rite ColorChecker评估相机色彩还原能力</p>
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
            <CardTitle>色卡图像</CardTitle>
            <CardDescription>上传拍摄的X-Rite ColorChecker 24色卡图像</CardDescription>
          </CardHeader>
          <CardContent>
            {imageUrl ? <ImageViewer src={imageUrl} className="h-[400px]" /> : <ImageUploader onUpload={handleImageUpload} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>分析结果</CardTitle>
            <CardDescription>色彩准确度概要</CardDescription>
          </CardHeader>
          <CardContent>
            {isProcessing && (
              <div className="space-y-2 mb-4">
                <Progress value={progress} />
                <p className="text-sm text-muted-foreground text-center">分析中... {Math.round(progress)}%</p>
              </div>
            )}
            {summary ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">平均 ΔE</p>
                  <p className={`text-2xl font-bold ${getDeltaERating(summary.avgDeltaE).color}`}>{summary.avgDeltaE.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{getDeltaERating(summary.avgDeltaE).text}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">最大 ΔE</p>
                  <p className={`text-2xl font-bold ${getDeltaERating(summary.maxDeltaE).color}`}>{summary.maxDeltaE.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">饱和度偏差</p>
                  <p className="text-2xl font-bold">
                    {summary.saturationBias > 0 ? '+' : ''}
                    {summary.saturationBias.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {summary.saturationBias > 5 ? '偏高' : summary.saturationBias < -5 ? '偏低' : '正常'}
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">色相偏移</p>
                  <p className="text-2xl font-bold">
                    {summary.hueBias > 0 ? '+' : ''}
                    {summary.hueBias.toFixed(1)}°
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">上传色卡图像后点击分析</div>
            )}
          </CardContent>
        </Card>
      </div>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>详细色块数据</CardTitle>
            <CardDescription>24个色块的测量结果</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={results} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
