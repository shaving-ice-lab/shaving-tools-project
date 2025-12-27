'use client'

import { useState, useCallback } from 'react'
import { Play, RotateCcw, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/shared/DataTable'

interface FocusTest {
  id: number
  condition: string
  focusTime: number
  success: boolean
  notes: string
}

export default function AutoFocusTest() {
  const [tests, setTests] = useState<FocusTest[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [currentCondition, setCurrentCondition] = useState('normal')

  const conditions = [
    { id: 'normal', name: '正常光线', description: '室内标准照明 (500-1000 lux)' },
    { id: 'bright', name: '强光', description: '户外阳光 (>10000 lux)' },
    { id: 'low', name: '弱光', description: '昏暗环境 (<100 lux)' },
    { id: 'contrast', name: '低对比度', description: '低对比度目标' },
    { id: 'moving', name: '移动目标', description: '追踪移动物体' },
  ]

  const simulateFocusTest = useCallback(async () => {
    setIsRunning(true)

    const baseTime =
      {
        normal: 150,
        bright: 120,
        low: 400,
        contrast: 350,
        moving: 200,
      }[currentCondition] || 200

    const successRate =
      {
        normal: 0.98,
        bright: 0.99,
        low: 0.85,
        contrast: 0.8,
        moving: 0.9,
      }[currentCondition] || 0.95

    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500))

    const focusTime = baseTime + Math.random() * 100 - 50
    const success = Math.random() < successRate

    const newTest: FocusTest = {
      id: Date.now(),
      condition: conditions.find(c => c.id === currentCondition)?.name || currentCondition,
      focusTime: Math.round(focusTime),
      success,
      notes: success ? '' : '对焦失败',
    }

    setTests(prev => [newTest, ...prev])
    setIsRunning(false)
  }, [currentCondition])

  const handleReset = useCallback(() => {
    setTests([])
  }, [])

  const getStats = () => {
    if (tests.length === 0) return null

    const successful = tests.filter(t => t.success)
    const avgTime = successful.length > 0 ? successful.reduce((sum, t) => sum + t.focusTime, 0) / successful.length : 0
    const hitRate = (successful.length / tests.length) * 100

    const byCondition = conditions
      .map(c => {
        const condTests = tests.filter(t => t.condition === c.name)
        const condSuccess = condTests.filter(t => t.success)
        return {
          condition: c.name,
          count: condTests.length,
          avgTime: condSuccess.length > 0 ? condSuccess.reduce((sum, t) => sum + t.focusTime, 0) / condSuccess.length : 0,
          hitRate: condTests.length > 0 ? (condSuccess.length / condTests.length) * 100 : 0,
        }
      })
      .filter(c => c.count > 0)

    return { avgTime, hitRate, byCondition, total: tests.length }
  }

  const stats = getStats()

  const columns = [
    { key: 'condition', header: '测试条件' },
    { key: 'focusTime', header: '对焦时间', render: (v: unknown) => `${v} ms` },
    {
      key: 'success',
      header: '结果',
      render: (v: unknown) => <span className={v ? 'text-green-600' : 'text-red-500'}>{v ? '成功' : '失败'}</span>,
    },
    { key: 'notes', header: '备注' },
  ]

  const conditionColumns = [
    { key: 'condition', header: '测试条件' },
    { key: 'count', header: '测试次数' },
    { key: 'avgTime', header: '平均时间', render: (v: unknown) => `${(v as number).toFixed(0)} ms` },
    { key: 'hitRate', header: '命中率', render: (v: unknown) => `${(v as number).toFixed(1)}%` },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">对焦性能测试</h2>
          <p className="text-muted-foreground">评估自动对焦系统的速度与精度</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={tests.length === 0}>
            <RotateCcw className="h-4 w-4 mr-2" />
            清空记录
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>测试控制</CardTitle>
            <CardDescription>选择测试条件并运行测试</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">测试条件:</label>
              <div className="space-y-2">
                {conditions.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setCurrentCondition(c.id)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      currentCondition === c.id ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    <p className="font-medium">{c.name}</p>
                    <p className={`text-xs ${currentCondition === c.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{c.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <Button className="w-full" size="lg" onClick={simulateFocusTest} disabled={isRunning}>
              <Zap className="h-5 w-5 mr-2" />
              {isRunning ? '测试中...' : '运行对焦测试'}
            </Button>

            <p className="text-xs text-muted-foreground text-center">提示：实际测试需配合实体相机操作记录</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>测试统计</CardTitle>
          </CardHeader>
          <CardContent>
            {stats ? (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">总测试次数</p>
                    <p className="text-3xl font-bold">{stats.total}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">平均对焦时间</p>
                    <p className="text-3xl font-bold text-primary">{stats.avgTime.toFixed(0)}</p>
                    <p className="text-sm text-muted-foreground">ms</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">对焦命中率</p>
                    <p
                      className={`text-3xl font-bold ${stats.hitRate > 95 ? 'text-green-600' : stats.hitRate > 85 ? 'text-yellow-500' : 'text-red-500'}`}
                    >
                      {stats.hitRate.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {stats.byCondition.length > 0 && <DataTable columns={conditionColumns} data={stats.byCondition} exportable={false} />}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">运行测试后显示统计数据</div>
            )}
          </CardContent>
        </Card>
      </div>

      {tests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>测试记录</CardTitle>
            <CardDescription>最近 {tests.length} 次测试结果</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={tests.slice(0, 20)} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
