'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Cpu, CircuitBoard, Sparkles } from 'lucide-react'
import { BenchmarkResult } from '@/lib/types'
import { chipDatabase } from '@/lib/chip-database'
import ReactECharts from 'echarts-for-react'

interface BenchmarkResultsProps {
  result: BenchmarkResult | null
  socName?: string
}

export function BenchmarkResults({ result, socName }: BenchmarkResultsProps) {
  if (!result) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            跑分结果
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-60 items-center justify-center text-slate-500">
            暂无跑分数据
          </div>
        </CardContent>
      </Card>
    )
  }

  // Find reference data from database
  const referenceChip = chipDatabase.find(c => 
    socName?.toLowerCase().includes(c.name.toLowerCase().split(' ').slice(-2).join(' '))
  )

  const cpuRadarOption = {
    backgroundColor: 'transparent',
    radar: {
      indicator: [
        { name: '单核', max: 3000 },
        { name: '多核', max: 10000 },
        { name: '整数', max: 3000 },
        { name: '浮点', max: 3000 },
        { name: '内存带宽', max: 150000 },
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: { color: '#94a3b8', fontSize: 11 },
      splitLine: { lineStyle: { color: '#334155' } },
      splitArea: { areaStyle: { color: ['rgba(59, 130, 246, 0.02)', 'rgba(59, 130, 246, 0.05)'] } },
      axisLine: { lineStyle: { color: '#475569' } },
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: [
              result.cpu.single_core,
              result.cpu.multi_core,
              result.cpu.integer,
              result.cpu.float,
              result.cpu.memory_bandwidth,
            ],
            name: '当前设备',
            lineStyle: { color: '#3b82f6', width: 2 },
            areaStyle: { color: 'rgba(59, 130, 246, 0.2)' },
            itemStyle: { color: '#3b82f6' },
          },
          ...(referenceChip?.benchmark_reference ? [{
            value: [
              referenceChip.benchmark_reference.single_core,
              referenceChip.benchmark_reference.multi_core,
              referenceChip.benchmark_reference.single_core * 1.1,
              referenceChip.benchmark_reference.single_core * 0.9,
              120000,
            ],
            name: '参考基准',
            lineStyle: { color: '#22c55e', width: 2, type: 'dashed' as const },
            areaStyle: { color: 'rgba(34, 197, 94, 0.1)' },
            itemStyle: { color: '#22c55e' },
          }] : []),
        ],
      },
    ],
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      borderColor: '#334155',
      textStyle: { color: '#e2e8f0' },
    },
    legend: {
      data: ['当前设备', ...(referenceChip ? ['参考基准'] : [])],
      textStyle: { color: '#94a3b8' },
      bottom: 0,
    },
  }

  const gpuBarOption = {
    backgroundColor: 'transparent',
    grid: { top: 20, right: 20, bottom: 30, left: 80 },
    xAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#475569' } },
      axisLabel: { color: '#94a3b8' },
      splitLine: { lineStyle: { color: '#334155', type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      data: ['填充率', '纹理', '计算', '综合'],
      axisLine: { lineStyle: { color: '#475569' } },
      axisLabel: { color: '#94a3b8' },
    },
    series: [
      {
        type: 'bar',
        data: [
          { value: result.gpu.fill_rate, itemStyle: { color: '#a855f7' } },
          { value: result.gpu.texture, itemStyle: { color: '#ec4899' } },
          { value: result.gpu.compute, itemStyle: { color: '#f97316' } },
          { value: result.gpu.score, itemStyle: { color: '#eab308' } },
        ],
        barWidth: 16,
        label: {
          show: true,
          position: 'right',
          color: '#94a3b8',
          fontSize: 11,
        },
      },
    ],
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      borderColor: '#334155',
      textStyle: { color: '#e2e8f0' },
    },
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* CPU Score */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-base">
              <Cpu className="h-4 w-4 text-blue-400" />
              CPU 跑分
            </span>
            <div className="flex gap-2">
              <Badge>单核 {result.cpu.single_core}</Badge>
              <Badge variant="secondary">多核 {result.cpu.multi_core}</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ReactECharts option={cpuRadarOption} style={{ height: '100%' }} />
          </div>
        </CardContent>
      </Card>

      {/* GPU Score */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-base">
              <CircuitBoard className="h-4 w-4 text-purple-400" />
              GPU 跑分
            </span>
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">
              {result.gpu.score}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ReactECharts option={gpuBarOption} style={{ height: '100%' }} />
          </div>
        </CardContent>
      </Card>

      {/* AI Score */}
      {result.ai && (
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-yellow-400" />
                AI/NPU 跑分
              </span>
              <Badge className="bg-gradient-to-r from-yellow-600 to-orange-600">
                {result.ai.score}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-slate-800/50 p-4 text-center">
                <div className="text-xs text-slate-400 mb-1">综合分数</div>
                <div className="text-2xl font-bold text-yellow-400">{result.ai.score}</div>
              </div>
              <div className="rounded-lg bg-slate-800/50 p-4 text-center">
                <div className="text-xs text-slate-400 mb-1">INT8 量化</div>
                <div className="text-2xl font-bold text-green-400">{result.ai.int8}</div>
              </div>
              <div className="rounded-lg bg-slate-800/50 p-4 text-center">
                <div className="text-xs text-slate-400 mb-1">FP16 半精度</div>
                <div className="text-2xl font-bold text-blue-400">{result.ai.fp16}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
