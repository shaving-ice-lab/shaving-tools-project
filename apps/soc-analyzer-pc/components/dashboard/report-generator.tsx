'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface BenchmarkResult {
  cpuSingleCore: number
  cpuMultiCore: number
  gpuScore: number
  aiScore: number
  totalScore: number
}

interface StressTestResult {
  stabilityScore: number
  performanceDrop: number
  maxTemperature: number
  throttlingTime: number
}

interface GameTestResult {
  gameName: string
  averageFps: number
  onePercentLow: number
  jankCount: number
}

interface DeviceInfo {
  model: string
  socName: string
  androidVersion: string
  ramSize: string
}

interface ReportData {
  device: DeviceInfo
  benchmark?: BenchmarkResult
  stressTest?: StressTestResult
  gameTests?: GameTestResult[]
  testDate: string
}

interface ReportGeneratorProps {
  data?: ReportData
  onGeneratePDF?: () => void
  onGenerateHTML?: () => void
  onShare?: () => void
}

export function ReportGenerator({
  data,
  onGeneratePDF,
  onGenerateHTML,
  onShare
}: ReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [watermark, setWatermark] = useState('')
  const [includeCharts, setIncludeCharts] = useState(true)
  const [includeRawData, setIncludeRawData] = useState(false)

  const handleGeneratePDF = async () => {
    setIsGenerating(true)
    setProgress(0)
    
    const steps = ['收集数据', '生成图表', '排版布局', '渲染PDF', '完成']
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500))
      setProgress(((i + 1) / steps.length) * 100)
    }
    
    setIsGenerating(false)
    onGeneratePDF?.()
  }

  const handleGenerateHTML = async () => {
    setIsGenerating(true)
    setProgress(0)
    
    for (let i = 0; i <= 100; i += 20) {
      await new Promise(resolve => setTimeout(resolve, 200))
      setProgress(i)
    }
    
    setIsGenerating(false)
    onGenerateHTML?.()
  }

  const getScoreRating = (score: number, maxScore: number) => {
    const ratio = score / maxScore
    if (ratio >= 0.9) return { label: '卓越', color: 'text-green-500' }
    if (ratio >= 0.7) return { label: '优秀', color: 'text-blue-500' }
    if (ratio >= 0.5) return { label: '良好', color: 'text-yellow-500' }
    return { label: '一般', color: 'text-gray-500' }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">报告生成</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data ? (
            <>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="font-medium mb-2">设备信息</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-400">设备型号</div>
                  <div>{data.device.model}</div>
                  <div className="text-gray-400">SoC芯片</div>
                  <div>{data.device.socName}</div>
                  <div className="text-gray-400">Android版本</div>
                  <div>{data.device.androidVersion}</div>
                  <div className="text-gray-400">内存</div>
                  <div>{data.device.ramSize}</div>
                  <div className="text-gray-400">测试日期</div>
                  <div>{data.testDate}</div>
                </div>
              </div>

              {data.benchmark && (
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h3 className="font-medium mb-2">性能跑分</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">CPU单核</span>
                      <span className={getScoreRating(data.benchmark.cpuSingleCore, 3000).color}>
                        {data.benchmark.cpuSingleCore.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">CPU多核</span>
                      <span className={getScoreRating(data.benchmark.cpuMultiCore, 15000).color}>
                        {data.benchmark.cpuMultiCore.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">GPU跑分</span>
                      <span className={getScoreRating(data.benchmark.gpuScore, 20000).color}>
                        {data.benchmark.gpuScore.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">AI跑分</span>
                      <span className={getScoreRating(data.benchmark.aiScore, 5000).color}>
                        {data.benchmark.aiScore.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-gray-700 pt-2 mt-2">
                      <span className="font-medium">综合跑分</span>
                      <span className="text-blue-400 font-bold text-lg">
                        {data.benchmark.totalScore.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {data.stressTest && (
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h3 className="font-medium mb-2">压力测试</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {data.stressTest.stabilityScore}
                      </div>
                      <div className="text-xs text-gray-400">稳定性评分</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">
                        {data.stressTest.performanceDrop.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-400">性能衰减</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-400">
                        {data.stressTest.maxTemperature}°C
                      </div>
                      <div className="text-xs text-gray-400">最高温度</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-400">
                        {Math.round(data.stressTest.throttlingTime / 1000)}s
                      </div>
                      <div className="text-xs text-gray-400">降频时长</div>
                    </div>
                  </div>
                </div>
              )}

              {data.gameTests && data.gameTests.length > 0 && (
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h3 className="font-medium mb-2">游戏性能</h3>
                  <div className="space-y-3">
                    {data.gameTests.map((game, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span>{game.gameName}</span>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-green-400">{game.averageFps.toFixed(1)} FPS</span>
                          <span className="text-yellow-400">{game.onePercentLow.toFixed(1)} 1%Low</span>
                          <Badge variant="outline">{game.jankCount} 卡顿</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-400">
              暂无测试数据，请先进行性能测试
            </div>
          )}

          <div className="border-t border-gray-700 pt-4">
            <h3 className="font-medium mb-3">报告选项</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCharts}
                  onChange={(e) => setIncludeCharts(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">包含图表</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeRawData}
                  onChange={(e) => setIncludeRawData(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">包含原始数据</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">水印文字:</span>
                <input
                  type="text"
                  value={watermark}
                  onChange={(e) => setWatermark(e.target.value)}
                  placeholder="可选"
                  className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm flex-1"
                />
              </div>
            </div>
          </div>

          {isGenerating && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>生成中...</span>
                <span>{progress.toFixed(0)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleGeneratePDF}
              disabled={!data || isGenerating}
              className="flex-1"
            >
              生成PDF报告
            </Button>
            <Button
              onClick={handleGenerateHTML}
              disabled={!data || isGenerating}
              variant="outline"
              className="flex-1"
            >
              生成网页报告
            </Button>
            <Button
              onClick={onShare}
              disabled={!data}
              variant="outline"
            >
              分享
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
