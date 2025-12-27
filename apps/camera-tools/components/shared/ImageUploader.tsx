'use client'

import { useCallback, useState } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ImageUploaderProps {
  accept?: string[]
  multiple?: boolean
  maxSize?: number
  onUpload: (files: File[]) => void
  onError?: (error: string) => void
  className?: string
}

export function ImageUploader({
  accept = ['image/jpeg', 'image/png', 'image/tiff', 'image/raw'],
  multiple = false,
  maxSize = 50,
  onUpload,
  onError,
  className,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const validateFile = useCallback(
    (file: File): boolean => {
      if (!accept.some(type => file.type.startsWith(type.split('/')[0]))) {
        onError?.(`不支持的文件格式: ${file.type}`)
        return false
      }
      if (file.size > maxSize * 1024 * 1024) {
        onError?.(`文件大小超过限制: ${maxSize}MB`)
        return false
      }
      return true
    },
    [accept, maxSize, onError]
  )

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return

      const validFiles: File[] = []
      for (let i = 0; i < files.length; i++) {
        if (validateFile(files[i])) {
          validFiles.push(files[i])
        }
      }

      if (validFiles.length > 0) {
        if (!multiple && validFiles.length > 0) {
          const url = URL.createObjectURL(validFiles[0])
          setPreview(url)
        }
        onUpload(multiple ? validFiles : [validFiles[0]])
      }
    },
    [multiple, onUpload, validateFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files)
    },
    [handleFiles]
  )

  const clearPreview = useCallback(() => {
    if (preview) {
      URL.revokeObjectURL(preview)
      setPreview(null)
    }
  }, [preview])

  return (
    <div className={cn('relative', className)}>
      {preview ? (
        <div className="relative rounded-lg overflow-hidden border bg-muted">
          <img src={preview} alt="预览" className="w-full h-auto max-h-[400px] object-contain" />
          <Button variant="destructive" size="icon" className="absolute top-2 right-2" onClick={clearPreview}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            'flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed rounded-lg transition-colors cursor-pointer',
            isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <div className="p-4 rounded-full bg-muted">
            {isDragging ? <Upload className="h-8 w-8 text-primary" /> : <ImageIcon className="h-8 w-8 text-muted-foreground" />}
          </div>
          <div className="text-center">
            <p className="font-medium">{isDragging ? '释放以上传' : '拖拽图片到此处'}</p>
            <p className="text-sm text-muted-foreground mt-1">或点击选择文件 (最大 {maxSize}MB)</p>
          </div>
          <input id="file-input" type="file" accept={accept.join(',')} multiple={multiple} className="hidden" onChange={handleInputChange} />
        </div>
      )}
    </div>
  )
}
