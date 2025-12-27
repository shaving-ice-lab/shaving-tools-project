'use client'

import { useEffect, useCallback } from 'react'

type KeyHandler = (event: KeyboardEvent) => void

interface ShortcutConfig {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  handler: KeyHandler
  description?: string
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey
        const altMatch = shortcut.alt ? event.altKey : !event.altKey

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          event.preventDefault()
          shortcut.handler(event)
          return
        }
      }
    },
    [shortcuts]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

export const defaultShortcuts = {
  navigateTools: [
    { key: '1', description: 'MTF曲线测试' },
    { key: '2', description: '色彩准确度测试' },
    { key: '3', description: '动态范围测试' },
    { key: '4', description: '噪点分析' },
    { key: '5', description: '畸变测试' },
    { key: '6', description: '暗角测试' },
    { key: '7', description: '白平衡测试' },
    { key: '8', description: '对焦性能测试' },
    { key: '9', description: '视频规格测试' },
    { key: '0', description: '评测报告' },
  ],
  common: [
    { key: 'h', description: '帮助指南' },
    { key: 's', ctrl: true, description: '保存/导出' },
    { key: ',', description: '设置' },
    { key: 'Escape', description: '关闭弹窗' },
  ],
}

interface ShortcutHintProps {
  shortcut: string
}

export function ShortcutHint({ shortcut }: ShortcutHintProps) {
  const keys = shortcut.split('+')

  return (
    <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
      {keys.map((key, i) => (
        <span key={i}>
          {i > 0 && <span className="mx-0.5">+</span>}
          <kbd className="px-1.5 py-0.5 bg-muted border rounded text-[10px] font-mono">{key}</kbd>
        </span>
      ))}
    </span>
  )
}
