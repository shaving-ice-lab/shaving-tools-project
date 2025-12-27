import React, { useMemo } from 'react';

interface JankEvent {
  timestamp: number;
  frameTime: number;
  severity: 'minor' | 'major' | 'severe';
}

interface JankTimelineProps {
  data: Array<{
    timestamp: number;
    fps: number;
    frameTime: number;
    isJank: boolean;
  }>;
  startTime: number;
  endTime: number;
}

const JankTimeline: React.FC<JankTimelineProps> = ({ data, startTime, endTime }) => {
  const jankEvents = useMemo(() => {
    return data
      .filter(d => d.isJank)
      .map(d => {
        let severity: 'minor' | 'major' | 'severe' = 'minor';
        if (d.frameTime > 50) severity = 'severe';
        else if (d.frameTime > 33) severity = 'major';
        
        return {
          timestamp: d.timestamp,
          frameTime: d.frameTime,
          severity
        } as JankEvent;
      });
  }, [data]);

  const duration = endTime - startTime;
  
  const getPositionPercent = (timestamp: number) => {
    return ((timestamp - startTime) / duration) * 100;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe': return 'bg-red-500';
      case 'major': return 'bg-orange-500';
      default: return 'bg-yellow-500';
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor((ms - startTime) / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const timeMarkers = useMemo(() => {
    const markers = [];
    const interval = duration / 10;
    for (let i = 0; i <= 10; i++) {
      markers.push(startTime + interval * i);
    }
    return markers;
  }, [startTime, duration]);

  const stats = useMemo(() => {
    const minor = jankEvents.filter(e => e.severity === 'minor').length;
    const major = jankEvents.filter(e => e.severity === 'major').length;
    const severe = jankEvents.filter(e => e.severity === 'severe').length;
    return { minor, major, severe, total: jankEvents.length };
  }, [jankEvents]);

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Jank Timeline</h3>
        <div className="flex gap-4 text-sm">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            Minor ({stats.minor})
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
            Major ({stats.major})
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            Severe ({stats.severe})
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Background track */}
        <div className="h-12 bg-gray-700 rounded-lg relative overflow-hidden">
          {/* Jank markers */}
          {jankEvents.map((event, index) => (
            <div
              key={index}
              className={`absolute top-0 h-full w-1 ${getSeverityColor(event.severity)} opacity-80 hover:opacity-100 cursor-pointer group`}
              style={{ left: `${getPositionPercent(event.timestamp)}%` }}
              title={`Frame Time: ${event.frameTime.toFixed(1)}ms`}
            >
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                  <div>Time: {formatTime(event.timestamp)}</div>
                  <div>Frame: {event.frameTime.toFixed(1)}ms</div>
                  <div className="capitalize">{event.severity} Jank</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Time markers */}
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          {timeMarkers.map((time, index) => (
            <span key={index}>{formatTime(time)}</span>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 grid grid-cols-4 gap-4 text-center text-sm">
        <div className="bg-gray-700 rounded p-2">
          <div className="text-gray-400">Total Janks</div>
          <div className="text-xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-gray-700 rounded p-2">
          <div className="text-gray-400">Jank Rate</div>
          <div className="text-xl font-bold text-yellow-400">
            {data.length > 0 ? ((stats.total / data.length) * 100).toFixed(1) : 0}%
          </div>
        </div>
        <div className="bg-gray-700 rounded p-2">
          <div className="text-gray-400">Avg Jank Time</div>
          <div className="text-xl font-bold text-orange-400">
            {jankEvents.length > 0 
              ? (jankEvents.reduce((a, b) => a + b.frameTime, 0) / jankEvents.length).toFixed(1)
              : 0}ms
          </div>
        </div>
        <div className="bg-gray-700 rounded p-2">
          <div className="text-gray-400">Max Jank Time</div>
          <div className="text-xl font-bold text-red-400">
            {jankEvents.length > 0 
              ? Math.max(...jankEvents.map(e => e.frameTime)).toFixed(1)
              : 0}ms
          </div>
        </div>
      </div>
    </div>
  );
};

export default JankTimeline;
