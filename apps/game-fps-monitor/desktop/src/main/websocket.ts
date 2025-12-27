import { WebSocketServer as WS, WebSocket } from 'ws';
import { EventEmitter } from 'events';
import { Database } from './database';
import { v4 as uuidv4 } from 'uuid';

export interface PerformancePacket {
  type: 'frame' | 'snapshot' | 'session_start' | 'session_end';
  timestamp: number;
  deviceId: string;
  data: FrameData | PerformanceSnapshot | SessionInfo;
}

export interface FrameData {
  fps: number;
  frameTime: number;
  jank: boolean;
}

export interface PerformanceSnapshot {
  fps: number;
  avgFps: number;
  minFps: number;
  maxFps: number;
  cpuUsage: number;
  gpuUsage: number;
  memoryUsage: number;
  temperature: number;
  power: number;
  jankCount: number;
  jankRate: number;
}

export interface SessionInfo {
  sessionId: string;
  gameName?: string;
  startTime?: number;
  endTime?: number;
}

interface ConnectedDevice {
  id: string;
  socket: WebSocket;
  deviceId: string;
  connectedAt: number;
  currentSessionId?: string;
}

export class WebSocketServer extends EventEmitter {
  private wss: WS | null = null;
  private port: number;
  private database: Database;
  private devices: Map<string, ConnectedDevice> = new Map();
  private running: boolean = false;

  constructor(port: number, database: Database) {
    super();
    this.port = port;
    this.database = database;
  }

  start() {
    if (this.running) return;

    this.wss = new WS({ port: this.port });
    this.running = true;

    console.log(`WebSocket服务器启动在端口 ${this.port}`);

    this.wss.on('connection', (socket: WebSocket) => {
      const connectionId = uuidv4();
      console.log(`新设备连接: ${connectionId}`);

      socket.on('message', (data: Buffer) => {
        try {
          const packet: PerformancePacket = JSON.parse(data.toString());
          this.handlePacket(connectionId, socket, packet);
        } catch (e) {
          console.error('解析数据包失败:', e);
        }
      });

      socket.on('close', () => {
        const device = this.devices.get(connectionId);
        if (device) {
          console.log(`设备断开连接: ${device.deviceId}`);
          this.emit('device-disconnected', device.deviceId);
          this.devices.delete(connectionId);
        }
      });

      socket.on('error', (err) => {
        console.error('WebSocket错误:', err);
      });
    });

    this.wss.on('error', (err) => {
      console.error('服务器错误:', err);
    });
  }

  private handlePacket(connectionId: string, socket: WebSocket, packet: PerformancePacket) {
    // 注册设备
    if (!this.devices.has(connectionId)) {
      this.devices.set(connectionId, {
        id: connectionId,
        socket,
        deviceId: packet.deviceId,
        connectedAt: Date.now(),
      });
      this.emit('device-connected', packet.deviceId);
    }

    const device = this.devices.get(connectionId)!;

    switch (packet.type) {
      case 'session_start':
        const sessionInfo = packet.data as SessionInfo;
        const sessionId = uuidv4();
        device.currentSessionId = sessionId;
        this.database.createSession({
          id: sessionId,
          deviceId: packet.deviceId,
          gameName: sessionInfo.gameName || '未知游戏',
          startTime: packet.timestamp,
        });
        this.emit('data', { ...packet, sessionId });
        break;

      case 'session_end':
        if (device.currentSessionId) {
          this.database.endSession(device.currentSessionId, packet.timestamp);
          device.currentSessionId = undefined;
        }
        this.emit('data', packet);
        break;

      case 'frame':
        if (device.currentSessionId) {
          const frameData = packet.data as FrameData;
          this.database.addFrame({
            sessionId: device.currentSessionId,
            timestamp: packet.timestamp,
            fps: frameData.fps,
            frameTime: frameData.frameTime,
            jank: frameData.jank ? 1 : 0,
          });
        }
        this.emit('data', packet);
        break;

      case 'snapshot':
        if (device.currentSessionId) {
          const snapshot = packet.data as PerformanceSnapshot;
          this.database.addSnapshot({
            sessionId: device.currentSessionId,
            timestamp: packet.timestamp,
            ...snapshot,
          });
        }
        this.emit('data', packet);
        break;
    }
  }

  stop() {
    if (this.wss) {
      this.wss.close();
      this.wss = null;
      this.running = false;
      this.devices.clear();
      console.log('WebSocket服务器已停止');
    }
  }

  isRunning(): boolean {
    return this.running;
  }

  getConnectedDevices(): { deviceId: string; connectedAt: number }[] {
    return Array.from(this.devices.values()).map((d) => ({
      deviceId: d.deviceId,
      connectedAt: d.connectedAt,
    }));
  }
}
