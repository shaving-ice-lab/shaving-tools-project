'use client'

import { useState } from 'react'
import { FileText, Download, FileJson, FileSpreadsheet, Code } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { generateReportData, exportToJSON, exportToCSV, exportToHTML, calculateOverallScore } from '@/lib/export/report-generator'
import { RadarChart } from './RadarChart'
import type { CameraInfo } from '@/types'

interface TestResults {
  mtf?: unknown
  color?: unknown
  dynamicRange?: unknown
  noise?: unknown
  distortion?: unknown
  vignetting?: unknown
  whiteBalance?: unknown
  autoFocus?: unknown
  video?: unknown
}

interface ReportExporterProps {
  cameraInfo: CameraInfo
  results: TestResults
  tester?: string
}

export function ReportExporter({ cameraInfo, results, tester = '评测人员' }: ReportExporterProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const scores = calculateOverallScore(results as Parameters<typeof calculateOverallScore>[0])

  const handleExport = async (format: 'json' | 'csv' | 'html') => {
    setIsGenerating(true)

    try {
      let content: string
      let filename: string
      let mimeType: string

      const report = generateReportData(cameraInfo, results as Parameters<typeof generateReportData>[1], tester)

      switch (format) {
        case 'json':
          content = exportToJSON(report)
          filename = `${cameraInfo.make}_${cameraInfo.model}_report.json`
          mimeType = 'application/json'
          break
        case 'csv':
          content = exportToCSV(results as Parameters<typeof exportToCSV>[0])
          filename = `${cameraInfo.make}_${cameraInfo.model}_data.csv`
          mimeType = 'text/csv'
          break
        case 'html':
          content = exportToHTML(report)
          filename = `${cameraInfo.make}_${cameraInfo.model}_report.html`
          mimeType = 'text/html'
          break
      }

      // 创建并下载文件
      const blob = new Blob([content], { type: `${mimeType};charset=utf-8` })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const getGradeColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getGradeLabel = (score: number) => {
    if (score >= 90) return '优秀'
    if (score >= 80) return '良好'
    if (score >= 70) return '中等'
    return '待改进'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            评测报告
          </CardTitle>
          <CardDescription>
            {cameraInfo.make} {cameraInfo.model} 相机综合评测
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            {/* 雷达图 */}
            <div className="flex flex-col items-center">
              <h3 className="font-semibold mb-4">性能雷达图</h3>
              {scores.categories.length > 0 ? (
                <RadarChart
                  data={scores.categories.map(c => ({
                    category: c.name,
                    score: Math.round(c.score),
                  }))}
                  size={280}
                />
              ) : (
                <div className="w-[280px] h-[280px] flex items-center justify-center text-muted-foreground border rounded-lg">暂无评测数据</div>
              )}
            </div>

            {/* 综合评分 */}
            <div className="space-y-4">
              <h3 className="font-semibold">综合评分</h3>
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                <p className={`text-6xl font-bold ${getGradeColor(scores.overall)}`}>{Math.round(scores.overall)}</p>
                <p className="text-lg text-muted-foreground mt-2">{getGradeLabel(scores.overall)}</p>
              </div>

              <div className="space-y-2">
                {scores.categories.map((cat, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm">{cat.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${cat.score}%` }} />
                      </div>
                      <span className="text-sm font-medium w-8">{Math.round(cat.score)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 导出按钮 */}
      <Card>
        <CardHeader>
          <CardTitle>导出报告</CardTitle>
          <CardDescription>选择导出格式下载评测报告</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => handleExport('html')} disabled={isGenerating} className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              HTML 网页报告
            </Button>
            <Button variant="outline" onClick={() => handleExport('json')} disabled={isGenerating} className="flex items-center gap-2">
              <FileJson className="h-4 w-4" />
              JSON 数据
            </Button>
            <Button variant="outline" onClick={() => handleExport('csv')} disabled={isGenerating} className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              CSV 表格
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 相机信息 */}
      <Card>
        <CardHeader>
          <CardTitle>设备信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">品牌</p>
              <p className="font-medium">{cameraInfo.make}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">型号</p>
              <p className="font-medium">{cameraInfo.model}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">镜头</p>
              <p className="font-medium">{cameraInfo.lens || '未知'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">测试日期</p>
              <p className="font-medium">{new Date().toLocaleDateString('zh-CN')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
