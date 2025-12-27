'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'

interface ConnectedDevice {
  id: string
  name: string
  model: string
  connectionType: 'usb' | 'wifi'
  connectedAt: number
  lastSeen: number
}

interface SettingsPageProps {
  connectedDevices?: ConnectedDevice[]
  onDisconnectDevice?: (deviceId: string) => void
  onExportData?: () => void
  onImportData?: () => void
  onClearHistory?: () => void
}

export function SettingsPage({
  connectedDevices = [],
  onDisconnectDevice,
  onExportData,
  onImportData,
  onClearHistory
}: SettingsPageProps) {
  const [darkMode, setDarkMode] = useState(true)
  const [language, setLanguage] = useState('zh')
  const [autoConnect, setAutoConnect] = useState(true)
  const [dataInterval, setDataInterval] = useState(100)
  const [showNotifications, setShowNotifications] = useState(true)
  const [confirmClear, setConfirmClear] = useState(false)

  const connectionHistory = [
    { id: '1', deviceName: 'Xiaomi 14', lastConnected: Date.now() - 3600000 },
    { id: '2', deviceName: 'iPhone 15 Pro', lastConnected: Date.now() - 86400000 },
    { id: '3', deviceName: 'Samsung S24 Ultra', lastConnected: Date.now() - 172800000 }
  ]

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">设置</h1>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">设备管理</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">已连接设备</h3>
            {connectedDevices.length > 0 ? (
              <div className="space-y-2">
                {connectedDevices.map(device => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <div>
                        <div className="font-medium">{device.name}</div>
                        <div className="text-sm text-gray-400">{device.model}</div>
                      </div>
                      <Badge variant="outline">
                        {device.connectionType === 'usb' ? 'USB' : 'WiFi'}
                      </Badge>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDisconnectDevice?.(device.id)}
                    >
                      断开
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 bg-gray-800/30 rounded-lg">
                暂无已连接设备
              </div>
            )}
          </div>

          <div>
            <h3 className="font-medium mb-2">连接历史</h3>
            <div className="space-y-2">
              {connectionHistory.map(device => (
                <div
                  key={device.id}
                  className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg"
                >
                  <div>
                    <div className="font-medium">{device.deviceName}</div>
                    <div className="text-sm text-gray-400">
                      上次连接: {new Date(device.lastConnected).toLocaleString()}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    重新连接
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">连接设置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">自动连接</div>
              <div className="text-sm text-gray-400">启动时自动连接上次的设备</div>
            </div>
            <Switch checked={autoConnect} onCheckedChange={setAutoConnect} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">数据推送间隔</div>
              <div className="text-sm text-gray-400">接收数据的时间间隔</div>
            </div>
            <select
              value={dataInterval}
              onChange={(e) => setDataInterval(Number(e.target.value))}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-1"
            >
              <option value={50}>50ms</option>
              <option value={100}>100ms</option>
              <option value={200}>200ms</option>
              <option value={500}>500ms</option>
              <option value={1000}>1000ms</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">显示通知</div>
              <div className="text-sm text-gray-400">设备连接/断开时显示通知</div>
            </div>
            <Switch checked={showNotifications} onCheckedChange={setShowNotifications} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">显示设置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">深色模式</div>
              <div className="text-sm text-gray-400">使用深色主题</div>
            </div>
            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">语言</div>
              <div className="text-sm text-gray-400">界面显示语言</div>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-1"
            >
              <option value="zh">中文</option>
              <option value="en">English</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">数据管理</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">导出测试数据</div>
              <div className="text-sm text-gray-400">将所有测试数据导出为JSON文件</div>
            </div>
            <Button variant="outline" onClick={onExportData}>
              导出
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">导入测试数据</div>
              <div className="text-sm text-gray-400">从JSON文件导入测试数据</div>
            </div>
            <Button variant="outline" onClick={onImportData}>
              导入
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">清除历史记录</div>
              <div className="text-sm text-gray-400">删除所有测试历史数据</div>
            </div>
            {confirmClear ? (
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    onClearHistory?.()
                    setConfirmClear(false)
                  }}
                >
                  确认删除
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmClear(false)}
                >
                  取消
                </Button>
              </div>
            ) : (
              <Button
                variant="destructive"
                onClick={() => setConfirmClear(true)}
              >
                清除
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">关于</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">版本</span>
            <span>1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">构建时间</span>
            <span>2024-12-27</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">开发者</span>
            <span>SoC Analyzer Team</span>
          </div>
          <div className="pt-2 border-t border-gray-700">
            <Button variant="link" className="p-0 h-auto text-blue-400">
              查看开源许可
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
