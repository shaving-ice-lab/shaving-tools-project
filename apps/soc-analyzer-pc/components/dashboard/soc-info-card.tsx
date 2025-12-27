'use client'

import { Cpu, CircuitBoard, MemoryStick, Sparkles, Camera, Radio } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { SocInfo, CpuCore } from '@/lib/types'
import { formatFrequency } from '@/lib/utils'

interface SocInfoCardProps {
  socInfo: SocInfo | null
}

function CoreGroup({ cores, type }: { cores: CpuCore[], type: string }) {
  const coresByType = cores.filter(c => c.type === type)
  if (coresByType.length === 0) return null

  const getTypeLabel = () => {
    switch (type) {
      case 'prime': return '超大核'
      case 'big': return '大核'
      case 'middle': return '中核'
      case 'little': return '小核'
      default: return type
    }
  }

  const getVariant = (): 'prime' | 'big' | 'middle' | 'little' => {
    return type as 'prime' | 'big' | 'middle' | 'little'
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Badge variant={getVariant()}>
          {getTypeLabel()} × {coresByType.length}
        </Badge>
        <span className="text-xs text-slate-400">{coresByType[0]?.arch}</span>
      </div>
      <div className="grid gap-1">
        {coresByType.map((core, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-16 text-xs text-slate-500">
              {formatFrequency(core.current_freq)}
            </div>
            <Progress 
              value={(core.current_freq / core.max_freq) * 100}
              className="h-1.5 flex-1"
              indicatorClassName={
                type === 'prime' ? 'bg-red-500' :
                type === 'big' ? 'bg-orange-500' :
                type === 'middle' ? 'bg-yellow-500' :
                'bg-green-500'
              }
            />
            <div className="w-16 text-xs text-slate-500 text-right">
              {formatFrequency(core.max_freq)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SocInfoCard({ socInfo }: SocInfoCardProps) {
  if (!socInfo) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-blue-400" />
            芯片信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-40 items-center justify-center text-slate-500">
            等待设备连接...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-blue-400" />
            {socInfo.cpu.name}
          </span>
          <Badge variant="outline">{socInfo.cpu.process}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* CPU Cores */}
        <div className="space-y-3">
          <CoreGroup cores={socInfo.cpu.cores} type="prime" />
          <CoreGroup cores={socInfo.cpu.cores} type="big" />
          <CoreGroup cores={socInfo.cpu.cores} type="middle" />
          <CoreGroup cores={socInfo.cpu.cores} type="little" />
        </div>

        <div className="h-px bg-slate-700" />

        {/* GPU */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CircuitBoard className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-slate-300">GPU</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-slate-200">{socInfo.gpu.name}</div>
            <div className="text-xs text-slate-500">{formatFrequency(socInfo.gpu.max_freq)}</div>
          </div>
        </div>

        {/* Memory */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MemoryStick className="h-4 w-4 text-green-400" />
            <span className="text-sm text-slate-300">内存</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-slate-200">
              {socInfo.memory.size_gb}GB {socInfo.memory.type}
            </div>
            <div className="text-xs text-slate-500">{socInfo.memory.bandwidth}</div>
          </div>
        </div>

        {/* NPU */}
        {socInfo.npu && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-slate-300">NPU</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-slate-200">{socInfo.npu.name}</div>
              <div className="text-xs text-slate-500">{socInfo.npu.tops} TOPS</div>
            </div>
          </div>
        )}

        {/* ISP */}
        {socInfo.isp && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-pink-400" />
              <span className="text-sm text-slate-300">ISP</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-slate-200">{socInfo.isp.name}</div>
            </div>
          </div>
        )}

        {/* Modem */}
        {socInfo.modem && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-cyan-400" />
              <span className="text-sm text-slate-300">基带</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-slate-200">{socInfo.modem.name}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
