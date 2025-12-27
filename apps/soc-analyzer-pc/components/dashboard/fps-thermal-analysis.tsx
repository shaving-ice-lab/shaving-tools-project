'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import * as echarts from 'echarts'

interface FrameDataPoint {
  timestamp: number
  fps: number
  frameTime: number
  temperature: number
  cpuFrequency: number
  gpuFrequency: number
}

interface FpsThermalAnalysisProps {
  data: FrameDataPoint[]
  gameName?: string
}

export function FpsThermalAnalysis({ data, gameName = '游戏' }: FpsThermalAnalysisProps) {
  const correlationChartRef = useRef<HTMLDivElement>(null)
  const heatmapChartRef = useRef<HTMLDivElement>(null)
  const scatterChartRef = useRef<HTMLDivElement>(null)

  const calculateCorrelation = (x: number[], y: number[]): number => {
    if (x.length !== y.length || x.length === 0) return 0
    const n = x.length
    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0)
    const sumX2 = x.reduce((total, xi) => total + xi * xi, 0)
    const sumY2 = y.reduce((total, yi) => total + yi * yi, 0)
    
    const numerator = n * sumXY - sumX * sumY
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))
    
    return denominator === 0 ? 0 : numerator / denominator
  }

  const fpsValues = data.map(d => d.fps)
  const tempValues = data.map(d => d.temperature)
  const frameTimeValues = data.map(d => d.frameTime)
  const cpuFreqValues = data.map(d => d.cpuFrequency)
  const gpuFreqValues = data.map(d => d.gpuFrequency)

  const fpsTemperatureCorrelation = calculateCorrelation(fpsValues, tempValues)
  const fpsFrameTimeCorrelation = calculateCorrelation(fpsValues, frameTimeValues)
  const tempCpuFreqCorrelation = calculateCorrelation(tempValues, cpuFreqValues)

  const avgFps = fpsValues.length > 0 ? fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length : 0
  const avgTemp = tempValues.length > 0 ? tempValues.reduce((a, b) => a + b, 0) / tempValues.length : 0

  const thermalThrottlePoints = data.filter((d, i) => {
    if (i === 0) return false
    return d.temperature > 45 && d.fps < data[i - 1].fps * 0.9
  })

  useEffect(() => {
    if (!correlationChartRef.current || data.length === 0) return

    const chart = echarts.init(correlationChartRef.current)
    const times = data.map(d => new Date(d.timestamp).toLocaleTimeString())

    chart.setOption({
      backgroundColor: 'transparent',
      legend: {
        data: ['帧率 (FPS)', '温度 (°C)'],
        textStyle: { color: '#9CA3AF' },
        top: 5
      },
      grid: { top: 40, right: 60, bottom: 30, left: 60 },
      xAxis: {
        type: 'category',
        data: times,
        axisLine: { lineStyle: { color: '#374151' } },
        axisLabel: { color: '#9CA3AF', fontSize: 10 }
      },
      yAxis: [
        {
          type: 'value',
          name: 'FPS',
          nameTextStyle: { color: '#3B82F6' },
          axisLine: { lineStyle: { color: '#3B82F6' } },
          axisLabel: { color: '#3B82F6' },
          splitLine: { lineStyle: { color: '#1F2937' } },
          min: 0,
          max: 120
        },
        {
          type: 'value',
          name: '温度',
          nameTextStyle: { color: '#EF4444' },
          axisLine: { lineStyle: { color: '#EF4444' } },
          axisLabel: { color: '#EF4444' },
          splitLine: { show: false },
          min: 20,
          max: 80
        }
      ],
      series: [
        {
          name: '帧率 (FPS)',
          type: 'line',
          data: fpsValues,
          smooth: true,
          lineStyle: { color: '#3B82F6', width: 2 },
          itemStyle: { color: '#3B82F6' },
          showSymbol: false
        },
        {
          name: '温度 (°C)',
          type: 'line',
          yAxisIndex: 1,
          data: tempValues,
          smooth: true,
          lineStyle: { color: '#EF4444', width: 2 },
          itemStyle: { color: '#EF4444' },
          showSymbol: false,
          areaStyle: { color: 'rgba(239, 68, 68, 0.1)' }
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
  }, [data])

  useEffect(() => {
    if (!scatterChartRef.current || data.length === 0) return

    const chart = echarts.init(scatterChartRef.current)

    const scatterData = data.map(d => [d.temperature, d.fps])

    chart.setOption({
      backgroundColor: 'transparent',
      grid: { top: 20, right: 20, bottom: 40, left: 50 },
      xAxis: {
        type: 'value',
        name: '温度 (°C)',
        nameLocation: 'middle',
        nameGap: 25,
        nameTextStyle: { color: '#9CA3AF' },
        axisLine: { lineStyle: { color: '#374151' } },
        axisLabel: { color: '#9CA3AF' },
        splitLine: { lineStyle: { color: '#1F2937' } }
      },
      yAxis: {
        type: 'value',
        name: 'FPS',
        nameTextStyle: { color: '#9CA3AF' },
        axisLine: { lineStyle: { color: '#374151' } },
        axisLabel: { color: '#9CA3AF' },
        splitLine: { lineStyle: { color: '#1F2937' } }
      },
      series: [{
        type: 'scatter',
        data: scatterData,
        symbolSize: 8,
        itemStyle: {
          color: (params: any) => {
            const temp = params.data[0]
            if (temp >= 50) return '#EF4444'
            if (temp >= 40) return '#F59E0B'
            return '#10B981'
          }
        }
      }],
      tooltip: {
        trigger: 'item',
        backgroundColor: '#1F2937',
        borderColor: '#374151',
        textStyle: { color: '#fff' },
        formatter: (params: any) => `温度: ${params.data[0]}°C<br/>帧率: ${params.data[1]} FPS`
      }
    })

    return () => chart.dispose()
  }, [data])

  const getCorrelationLabel = (value: number): { text: string; color: string } => {
    const absValue = Math.abs(value)
    if (absValue >= 0.7) return { text: '强相关', color: 'text-red-400' }
    if (absValue >= 0.4) return { text: '中等相关', color: 'text-yellow-400' }
    if (absValue >= 0.2) return { text: '弱相关', color: 'text-green-400' }
    return { text: '无相关', color: 'text-gray-400' }
  }

  const fpsTemperatureLabel = getCorrelationLabel(fpsTemperatureCorrelation)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">温度与帧率关联分析</CardTitle>
            <Badge variant="outline">{gameName}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">
                {avgFps.toFixed(1)}
              </div>
              <div className="text-xs text-gray-400">平均帧率 (FPS)</div>
            </div>
            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-red-400">
                {avgTemp.toFixed(1)}°C
              </div>
              <div className="text-xs text-gray-400">平均温度</div>
            </div>
            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
              <div className={`text-2xl font-bold ${fpsTemperatureLabel.color}`}>
                {fpsTemperatureCorrelation.toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">
                温度-帧率相关性 ({fpsTemperatureLabel.text})
              </div>
            </div>
            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-orange-400">
                {thermalThrottlePoints.length}
              </div>
              <div className="text-xs text-gray-400">降频次数</div>
            </div>
          </div>

          <div ref={correlationChartRef} className="h-64" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">温度-帧率分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={scatterChartRef} className="h-48" />
            <div className="flex justify-center gap-4 mt-2 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-green-500" /> &lt;40°C
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-yellow-500" /> 40-50°C
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-red-500" /> &gt;50°C
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">相关性分析</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-gray-800/30 rounded">
                <span>温度 vs 帧率</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${fpsTemperatureCorrelation < 0 ? 'bg-red-500' : 'bg-blue-500'}`}
                      style={{ width: `${Math.abs(fpsTemperatureCorrelation) * 100}%` }}
                    />
                  </div>
                  <span className={fpsTemperatureLabel.color}>
                    {fpsTemperatureCorrelation.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-800/30 rounded">
                <span>温度 vs CPU频率</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${tempCpuFreqCorrelation < 0 ? 'bg-red-500' : 'bg-blue-500'}`}
                      style={{ width: `${Math.abs(tempCpuFreqCorrelation) * 100}%` }}
                    />
                  </div>
                  <span className={getCorrelationLabel(tempCpuFreqCorrelation).color}>
                    {tempCpuFreqCorrelation.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-800/30 rounded">
                <span>帧率 vs 帧时间</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${fpsFrameTimeCorrelation < 0 ? 'bg-red-500' : 'bg-blue-500'}`}
                      style={{ width: `${Math.abs(fpsFrameTimeCorrelation) * 100}%` }}
                    />
                  </div>
                  <span className={getCorrelationLabel(fpsFrameTimeCorrelation).color}>
                    {fpsFrameTimeCorrelation.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-800/30 rounded text-sm">
              <div className="font-medium mb-1">分析结论</div>
              <div className="text-gray-400">
                {fpsTemperatureCorrelation < -0.5
                  ? '温度上升时帧率明显下降，建议改善散热条件或降低画质设置。'
                  : fpsTemperatureCorrelation < -0.2
                  ? '温度对帧率有一定影响，但整体表现尚可。'
                  : '温度控制良好，帧率表现稳定。'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
