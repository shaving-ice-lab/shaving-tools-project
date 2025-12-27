import { contextBridge, ipcRenderer } from 'electron';

export interface ElectronAPI {
  // 设备管理
  getConnectedDevices: () => Promise<{ deviceId: string; connectedAt: number }[]>;
  getAdbDevices: () => Promise<{ serial: string; state: string; model?: string }[]>;
  adbForward: (serial: string, localPort: number, remotePort: number) => Promise<boolean>;
  
  // 会话管理
  getSessions: (limit?: number) => Promise<any[]>;
  getSession: (sessionId: string) => Promise<any>;
  getSessionFrames: (sessionId: string) => Promise<any[]>;
  deleteSession: (sessionId: string) => Promise<void>;
  exportSession: (sessionId: string, format: string) => Promise<{ session: any; frames: any[] }>;
  
  // 服务状态
  getServerStatus: () => Promise<{
    wsRunning: boolean;
    wsPort: number;
    connectedDevices: number;
  }>;
  
  // 事件监听
  onPerformanceData: (callback: (data: any) => void) => () => void;
  onDeviceConnected: (callback: (deviceId: string) => void) => () => void;
  onDeviceDisconnected: (callback: (deviceId: string) => void) => () => void;
}

const electronAPI: ElectronAPI = {
  getConnectedDevices: () => ipcRenderer.invoke('get-connected-devices'),
  getAdbDevices: () => ipcRenderer.invoke('get-adb-devices'),
  adbForward: (serial, localPort, remotePort) =>
    ipcRenderer.invoke('adb-forward', serial, localPort, remotePort),
  
  getSessions: (limit) => ipcRenderer.invoke('get-sessions', limit),
  getSession: (sessionId) => ipcRenderer.invoke('get-session', sessionId),
  getSessionFrames: (sessionId) => ipcRenderer.invoke('get-session-frames', sessionId),
  deleteSession: (sessionId) => ipcRenderer.invoke('delete-session', sessionId),
  exportSession: (sessionId, format) => ipcRenderer.invoke('export-session', sessionId, format),
  
  getServerStatus: () => ipcRenderer.invoke('get-server-status'),
  
  onPerformanceData: (callback) => {
    const handler = (_: any, data: any) => callback(data);
    ipcRenderer.on('performance-data', handler);
    return () => ipcRenderer.removeListener('performance-data', handler);
  },
  
  onDeviceConnected: (callback) => {
    const handler = (_: any, deviceId: string) => callback(deviceId);
    ipcRenderer.on('device-connected', handler);
    return () => ipcRenderer.removeListener('device-connected', handler);
  },
  
  onDeviceDisconnected: (callback) => {
    const handler = (_: any, deviceId: string) => callback(deviceId);
    ipcRenderer.on('device-disconnected', handler);
    return () => ipcRenderer.removeListener('device-disconnected', handler);
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
