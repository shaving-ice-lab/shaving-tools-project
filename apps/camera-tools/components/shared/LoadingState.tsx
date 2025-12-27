'use client'

import { Loader2 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface LoadingStateProps {
  message?: string
  progress?: number
  showProgress?: boolean
}

export function LoadingState({ message = '处理中...', progress = 0, showProgress = false }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
      {showProgress && (
        <div className="w-48">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-center mt-1 text-muted-foreground">{progress.toFixed(0)}%</p>
        </div>
      )}
    </div>
  )
}

interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
  progress?: number
  children: React.ReactNode
}

export function LoadingOverlay({ isLoading, message, progress, children }: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
          <LoadingState message={message} progress={progress} showProgress={progress !== undefined} />
        </div>
      )}
    </div>
  )
}

interface SkeletonCardProps {
  lines?: number
}

export function SkeletonCard({ lines = 3 }: SkeletonCardProps) {
  return (
    <div className="border rounded-lg p-6 space-y-4 animate-pulse">
      <div className="h-6 bg-muted rounded w-1/3" />
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-4 bg-muted rounded" style={{ width: `${100 - i * 15}%` }} />
        ))}
      </div>
    </div>
  )
}
