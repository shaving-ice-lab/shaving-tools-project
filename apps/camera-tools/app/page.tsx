'use client'

import { useState } from 'react'
import { Camera, Palette, Sun, Scan, Grid3X3, Circle, Thermometer, Focus, Video, FileText, Settings, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TooltipProvider } from '@/components/ui/tooltip'

import MTFAnalyzer from '@/components/camera-tools/MTFAnalyzer'
import ColorChecker from '@/components/camera-tools/ColorChecker'
import DynamicRange from '@/components/camera-tools/DynamicRange'
import NoiseAnalyzer from '@/components/camera-tools/NoiseAnalyzer'
import DistortionTest from '@/components/camera-tools/DistortionTest'
import VignettingTest from '@/components/camera-tools/VignettingTest'
import WhiteBalance from '@/components/camera-tools/WhiteBalance'
import AutoFocusTest from '@/components/camera-tools/AutoFocusTest'
import VideoSpecs from '@/components/camera-tools/VideoSpecs'
import { ReportExporter } from '@/components/shared/ReportExporter'
import { SettingsPanel } from '@/components/shared/SettingsPanel'
import { HelpGuide } from '@/components/shared/HelpGuide'
import { useCameraStore } from '@/stores/camera-store'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

const tools = [
  { id: 'mtf', name: 'MTF曲线', icon: Camera, description: '锐度与解析力分析' },
  { id: 'color', name: '色彩准确度', icon: Palette, description: '色彩还原与偏色检测' },
  { id: 'dynamic-range', name: '动态范围', icon: Sun, description: '宽容度与细节保留' },
  { id: 'noise', name: '噪点分析', icon: Scan, description: '高ISO性能评估' },
  { id: 'distortion', name: '畸变测试', icon: Grid3X3, description: '桶形/枕形畸变测量' },
  { id: 'vignetting', name: '暗角测试', icon: Circle, description: '边缘亮度衰减分析' },
  { id: 'white-balance', name: '白平衡', icon: Thermometer, description: '色温准确性验证' },
  { id: 'autofocus', name: '对焦性能', icon: Focus, description: '自动对焦速度与精度' },
  { id: 'video', name: '视频规格', icon: Video, description: '视频模式专项评测' },
  { id: 'report', name: '评测报告', icon: FileText, description: '综合评分与导出' },
  { id: 'settings', name: '设置', icon: Settings, description: '应用设置与配置' },
  { id: 'help', name: '帮助', icon: HelpCircle, description: '使用指南与说明' },
]

export default function HomePage() {
  const [activeTool, setActiveTool] = useState('mtf')
  const { cameraInfo, setCameraInfo, testResults, clearTestResults } = useCameraStore()

  // 键盘快捷键
  useKeyboardShortcuts([
    { key: '1', handler: () => setActiveTool('mtf') },
    { key: '2', handler: () => setActiveTool('color') },
    { key: '3', handler: () => setActiveTool('dynamic-range') },
    { key: '4', handler: () => setActiveTool('noise') },
    { key: '5', handler: () => setActiveTool('distortion') },
    { key: '6', handler: () => setActiveTool('vignetting') },
    { key: '7', handler: () => setActiveTool('white-balance') },
    { key: '8', handler: () => setActiveTool('autofocus') },
    { key: '9', handler: () => setActiveTool('video') },
    { key: '0', handler: () => setActiveTool('report') },
    { key: 'h', handler: () => setActiveTool('help') },
    { key: ',', handler: () => setActiveTool('settings') },
  ])

  const renderToolContent = () => {
    switch (activeTool) {
      case 'mtf':
        return <MTFAnalyzer />
      case 'color':
        return <ColorChecker />
      case 'dynamic-range':
        return <DynamicRange />
      case 'noise':
        return <NoiseAnalyzer />
      case 'distortion':
        return <DistortionTest />
      case 'vignetting':
        return <VignettingTest />
      case 'white-balance':
        return <WhiteBalance />
      case 'autofocus':
        return <AutoFocusTest />
      case 'video':
        return <VideoSpecs />
      case 'report':
        return <ReportExporter cameraInfo={cameraInfo || { make: '未设置', model: '未设置' }} results={testResults} tester="评测人员" />
      case 'settings':
        return <SettingsPanel cameraInfo={cameraInfo} onCameraInfoChange={setCameraInfo} onClearData={clearTestResults} />
      case 'help':
        return <HelpGuide />
      default:
        return <MTFAnalyzer />
    }
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Camera className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">相机评测工具套件</h1>
                <p className="text-xs text-muted-foreground">专业镜头与相机评测分析</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setActiveTool('report')}>
                <FileText className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setActiveTool('settings')}>
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setActiveTool('help')}>
                <HelpCircle className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Sidebar */}
          <aside className="w-64 border-r bg-card p-4 hidden lg:block">
            <nav className="space-y-1">
              {tools.map(tool => {
                const Icon = tool.icon
                return (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                      activeTool === tool.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{tool.name}</p>
                      <p className={cn('text-xs truncate', activeTool === tool.id ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                        {tool.description}
                      </p>
                    </div>
                  </button>
                )
              })}
            </nav>
          </aside>

          {/* Mobile Tab Navigation */}
          <div className="lg:hidden w-full">
            <Tabs value={activeTool} onValueChange={setActiveTool} className="w-full">
              <div className="border-b overflow-x-auto">
                <TabsList className="h-auto p-1 bg-transparent w-max">
                  {tools.map(tool => {
                    const Icon = tool.icon
                    return (
                      <TabsTrigger key={tool.id} value={tool.id} className="flex items-center gap-2 px-3 py-2">
                        <Icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{tool.name}</span>
                      </TabsTrigger>
                    )
                  })}
                </TabsList>
              </div>
              <div className="p-4">
                {tools.map(tool => (
                  <TabsContent key={tool.id} value={tool.id} className="mt-0">
                    {renderToolContent()}
                  </TabsContent>
                ))}
              </div>
            </Tabs>
          </div>

          {/* Desktop Content Area */}
          <main className="flex-1 p-6 hidden lg:block overflow-auto">{renderToolContent()}</main>
        </div>
      </div>
    </TooltipProvider>
  )
}
