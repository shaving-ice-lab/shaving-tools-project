import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar } from 'lucide-react';
import SessionList from '../components/SessionList';
import FpsChart from '../components/FpsChart';

declare global {
  interface Window {
    electronAPI: {
      getSessions: (limit?: number) => Promise<any[]>;
      getSession: (sessionId: string) => Promise<any>;
      getSessionFrames: (sessionId: string) => Promise<any[]>;
      deleteSession: (sessionId: string) => Promise<void>;
      exportSession: (sessionId: string, format: string) => Promise<any>;
    };
  }
}

interface Session {
  id: string;
  deviceId: string;
  gameName: string;
  startTime: number;
  endTime?: number;
}

export default function History() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [sessionFrames, setSessionFrames] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    if (window.electronAPI) {
      const data = await window.electronAPI.getSessions(100);
      setSessions(data);
    }
    setLoading(false);
  };

  const handleSelectSession = async (sessionId: string) => {
    if (window.electronAPI) {
      const session = await window.electronAPI.getSession(sessionId);
      const frames = await window.electronAPI.getSessionFrames(sessionId);
      setSelectedSession(session);
      setSessionFrames(frames);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (window.electronAPI) {
      await window.electronAPI.deleteSession(sessionId);
      await loadSessions();
      if (selectedSession?.id === sessionId) {
        setSelectedSession(null);
        setSessionFrames([]);
      }
    }
  };

  const handleExportSession = async (sessionId: string) => {
    if (window.electronAPI) {
      const data = await window.electronAPI.exportSession(sessionId, 'json');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `session_${sessionId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const filteredSessions = sessions.filter(
    (s) =>
      s.gameName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.deviceId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateStats = () => {
    if (sessionFrames.length === 0) return null;
    const fps = sessionFrames.map((f) => f.fps);
    const jankCount = sessionFrames.filter((f) => f.jank).length;
    return {
      avgFps: fps.reduce((a, b) => a + b, 0) / fps.length,
      minFps: Math.min(...fps),
      maxFps: Math.max(...fps),
      jankCount,
      jankRate: (jankCount / sessionFrames.length) * 100,
    };
  };

  const stats = calculateStats();

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">历史记录</h1>
        <p className="text-gray-500 mt-1">查看和管理测试会话记录</p>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        {/* Session List */}
        <div className="col-span-5 flex flex-col min-h-0">
          {/* Search */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="搜索游戏或设备..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-200 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
            </div>
            <button className="p-2 bg-dark-200 border border-gray-800 rounded-lg hover:bg-dark-100 transition-colors">
              <Filter className="w-5 h-5 text-gray-400" />
            </button>
            <button className="p-2 bg-dark-200 border border-gray-800 rounded-lg hover:bg-dark-100 transition-colors">
              <Calendar className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="text-center py-8 text-gray-500">加载中...</div>
            ) : (
              <SessionList
                sessions={filteredSessions}
                onSelect={handleSelectSession}
                onDelete={handleDeleteSession}
                onExport={handleExportSession}
              />
            )}
          </div>
        </div>

        {/* Session Detail */}
        <div className="col-span-7 bg-dark-200 rounded-xl border border-gray-800 p-6 overflow-auto">
          {selectedSession ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedSession.gameName}</h2>
                <p className="text-gray-500 mt-1">{selectedSession.deviceId}</p>
              </div>

              {/* Stats */}
              {stats && (
                <div className="grid grid-cols-5 gap-4">
                  <div className="bg-dark-100 rounded-lg p-3 text-center">
                    <p className="text-gray-500 text-xs">平均FPS</p>
                    <p className="text-lg font-bold text-green-400">{stats.avgFps.toFixed(1)}</p>
                  </div>
                  <div className="bg-dark-100 rounded-lg p-3 text-center">
                    <p className="text-gray-500 text-xs">最低FPS</p>
                    <p className="text-lg font-bold text-red-400">{stats.minFps.toFixed(1)}</p>
                  </div>
                  <div className="bg-dark-100 rounded-lg p-3 text-center">
                    <p className="text-gray-500 text-xs">最高FPS</p>
                    <p className="text-lg font-bold text-blue-400">{stats.maxFps.toFixed(1)}</p>
                  </div>
                  <div className="bg-dark-100 rounded-lg p-3 text-center">
                    <p className="text-gray-500 text-xs">卡顿次数</p>
                    <p className="text-lg font-bold text-yellow-400">{stats.jankCount}</p>
                  </div>
                  <div className="bg-dark-100 rounded-lg p-3 text-center">
                    <p className="text-gray-500 text-xs">卡顿率</p>
                    <p className="text-lg font-bold text-purple-400">{stats.jankRate.toFixed(2)}%</p>
                  </div>
                </div>
              )}

              {/* Chart */}
              <div>
                <h3 className="text-white font-medium mb-4">帧率曲线</h3>
                <FpsChart
                  data={sessionFrames.map((f) => ({
                    timestamp: f.timestamp,
                    fps: f.fps,
                    jank: f.jank,
                  }))}
                  height={300}
                />
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              选择一个会话查看详情
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
