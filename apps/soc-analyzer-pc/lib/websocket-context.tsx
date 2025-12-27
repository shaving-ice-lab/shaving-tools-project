'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { 
  ConnectionStatus, 
  WSMessage, 
  DeviceHandshake, 
  SocInfo, 
  RealtimeMonitor,
  BenchmarkResult,
  StressTestData,
  GameFrameData
} from './types'

interface WebSocketContextType {
  status: ConnectionStatus
  deviceInfo: DeviceHandshake | null
  socInfo: SocInfo | null
  realtimeData: RealtimeMonitor | null
  benchmarkResult: BenchmarkResult | null
  stressTestData: StressTestData[]
  gameFrameData: GameFrameData[]
  connect: (url: string) => void
  disconnect: () => void
  serverPort: number
  setServerPort: (port: number) => void
}

const WebSocketContext = createContext<WebSocketContextType | null>(null)

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const [deviceInfo, setDeviceInfo] = useState<DeviceHandshake | null>(null)
  const [socInfo, setSocInfo] = useState<SocInfo | null>(null)
  const [realtimeData, setRealtimeData] = useState<RealtimeMonitor | null>(null)
  const [benchmarkResult, setBenchmarkResult] = useState<BenchmarkResult | null>(null)
  const [stressTestData, setStressTestData] = useState<StressTestData[]>([])
  const [gameFrameData, setGameFrameData] = useState<GameFrameData[]>([])
  const [serverPort, setServerPort] = useState(8765)
  
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data: WSMessage = JSON.parse(event.data)
      
      switch (data.type) {
        case 'handshake':
          setDeviceInfo(data as DeviceHandshake)
          break
        case 'soc_info':
          setSocInfo(data as SocInfo)
          break
        case 'realtime_monitor':
          setRealtimeData(data as RealtimeMonitor)
          break
        case 'benchmark_result':
          setBenchmarkResult(data as BenchmarkResult)
          break
        case 'stress_test':
          setStressTestData(prev => [...prev.slice(-300), data as StressTestData])
          break
        case 'game_frame':
          setGameFrameData(prev => [...prev.slice(-600), data as GameFrameData])
          break
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error)
    }
  }, [])

  const connect = useCallback((url: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    setStatus('connecting')
    
    try {
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        setStatus('connected')
        console.log('WebSocket connected')
      }

      ws.onmessage = handleMessage

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setStatus('error')
      }

      ws.onclose = () => {
        setStatus('disconnected')
        wsRef.current = null
        
        // Auto reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          if (status !== 'disconnected') {
            connect(url)
          }
        }, 3000)
      }
    } catch (error) {
      console.error('Failed to create WebSocket:', error)
      setStatus('error')
    }
  }, [handleMessage, status])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    
    setStatus('disconnected')
    setDeviceInfo(null)
    setSocInfo(null)
    setRealtimeData(null)
    setBenchmarkResult(null)
    setStressTestData([])
    setGameFrameData([])
  }, [])

  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return (
    <WebSocketContext.Provider
      value={{
        status,
        deviceInfo,
        socInfo,
        realtimeData,
        benchmarkResult,
        stressTestData,
        gameFrameData,
        connect,
        disconnect,
        serverPort,
        setServerPort,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }
  return context
}
