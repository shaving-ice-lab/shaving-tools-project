'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import * as echarts from 'echarts'

interface FrameData {
  timestamp: number
  fps: number
  frameTime: number
  jank: boolean
}

interface GamePerformanceData {
  gameName: string
  duration: number
  frameData: FrameData[]
  averageFps: number
  onePercentLow: number
  pointOnePercentLow: number
  jankCount: number
  maxTemperature: number
}

interface GamePerformanceProps {
  data?: GamePerformanceData
  realtimeFrameData?: FrameData[]
}

export function GamePerformance({ data, realtimeFrameData }: GamePerformanceProps) {
  const fpsChartRef = useRef<HTMLDivElement>(null)
  const frameTimeChartRef = useRef<HTMLDivElement>(null)
  const distributionChartRef = useRef<HTMLDivElement>(null)

  const frameHistory = realtimeFrameData || data?.frameData || []

  useEffect(() => {
    if (!fpsChartRef.current || frameHistory.length === 0) return

    const chart = echarts.init(fpsChartRef.current)
    const times = frameHistory.map((d: FrameData) => new Date(d.timestamp).toLocaleTimeString())
    const fps = frameHistory.map((d: FrameData) => d.fps)

    chart.setOption({
      backgroundColor: 'transparent',
      grid: { top: 30, right: 20, bottom: 30, left: 50 },
      xAxis: {
        type: 'category',
        data: times,
        axisLine: { lineStyle: { color: '#374151' } },
        axisLabel: { color: '#9CA3AF', fontSize: 10 }
      },
      yAxis: {
        type: 'value',
        name: 'FPS',
        nameTextStyle: { color: '#9CA3AF' },
        axisLine: { lineStyle: { color: '#374151' } },
        axisLabel: { color: '#9CA3AF' },
        splitLine: { lineStyle: { color: '#1F2937' } },
        min: 0,
        max: 120
      },
      series: [{
        type: 'line',
        data: fps,
        smooth: true,
        lineStyle: { color: '#10B981', width: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
            { offset: 1, color: 'rgba(16, 185, 129, 0)' }
          ])
        },
        markLine: {
          silent: true,
          data: [
            { yAxis: 60, lineStyle: { color: '#F59E0B', type: 'dashed' } },
            { yAxis: 30, lineStyle: { color: '#EF4444', type: 'dashed' } }
          ]
        }
      }],
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1F2937',
        borderColor: '#374151',
        textStyle: { color: '#fff' }
      }
    })

    return () => chart.dispose()
  }, [frameHistory])

  useEffect(() => {
    if (!frameTimeChartRef.current || frameHistory.length === 0) return

    const chart = echarts.init(frameTimeChartRef.current)
    const times = frameHistory.map((d: FrameData) => new Date(d.timestamp).toLocaleTimeString())
    const frameTimes = frameHistory.map((d: FrameData) => d.frameTime)
    const jankPoints = frameHistory.map((d: FrameData) => d.jank ? d.frameTime : null)

    chart.setOption({
      backgroundColor: 'transparent',
      grid: { top: 30, right: 20, bottom: 30, left: 50 },
      xAxis: {
        type: 'category',
        data: times,
        axisLine: { lineStyle: { color: '#374151' } },
        axisLabel: { color: '#9CA3AF', fontSize: 10 }
      },
      yAxis: {
        type: 'value',
        name: '帧时间 (ms)',
        nameTextStyle: { color: '#9CA3AF' },
        axisLine: { lineStyle: { color: '#374151' } },
        axisLabel: { color: '#9CA3AF' },
        splitLine: { lineStyle: { color: '#1F2937' } }
      },
      series: [
        {
          name: '帧时间',
          type: 'line',
          data: frameTimes,
          smooth: true,
          lineStyle: { color: '#3B82F6', width: 2 },
          showSymbol: false
        },
        {
          name: '卡顿帧',
          type: 'scatter',
          data: jankPoints,
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
  }, [frameHistory])

  useEffect(() => {
    if (!distributionChartRef.current || frameHistory.length === 0) return

    const chart = echarts.init(distributionChartRef.current)
    
    const bins = [0, 8, 16, 25, 33, 50, 100]
    const labels = ['<8ms', '8-16ms', '16-25ms', '25-33ms', '33-50ms', '>50ms']
    const counts = new Array(6).fill(0)
    
    frameHistory.forEach((d: FrameData) => {
      const ft = d.frameTime
      if (ft < 8) counts[0]++
      else if (ft < 16) counts[1]++
      else if (ft < 25) counts[2]++
      else if (ft < 33) counts[3]++
      else if (ft < 50) counts[4]++
      else counts[5]++
    })

    const total = frameHistory.length
    const percentages = counts.map(c => ((c / total) * 100).toFixed(1))

    chart.setOption({
      backgroundColor: 'transparent',
      grid: { top: 30, right: 20, bottom: 40, left: 50 },
      xAxis: {
        type: 'category',
        data: labels,
        axisLine: { lineStyle: { color: '#374151' } },
        axisLabel: { color: '#9CA3AF', fontSize: 10 }
      },
      yAxis: {
        type: 'value',
        name: '占比 (%)',
        nameTextStyle: { color: '#9CA3AF' },
        axisLine: { lineStyle: { color: '#374151' } },
        axisLabel: { color: '#9CA3AF' },
        splitLine: { lineStyle: { color: '#1F2937' } }
      },
      series: [{
        type: 'bar',
        data: percentages,
        itemStyle: {
          color: (params: any) => {
            const colors = ['#10B981', '#22C55E', '#84CC16', '#F59E0B', '#F97316', '#EF4444']
            return colors[params.dataIndex]
          }
        },
        barWidth: '60%'
      }],
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1F2937',
        borderColor: '#374151',
        textStyle: { color: '#fff' },
        formatter: (params: any) => {
          const p = params[0]
          return `${p.name}: ${p.value}%`
        }
      }
    })

    return () => chart.dispose()
  }, [frameHistory])

  const getFpsColor = (fps: number) => {
    if (fps >= 55) return 'text-green-500'
    if (fps >= 30) return 'text-yellow-500'
    return 'text-red-500'
  }

  const avgFps = data?.averageFps || (frameHistory.length > 0 
    ? frameHistory.reduce((sum: number, d: FrameData) => sum + d.fps, 0) / frameHistory.length 
    : 0)

  const onePercentLow = data?.onePercentLow || calculatePercentileFps(frameHistory, 1)
  const pointOnePercentLow = data?.pointOnePercentLow || calculatePercentileFps(frameHistory, 0.1)
  const jankCount = data?.jankCount || frameHistory.filter((d: FrameData) => d.jank).length

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">游戏性能分析</CardTitle>
            {data?.gameName && (
              <Badge variant="outline">{data.gameName}</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
              <div className={`text-2xl font-bold ${getFpsColor(avgFps)}`}>
                {avgFps.toFixed(1)}
              </div>
              <div className="text-xs text-gray-400">平均帧率</div>
            </div>
            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400">
                {onePercentLow.toFixed(1)}
              </div>
              <div className="text-xs text-gray-400">1% Low</div>
            </div>
            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-orange-400">
                {pointOnePercentLow.toFixed(1)}
              </div>
              <div className="text-xs text-gray-400">0.1% Low</div>
            </div>
            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-red-400">
                {jankCount}
              </div>
              <div className="text-xs text-gray-400">卡顿次数</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">实时帧率</CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={fpsChartRef} className="h-48" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">帧时间</CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={frameTimeChartRef} className="h-48" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">帧时间分布</CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={distributionChartRef} className="h-48" />
        </CardContent>
      </Card>
    </div>
  )
}

function calculatePercentileFps(data: FrameData[], percentile: number): number {
  if (data.length === 0) return 0
  const sorted = [...data].sort((a, b) => a.fps - b.fps)
  const index = Math.floor(data.length * percentile / 100)
  return sorted[index]?.fps || 0
}
