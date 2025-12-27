'use client'

import { useCallback, useRef, useState, useEffect, ReactNode } from 'react'
import { ZoomIn, ZoomOut, RotateCcw, Move } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { Region } from '@/types'

interface ImageViewerProps {
  src: string
  zoom?: boolean
  pan?: boolean
  overlay?: ReactNode
  onRegionSelect?: (region: Region) => void
  className?: string
}

export function ImageViewer({ src, zoom = true, pan = true, overlay, onRegionSelect, className }: ImageViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isSelecting, setIsSelecting] = useState(false)
  const [selection, setSelection] = useState<Region | null>(null)
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 })

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (!zoom) return
      e.preventDefault()

      const delta = e.deltaY > 0 ? 0.9 : 1.1
      setScale(prev => Math.min(Math.max(0.1, prev * delta), 10))
    },
    [zoom]
  )

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false })
      return () => container.removeEventListener('wheel', handleWheel)
    }
  }, [handleWheel])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.shiftKey && onRegionSelect) {
        setIsSelecting(true)
        const rect = containerRef.current?.getBoundingClientRect()
        if (rect) {
          const x = (e.clientX - rect.left - position.x) / scale
          const y = (e.clientY - rect.top - position.y) / scale
          setSelectionStart({ x, y })
          setSelection({ x, y, width: 0, height: 0 })
        }
      } else if (pan) {
        setIsDragging(true)
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
      }
    },
    [pan, position, scale, onRegionSelect]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isSelecting && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left - position.x) / scale
        const y = (e.clientY - rect.top - position.y) / scale
        setSelection({
          x: Math.min(selectionStart.x, x),
          y: Math.min(selectionStart.y, y),
          width: Math.abs(x - selectionStart.x),
          height: Math.abs(y - selectionStart.y),
        })
      } else if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        })
      }
    },
    [isDragging, isSelecting, dragStart, selectionStart, position, scale]
  )

  const handleMouseUp = useCallback(() => {
    if (isSelecting && selection && onRegionSelect) {
      if (selection.width > 5 && selection.height > 5) {
        onRegionSelect(selection)
      }
    }
    setIsDragging(false)
    setIsSelecting(false)
  }, [isSelecting, selection, onRegionSelect])

  const resetView = useCallback(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
    setSelection(null)
  }, [])

  const zoomIn = useCallback(() => {
    setScale(prev => Math.min(prev * 1.2, 10))
  }, [])

  const zoomOut = useCallback(() => {
    setScale(prev => Math.max(prev / 1.2, 0.1))
  }, [])

  return (
    <div className={cn('relative overflow-hidden rounded-lg border bg-muted', className)}>
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        {zoom && (
          <>
            <Button variant="secondary" size="icon" onClick={zoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" onClick={zoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
          </>
        )}
        <Button variant="secondary" size="icon" onClick={resetView}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {onRegionSelect && (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-2 bg-background/80 rounded px-2 py-1 text-xs">
          <Move className="h-3 w-3" />
          <span>按住 Shift 拖拽选择区域</span>
        </div>
      )}

      <div
        ref={containerRef}
        className="w-full h-full min-h-[300px] cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: '0 0',
          }}
          className="relative"
        >
          <img src={src} alt="图像" className="max-w-none" draggable={false} />

          {selection && (
            <div
              className="absolute border-2 border-primary bg-primary/20 pointer-events-none"
              style={{
                left: selection.x,
                top: selection.y,
                width: selection.width,
                height: selection.height,
              }}
            />
          )}

          {overlay}
        </div>
      </div>

      <div className="absolute bottom-2 left-2 bg-background/80 rounded px-2 py-1 text-xs">缩放: {Math.round(scale * 100)}%</div>
    </div>
  )
}
