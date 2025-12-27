import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar
} from 'recharts';

interface SessionData {
  id: number;
  deviceId: string;
  gameName: string;
  startTime: number;
  endTime: number | null;
}

interface SessionStats {
  sessionId: number;
  gameName: string;
  avgFps: number;
  minFps: number;
  maxFps: number;
  jankRate: number;
  avgCpu: number;
  avgMemory: number;
  avgTemp: number;
  stability: number;
}

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7'];

const Compare: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [selectedSessions, setSelectedSessions] = useState<number[]>([]);
  const [sessionStats, setSessionStats] = useState<SessionStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      // @ts-ignore
      const data = await window.api.getSessions();
      setSessions(data.filter((s: SessionData) => s.endTime !== null));
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
    setLoading(false);
  };

  const toggleSession = async (sessionId: number) => {
    if (selectedSessions.includes(sessionId)) {
      setSelectedSessions(prev => prev.filter(id => id !== sessionId));
      setSessionStats(prev => prev.filter(s => s.sessionId !== sessionId));
    } else if (selectedSessions.length < 5) {
      setSelectedSessions(prev => [...prev, sessionId]);
      await loadSessionStats(sessionId);
    }
  };

  const loadSessionStats = async (sessionId: number) => {
    try {
      // @ts-ignore
      const records = await window.api.getFrameRecords(sessionId);
      const session = sessions.find(s => s.id === sessionId);
      
      if (records.length > 0 && session) {
        const fpsValues = records.map((r: any) => r.fps);
        const avgFps = fpsValues.reduce((a: number, b: number) => a + b, 0) / fpsValues.length;
        const minFps = Math.min(...fpsValues);
        const maxFps = Math.max(...fpsValues);
        const jankCount = records.filter((r: any) => r.isJank).length;
        
        // Calculate FPS stability (lower variance = higher stability)
        const variance = fpsValues.reduce((acc: number, val: number) => 
          acc + Math.pow(val - avgFps, 2), 0) / fpsValues.length;
        const stability = Math.max(0, 100 - Math.sqrt(variance));

        const stats: SessionStats = {
          sessionId,
          gameName: session.gameName || 'Unknown',
          avgFps,
          minFps,
          maxFps,
          jankRate: (jankCount / records.length) * 100,
          avgCpu: records.reduce((a: number, r: any) => a + r.cpuUsage, 0) / records.length,
          avgMemory: records.reduce((a: number, r: any) => a + r.memoryUsage, 0) / records.length,
          avgTemp: records.reduce((a: number, r: any) => a + r.temperature, 0) / records.length,
          stability
        };

        setSessionStats(prev => [...prev, stats]);
      }
    } catch (error) {
      console.error('Failed to load session stats:', error);
    }
  };

  const getRadarData = () => {
    if (sessionStats.length === 0) return [];

    const maxValues = {
      avgFps: Math.max(...sessionStats.map(s => s.avgFps), 60),
      stability: 100,
      efficiency: 100,
      thermal: 100,
      smoothness: 100
    };

    return [
      { metric: 'Average FPS', fullMark: 100 },
      { metric: 'Stability', fullMark: 100 },
      { metric: 'CPU Efficiency', fullMark: 100 },
      { metric: 'Thermal', fullMark: 100 },
      { metric: 'Smoothness', fullMark: 100 }
    ].map(item => {
      const data: any = { metric: item.metric, fullMark: item.fullMark };
      sessionStats.forEach((stats, index) => {
        switch (item.metric) {
          case 'Average FPS':
            data[`session${index}`] = (stats.avgFps / maxValues.avgFps) * 100;
            break;
          case 'Stability':
            data[`session${index}`] = stats.stability;
            break;
          case 'CPU Efficiency':
            data[`session${index}`] = Math.max(0, 100 - stats.avgCpu);
            break;
          case 'Thermal':
            data[`session${index}`] = Math.max(0, 100 - (stats.avgTemp - 25) * 2);
            break;
          case 'Smoothness':
            data[`session${index}`] = Math.max(0, 100 - stats.jankRate * 5);
            break;
        }
      });
      return data;
    });
  };

  const getComparisonData = () => {
    return sessionStats.map((stats, index) => ({
      name: stats.gameName.substring(0, 15),
      avgFps: stats.avgFps,
      minFps: stats.minFps,
      maxFps: stats.maxFps,
      jankRate: stats.jankRate,
      fill: COLORS[index]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
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
          <h1 className="text-2xl font-bold">Session Comparison</h1>
        </div>
        <p className="text-gray-400">Select up to 5 sessions to compare</p>
      </div>

      {/* Session Selection */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Select Sessions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
          {sessions.map((session, index) => (
            <button
              key={session.id}
              onClick={() => toggleSession(session.id)}
              className={`p-3 rounded-lg text-left transition-colors ${
                selectedSessions.includes(session.id)
                  ? 'bg-green-600 hover:bg-green-500'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              disabled={!selectedSessions.includes(session.id) && selectedSessions.length >= 5}
            >
              <p className="font-medium truncate">{session.gameName || 'Unknown'}</p>
              <p className="text-xs text-gray-300">
                {new Date(session.startTime).toLocaleDateString()}
              </p>
            </button>
          ))}
        </div>
      </div>

      {sessionStats.length > 0 && (
        <>
          {/* Radar Chart */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Performance Radar</h2>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={getRadarData()}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="metric" stroke="#9ca3af" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#9ca3af" />
                {sessionStats.map((_, index) => (
                  <Radar
                    key={index}
                    name={sessionStats[index].gameName}
                    dataKey={`session${index}`}
                    stroke={COLORS[index]}
                    fill={COLORS[index]}
                    fillOpacity={0.3}
                  />
                ))}
                <Legend />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Stats Comparison Table */}
          <div className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
            <h2 className="text-lg font-semibold mb-4">Detailed Comparison</h2>
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="pb-3">Metric</th>
                  {sessionStats.map((stats, index) => (
                    <th key={stats.sessionId} className="pb-3">
                      <span className="flex items-center gap-2">
                        <span 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index] }}
                        ></span>
                        {stats.gameName.substring(0, 12)}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-gray-700">
                  <td className="py-3 text-gray-400">Avg FPS</td>
                  {sessionStats.map(s => (
                    <td key={s.sessionId} className="py-3 font-bold">{s.avgFps.toFixed(1)}</td>
                  ))}
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-3 text-gray-400">Min FPS</td>
                  {sessionStats.map(s => (
                    <td key={s.sessionId} className="py-3 text-red-400">{s.minFps.toFixed(1)}</td>
                  ))}
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-3 text-gray-400">Max FPS</td>
                  {sessionStats.map(s => (
                    <td key={s.sessionId} className="py-3 text-green-400">{s.maxFps.toFixed(1)}</td>
                  ))}
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-3 text-gray-400">Jank Rate</td>
                  {sessionStats.map(s => (
                    <td key={s.sessionId} className="py-3 text-yellow-400">{s.jankRate.toFixed(1)}%</td>
                  ))}
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-3 text-gray-400">Avg CPU</td>
                  {sessionStats.map(s => (
                    <td key={s.sessionId} className="py-3">{s.avgCpu.toFixed(1)}%</td>
                  ))}
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-3 text-gray-400">Avg Memory</td>
                  {sessionStats.map(s => (
                    <td key={s.sessionId} className="py-3">{s.avgMemory.toFixed(0)} MB</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 text-gray-400">Avg Temp</td>
                  {sessionStats.map(s => (
                    <td key={s.sessionId} className="py-3">{s.avgTemp.toFixed(1)}°C</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}

      {sessionStats.length === 0 && (
        <div className="flex items-center justify-center h-64 text-gray-400">
          Select sessions above to compare their performance
        </div>
      )}
    </div>
  );
};

export default Compare;
