'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import * as echarts from 'echarts'
import { formatTemperature } from '@/lib/utils'

interface StressTestDataPoint {
  timestamp: number
  cpuUsage: number
  cpuFrequencies: number[]
  cpuTemperature: number
  gpuTemperature: number
  batteryTemperature: number
  powerConsumption: number
  performanceScore: number
  throttlingDetected: boolean
}

interface StressTestResult {
  durationMinutes: number
  dataPoints: StressTestDataPoint[]
  averagePerformance: number
  minPerformance: number
  maxPerformance: number
  performanceDrop: number
  maxTemperature: number
  throttlingTime: number
  stabilityScore: number
}

interface StressTestAnalysisProps {
  isRunning: boolean
  progress: number
  currentData?: StressTestDataPoint
  result?: StressTestResult
  onStart?: (duration: number) => void
  onStop?: () => void
}

export function StressTestAnalysis({
  isRunning,
  progress,
  currentData,
  result,
  onStart,
  onStop
}: StressTestAnalysisProps) {
  const [duration, setDuration] = useState(15)
  const [dataHistory, setDataHistory] = useState<StressTestDataPoint[]>([])
  const performanceChartRef = useRef<HTMLDivElement>(null)
  const temperatureChartRef = useRef<HTMLDivElement>(null)
  const frequencyChartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (currentData) {
      setDataHistory(prev => [...prev.slice(-300), currentData])
    }
  }, [currentData])

  useEffect(() => {
    if (!performanceChartRef.current || dataHistory.length === 0) return

    const chart = echarts.init(performanceChartRef.current)
    const times = dataHistory.map(d => new Date(d.timestamp).toLocaleTimeString())
    const scores = dataHistory.map(d => d.performanceScore)
    const throttling = dataHistory.map(d => d.throttlingDetected ? d.performanceScore : null)

    chart.setOption({
      backgroundColor: 'transparent',
      grid: { top: 40, right: 20, bottom: 30, left: 50 },
      xAxis: {
        type: 'category',
        data: times,
        axisLine: { lineStyle: { color: '#374151' } },
        axisLabel: { color: '#9CA3AF', fontSize: 10 }
      },
      yAxis: {
        type: 'value',
        name: '性能分数',
        nameTextStyle: { color: '#9CA3AF' },
        axisLine: { lineStyle: { color: '#374151' } },
        axisLabel: { color: '#9CA3AF' },
        splitLine: { lineStyle: { color: '#1F2937' } }
      },
      series: [
        {
          name: '性能分数',
          type: 'line',
          data: scores,
          smooth: true,
          lineStyle: { color: '#3B82F6', width: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0)' }
            ])
          }
        },
        {
          name: '降频区域',
          type: 'scatter',
          data: throttling,
          symbolSize: 8,
          itemStyle: { color: '#EF4444' }
        }
      ],
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1F2937',
        borderColor: '#374151',
        textStyle: { color: '#fff' }
      }
    })

    return () => chart.dispose()
  }, [dataHistory])

  useEffect(() => {
    if (!temperatureChartRef.current || dataHistory.length === 0) return

    const chart = echarts.init(temperatureChartRef.current)
    const times = dataHistory.map(d => new Date(d.timestamp).toLocaleTimeString())

    chart.setOption({
      backgroundColor: 'transparent',
      legend: {
        data: ['CPU温度', 'GPU温度', '电池温度'],
        textStyle: { color: '#9CA3AF' },
        top: 5
      },
      grid: { top: 40, right: 20, bottom: 30, left: 50 },
      xAxis: {
        type: 'category',
        data: times,
        axisLine: { lineStyle: { color: '#374151' } },
        axisLabel: { color: '#9CA3AF', fontSize: 10 }
      },
      yAxis: {
        type: 'value',
        name: '温度 (°C)',
        nameTextStyle: { color: '#9CA3AF' },
        axisLine: { lineStyle: { color: '#374151' } },
        axisLabel: { color: '#9CA3AF' },
        splitLine: { lineStyle: { color: '#1F2937' } },
        min: 20,
        max: 100
      },
      series: [
        {
          name: 'CPU温度',
          type: 'line',
          data: dataHistory.map(d => d.cpuTemperature),
          smooth: true,
          lineStyle: { color: '#EF4444', width: 2 }
        },
        {
          name: 'GPU温度',
          type: 'line',
          data: dataHistory.map(d => d.gpuTemperature),
          smooth: true,
          lineStyle: { color: '#F59E0B', width: 2 }
        },
        {
          name: '电池温度',
          type: 'line',
          data: dataHistory.map(d => d.batteryTemperature),
          smooth: true,
          lineStyle: { color: '#10B981', width: 2 }
        }
      ],
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1F2937',
        borderColor: '#374151',
        textStyle: { color: '#fff' }
      }
    })

    return () => chart.dispose()
  }, [dataHistory])

  useEffect(() => {
    if (!frequencyChartRef.current || dataHistory.length === 0) return

    const chart = echarts.init(frequencyChartRef.current)
    const times = dataHistory.map(d => new Date(d.timestamp).toLocaleTimeString())
    const numCores = dataHistory[0]?.cpuFrequencies?.length || 8

    const series = []
    for (let i = 0; i < numCores; i++) {
      series.push({
        name: `核心 ${i}`,
        type: 'line',
        data: dataHistory.map(d => d.cpuFrequencies?.[i] || 0),
        smooth: true,
        lineStyle: { width: 1 },
        showSymbol: false
      })
    }

    chart.setOption({
      backgroundColor: 'transparent',
      grid: { top: 40, right: 20, bottom: 30, left: 50 },
      xAxis: {
        type: 'category',
        data: times,
        axisLine: { lineStyle: { color: '#374151' } },
        axisLabel: { color: '#9CA3AF', fontSize: 10 }
      },
      yAxis: {
        type: 'value',
        name: '频率 (MHz)',
        nameTextStyle: { color: '#9CA3AF' },
        axisLine: { lineStyle: { color: '#374151' } },
        axisLabel: { color: '#9CA3AF' },
        splitLine: { lineStyle: { color: '#1F2937' } }
      },
      series,
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1F2937',
        borderColor: '#374151',
        textStyle: { color: '#fff' }
      }
    })

    return () => chart.dispose()
  }, [dataHistory])

  const getStabilityColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getStabilityLabel = (score: number) => {
    if (score >= 80) return '优秀'
    if (score >= 60) return '良好'
    if (score >= 40) return '一般'
    return '较差'
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">压力测试</CardTitle>
            <div className="flex items-center gap-2">
              {!isRunning ? (
                <>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
                  >
                    <option value={5}>5 分钟</option>
                    <option value={10}>10 分钟</option>
                    <option value={15}>15 分钟</option>
                    <option value={30}>30 分钟</option>
                  </select>
                  <Button onClick={() => onStart?.(duration)} size="sm">
                    开始测试
                  </Button>
                </>
              ) : (
                <Button onClick={onStop} variant="destructive" size="sm">
                  停止测试
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isRunning && (
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>测试进度</span>
                <span>{Math.round(progress * 100)}%</span>
              </div>
              <Progress value={progress * 100} />
            </div>
          )}

          {result && !isRunning && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                <div className={`text-2xl font-bold ${getStabilityColor(result.stabilityScore)}`}>
                  {result.stabilityScore}
                </div>
                <div className="text-xs text-gray-400">稳定性评分</div>
                <Badge variant="outline" className="mt-1">
                  {getStabilityLabel(result.stabilityScore)}
                </Badge>
              </div>
              <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">
                  {result.performanceDrop.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-400">性能衰减</div>
              </div>
              <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                <div className="text-2xl font-bold text-red-400">
                  {formatTemperature(result.maxTemperature)}
                </div>
                <div className="text-xs text-gray-400">最高温度</div>
              </div>
              <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-400">
                  {Math.round(result.throttlingTime / 1000)}s
                </div>
                <div className="text-xs text-gray-400">降频时间</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">性能变化曲线</CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={performanceChartRef} className="h-48" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">温度变化曲线</CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={temperatureChartRef} className="h-48" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">CPU频率变化</CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={frequencyChartRef} className="h-48" />
        </CardContent>
      </Card>
    </div>
  )
}
