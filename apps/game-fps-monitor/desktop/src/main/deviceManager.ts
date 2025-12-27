import { EventEmitter } from 'events'
import * as dgram from 'dgram'

export interface ConnectedDevice {
  id: string
  name: string
  host: string
  port: number
  model: string
  androidVersion: string
  connectionType: 'websocket' | 'adb'
  status: 'connected' | 'disconnected' | 'connecting'
  lastSeen: number
  fps?: number
  cpuUsage?: number
  temperature?: number
}

export interface DeviceManagerEvents {
  deviceConnected: (device: ConnectedDevice) => void
  deviceDisconnected: (deviceId: string) => void
  deviceUpdated: (device: ConnectedDevice) => void
  discoveryResult: (devices: DiscoveredDevice[]) => void
}

export interface DiscoveredDevice {
  name: string
  host: string
  port: number
  model: string
}

const UDP_DISCOVERY_PORT = 9876
const UDP_DISCOVERY_MESSAGE = 'FPS_MONITOR_DISCOVER'
const UDP_RESPONSE_PREFIX = 'FPS_MONITOR_SERVER:'

export class DeviceManager extends EventEmitter {
  private devices: Map<string, ConnectedDevice> = new Map()
  private udpServer: dgram.Socket | null = null
  private discoveryInterval: NodeJS.Timeout | null = null

  constructor() {
    super()
  }

  getDevices(): ConnectedDevice[] {
    return Array.from(this.devices.values())
  }

  getDevice(id: string): ConnectedDevice | undefined {
    return this.devices.get(id)
  }

  addDevice(device: Omit<ConnectedDevice, 'id' | 'lastSeen'>): string {
    const id = `${device.host}:${device.port}`
    const newDevice: ConnectedDevice = {
      ...device,
      id,
      lastSeen: Date.now()
    }
    this.devices.set(id, newDevice)
    this.emit('deviceConnected', newDevice)
    return id
  }

  updateDevice(id: string, updates: Partial<ConnectedDevice>): void {
    const device = this.devices.get(id)
    if (device) {
      const updatedDevice = { ...device, ...updates, lastSeen: Date.now() }
      this.devices.set(id, updatedDevice)
      this.emit('deviceUpdated', updatedDevice)
    }
  }

  removeDevice(id: string): void {
    if (this.devices.has(id)) {
      this.devices.delete(id)
      this.emit('deviceDisconnected', id)
    }
  }

  updateDeviceData(id: string, data: { fps?: number; cpuUsage?: number; temperature?: number }): void {
    const device = this.devices.get(id)
    if (device) {
      device.fps = data.fps ?? device.fps
      device.cpuUsage = data.cpuUsage ?? device.cpuUsage
      device.temperature = data.temperature ?? device.temperature
      device.lastSeen = Date.now()
      this.devices.set(id, device)
      this.emit('deviceUpdated', device)
    }
  }

  startUdpDiscoveryServer(): void {
    if (this.udpServer) return

    this.udpServer = dgram.createSocket('udp4')

    this.udpServer.on('message', (msg, rinfo) => {
      const message = msg.toString()
      
      if (message === UDP_DISCOVERY_MESSAGE) {
        // 响应发现请求
        const response = `${UDP_RESPONSE_PREFIX}8080:FPS Monitor Desktop:1.0.0`
        const responseBuffer = Buffer.from(response)
        this.udpServer?.send(responseBuffer, rinfo.port, rinfo.address)
      }
    })

    this.udpServer.on('error', (err) => {
      console.error('UDP server error:', err)
      this.udpServer?.close()
      this.udpServer = null
    })

    this.udpServer.bind(UDP_DISCOVERY_PORT, () => {
      console.log(`UDP discovery server listening on port ${UDP_DISCOVERY_PORT}`)
      this.udpServer?.setBroadcast(true)
    })
  }

  stopUdpDiscoveryServer(): void {
    if (this.udpServer) {
      this.udpServer.close()
      this.udpServer = null
    }
  }

  async discoverDevices(timeout: number = 3000): Promise<DiscoveredDevice[]> {
    return new Promise((resolve) => {
      const devices: DiscoveredDevice[] = []
      const socket = dgram.createSocket('udp4')

      socket.on('message', (msg, rinfo) => {
        const message = msg.toString()
        if (message.startsWith(UDP_RESPONSE_PREFIX)) {
          const parts = message.replace(UDP_RESPONSE_PREFIX, '').split(':')
          const device: DiscoveredDevice = {
            host: rinfo.address,
            port: parseInt(parts[0]) || 8080,
            name: parts[1] || 'Unknown Device',
            model: parts[2] || ''
          }
          
          if (!devices.some(d => d.host === device.host && d.port === device.port)) {
            devices.push(device)
          }
        }
      })

      socket.on('error', (err) => {
        console.error('Discovery error:', err)
        socket.close()
        resolve(devices)
      })

      socket.bind(() => {
        socket.setBroadcast(true)
        const message = Buffer.from(UDP_DISCOVERY_MESSAGE)
        socket.send(message, 0, message.length, UDP_DISCOVERY_PORT, '255.255.255.255')
      })

      setTimeout(() => {
        socket.close()
        this.emit('discoveryResult', devices)
        resolve(devices)
      }, timeout)
    })
  }

  startPeriodicDiscovery(intervalMs: number = 10000): void {
    if (this.discoveryInterval) return

    this.discoveryInterval = setInterval(async () => {
      await this.discoverDevices()
    }, intervalMs)

    // 立即执行一次
    this.discoverDevices()
  }

  stopPeriodicDiscovery(): void {
    if (this.discoveryInterval) {
      clearInterval(this.discoveryInterval)
      this.discoveryInterval = null
    }
  }

  checkDeviceTimeout(timeoutMs: number = 30000): void {
    const now = Date.now()
    for (const [id, device] of this.devices.entries()) {
      if (now - device.lastSeen > timeoutMs && device.status === 'connected') {
        device.status = 'disconnected'
        this.devices.set(id, device)
        this.emit('deviceUpdated', device)
      }
    }
  }

  getConnectedCount(): number {
    return Array.from(this.devices.values()).filter(d => d.status === 'connected').length
  }

  getAllDeviceStats(): { total: number; connected: number; disconnected: number } {
    const devices = Array.from(this.devices.values())
    return {
      total: devices.length,
      connected: devices.filter(d => d.status === 'connected').length,
      disconnected: devices.filter(d => d.status === 'disconnected').length
    }
  }

  cleanup(): void {
    this.stopUdpDiscoveryServer()
    this.stopPeriodicDiscovery()
    this.devices.clear()
    this.removeAllListeners()
  }
}

export const deviceManager = new DeviceManager()
