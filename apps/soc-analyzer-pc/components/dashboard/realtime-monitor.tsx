'use client'

import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Activity, Thermometer, Zap, HardDrive } from 'lucide-react'
import { RealtimeMonitor as RealtimeMonitorType } from '@/lib/types'
import { formatFrequency, formatTemperature, formatMemory, formatPower, getTemperatureColor } from '@/lib/utils'
import ReactECharts from 'echarts-for-react'

interface RealtimeMonitorProps {
  data: RealtimeMonitorType | null
  historicalData?: RealtimeMonitorType[]
}

export function RealtimeMonitor({ data, historicalData = [] }: RealtimeMonitorProps) {
  const [chartData, setChartData] = useState<{ time: string; cpu: number; gpu: number; temp: number }[]>([])
  
  useEffect(() => {
    if (data) {
      const now = new Date()
      const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
      setChartData(prev => {
        const newData = [...prev, {
          time: timeStr,
          cpu: data.cpu.usage,
          gpu: data.gpu.usage,
          temp: data.cpu.temperature
        }]
        return newData.slice(-60)
      })
    }
  }, [data])

  const cpuFreqOption = {
    backgroundColor: 'transparent',
    grid: { top: 10, right: 10, bottom: 25, left: 50 },
    xAxis: {
      type: 'category',
      data: chartData.map(d => d.time),
      axisLine: { lineStyle: { color: '#475569' } },
      axisLabel: { color: '#94a3b8', fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLine: { lineStyle: { color: '#475569' } },
      axisLabel: { color: '#94a3b8', fontSize: 10, formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#334155', type: 'dashed' } },
    },
    series: [
      {
        name: 'CPU',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: chartData.map(d => d.cpu),
        lineStyle: { color: '#3b82f6', width: 2 },
        areaStyle: { color: 'rgba(59, 130, 246, 0.1)' },
      },
      {
        name: 'GPU',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: chartData.map(d => d.gpu),
        lineStyle: { color: '#a855f7', width: 2 },
        areaStyle: { color: 'rgba(168, 85, 247, 0.1)' },
      },
    ],
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      borderColor: '#334155',
      textStyle: { color: '#e2e8f0' },
    },
    legend: {
      data: ['CPU', 'GPU'],
      textStyle: { color: '#94a3b8' },
      right: 10,
      top: 0,
    },
  }

  const tempOption = {
    backgroundColor: 'transparent',
    grid: { top: 10, right: 10, bottom: 25, left: 50 },
    xAxis: {
      type: 'category',
      data: chartData.map(d => d.time),
      axisLine: { lineStyle: { color: '#475569' } },
      axisLabel: { color: '#94a3b8', fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      min: 20,
      max: 80,
      axisLine: { lineStyle: { color: '#475569' } },
      axisLabel: { color: '#94a3b8', fontSize: 10, formatter: '{value}°C' },
      splitLine: { lineStyle: { color: '#334155', type: 'dashed' } },
    },
    series: [
      {
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: chartData.map(d => d.temp),
        lineStyle: { color: '#f97316', width: 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(249, 115, 22, 0.3)' },
              { offset: 1, color: 'rgba(249, 115, 22, 0)' },
            ],
          },
        },
      },
    ],
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      borderColor: '#334155',
      textStyle: { color: '#e2e8f0' },
      formatter: (params: any) => `${params[0].axisValue}<br/>温度: ${params[0].value}°C`,
    },
  }

  if (!data) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-400" />
            实时监控
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-60 items-center justify-center text-slate-500">
            等待数据...
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalMemory = data.memory.used_mb + data.memory.available_mb
  const memoryUsage = (data.memory.used_mb / totalMemory) * 100

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* CPU/GPU Usage */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-blue-400" />
            CPU / GPU 使用率
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-400">CPU</span>
                <span className="text-sm font-medium text-blue-400">{data.cpu.usage.toFixed(1)}%</span>
              </div>
              <Progress value={data.cpu.usage} className="h-2" indicatorClassName="bg-blue-500" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-400">GPU</span>
                <span className="text-sm font-medium text-purple-400">{data.gpu.usage.toFixed(1)}%</span>
              </div>
              <Progress value={data.gpu.usage} className="h-2" indicatorClassName="bg-purple-500" />
            </div>
          </div>
          <div className="h-40">
            <ReactECharts option={cpuFreqOption} style={{ height: '100%' }} />
          </div>
        </CardContent>
      </Card>

      {/* Temperature */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Thermometer className="h-4 w-4 text-orange-400" />
            温度监控
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xs text-slate-400 mb-1">CPU</div>
              <div className={`text-lg font-bold ${getTemperatureColor(data.cpu.temperature)}`}>
                {formatTemperature(data.cpu.temperature)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-400 mb-1">GPU</div>
              <div className={`text-lg font-bold ${getTemperatureColor(data.gpu.temperature)}`}>
                {formatTemperature(data.gpu.temperature)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-400 mb-1">电池</div>
              <div className={`text-lg font-bold ${getTemperatureColor(data.battery.temperature)}`}>
                {formatTemperature(data.battery.temperature)}
              </div>
            </div>
          </div>
          <div className="h-40">
            <ReactECharts option={tempOption} style={{ height: '100%' }} />
          </div>
        </CardContent>
      </Card>

      {/* Memory */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <HardDrive className="h-4 w-4 text-green-400" />
            内存使用
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">已用 / 总量</span>
            <span className="text-sm font-medium text-green-400">
              {formatMemory(data.memory.used_mb)} / {formatMemory(totalMemory)}
            </span>
          </div>
          <Progress value={memoryUsage} className="h-3" indicatorClassName="bg-green-500" />
          <div className="mt-2 flex justify-between text-xs text-slate-500">
            <span>使用率: {memoryUsage.toFixed(1)}%</span>
            <span>可用: {formatMemory(data.memory.available_mb)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Power */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-4 w-4 text-yellow-400" />
            功耗估算
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-slate-400 mb-1">实时功耗</div>
              <div className="text-2xl font-bold text-yellow-400">
                {formatPower(data.battery.power_mw)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">电压 / 电流</div>
              <div className="text-sm text-slate-300">
                {(data.battery.voltage_mv / 1000).toFixed(2)} V
              </div>
              <div className="text-sm text-slate-300">
                {Math.abs(data.battery.current_ma)} mA
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
