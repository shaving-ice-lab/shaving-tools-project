'use client'

import { useState, useCallback, useEffect, RefObject } from 'react'

export function useFullscreen(ref: RefObject<HTMLElement>) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const enterFullscreen = useCallback(async () => {
    if (ref.current && document.fullscreenEnabled) {
      try {
        await ref.current.requestFullscreen()
        setIsFullscreen(true)
      } catch (error) {
        console.error('Fullscreen request failed:', error)
      }
    }
  }, [ref])

  const exitFullscreen = useCallback(async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen()
        setIsFullscreen(false)
      } catch (error) {
        console.error('Exit fullscreen failed:', error)
      }
    }
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen()
    } else {
      enterFullscreen()
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  return {
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
    isSupported: typeof document !== 'undefined' && document.fullscreenEnabled,
  }
}
