'use client'

import { useState } from 'react'
import { Camera, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { CameraInfo } from '@/types'

interface CameraInfoFormProps {
  initialData?: CameraInfo
  onSave: (info: CameraInfo) => void
  onCancel?: () => void
}

export function CameraInfoForm({ initialData, onSave, onCancel }: CameraInfoFormProps) {
  const [formData, setFormData] = useState<CameraInfo>({
    make: initialData?.make || '',
    model: initialData?.model || '',
    lens: initialData?.lens || '',
    serialNumber: initialData?.serialNumber || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.make && formData.model) {
      onSave(formData)
    }
  }

  const handleChange = (field: keyof CameraInfo, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          相机信息
        </CardTitle>
        <CardDescription>输入被测相机和镜头信息</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">品牌 *</label>
              <input
                type="text"
                value={formData.make}
                onChange={e => handleChange('make', e.target.value)}
                placeholder="如: Sony, Canon, Nikon"
                className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">型号 *</label>
              <input
                type="text"
                value={formData.model}
                onChange={e => handleChange('model', e.target.value)}
                placeholder="如: A7R V, EOS R5"
                className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">镜头</label>
              <input
                type="text"
                value={formData.lens || ''}
                onChange={e => handleChange('lens', e.target.value)}
                placeholder="如: FE 24-70mm f/2.8 GM II"
                className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">序列号</label>
              <input
                type="text"
                value={formData.serialNumber || ''}
                onChange={e => handleChange('serialNumber', e.target.value)}
                placeholder="可选"
                className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                取消
              </Button>
            )}
            <Button type="submit" disabled={!formData.make || !formData.model}>
              <Save className="h-4 w-4 mr-2" />
              保存
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
