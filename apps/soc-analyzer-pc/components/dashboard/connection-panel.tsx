'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Wifi, WifiOff, Usb, QrCode, RefreshCw, Smartphone } from 'lucide-react'
import { ConnectionStatus } from '@/lib/types'

interface ConnectionPanelProps {
  status: ConnectionStatus
  onConnect: (url: string) => void
  onDisconnect: () => void
  serverPort: number
  onPortChange: (port: number) => void
}

export function ConnectionPanel({ 
  status, 
  onConnect, 
  onDisconnect,
  serverPort,
  onPortChange 
}: ConnectionPanelProps) {
  const [ipAddress, setIpAddress] = useState('')
  const [connectionMode, setConnectionMode] = useState<'wireless' | 'wired'>('wireless')

  useEffect(() => {
    // Try to get local IP
    fetch('/api/local-ip')
      .then(res => res.json())
      .then(data => setIpAddress(data.ip || 'localhost'))
      .catch(() => setIpAddress('localhost'))
  }, [])

  const wsUrl = `ws://${ipAddress}:${serverPort}`

  const handleConnect = () => {
    if (connectionMode === 'wireless') {
      onConnect(wsUrl)
    } else {
      // ADB forward mode
      onConnect(`ws://localhost:${serverPort}`)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-base">
            <Wifi className="h-4 w-4 text-blue-400" />
            设备连接
          </span>
          <Badge variant={status === 'connected' ? 'success' : status === 'connecting' ? 'warning' : 'secondary'}>
            {status === 'connected' ? '已连接' : status === 'connecting' ? '连接中' : '未连接'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Mode */}
        <div className="flex gap-2">
          <Button
            variant={connectionMode === 'wireless' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setConnectionMode('wireless')}
            className="flex-1"
          >
            <Wifi className="mr-2 h-4 w-4" />
            无线连接
          </Button>
          <Button
            variant={connectionMode === 'wired' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setConnectionMode('wired')}
            className="flex-1"
          >
            <Usb className="mr-2 h-4 w-4" />
            有线连接
          </Button>
        </div>

        {connectionMode === 'wireless' ? (
          <>
            {/* QR Code Area */}
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-600 bg-slate-800/30 p-6">
              <div className="mb-4 rounded-lg bg-white p-4">
                <QrCode className="h-32 w-32 text-slate-900" />
              </div>
              <p className="text-sm text-slate-400">使用手机端App扫描二维码连接</p>
              <p className="mt-1 text-xs text-slate-500">{wsUrl}</p>
            </div>

            {/* Manual Connection */}
            <div className="space-y-2">
              <label className="text-sm text-slate-400">服务端口</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={serverPort}
                  onChange={(e) => onPortChange(parseInt(e.target.value) || 8765)}
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
                />
                <Button variant="secondary" size="icon">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* ADB Instructions */}
            <div className="rounded-lg bg-slate-800/50 p-4 text-sm">
              <p className="mb-2 font-medium text-slate-200">有线连接步骤：</p>
              <ol className="list-decimal list-inside space-y-1 text-slate-400">
                <li>使用USB数据线连接手机到电脑</li>
                <li>在手机上开启USB调试模式</li>
                <li>运行以下ADB命令进行端口转发</li>
              </ol>
              <div className="mt-3 rounded bg-slate-900 p-2 font-mono text-xs text-green-400">
                adb forward tcp:{serverPort} tcp:{serverPort}
              </div>
            </div>
          </>
        )}

        {/* Connection Button */}
        <div className="flex gap-2">
          {status === 'connected' ? (
            <Button variant="destructive" className="flex-1" onClick={onDisconnect}>
              <WifiOff className="mr-2 h-4 w-4" />
              断开连接
            </Button>
          ) : (
            <Button 
              className="flex-1" 
              onClick={handleConnect}
              disabled={status === 'connecting'}
            >
              <Smartphone className="mr-2 h-4 w-4" />
              {status === 'connecting' ? '连接中...' : '连接设备'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
