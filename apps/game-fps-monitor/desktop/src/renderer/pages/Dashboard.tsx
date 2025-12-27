import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Cpu, Thermometer, Zap, BarChart3, AlertTriangle } from 'lucide-react';
import DevicePanel from '../components/DevicePanel';
import FpsChart from '../components/FpsChart';
import StatsCard from '../components/StatsCard';

declare global {
  interface Window {
    electronAPI: {
      getConnectedDevices: () => Promise<{ deviceId: string; connectedAt: number }[]>;
      onPerformanceData: (callback: (data: any) => void) => () => void;
      onDeviceConnected: (callback: (deviceId: string) => void) => () => void;
      onDeviceDisconnected: (callback: (deviceId: string) => void) => () => void;
    };
  }
}

interface PerformanceData {
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

interface FrameData {
  timestamp: number;
  fps: number;
  jank?: boolean;
}

export default function Dashboard() {
  const [devices, setDevices] = useState<{ deviceId: string; connectedAt: number }[]>([]);
  const [currentData, setCurrentData] = useState<PerformanceData | null>(null);
  const [frameHistory, setFrameHistory] = useState<FrameData[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const refreshDevices = useCallback(async () => {
    if (window.electronAPI) {
      const connectedDevices = await window.electronAPI.getConnectedDevices();
      setDevices(connectedDevices);
    }
  }, []);

  useEffect(() => {
    refreshDevices();

    if (window.electronAPI) {
      const unsubData = window.electronAPI.onPerformanceData((data) => {
        if (data.type === 'snapshot') {
          setCurrentData(data.data);
          setIsRecording(true);
        }
        if (data.type === 'frame') {
          setFrameHistory((prev) => {
            const newHistory = [...prev, { 
              timestamp: data.timestamp, 
              fps: data.data.fps,
              jank: data.data.jank 
            }];
            return newHistory.slice(-300);
          });
        }
        if (data.type === 'session_end') {
          setIsRecording(false);
        }
      });

      const unsubConnect = window.electronAPI.onDeviceConnected(() => {
        refreshDevices();
      });

      const unsubDisconnect = window.electronAPI.onDeviceDisconnected(() => {
        refreshDevices();
      });

      return () => {
        unsubData();
        unsubConnect();
        unsubDisconnect();
      };
    }
  }, [refreshDevices]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">实时监控</h1>
          <p className="text-gray-500 mt-1">查看设备的实时游戏性能数据</p>
        </div>
        {isRecording && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 rounded-lg">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 font-medium">记录中</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Panel - Device & Stats */}
        <div className="col-span-4 space-y-6">
          <DevicePanel devices={devices} onRefresh={refreshDevices} />

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <StatsCard
              title="当前帧率"
              value={currentData?.fps?.toFixed(1) || '--'}
              unit="FPS"
              icon={Activity}
              color="blue"
            />
            <StatsCard
              title="平均帧率"
              value={currentData?.avgFps?.toFixed(1) || '--'}
              unit="FPS"
              icon={BarChart3}
              color="green"
            />
            <StatsCard
              title="CPU占用"
              value={currentData?.cpuUsage?.toFixed(1) || '--'}
              unit="%"
              icon={Cpu}
              color="purple"
            />
            <StatsCard
              title="温度"
              value={currentData?.temperature?.toFixed(1) || '--'}
              unit="°C"
              icon={Thermometer}
              color="yellow"
            />
            <StatsCard
              title="功耗"
              value={currentData?.power?.toFixed(0) || '--'}
              unit="mW"
              icon={Zap}
              color="red"
            />
            <StatsCard
              title="卡顿率"
              value={currentData?.jankRate?.toFixed(2) || '--'}
              unit="%"
              icon={AlertTriangle}
              color={currentData && currentData.jankRate > 5 ? 'red' : 'green'}
            />
          </div>
        </div>

        {/* Right Panel - Charts */}
        <div className="col-span-8 space-y-6">
          {/* FPS Chart */}
          <div className="bg-dark-200 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">帧率曲线</h3>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-green-400" />
                  <span className="text-gray-500">60 FPS</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-yellow-400" />
                  <span className="text-gray-500">30 FPS</span>
                </div>
              </div>
            </div>
            <FpsChart data={frameHistory} height={350} />
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-dark-200 rounded-xl p-4 border border-gray-800 text-center">
              <p className="text-gray-500 text-sm">最低帧率</p>
              <p className="text-2xl font-bold text-red-400 mt-1">
                {currentData?.minFps?.toFixed(1) || '--'}
              </p>
            </div>
            <div className="bg-dark-200 rounded-xl p-4 border border-gray-800 text-center">
              <p className="text-gray-500 text-sm">最高帧率</p>
              <p className="text-2xl font-bold text-green-400 mt-1">
                {currentData?.maxFps?.toFixed(1) || '--'}
              </p>
            </div>
            <div className="bg-dark-200 rounded-xl p-4 border border-gray-800 text-center">
              <p className="text-gray-500 text-sm">GPU占用</p>
              <p className="text-2xl font-bold text-purple-400 mt-1">
                {currentData?.gpuUsage?.toFixed(1) || '--'}%
              </p>
            </div>
            <div className="bg-dark-200 rounded-xl p-4 border border-gray-800 text-center">
              <p className="text-gray-500 text-sm">内存占用</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">
                {currentData?.memoryUsage?.toFixed(0) || '--'} MB
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
