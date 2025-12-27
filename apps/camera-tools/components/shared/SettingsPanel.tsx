'use client'

import { useState } from 'react'
import { Settings, Moon, Sun, Monitor, Trash2, Download, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CameraInfoForm } from './CameraInfoForm'
import type { CameraInfo } from '@/types'

interface SettingsPanelProps {
  cameraInfo: CameraInfo | null
  onCameraInfoChange: (info: CameraInfo) => void
  onClearData?: () => void
}

export function SettingsPanel({ cameraInfo, onCameraInfoChange, onClearData }: SettingsPanelProps) {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')

  const handleExportSettings = () => {
    const settings = {
      cameraInfo,
      theme,
      exportDate: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'camera-tools-settings.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleImportSettings = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async e => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        try {
          const text = await file.text()
          const settings = JSON.parse(text)
          if (settings.cameraInfo) {
            onCameraInfoChange(settings.cameraInfo)
          }
          if (settings.theme) {
            setTheme(settings.theme)
          }
        } catch (error) {
          console.error('Failed to import settings:', error)
        }
      }
    }
    input.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">设置</h2>
          <p className="text-muted-foreground">管理应用设置和相机信息</p>
        </div>
      </div>

      {/* 相机信息 */}
      <CameraInfoForm initialData={cameraInfo || undefined} onSave={onCameraInfoChange} />

      {/* 外观设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            外观设置
          </CardTitle>
          <CardDescription>自定义界面外观</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">主题</label>
              <div className="flex gap-2">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('light')}
                  className="flex items-center gap-2"
                >
                  <Sun className="h-4 w-4" />
                  浅色
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('dark')}
                  className="flex items-center gap-2"
                >
                  <Moon className="h-4 w-4" />
                  深色
                </Button>
                <Button
                  variant={theme === 'system' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('system')}
                  className="flex items-center gap-2"
                >
                  <Monitor className="h-4 w-4" />
                  系统
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 数据管理 */}
      <Card>
        <CardHeader>
          <CardTitle>数据管理</CardTitle>
          <CardDescription>导入、导出或清除数据</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleExportSettings}>
              <Download className="h-4 w-4 mr-2" />
              导出设置
            </Button>
            <Button variant="outline" onClick={handleImportSettings}>
              <Upload className="h-4 w-4 mr-2" />
              导入设置
            </Button>
            {onClearData && (
              <Button variant="destructive" onClick={onClearData}>
                <Trash2 className="h-4 w-4 mr-2" />
                清除所有数据
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 关于 */}
      <Card>
        <CardHeader>
          <CardTitle>关于</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>相机评测工具套件</strong> v1.0.0
            </p>
            <p>专业的相机镜头评测分析工具，支持MTF曲线、色彩准确度、动态范围等多项测试。</p>
            <p className="pt-2">参考标准: ISO 12233:2017, ISO 14524:2009, ISO 17321:2012</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
