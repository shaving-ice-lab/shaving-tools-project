'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import * as echarts from 'echarts'

interface ChipData {
  id: string
  name: string
  manufacturer: string
  process: string
  cpuCores: string
  cpuFreq: string
  gpu: string
  npu: string
  modem: string
  tdp: number
  cpuScore: number
  gpuScore: number
  aiScore: number
  totalScore: number
}

interface ChipCompareProps {
  availableChips: ChipData[]
  selectedChips?: ChipData[]
  onChipSelect?: (chip: ChipData) => void
  onChipRemove?: (chipId: string) => void
}

export function ChipCompare({
  availableChips,
  selectedChips = [],
  onChipSelect,
  onChipRemove
}: ChipCompareProps) {
  const radarChartRef = useRef<HTMLDivElement>(null)
  const barChartRef = useRef<HTMLDivElement>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredChips = availableChips.filter(chip =>
    chip.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chip.manufacturer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    if (!radarChartRef.current || selectedChips.length === 0) return

    const chart = echarts.init(radarChartRef.current)
    
    const indicators = [
      { name: 'CPU单核', max: 3000 },
      { name: 'CPU多核', max: 15000 },
      { name: 'GPU', max: 20000 },
      { name: 'AI/NPU', max: 5000 },
      { name: '能效比', max: 100 }
    ]

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

    const series = selectedChips.map((chip, index) => ({
      name: chip.name,
      type: 'radar',
      data: [{
        value: [
          chip.cpuScore * 0.3,
          chip.cpuScore,
          chip.gpuScore,
          chip.aiScore,
          Math.round(chip.totalScore / chip.tdp)
        ],
        name: chip.name
      }],
      lineStyle: { color: colors[index % colors.length], width: 2 },
      areaStyle: { color: colors[index % colors.length], opacity: 0.1 },
      itemStyle: { color: colors[index % colors.length] }
    }))

    chart.setOption({
      backgroundColor: 'transparent',
      legend: {
        data: selectedChips.map(c => c.name),
        textStyle: { color: '#9CA3AF' },
        bottom: 0
      },
      radar: {
        indicator: indicators,
        shape: 'polygon',
        splitNumber: 5,
        axisName: { color: '#9CA3AF' },
        splitLine: { lineStyle: { color: '#374151' } },
        splitArea: { areaStyle: { color: ['transparent'] } },
        axisLine: { lineStyle: { color: '#374151' } }
      },
      series
    })

    return () => chart.dispose()
  }, [selectedChips])

  useEffect(() => {
    if (!barChartRef.current || selectedChips.length === 0) return

    const chart = echarts.init(barChartRef.current)
    const categories = ['CPU跑分', 'GPU跑分', 'AI跑分', '综合跑分']
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

    const series = selectedChips.map((chip, index) => ({
      name: chip.name,
      type: 'bar',
      data: [chip.cpuScore, chip.gpuScore, chip.aiScore, chip.totalScore],
      itemStyle: { color: colors[index % colors.length] },
      barGap: '10%'
    }))

    chart.setOption({
      backgroundColor: 'transparent',
      legend: {
        data: selectedChips.map(c => c.name),
        textStyle: { color: '#9CA3AF' },
        top: 5
      },
      grid: { top: 50, right: 20, bottom: 30, left: 60 },
      xAxis: {
        type: 'category',
        data: categories,
        axisLine: { lineStyle: { color: '#374151' } },
        axisLabel: { color: '#9CA3AF' }
      },
      yAxis: {
        type: 'value',
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
  }, [selectedChips])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">芯片对比</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedChips.map(chip => (
              <Badge
                key={chip.id}
                className="cursor-pointer hover:bg-red-500/20"
                onClick={() => onChipRemove?.(chip.id)}
              >
                {chip.name} ×
              </Badge>
            ))}
            {selectedChips.length === 0 && (
              <span className="text-gray-400 text-sm">请选择要对比的芯片</span>
            )}
          </div>
          
          <input
            type="text"
            placeholder="搜索芯片..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm mb-2"
          />
          
          <div className="max-h-48 overflow-y-auto space-y-1">
            {filteredChips.slice(0, 10).map(chip => (
              <div
                key={chip.id}
                className="flex justify-between items-center p-2 rounded hover:bg-gray-800 cursor-pointer"
                onClick={() => onChipSelect?.(chip)}
              >
                <div>
                  <span className="font-medium">{chip.name}</span>
                  <span className="text-gray-400 text-sm ml-2">{chip.manufacturer}</span>
                </div>
                <span className="text-blue-400 text-sm">{chip.totalScore.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedChips.length >= 2 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">性能雷达图</CardTitle>
              </CardHeader>
              <CardContent>
                <div ref={radarChartRef} className="h-64" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">跑分对比</CardTitle>
              </CardHeader>
              <CardContent>
                <div ref={barChartRef} className="h-64" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">规格对比</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 px-3">规格</th>
                      {selectedChips.map(chip => (
                        <th key={chip.id} className="text-left py-2 px-3">{chip.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-800">
                      <td className="py-2 px-3 text-gray-400">制程</td>
                      {selectedChips.map(chip => (
                        <td key={chip.id} className="py-2 px-3">{chip.process}</td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-2 px-3 text-gray-400">CPU核心</td>
                      {selectedChips.map(chip => (
                        <td key={chip.id} className="py-2 px-3">{chip.cpuCores}</td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-2 px-3 text-gray-400">CPU频率</td>
                      {selectedChips.map(chip => (
                        <td key={chip.id} className="py-2 px-3">{chip.cpuFreq}</td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-2 px-3 text-gray-400">GPU</td>
                      {selectedChips.map(chip => (
                        <td key={chip.id} className="py-2 px-3">{chip.gpu}</td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-2 px-3 text-gray-400">NPU</td>
                      {selectedChips.map(chip => (
                        <td key={chip.id} className="py-2 px-3">{chip.npu}</td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-2 px-3 text-gray-400">TDP</td>
                      {selectedChips.map(chip => (
                        <td key={chip.id} className="py-2 px-3">{chip.tdp}W</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
