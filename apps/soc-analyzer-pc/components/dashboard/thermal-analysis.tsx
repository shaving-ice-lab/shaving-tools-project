'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import * as echarts from 'echarts'

interface ThermalZone {
  name: string
  temperature: number
  maxTemperature: number
}

interface ThermalDataPoint {
  timestamp: number
  zones: ThermalZone[]
}

interface ThermalAnalysisProps {
  realtimeData?: ThermalDataPoint
  historyData?: ThermalDataPoint[]
  testScenario?: string
}

export function ThermalAnalysis({
  realtimeData,
  historyData = [],
  testScenario = '待机'
}: ThermalAnalysisProps) {
  const heatmapRef = useRef<HTMLDivElement>(null)
  const trendChartRef = useRef<HTMLDivElement>(null)
  const comparisonChartRef = useRef<HTMLDivElement>(null)

  const zones = realtimeData?.zones || [
    { name: 'CPU', temperature: 45, maxTemperature: 65 },
    { name: 'GPU', temperature: 42, maxTemperature: 58 },
    { name: '电池', temperature: 35, maxTemperature: 42 },
    { name: '屏幕', temperature: 38, maxTemperature: 45 },
    { name: '主板', temperature: 40, maxTemperature: 52 }
  ]

  useEffect(() => {
    if (!heatmapRef.current) return

    const chart = echarts.init(heatmapRef.current)
    
    const data = zones.map((zone, index) => ({
      name: zone.name,
      value: zone.temperature,
      itemStyle: {
        color: getTemperatureColor(zone.temperature)
      }
    }))

    chart.setOption({
      backgroundColor: 'transparent',
      tooltip: {
        formatter: (params: any) => `${params.name}: ${params.value}°C`
      },
      series: [{
        type: 'treemap',
        data: data,
        label: {
          show: true,
          formatter: (params: any) => `${params.name}\n${params.value}°C`,
          color: '#fff',
          fontSize: 14
        },
        breadcrumb: { show: false },
        itemStyle: {
          borderColor: '#1F2937',
          borderWidth: 2,
          gapWidth: 2
        }
      }]
    })

    return () => chart.dispose()
  }, [zones])

  useEffect(() => {
    if (!trendChartRef.current || historyData.length === 0) return

    const chart = echarts.init(trendChartRef.current)
    const times = historyData.map(d => new Date(d.timestamp).toLocaleTimeString())
    
    const zoneNames = historyData[0]?.zones.map(z => z.name) || []
    const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6']

    const series = zoneNames.map((name, index) => ({
      name,
      type: 'line',
      data: historyData.map(d => d.zones.find(z => z.name === name)?.temperature || 0),
      smooth: true,
      lineStyle: { color: colors[index % colors.length], width: 2 },
      showSymbol: false
    }))

    chart.setOption({
      backgroundColor: 'transparent',
      legend: {
        data: zoneNames,
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
      series,
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1F2937',
        borderColor: '#374151',
        textStyle: { color: '#fff' }
      }
    })

    return () => chart.dispose()
  }, [historyData])

  useEffect(() => {
    if (!comparisonChartRef.current) return

    const chart = echarts.init(comparisonChartRef.current)
    
    const scenarios = ['待机', '日常使用', '游戏', '跑分', '充电']
    const avgTemps = [32, 38, 52, 58, 45]
    const maxTemps = [35, 45, 68, 75, 52]

    chart.setOption({
      backgroundColor: 'transparent',
      legend: {
        data: ['平均温度', '最高温度'],
        textStyle: { color: '#9CA3AF' },
        top: 5
      },
      grid: { top: 40, right: 20, bottom: 30, left: 50 },
      xAxis: {
        type: 'category',
        data: scenarios,
        axisLine: { lineStyle: { color: '#374151' } },
        axisLabel: { color: '#9CA3AF' }
      },
      yAxis: {
        type: 'value',
        name: '温度 (°C)',
        nameTextStyle: { color: '#9CA3AF' },
        axisLine: { lineStyle: { color: '#374151' } },
        axisLabel: { color: '#9CA3AF' },
        splitLine: { lineStyle: { color: '#1F2937' } }
      },
      series: [
        {
          name: '平均温度',
          type: 'bar',
          data: avgTemps,
          itemStyle: { color: '#3B82F6' }
        },
        {
          name: '最高温度',
          type: 'bar',
          data: maxTemps,
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
  }, [])

  const getTemperatureColor = (temp: number) => {
    if (temp >= 60) return '#EF4444'
    if (temp >= 50) return '#F59E0B'
    if (temp >= 40) return '#10B981'
    return '#3B82F6'
  }

  const getTemperatureLabel = (temp: number) => {
    if (temp >= 60) return '过热'
    if (temp >= 50) return '偏高'
    if (temp >= 40) return '正常'
    return '良好'
  }

  const maxTemp = Math.max(...zones.map(z => z.temperature))
  const avgTemp = zones.reduce((sum, z) => sum + z.temperature, 0) / zones.length

  const coolingEfficiency = zones.reduce((sum, z) => {
    const ratio = 1 - (z.temperature - 25) / (z.maxTemperature - 25)
    return sum + Math.max(0, Math.min(1, ratio))
  }, 0) / zones.length * 100

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">发热分析</CardTitle>
            <Badge variant="outline">{testScenario}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
              <div className={`text-2xl font-bold ${getTemperatureColor(maxTemp) === '#EF4444' ? 'text-red-500' : getTemperatureColor(maxTemp) === '#F59E0B' ? 'text-yellow-500' : 'text-green-500'}`}>
                {maxTemp.toFixed(1)}°C
              </div>
              <div className="text-xs text-gray-400">最高温度</div>
              <Badge className="mt-1" style={{ backgroundColor: getTemperatureColor(maxTemp) }}>
                {getTemperatureLabel(maxTemp)}
              </Badge>
            </div>
            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">
                {avgTemp.toFixed(1)}°C
              </div>
              <div className="text-xs text-gray-400">平均温度</div>
            </div>
            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-green-400">
                {coolingEfficiency.toFixed(0)}%
              </div>
              <div className="text-xs text-gray-400">散热效率</div>
            </div>
            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">
                {zones.filter(z => z.temperature >= 50).length}
              </div>
              <div className="text-xs text-gray-400">热点区域</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">温度分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={heatmapRef} className="h-48" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">各区域温度</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {zones.map(zone => (
                <div key={zone.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{zone.name}</span>
                    <span style={{ color: getTemperatureColor(zone.temperature) }}>
                      {zone.temperature}°C
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(zone.temperature / 100) * 100}%`,
                        backgroundColor: getTemperatureColor(zone.temperature)
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">温度趋势</CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={trendChartRef} className="h-48" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">场景温度对比</CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={comparisonChartRef} className="h-48" />
        </CardContent>
      </Card>
    </div>
  )
}
