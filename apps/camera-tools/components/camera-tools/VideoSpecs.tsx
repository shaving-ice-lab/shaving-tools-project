'use client'

import { useState } from 'react'
import { Video, Plus, Trash2, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/shared/DataTable'

interface VideoMode {
  id: number
  resolution: string
  frameRate: number
  codec: string
  bitrate: number
  hdr: boolean
  stabilization: string
  autofocus: boolean
  notes: string
}

const RESOLUTIONS = ['4K (3840x2160)', '1080p (1920x1080)', '720p (1280x720)', '8K (7680x4320)']
const FRAME_RATES = [24, 25, 30, 50, 60, 120, 240]
const CODECS = ['H.264', 'H.265/HEVC', 'ProRes', 'RAW']
const STABILIZATION = ['无', '电子防抖 (EIS)', '光学防抖 (OIS)', 'EIS+OIS']

export default function VideoSpecs() {
  const [modes, setModes] = useState<VideoMode[]>([])
  const [formData, setFormData] = useState({
    resolution: '4K (3840x2160)',
    frameRate: 30,
    codec: 'H.264',
    bitrate: 100,
    hdr: false,
    stabilization: '无',
    autofocus: true,
    notes: '',
  })

  const handleAddMode = () => {
    const newMode: VideoMode = {
      id: Date.now(),
      ...formData,
    }
    setModes(prev => [...prev, newMode])
  }

  const handleDeleteMode = (id: number) => {
    setModes(prev => prev.filter(m => m.id !== id))
  }

  const columns = [
    { key: 'resolution', header: '分辨率' },
    { key: 'frameRate', header: '帧率', render: (v: unknown) => `${v} fps` },
    { key: 'codec', header: '编码' },
    { key: 'bitrate', header: '码率', render: (v: unknown) => `${v} Mbps` },
    { key: 'hdr', header: 'HDR', render: (v: unknown) => ((v as boolean) ? '是' : '否') },
    { key: 'stabilization', header: '防抖' },
    { key: 'autofocus', header: '自动对焦', render: (v: unknown) => ((v as boolean) ? '支持' : '不支持') },
    {
      key: 'id',
      header: '操作',
      render: (_: unknown, row: VideoMode) => (
        <Button variant="ghost" size="sm" onClick={() => handleDeleteMode(row.id)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      ),
    },
  ]

  const getVideoScore = () => {
    if (modes.length === 0) return null

    let score = 0
    const has4K60 = modes.some(m => m.resolution.includes('4K') && m.frameRate >= 60)
    const has4K = modes.some(m => m.resolution.includes('4K'))
    const has8K = modes.some(m => m.resolution.includes('8K'))
    const hasHDR = modes.some(m => m.hdr)
    const hasSlowMo = modes.some(m => m.frameRate >= 120)
    const hasProRes = modes.some(m => m.codec === 'ProRes' || m.codec === 'RAW')
    const hasOIS = modes.some(m => m.stabilization.includes('OIS'))

    if (has8K) score += 20
    else if (has4K60) score += 15
    else if (has4K) score += 10

    if (hasHDR) score += 15
    if (hasSlowMo) score += 15
    if (hasProRes) score += 20
    if (hasOIS) score += 15
    if (modes.length >= 5) score += 15

    return Math.min(100, score)
  }

  const score = getVideoScore()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">视频规格测试</h2>
          <p className="text-muted-foreground">记录和评估相机视频拍摄能力</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>添加视频模式</CardTitle>
            <CardDescription>记录相机支持的视频规格</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">分辨率</label>
                <select
                  value={formData.resolution}
                  onChange={e => setFormData(prev => ({ ...prev, resolution: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  {RESOLUTIONS.map(r => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">帧率 (fps)</label>
                <select
                  value={formData.frameRate}
                  onChange={e => setFormData(prev => ({ ...prev, frameRate: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  {FRAME_RATES.map(f => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">编码格式</label>
                <select
                  value={formData.codec}
                  onChange={e => setFormData(prev => ({ ...prev, codec: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  {CODECS.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">码率 (Mbps)</label>
                <input
                  type="number"
                  value={formData.bitrate}
                  onChange={e => setFormData(prev => ({ ...prev, bitrate: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">防抖模式</label>
                <select
                  value={formData.stabilization}
                  onChange={e => setFormData(prev => ({ ...prev, stabilization: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  {STABILIZATION.map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-4 pt-6">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.hdr} onChange={e => setFormData(prev => ({ ...prev, hdr: e.target.checked }))} />
                  <span className="text-sm">HDR</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.autofocus}
                    onChange={e => setFormData(prev => ({ ...prev, autofocus: e.target.checked }))}
                  />
                  <span className="text-sm">自动对焦</span>
                </label>
              </div>
              <div className="col-span-2 flex items-end">
                <Button onClick={handleAddMode} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  添加模式
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              视频能力评分
            </CardTitle>
          </CardHeader>
          <CardContent>
            {score !== null ? (
              <div className="text-center">
                <p className={`text-5xl font-bold ${score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>{score}</p>
                <p className="text-muted-foreground">/ 100</p>
                <div className="mt-4 text-sm text-left space-y-1">
                  <p>已记录 {modes.length} 个视频模式</p>
                  {modes.some(m => m.resolution.includes('4K')) && <p className="text-green-600">✓ 支持4K录制</p>}
                  {modes.some(m => m.hdr) && <p className="text-green-600">✓ 支持HDR</p>}
                  {modes.some(m => m.frameRate >= 120) && <p className="text-green-600">✓ 支持慢动作</p>}
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">添加视频模式后显示评分</div>
            )}
          </CardContent>
        </Card>
      </div>

      {modes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>已记录的视频模式</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={modes} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
