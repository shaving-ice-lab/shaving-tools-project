import React, { useState, useEffect } from 'react';
import { Server, Usb, Wifi, HardDrive, RefreshCw } from 'lucide-react';

declare global {
  interface Window {
    electronAPI: {
      getServerStatus: () => Promise<{
        wsRunning: boolean;
        wsPort: number;
        connectedDevices: number;
      }>;
      getAdbDevices: () => Promise<{ serial: string; state: string; model?: string }[]>;
      adbForward: (serial: string, localPort: number, remotePort: number) => Promise<boolean>;
    };
  }
}

interface ServerStatus {
  wsRunning: boolean;
  wsPort: number;
  connectedDevices: number;
}

interface AdbDevice {
  serial: string;
  state: string;
  model?: string;
}

export default function Settings() {
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [adbDevices, setAdbDevices] = useState<AdbDevice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setLoading(true);
    if (window.electronAPI) {
      const status = await window.electronAPI.getServerStatus();
      setServerStatus(status);
      const devices = await window.electronAPI.getAdbDevices();
      setAdbDevices(devices);
    }
    setLoading(false);
  };

  const handleAdbForward = async (serial: string) => {
    if (window.electronAPI) {
      const success = await window.electronAPI.adbForward(serial, 8765, 8765);
      if (success) {
        alert('端口转发成功！');
      } else {
        alert('端口转发失败');
      }
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">设置</h1>
        <p className="text-gray-500 mt-1">配置服务器和连接选项</p>
      </div>

      {/* Server Status */}
      <div className="bg-dark-200 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-600/20 rounded-lg">
              <Server className="w-5 h-5 text-primary-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">WebSocket服务器</h2>
          </div>
          <button
            onClick={loadStatus}
            className="p-2 hover:bg-dark-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-dark-100 rounded-lg p-4">
            <p className="text-gray-500 text-sm">状态</p>
            <div className="flex items-center gap-2 mt-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  serverStatus?.wsRunning ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className={serverStatus?.wsRunning ? 'text-green-400' : 'text-red-400'}>
                {serverStatus?.wsRunning ? '运行中' : '已停止'}
              </span>
            </div>
          </div>
          <div className="bg-dark-100 rounded-lg p-4">
            <p className="text-gray-500 text-sm">端口</p>
            <p className="text-white font-medium mt-1">{serverStatus?.wsPort || '--'}</p>
          </div>
          <div className="bg-dark-100 rounded-lg p-4">
            <p className="text-gray-500 text-sm">已连接设备</p>
            <p className="text-white font-medium mt-1">{serverStatus?.connectedDevices || 0}</p>
          </div>
        </div>
      </div>

      {/* WiFi Connection */}
      <div className="bg-dark-200 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-600/20 rounded-lg">
            <Wifi className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">WiFi连接</h2>
        </div>

        <div className="bg-dark-100 rounded-lg p-4">
          <p className="text-gray-400 mb-2">在手机App中输入以下地址进行连接：</p>
          <div className="flex items-center gap-4">
            <code className="flex-1 bg-dark-300 px-4 py-2 rounded text-primary-400 font-mono">
              ws://电脑IP:8765
            </code>
          </div>
          <p className="text-xs text-gray-500 mt-2">确保手机和电脑在同一局域网内</p>
        </div>
      </div>

      {/* ADB Connection */}
      <div className="bg-dark-200 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-600/20 rounded-lg">
            <Usb className="w-5 h-5 text-green-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">USB连接 (ADB)</h2>
        </div>

        {adbDevices.length === 0 ? (
          <div className="bg-dark-100 rounded-lg p-4 text-center">
            <HardDrive className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500">未检测到ADB设备</p>
            <p className="text-xs text-gray-600 mt-1">请确保已安装ADB并通过USB连接设备</p>
          </div>
        ) : (
          <div className="space-y-3">
            {adbDevices.map((device) => (
              <div
                key={device.serial}
                className="flex items-center justify-between bg-dark-100 rounded-lg p-4"
              >
                <div>
                  <p className="text-white font-medium">{device.model || device.serial}</p>
                  <p className="text-xs text-gray-500">{device.serial}</p>
                </div>
                <button
                  onClick={() => handleAdbForward(device.serial)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  端口转发
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Data Storage */}
      <div className="bg-dark-200 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-600/20 rounded-lg">
            <HardDrive className="w-5 h-5 text-purple-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">数据存储</h2>
        </div>

        <div className="bg-dark-100 rounded-lg p-4">
          <p className="text-gray-400 mb-2">数据存储位置：</p>
          <code className="block bg-dark-300 px-4 py-2 rounded text-gray-300 font-mono text-sm">
            %APPDATA%/game-fps-monitor-desktop/fps_monitor.db
          </code>
        </div>
      </div>
    </div>
  );
}
