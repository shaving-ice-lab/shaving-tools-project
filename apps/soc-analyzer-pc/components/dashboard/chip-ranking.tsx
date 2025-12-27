'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import * as echarts from 'echarts'

interface ChipScore {
  id: string
  name: string
  manufacturer: string
  cpuScore: number
  gpuScore: number
  aiScore: number
  totalScore: number
  process: string
  releaseYear: number
}

interface ChipRankingProps {
  chips: ChipScore[]
  currentChipId?: string
  category?: 'total' | 'cpu' | 'gpu' | 'ai'
}

export function ChipRanking({
  chips,
  currentChipId,
  category = 'total'
}: ChipRankingProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const [selectedCategory, setSelectedCategory] = useState(category)
  const [filterManufacturer, setFilterManufacturer] = useState<string | null>(null)

  const manufacturers = [...new Set(chips.map(c => c.manufacturer))]

  const filteredChips = filterManufacturer
    ? chips.filter(c => c.manufacturer === filterManufacturer)
    : chips

  const getScore = (chip: ChipScore) => {
    switch (selectedCategory) {
      case 'cpu': return chip.cpuScore
      case 'gpu': return chip.gpuScore
      case 'ai': return chip.aiScore
      default: return chip.totalScore
    }
  }

  const sortedChips = [...filteredChips].sort((a, b) => getScore(b) - getScore(a))
  const top10 = sortedChips.slice(0, 10)

  const currentChipRank = currentChipId
    ? sortedChips.findIndex(c => c.id === currentChipId) + 1
    : null

  useEffect(() => {
    if (!chartRef.current) return

    const chart = echarts.init(chartRef.current)

    const colors = top10.map(chip =>
      chip.id === currentChipId ? '#3B82F6' : '#6B7280'
    )

    chart.setOption({
      backgroundColor: 'transparent',
      grid: { top: 10, right: 100, bottom: 30, left: 120 },
      xAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#374151' } },
        axisLabel: { color: '#9CA3AF' },
        splitLine: { lineStyle: { color: '#1F2937' } }
      },
      yAxis: {
        type: 'category',
        data: top10.map(c => c.name).reverse(),
        axisLine: { lineStyle: { color: '#374151' } },
        axisLabel: { color: '#9CA3AF', width: 100 }
      },
      series: [{
        type: 'bar',
        data: top10.map(c => getScore(c)).reverse(),
        itemStyle: {
          color: (params: any) => colors[top10.length - 1 - params.dataIndex]
        },
        label: {
          show: true,
          position: 'right',
          color: '#9CA3AF',
          formatter: (params: any) => params.value.toLocaleString()
        }
      }],
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1F2937',
        borderColor: '#374151',
        textStyle: { color: '#fff' },
        formatter: (params: any) => {
          const idx = top10.length - 1 - params[0].dataIndex
          const chip = top10[idx]
          return `
            <div style="font-weight:bold">${chip.name}</div>
            <div>厂商: ${chip.manufacturer}</div>
            <div>制程: ${chip.process}</div>
            <div>总分: ${chip.totalScore.toLocaleString()}</div>
            <div>CPU: ${chip.cpuScore.toLocaleString()}</div>
            <div>GPU: ${chip.gpuScore.toLocaleString()}</div>
            <div>AI: ${chip.aiScore.toLocaleString()}</div>
          `
        }
      }
    })

    return () => chart.dispose()
  }, [top10, selectedCategory, currentChipId])

  const getManufacturerColor = (manufacturer: string) => {
    const colors: Record<string, string> = {
      'Qualcomm': 'bg-red-500/20 text-red-400',
      'MediaTek': 'bg-blue-500/20 text-blue-400',
      'Apple': 'bg-gray-500/20 text-gray-400',
      'Samsung': 'bg-purple-500/20 text-purple-400',
      'HiSilicon': 'bg-orange-500/20 text-orange-400'
    }
    return colors[manufacturer] || 'bg-gray-500/20 text-gray-400'
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">同级别芯片排行榜</CardTitle>
            {currentChipRank && (
              <Badge className="bg-blue-500">
                当前排名: #{currentChipRank}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4 flex-wrap">
            <button
              className={`px-3 py-1 rounded text-sm ${selectedCategory === 'total' ? 'bg-blue-500' : 'bg-gray-700'}`}
              onClick={() => setSelectedCategory('total')}
            >
              综合
            </button>
            <button
              className={`px-3 py-1 rounded text-sm ${selectedCategory === 'cpu' ? 'bg-blue-500' : 'bg-gray-700'}`}
              onClick={() => setSelectedCategory('cpu')}
            >
              CPU
            </button>
            <button
              className={`px-3 py-1 rounded text-sm ${selectedCategory === 'gpu' ? 'bg-blue-500' : 'bg-gray-700'}`}
              onClick={() => setSelectedCategory('gpu')}
            >
              GPU
            </button>
            <button
              className={`px-3 py-1 rounded text-sm ${selectedCategory === 'ai' ? 'bg-blue-500' : 'bg-gray-700'}`}
              onClick={() => setSelectedCategory('ai')}
            >
              AI
            </button>
            <div className="flex-1" />
            <select
              value={filterManufacturer || ''}
              onChange={(e) => setFilterManufacturer(e.target.value || null)}
              className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
            >
              <option value="">全部厂商</option>
              {manufacturers.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div ref={chartRef} className="h-80" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">完整排行</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-y-auto max-h-64 space-y-2">
            {sortedChips.map((chip, index) => (
              <div
                key={chip.id}
                className={`flex items-center justify-between p-2 rounded ${
                  chip.id === currentChipId ? 'bg-blue-500/20' : 'bg-gray-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 text-center font-bold ${
                    index < 3 ? 'text-yellow-400' : 'text-gray-400'
                  }`}>
                    {index + 1}
                  </span>
                  <div>
                    <div className="font-medium">{chip.name}</div>
                    <div className="flex gap-2 text-xs">
                      <Badge className={getManufacturerColor(chip.manufacturer)}>
                        {chip.manufacturer}
                      </Badge>
                      <span className="text-gray-400">{chip.process}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-400">
                    {getScore(chip).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">
                    {selectedCategory === 'total' ? '综合' :
                     selectedCategory === 'cpu' ? 'CPU' :
                     selectedCategory === 'gpu' ? 'GPU' : 'AI'}分
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
