import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';

interface SessionData {
  id: number;
  deviceId: string;
  gameName: string;
  startTime: number;
  endTime: number | null;
}

interface FrameRecord {
  id: number;
  sessionId: number;
  timestamp: number;
  fps: number;
  frameTime: number;
  cpuUsage: number;
  gpuUsage: number;
  memoryUsage: number;
  temperature: number;
  power: number;
  isJank: boolean;
}

interface SessionStats {
  avgFps: number;
  minFps: number;
  maxFps: number;
  jankCount: number;
  jankRate: number;
  avgCpu: number;
  avgMemory: number;
  avgTemp: number;
  totalFrames: number;
  duration: number;
}

const SessionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionData | null>(null);
  const [frameRecords, setFrameRecords] = useState<FrameRecord[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessionData();
  }, [id]);

  const loadSessionData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      // @ts-ignore
      const sessionData = await window.api.getSession(parseInt(id));
      setSession(sessionData);
      
      // @ts-ignore
      const records = await window.api.getFrameRecords(parseInt(id));
      setFrameRecords(records);
      
      // Calculate stats
      if (records.length > 0) {
        const fpsValues = records.map((r: FrameRecord) => r.fps);
        const jankFrames = records.filter((r: FrameRecord) => r.isJank);
        
        setStats({
          avgFps: fpsValues.reduce((a: number, b: number) => a + b, 0) / fpsValues.length,
          minFps: Math.min(...fpsValues),
          maxFps: Math.max(...fpsValues),
          jankCount: jankFrames.length,
          jankRate: (jankFrames.length / records.length) * 100,
          avgCpu: records.reduce((a: number, r: FrameRecord) => a + r.cpuUsage, 0) / records.length,
          avgMemory: records.reduce((a: number, r: FrameRecord) => a + r.memoryUsage, 0) / records.length,
          avgTemp: records.reduce((a: number, r: FrameRecord) => a + r.temperature, 0) / records.length,
          totalFrames: records.length,
          duration: sessionData.endTime ? sessionData.endTime - sessionData.startTime : 0
        });
      }
    } catch (error) {
      console.error('Failed to load session data:', error);
    }
    setLoading(false);
  };

  const getFpsDistribution = () => {
    const distribution = [
      { range: '0-15', count: 0, color: '#ef4444' },
      { range: '15-30', count: 0, color: '#f97316' },
      { range: '30-45', count: 0, color: '#eab308' },
      { range: '45-60', count: 0, color: '#84cc16' },
      { range: '60+', count: 0, color: '#22c55e' }
    ];

    frameRecords.forEach(record => {
      if (record.fps < 15) distribution[0].count++;
      else if (record.fps < 30) distribution[1].count++;
      else if (record.fps < 45) distribution[2].count++;
      else if (record.fps < 60) distribution[3].count++;
      else distribution[4].count++;
    });

    return distribution;
  };

  const exportToCSV = () => {
    if (frameRecords.length === 0) return;
    
    const headers = ['Timestamp', 'FPS', 'Frame Time', 'CPU Usage', 'GPU Usage', 'Memory', 'Temperature', 'Power', 'Is Jank'];
    const rows = frameRecords.map(r => [
      new Date(r.timestamp).toISOString(),
      r.fps.toFixed(2),
      r.frameTime.toFixed(2),
      r.cpuUsage.toFixed(2),
      r.gpuUsage.toFixed(2),
      r.memoryUsage.toFixed(2),
      r.temperature.toFixed(2),
      r.power.toFixed(2),
      r.isJank ? 'Yes' : 'No'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `session_${id}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToJSON = () => {
    if (!session || frameRecords.length === 0) return;
    
    const exportData = {
      session,
      stats,
      frameRecords
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `session_${id}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-gray-400 mb-4">Session not found</p>
        <button 
          onClick={() => navigate('/history')}
          className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
        >
          Back to History
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/history')}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold">{session.gameName || 'Unknown Game'}</h1>
            <p className="text-gray-400 text-sm">
              {new Date(session.startTime).toLocaleString()} | {session.deviceId}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={exportToCSV}
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
          <button 
            onClick={exportToJSON}
            className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-500 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export JSON
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Average FPS</p>
            <p className="text-2xl font-bold text-green-400">{stats.avgFps.toFixed(1)}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Min FPS</p>
            <p className="text-2xl font-bold text-red-400">{stats.minFps.toFixed(1)}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Max FPS</p>
            <p className="text-2xl font-bold text-blue-400">{stats.maxFps.toFixed(1)}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Jank Rate</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.jankRate.toFixed(1)}%</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Total Frames</p>
            <p className="text-2xl font-bold">{stats.totalFrames}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Duration</p>
            <p className="text-2xl font-bold">{formatDuration(stats.duration)}</p>
          </div>
        </div>
      )}

      {/* FPS Timeline Chart */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">FPS Timeline</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={frameRecords.slice(-500)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
              stroke="#9ca3af"
            />
            <YAxis stroke="#9ca3af" domain={[0, 'auto']} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
              labelFormatter={(ts) => new Date(ts).toLocaleTimeString()}
            />
            <Legend />
            <Line type="monotone" dataKey="fps" stroke="#22c55e" dot={false} name="FPS" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* FPS Distribution */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">FPS Distribution</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={getFpsDistribution()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="range" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
            />
            <Bar dataKey="count" name="Frames">
              {getFpsDistribution().map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">CPU & Memory</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={frameRecords.slice(-200)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                stroke="#9ca3af"
              />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                labelFormatter={(ts) => new Date(ts).toLocaleTimeString()}
              />
              <Legend />
              <Line type="monotone" dataKey="cpuUsage" stroke="#3b82f6" dot={false} name="CPU %" />
              <Line type="monotone" dataKey="memoryUsage" stroke="#a855f7" dot={false} name="Memory MB" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Temperature & Power</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={frameRecords.slice(-200)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                stroke="#9ca3af"
              />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                labelFormatter={(ts) => new Date(ts).toLocaleTimeString()}
              />
              <Legend />
              <Line type="monotone" dataKey="temperature" stroke="#ef4444" dot={false} name="Temp °C" />
              <Line type="monotone" dataKey="power" stroke="#f59e0b" dot={false} name="Power mW" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SessionDetail;
