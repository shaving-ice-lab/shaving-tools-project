'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import * as echarts from 'echarts'

interface ScoreRecord {
  id: string
  timestamp: number
  deviceModel: string
  socName: string
  cpuScore: number
  gpuScore: number
  aiScore: number
  totalScore: number
  temperature: number
}

interface ScoreTrendProps {
  records: ScoreRecord[]
  deviceId?: string
}

export function ScoreTrend({ records, deviceId }: ScoreTrendProps) {
  const trendChartRef = useRef<HTMLDivElement>(null)
  const distributionChartRef = useRef<HTMLDivElement>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  const filterRecords = () => {
    const now = Date.now()
    const ranges: Record<string, number> = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      'all': Infinity
    }
    const range = ranges[timeRange]
    return records.filter(r => now - r.timestamp < range)
  }

  const filteredRecords = filterRecords()
  const sortedRecords = [...filteredRecords].sort((a, b) => a.timestamp - b.timestamp)

  const avgScore = sortedRecords.length > 0
    ? sortedRecords.reduce((sum, r) => sum + r.totalScore, 0) / sortedRecords.length
    : 0

  const maxScore = sortedRecords.length > 0
    ? Math.max(...sortedRecords.map(r => r.totalScore))
    : 0

  const minScore = sortedRecords.length > 0
    ? Math.min(...sortedRecords.map(r => r.totalScore))
    : 0

  const scoreTrend = sortedRecords.length >= 2
    ? ((sortedRecords[sortedRecords.length - 1].totalScore - sortedRecords[0].totalScore) / sortedRecords[0].totalScore * 100)
    : 0

  useEffect(() => {
    if (!trendChartRef.current || sortedRecords.length === 0) return

    const chart = echarts.init(trendChartRef.current)

    const dates = sortedRecords.map(r => new Date(r.timestamp).toLocaleDateString())
    const totalScores = sortedRecords.map(r => r.totalScore)
    const cpuScores = sortedRecords.map(r => r.cpuScore)
    const gpuScores = sortedRecords.map(r => r.gpuScore)
    const aiScores = sortedRecords.map(r => r.aiScore)

    chart.setOption({
      backgroundColor: 'transparent',
      legend: {
        data: ['综合', 'CPU', 'GPU', 'AI'],
        textStyle: { color: '#9CA3AF' },
        top: 5
      },
      grid: { top: 40, right: 20, bottom: 30, left: 60 },
      xAxis: {
        type: 'category',
        data: dates,
        axisLine: { lineStyle: { color: '#374151' } },
        axisLabel: { color: '#9CA3AF', rotate: 45, fontSize: 10 }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#374151' } },
        axisLabel: { color: '#9CA3AF' },
        splitLine: { lineStyle: { color: '#1F2937' } }
      },
      series: [
        {
          name: '综合',
          type: 'line',
          data: totalScores,
          smooth: true,
          lineStyle: { color: '#3B82F6', width: 2 },
          itemStyle: { color: '#3B82F6' }
        },
        {
          name: 'CPU',
          type: 'line',
          data: cpuScores,
          smooth: true,
          lineStyle: { color: '#10B981', width: 1 },
          itemStyle: { color: '#10B981' }
        },
        {
          name: 'GPU',
          type: 'line',
          data: gpuScores,
          smooth: true,
          lineStyle: { color: '#F59E0B', width: 1 },
          itemStyle: { color: '#F59E0B' }
        },
        {
          name: 'AI',
          type: 'line',
          data: aiScores,
          smooth: true,
          lineStyle: { color: '#8B5CF6', width: 1 },
          itemStyle: { color: '#8B5CF6' }
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
  }, [sortedRecords])

  useEffect(() => {
    if (!distributionChartRef.current || sortedRecords.length === 0) return

    const chart = echarts.init(distributionChartRef.current)

    const bucketSize = 50000
    const scores = sortedRecords.map(r => r.totalScore)
    const minBucket = Math.floor(Math.min(...scores) / bucketSize) * bucketSize
    const maxBucket = Math.ceil(Math.max(...scores) / bucketSize) * bucketSize

    const buckets: Record<number, number> = {}
    for (let b = minBucket; b <= maxBucket; b += bucketSize) {
      buckets[b] = 0
    }
    scores.forEach(s => {
      const bucket = Math.floor(s / bucketSize) * bucketSize
      buckets[bucket] = (buckets[bucket] || 0) + 1
    })

    const bucketKeys = Object.keys(buckets).map(Number).sort((a, b) => a - b)
    const bucketLabels = bucketKeys.map(b => `${(b / 1000).toFixed(0)}K-${((b + bucketSize) / 1000).toFixed(0)}K`)
    const bucketValues = bucketKeys.map(b => buckets[b])

    chart.setOption({
      backgroundColor: 'transparent',
      grid: { top: 10, right: 20, bottom: 40, left: 50 },
      xAxis: {
        type: 'category',
        data: bucketLabels,
        axisLine: { lineStyle: { color: '#374151' } },
        axisLabel: { color: '#9CA3AF', rotate: 45, fontSize: 10 }
      },
      yAxis: {
        type: 'value',
        name: '次数',
        nameTextStyle: { color: '#9CA3AF' },
        axisLine: { lineStyle: { color: '#374151' } },
        axisLabel: { color: '#9CA3AF' },
        splitLine: { lineStyle: { color: '#1F2937' } }
      },
      series: [{
        type: 'bar',
        data: bucketValues,
        itemStyle: { color: '#3B82F6' }
      }],
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1F2937',
        borderColor: '#374151',
        textStyle: { color: '#fff' }
      }
    })

    return () => chart.dispose()
  }, [sortedRecords])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">跑分趋势分析</CardTitle>
            <div className="flex gap-2">
              {(['7d', '30d', '90d', 'all'] as const).map(range => (
                <button
                  key={range}
                  className={`px-2 py-1 rounded text-xs ${
                    timeRange === range ? 'bg-blue-500' : 'bg-gray-700'
                  }`}
                  onClick={() => setTimeRange(range)}
                >
                  {range === 'all' ? '全部' : range}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">
                {avgScore.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className="text-xs text-gray-400">平均分数</div>
            </div>
            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-green-400">
                {maxScore.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">最高分</div>
            </div>
            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400">
                {minScore.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">最低分</div>
            </div>
            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
              <div className={`text-2xl font-bold ${scoreTrend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {scoreTrend >= 0 ? '+' : ''}{scoreTrend.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400">变化趋势</div>
            </div>
          </div>

          <div ref={trendChartRef} className="h-64" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">分数分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={distributionChartRef} className="h-48" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">测试记录</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-y-auto max-h-48 space-y-2">
              {sortedRecords.slice(-10).reverse().map(record => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-2 bg-gray-800/30 rounded"
                >
                  <div>
                    <div className="text-sm">{record.deviceModel}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(record.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-400">
                      {record.totalScore.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">
                      {record.temperature}°C
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
