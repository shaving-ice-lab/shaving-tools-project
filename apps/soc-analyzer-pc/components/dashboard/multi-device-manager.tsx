'use client';

import React, { useState, useEffect } from 'react';

interface ConnectedDevice {
  id: string;
  name: string;
  model: string;
  soc: string;
  status: 'connected' | 'disconnected' | 'syncing';
  connectionType: 'wifi' | 'usb';
  batteryLevel: number;
  lastSync: number;
  ipAddress?: string;
}

interface DeviceMetrics {
  deviceId: string;
  cpuUsage: number;
  gpuUsage: number;
  memoryUsage: number;
  temperature: number;
  fps?: number;
}

const MultiDeviceManager: React.FC = () => {
  const [devices, setDevices] = useState<ConnectedDevice[]>([]);
  const [deviceMetrics, setDeviceMetrics] = useState<Map<string, DeviceMetrics>>(new Map());
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    initializeMockDevices();
    const interval = setInterval(updateDeviceMetrics, 2000);
    return () => clearInterval(interval);
  }, []);

  const initializeMockDevices = () => {
    const mockDevices: ConnectedDevice[] = [
      {
        id: 'device-1',
        name: 'Xiaomi 14 Pro',
        model: '2311DRK48C',
        soc: 'Snapdragon 8 Gen 3',
        status: 'connected',
        connectionType: 'wifi',
        batteryLevel: 78,
        lastSync: Date.now(),
        ipAddress: '192.168.1.101',
      },
      {
        id: 'device-2',
        name: 'Samsung S24 Ultra',
        model: 'SM-S928B',
        soc: 'Snapdragon 8 Gen 3',
        status: 'connected',
        connectionType: 'usb',
        batteryLevel: 92,
        lastSync: Date.now(),
      },
      {
        id: 'device-3',
        name: 'OnePlus 12',
        model: 'CPH2573',
        soc: 'Snapdragon 8 Gen 3',
        status: 'disconnected',
        connectionType: 'wifi',
        batteryLevel: 45,
        lastSync: Date.now() - 300000,
        ipAddress: '192.168.1.103',
      },
    ];

    setDevices(mockDevices);

    const initialMetrics = new Map<string, DeviceMetrics>();
    mockDevices.forEach((device) => {
      if (device.status === 'connected') {
        initialMetrics.set(device.id, {
          deviceId: device.id,
          cpuUsage: Math.random() * 60 + 20,
          gpuUsage: Math.random() * 50 + 10,
          memoryUsage: Math.random() * 40 + 40,
          temperature: Math.random() * 15 + 35,
          fps: Math.floor(Math.random() * 30 + 30),
        });
      }
    });
    setDeviceMetrics(initialMetrics);
  };

  const updateDeviceMetrics = () => {
    setDeviceMetrics((prev) => {
      const newMetrics = new Map(prev);
      newMetrics.forEach((metrics, deviceId) => {
        newMetrics.set(deviceId, {
          ...metrics,
          cpuUsage: Math.max(0, Math.min(100, metrics.cpuUsage + (Math.random() - 0.5) * 10)),
          gpuUsage: Math.max(0, Math.min(100, metrics.gpuUsage + (Math.random() - 0.5) * 8)),
          memoryUsage: Math.max(0, Math.min(100, metrics.memoryUsage + (Math.random() - 0.5) * 3)),
          temperature: Math.max(25, Math.min(90, metrics.temperature + (Math.random() - 0.5) * 2)),
          fps: Math.floor(Math.max(1, Math.min(60, (metrics.fps || 30) + (Math.random() - 0.5) * 5))),
        });
      });
      return newMetrics;
    });
  };

  const scanForDevices = async () => {
    setIsScanning(true);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setIsScanning(false);
  };

  const connectDevice = (deviceId: string) => {
    setDevices((prev) =>
      prev.map((d) =>
        d.id === deviceId
          ? { ...d, status: 'syncing' as const }
          : d
      )
    );

    setTimeout(() => {
      setDevices((prev) =>
        prev.map((d) =>
          d.id === deviceId
            ? { ...d, status: 'connected' as const, lastSync: Date.now() }
            : d
        )
      );

      setDeviceMetrics((prev) => {
        const newMetrics = new Map(prev);
        newMetrics.set(deviceId, {
          deviceId,
          cpuUsage: Math.random() * 60 + 20,
          gpuUsage: Math.random() * 50 + 10,
          memoryUsage: Math.random() * 40 + 40,
          temperature: Math.random() * 15 + 35,
          fps: Math.floor(Math.random() * 30 + 30),
        });
        return newMetrics;
      });
    }, 2000);
  };

  const disconnectDevice = (deviceId: string) => {
    setDevices((prev) =>
      prev.map((d) =>
        d.id === deviceId
          ? { ...d, status: 'disconnected' as const }
          : d
      )
    );

    setDeviceMetrics((prev) => {
      const newMetrics = new Map(prev);
      newMetrics.delete(deviceId);
      return newMetrics;
    });
  };

  const getStatusColor = (status: ConnectedDevice['status']) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'disconnected': return 'bg-gray-500';
      case 'syncing': return 'bg-yellow-500 animate-pulse';
    }
  };

  const getStatusText = (status: ConnectedDevice['status']) => {
    switch (status) {
      case 'connected': return '已连接';
      case 'disconnected': return '已断开';
      case 'syncing': return '同步中...';
    }
  };

  const connectedCount = devices.filter((d) => d.status === 'connected').length;

  return (
    <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">多设备管理</h2>
          <p className="text-gray-400 text-sm mt-1">
            已连接 {connectedCount} 台设备，共 {devices.length} 台
          </p>
        </div>
        <button
          onClick={scanForDevices}
          disabled={isScanning}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
            isScanning
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isScanning ? (
            <>
              <span className="animate-spin">⟳</span>
              扫描中...
            </>
          ) : (
            <>
              <span>📡</span>
              扫描设备
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {devices.map((device) => {
          const metrics = deviceMetrics.get(device.id);
          const isSelected = selectedDeviceId === device.id;

          return (
            <div
              key={device.id}
              onClick={() => setSelectedDeviceId(isSelected ? null : device.id)}
              className={`bg-gray-800 rounded-lg p-4 cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-blue-500' : 'hover:bg-gray-750'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(device.status)}`} />
                  <div>
                    <h3 className="text-white font-medium">{device.name}</h3>
                    <p className="text-gray-400 text-sm">{device.soc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">
                    {device.connectionType === 'wifi' ? '📶' : '🔌'}
                  </span>
                  <span className="text-gray-400 text-sm">
                    🔋 {device.batteryLevel}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-gray-400">状态: {getStatusText(device.status)}</span>
                {device.ipAddress && (
                  <span className="text-gray-500">{device.ipAddress}</span>
                )}
              </div>

              {device.status === 'connected' && metrics && (
                <div className="grid grid-cols-4 gap-2 mb-3">
                  <div className="text-center">
                    <div className="text-xs text-gray-400">CPU</div>
                    <div className="text-sm font-medium text-blue-400">
                      {metrics.cpuUsage.toFixed(0)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-400">GPU</div>
                    <div className="text-sm font-medium text-green-400">
                      {metrics.gpuUsage.toFixed(0)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-400">温度</div>
                    <div className={`text-sm font-medium ${
                      metrics.temperature > 60 ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {metrics.temperature.toFixed(0)}°C
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-400">FPS</div>
                    <div className="text-sm font-medium text-purple-400">
                      {metrics.fps}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                {device.status === 'disconnected' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      connectDevice(device.id);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded text-sm transition-colors"
                  >
                    连接
                  </button>
                ) : device.status === 'connected' ? (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        disconnectDevice(device.id);
                      }}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded text-sm transition-colors"
                    >
                      断开
                    </button>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm transition-colors"
                    >
                      详情
                    </button>
                  </>
                ) : (
                  <div className="flex-1 bg-gray-700 text-gray-400 py-2 rounded text-sm text-center">
                    正在连接...
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {devices.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📱</div>
          <p className="text-gray-400">暂无设备连接</p>
          <p className="text-gray-500 text-sm mt-2">
            点击"扫描设备"或使用USB连接手机
          </p>
        </div>
      )}
    </div>
  );
};

export default MultiDeviceManager;
