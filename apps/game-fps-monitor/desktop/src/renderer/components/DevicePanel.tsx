import React from 'react';
import { Smartphone, Wifi, Usb, RefreshCw } from 'lucide-react';

interface Device {
  deviceId: string;
  connectedAt: number;
  type?: 'wifi' | 'usb';
}

interface DevicePanelProps {
  devices: Device[];
  onRefresh: () => void;
}

export default function DevicePanel({ devices, onRefresh }: DevicePanelProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN');
  };

  return (
    <div className="bg-dark-200 rounded-xl p-4 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">已连接设备</h3>
        <button
          onClick={onRefresh}
          className="p-2 hover:bg-dark-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {devices.length === 0 ? (
        <div className="text-center py-8">
          <Smartphone className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">等待设备连接...</p>
          <p className="text-xs text-gray-600 mt-2">
            确保手机和电脑在同一网络，或通过USB连接
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {devices.map((device) => (
            <li
              key={device.deviceId}
              className="flex items-center gap-3 p-3 bg-dark-100 rounded-lg"
            >
              <div className="p-2 bg-success/20 rounded-lg">
                <Smartphone className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{device.deviceId}</p>
                <p className="text-xs text-gray-500">
                  连接于 {formatTime(device.connectedAt)}
                </p>
              </div>
              {device.type === 'usb' ? (
                <Usb className="w-4 h-4 text-gray-400" />
              ) : (
                <Wifi className="w-4 h-4 text-gray-400" />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
