'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/dashboard/header'
import { SocInfoCard } from '@/components/dashboard/soc-info-card'
import { RealtimeMonitor } from '@/components/dashboard/realtime-monitor'
import { BenchmarkResults } from '@/components/dashboard/benchmark-results'
import { ChipDatabase } from '@/components/dashboard/chip-database'
import { ConnectionPanel } from '@/components/dashboard/connection-panel'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { 
  Activity, 
  Database, 
  Trophy, 
  Flame, 
  Gamepad2, 
  FileText,
  Play,
  Square
} from 'lucide-react'
import { 
  mockDeviceHandshake, 
  mockSocInfo, 
  mockBenchmarkResult, 
  generateMockRealtimeData 
} from '@/lib/mock-data'
import { ConnectionStatus, SocInfo, RealtimeMonitor as RealtimeMonitorType, BenchmarkResult, DeviceHandshake } from '@/lib/types'

export default function HomePage() {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const [deviceInfo, setDeviceInfo] = useState<DeviceHandshake | null>(null)
  const [socInfo, setSocInfo] = useState<SocInfo | null>(null)
  const [realtimeData, setRealtimeData] = useState<RealtimeMonitorType | null>(null)
  const [benchmarkResult, setBenchmarkResult] = useState<BenchmarkResult | null>(null)
  const [serverPort, setServerPort] = useState(8765)
  const [useMockData, setUseMockData] = useState(true)

  // Simulate connection with mock data
  const handleConnect = (url: string) => {
    console.log('Connecting to:', url)
    setStatus('connecting')
    
    setTimeout(() => {
      setStatus('connected')
      if (useMockData) {
        setDeviceInfo(mockDeviceHandshake)
        setSocInfo(mockSocInfo)
        setBenchmarkResult(mockBenchmarkResult)
      }
    }, 1500)
  }

  const handleDisconnect = () => {
    setStatus('disconnected')
    setDeviceInfo(null)
    setSocInfo(null)
    setRealtimeData(null)
    setBenchmarkResult(null)
  }

  // Generate realtime data when connected
  useEffect(() => {
    if (status === 'connected' && useMockData) {
      const interval = setInterval(() => {
        setRealtimeData(generateMockRealtimeData())
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [status, useMockData])

  return (
    <div className="min-h-screen">
      <Header 
        status={status}
        deviceName={deviceInfo ? `${deviceInfo.device.brand} ${deviceInfo.device.model}` : undefined}
        socName={deviceInfo?.device.soc}
      />

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="monitor" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="monitor" className="gap-2">
                <Activity className="h-4 w-4" />
                实时监控
              </TabsTrigger>
              <TabsTrigger value="benchmark" className="gap-2">
                <Trophy className="h-4 w-4" />
                性能跑分
              </TabsTrigger>
              <TabsTrigger value="stress" className="gap-2">
                <Flame className="h-4 w-4" />
                压力测试
              </TabsTrigger>
              <TabsTrigger value="game" className="gap-2">
                <Gamepad2 className="h-4 w-4" />
                游戏测试
              </TabsTrigger>
              <TabsTrigger value="database" className="gap-2">
                <Database className="h-4 w-4" />
                芯片数据库
              </TabsTrigger>
              <TabsTrigger value="report" className="gap-2">
                <FileText className="h-4 w-4" />
                测试报告
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-slate-400">
                <input
                  type="checkbox"
                  checked={useMockData}
                  onChange={(e) => setUseMockData(e.target.checked)}
                  className="rounded border-slate-600"
                />
                使用模拟数据
              </label>
            </div>
          </div>

          {/* Real-time Monitor Tab */}
          <TabsContent value="monitor" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-4">
              <div className="lg:col-span-1 space-y-4">
                <ConnectionPanel
                  status={status}
                  onConnect={handleConnect}
                  onDisconnect={handleDisconnect}
                  serverPort={serverPort}
                  onPortChange={setServerPort}
                />
                <SocInfoCard socInfo={socInfo} />
              </div>
              <div className="lg:col-span-3">
                <RealtimeMonitor data={realtimeData} />
              </div>
            </div>
          </TabsContent>

          {/* Benchmark Tab */}
          <TabsContent value="benchmark" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-4">
              <div className="lg:col-span-1 space-y-4">
                <SocInfoCard socInfo={socInfo} />
                <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4 space-y-3">
                  <h3 className="text-sm font-medium text-slate-200">快速测试</h3>
                  <Button className="w-full" disabled={status !== 'connected'}>
                    <Play className="mr-2 h-4 w-4" />
                    开始全部测试
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" disabled={status !== 'connected'}>
                      CPU测试
                    </Button>
                    <Button variant="outline" size="sm" disabled={status !== 'connected'}>
                      GPU测试
                    </Button>
                    <Button variant="outline" size="sm" disabled={status !== 'connected'}>
                      内存测试
                    </Button>
                    <Button variant="outline" size="sm" disabled={status !== 'connected'}>
                      AI测试
                    </Button>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-3">
                <BenchmarkResults result={benchmarkResult} socName={socInfo?.cpu.name} />
              </div>
            </div>
          </TabsContent>

          {/* Stress Test Tab */}
          <TabsContent value="stress" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-4">
              <div className="lg:col-span-1 space-y-4">
                <SocInfoCard socInfo={socInfo} />
                <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4 space-y-3">
                  <h3 className="text-sm font-medium text-slate-200">压力测试设置</h3>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400">测试时长</label>
                    <select className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-200">
                      <option value="5">5 分钟</option>
                      <option value="10">10 分钟</option>
                      <option value="15" selected>15 分钟</option>
                      <option value="30">30 分钟</option>
                    </select>
                  </div>
                  <Button className="w-full" variant="destructive" disabled={status !== 'connected'}>
                    <Flame className="mr-2 h-4 w-4" />
                    开始压力测试
                  </Button>
                  <Button className="w-full" variant="outline" disabled>
                    <Square className="mr-2 h-4 w-4" />
                    停止测试
                  </Button>
                </div>
              </div>
              <div className="lg:col-span-3">
                <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-8 text-center">
                  <Flame className="mx-auto h-16 w-16 text-slate-600" />
                  <h3 className="mt-4 text-lg font-medium text-slate-300">压力测试</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    连接设备后开始压力测试，实时监控CPU频率、温度变化和性能衰减曲线
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Game Test Tab */}
          <TabsContent value="game" className="space-y-6">
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-8 text-center">
              <Gamepad2 className="mx-auto h-16 w-16 text-slate-600" />
              <h3 className="mt-4 text-lg font-medium text-slate-300">游戏性能测试</h3>
              <p className="mt-2 text-sm text-slate-500">
                连接设备后可以监控游戏帧率、帧时间分布、卡顿检测等游戏性能数据
              </p>
            </div>
          </TabsContent>

          {/* Chip Database Tab */}
          <TabsContent value="database">
            <ChipDatabase />
          </TabsContent>

          {/* Report Tab */}
          <TabsContent value="report" className="space-y-6">
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-8 text-center">
              <FileText className="mx-auto h-16 w-16 text-slate-600" />
              <h3 className="mt-4 text-lg font-medium text-slate-300">测试报告</h3>
              <p className="mt-2 text-sm text-slate-500">
                完成测试后可以生成PDF或HTML格式的详细测试报告
              </p>
              <div className="mt-6 flex justify-center gap-4">
                <Button variant="outline" disabled>
                  生成PDF报告
                </Button>
                <Button variant="outline" disabled>
                  生成HTML报告
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
