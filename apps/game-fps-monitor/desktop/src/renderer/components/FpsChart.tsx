import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface FrameData {
  timestamp: number;
  fps: number;
  jank?: boolean;
}

interface FpsChartProps {
  data: FrameData[];
  height?: number;
  showGrid?: boolean;
}

export default function FpsChart({ data, height = 300, showGrid = true }: FpsChartProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const chartData = data.map((d, i) => ({
    ...d,
    index: i,
    time: formatTime(d.timestamp),
  }));

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#45475a" />}
          <XAxis 
            dataKey="time" 
            stroke="#6c7086" 
            fontSize={12}
            tickLine={false}
          />
          <YAxis 
            stroke="#6c7086" 
            fontSize={12}
            domain={[0, 120]}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e1e2e',
              border: '1px solid #45475a',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#cdd6f4' }}
            itemStyle={{ color: '#89b4fa' }}
            formatter={(value: number) => [`${value.toFixed(1)} FPS`, '帧率']}
          />
          <ReferenceLine y={60} stroke="#a6e3a1" strokeDasharray="5 5" />
          <ReferenceLine y={30} stroke="#f9e2af" strokeDasharray="5 5" />
          <Line
            type="monotone"
            dataKey="fps"
            stroke="#89b4fa"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#89b4fa' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
