'use client'

import { useState } from 'react'
import { History, Trash2, Eye, Download, Clock, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface TestRecord {
  id: string
  cameraInfo: { make: string; model: string; lens?: string }
  testDate: Date
  scores: { overall: number; categories: { name: string; score: number }[] }
  toolsCompleted: string[]
}

interface HistoryPanelProps {
  records: TestRecord[]
  onView: (record: TestRecord) => void
  onDelete: (id: string) => void
  onExport: (record: TestRecord) => void
  onCompare?: (records: TestRecord[]) => void
}

export function HistoryPanel({ records, onView, onDelete, onExport, onCompare }: HistoryPanelProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]))
  }

  const handleCompare = () => {
    if (onCompare && selectedIds.length >= 2) {
      const selectedRecords = records.filter(r => selectedIds.includes(r.id))
      onCompare(selectedRecords)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50'
    if (score >= 80) return 'text-blue-600 bg-blue-50'
    if (score >= 70) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <History className="h-6 w-6" />
            测试历史
          </h2>
          <p className="text-muted-foreground">查看和管理之前的评测记录</p>
        </div>
        {onCompare && selectedIds.length >= 2 && <Button onClick={handleCompare}>对比选中 ({selectedIds.length})</Button>}
      </div>

      {records.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>暂无测试记录</p>
              <p className="text-sm mt-1">完成评测后，记录将显示在这里</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {records.map(record => (
            <Card key={record.id} className={`transition-all ${selectedIds.includes(record.id) ? 'ring-2 ring-primary' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {onCompare && (
                    <input type="checkbox" checked={selectedIds.includes(record.id)} onChange={() => toggleSelect(record.id)} className="h-4 w-4" />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium truncate">
                        {record.cameraInfo.make} {record.cameraInfo.model}
                      </span>
                      {record.cameraInfo.lens && <span className="text-sm text-muted-foreground truncate">+ {record.cameraInfo.lens}</span>}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>{formatDate(record.testDate)}</span>
                      <span>{record.toolsCompleted.length} 项测试完成</span>
                    </div>
                  </div>

                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(record.scores.overall)}`}>
                    {record.scores.overall.toFixed(0)} 分
                  </div>

                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onView(record)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onExport(record)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(record.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
