'use client'

import { Cpu, Wifi, WifiOff, Monitor, Settings } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConnectionStatus } from '@/lib/types'

interface HeaderProps {
  status: ConnectionStatus
  deviceName?: string
  socName?: string
}

export function Header({ status, deviceName, socName }: HeaderProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-500'
      case 'connecting':
        return 'bg-yellow-500 animate-pulse'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-slate-500'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return '已连接'
      case 'connecting':
        return '连接中...'
      case 'error':
        return '连接错误'
      default:
        return '未连接'
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-2">
              <Cpu className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">SoC Analyzer Pro</h1>
              <p className="text-xs text-slate-400">芯片性能深度分析平台</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {deviceName && (
            <div className="flex items-center gap-2 rounded-lg bg-slate-800/50 px-3 py-1.5">
              <Monitor className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-200">{deviceName}</span>
              {socName && (
                <Badge variant="secondary" className="ml-1">
                  {socName}
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor()}`} />
            <span className="text-sm text-slate-300">{getStatusText()}</span>
            {status === 'connected' ? (
              <Wifi className="h-4 w-4 text-green-400" />
            ) : (
              <WifiOff className="h-4 w-4 text-slate-500" />
            )}
          </div>

          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
