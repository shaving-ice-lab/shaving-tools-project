'use client';

import React, { useState, useEffect, useMemo } from 'react';
import * as echarts from 'echarts';

interface TemperatureDataPoint {
  timestamp: number;
  cpuTemp: number;
  gpuTemp: number;
  batteryTemp: number;
  load: number;
}

interface PredictionResult {
  predictedTemps: number[];
  confidence: number;
  trend: 'rising' | 'stable' | 'falling';
  timeToThermalLimit: number | null;
  suggestedActions: string[];
}

const TemperaturePrediction: React.FC = () => {
  const [historicalData, setHistoricalData] = useState<TemperatureDataPoint[]>([]);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [predictionMinutes, setPredictionMinutes] = useState(5);
  const [selectedSensor, setSelectedSensor] = useState<'cpu' | 'gpu' | 'battery'>('cpu');
  const [thermalLimit, setThermalLimit] = useState(85);

  useEffect(() => {
    generateMockData();
  }, []);

  useEffect(() => {
    if (historicalData.length > 10) {
      const result = predictTemperature(historicalData, predictionMinutes, selectedSensor);
      setPrediction(result);
    }
  }, [historicalData, predictionMinutes, selectedSensor]);

  const generateMockData = () => {
    const now = Date.now();
    const data: TemperatureDataPoint[] = [];
    let baseTemp = 45;

    for (let i = 60; i >= 0; i--) {
      const load = 30 + Math.random() * 50;
      const tempVariation = (load - 50) * 0.3 + Math.random() * 3;
      baseTemp = Math.max(35, Math.min(90, baseTemp + tempVariation * 0.1));

      data.push({
        timestamp: now - i * 60000,
        cpuTemp: baseTemp + Math.random() * 5,
        gpuTemp: baseTemp - 5 + Math.random() * 4,
        batteryTemp: 30 + (baseTemp - 45) * 0.3 + Math.random() * 2,
        load: load,
      });
    }

    setHistoricalData(data);
  };

  const predictTemperature = (
    data: TemperatureDataPoint[],
    minutes: number,
    sensor: 'cpu' | 'gpu' | 'battery'
  ): PredictionResult => {
    const temps = data.map((d) => {
      switch (sensor) {
        case 'cpu': return d.cpuTemp;
        case 'gpu': return d.gpuTemp;
        case 'battery': return d.batteryTemp;
      }
    });

    const recentTemps = temps.slice(-20);
    const avgChange = recentTemps.length > 1
      ? (recentTemps[recentTemps.length - 1] - recentTemps[0]) / recentTemps.length
      : 0;

    const currentTemp = temps[temps.length - 1];
    const predictedTemps: number[] = [];

    for (let i = 1; i <= minutes; i++) {
      const decay = Math.exp(-i * 0.1);
      const predicted = currentTemp + avgChange * i * decay + Math.random() * 2 - 1;
      predictedTemps.push(Math.max(25, Math.min(100, predicted)));
    }

    let trend: 'rising' | 'stable' | 'falling';
    if (avgChange > 0.3) trend = 'rising';
    else if (avgChange < -0.3) trend = 'falling';
    else trend = 'stable';

    let timeToThermalLimit: number | null = null;
    if (trend === 'rising' && avgChange > 0) {
      const timeMinutes = (thermalLimit - currentTemp) / avgChange;
      if (timeMinutes > 0 && timeMinutes < 60) {
        timeToThermalLimit = timeMinutes;
      }
    }

    const suggestedActions: string[] = [];
    if (currentTemp > 80) {
      suggestedActions.push('建议降低处理器负载');
      suggestedActions.push('检查散热系统是否正常工作');
    }
    if (trend === 'rising' && avgChange > 0.5) {
      suggestedActions.push('温度快速上升,建议减少性能密集型任务');
    }
    if (timeToThermalLimit && timeToThermalLimit < 10) {
      suggestedActions.push(`预计${Math.round(timeToThermalLimit)}分钟内达到温度阈值`);
    }

    const confidence = Math.max(0.5, Math.min(0.95, 0.85 - Math.abs(avgChange) * 0.1));

    return {
      predictedTemps,
      confidence,
      trend,
      timeToThermalLimit,
      suggestedActions,
    };
  };

  const chartOption = useMemo(() => {
    if (historicalData.length === 0) return {};

    const temps = historicalData.map((d) => {
      switch (selectedSensor) {
        case 'cpu': return d.cpuTemp;
        case 'gpu': return d.gpuTemp;
        case 'battery': return d.batteryTemp;
      }
    });

    const times = historicalData.map((d) =>
      new Date(d.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    );

    const futureTimes: string[] = [];
    const lastTime = historicalData[historicalData.length - 1]?.timestamp || Date.now();
    for (let i = 1; i <= predictionMinutes; i++) {
      futureTimes.push(
        new Date(lastTime + i * 60000).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      );
    }

    const allTimes = [...times, ...futureTimes];
    const allTemps = [...temps, ...(prediction?.predictedTemps || [])];

    const historicalLineData = temps.map((t, i) => [i, t]);
    const predictionLineData = prediction?.predictedTemps.map((t, i) => [temps.length + i, t]) || [];

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#333',
        textStyle: { color: '#fff' },
      },
      legend: {
        data: ['历史温度', '预测温度', '温度阈值'],
        textStyle: { color: '#9ca3af' },
        top: 10,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: allTimes,
        axisLine: { lineStyle: { color: '#4b5563' } },
        axisLabel: { color: '#9ca3af', rotate: 45 },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'value',
        name: '温度 (°C)',
        nameTextStyle: { color: '#9ca3af' },
        min: 20,
        max: 100,
        axisLine: { lineStyle: { color: '#4b5563' } },
        axisLabel: { color: '#9ca3af' },
        splitLine: { lineStyle: { color: '#374151', type: 'dashed' } },
      },
      series: [
        {
          name: '历史温度',
          type: 'line',
          data: historicalLineData,
          smooth: true,
          lineStyle: { color: '#3b82f6', width: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.05)' },
            ]),
          },
          symbol: 'none',
        },
        {
          name: '预测温度',
          type: 'line',
          data: predictionLineData,
          smooth: true,
          lineStyle: { color: '#f59e0b', width: 2, type: 'dashed' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(245, 158, 11, 0.3)' },
              { offset: 1, color: 'rgba(245, 158, 11, 0.05)' },
            ]),
          },
          symbol: 'circle',
          symbolSize: 6,
        },
        {
          name: '温度阈值',
          type: 'line',
          data: allTimes.map(() => thermalLimit),
          lineStyle: { color: '#ef4444', width: 2, type: 'dotted' },
          symbol: 'none',
        },
      ],
    };
  }, [historicalData, prediction, selectedSensor, predictionMinutes, thermalLimit]);

  useEffect(() => {
    const chartDom = document.getElementById('temp-prediction-chart');
    if (chartDom && Object.keys(chartOption).length > 0) {
      const chart = echarts.init(chartDom, 'dark');
      chart.setOption(chartOption);

      const handleResize = () => chart.resize();
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chart.dispose();
      };
    }
  }, [chartOption]);

  const getTrendIcon = (trend: 'rising' | 'stable' | 'falling') => {
    switch (trend) {
      case 'rising': return '📈';
      case 'falling': return '📉';
      case 'stable': return '➡️';
    }
  };

  const getTrendColor = (trend: 'rising' | 'stable' | 'falling') => {
    switch (trend) {
      case 'rising': return 'text-red-400';
      case 'falling': return 'text-green-400';
      case 'stable': return 'text-blue-400';
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">温度趋势预测</h2>
        <div className="flex items-center gap-4">
          <select
            value={selectedSensor}
            onChange={(e) => setSelectedSensor(e.target.value as 'cpu' | 'gpu' | 'battery')}
            className="bg-gray-800 text-white rounded-lg px-3 py-2 text-sm border border-gray-700"
          >
            <option value="cpu">CPU温度</option>
            <option value="gpu">GPU温度</option>
            <option value="battery">电池温度</option>
          </select>
          <select
            value={predictionMinutes}
            onChange={(e) => setPredictionMinutes(Number(e.target.value))}
            className="bg-gray-800 text-white rounded-lg px-3 py-2 text-sm border border-gray-700"
          >
            <option value={5}>预测5分钟</option>
            <option value={10}>预测10分钟</option>
            <option value={15}>预测15分钟</option>
            <option value={30}>预测30分钟</option>
          </select>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">阈值:</span>
            <input
              type="number"
              value={thermalLimit}
              onChange={(e) => setThermalLimit(Number(e.target.value))}
              className="bg-gray-800 text-white rounded-lg px-2 py-1 w-16 text-sm border border-gray-700"
              min={50}
              max={100}
            />
            <span className="text-gray-400 text-sm">°C</span>
          </div>
        </div>
      </div>

      <div id="temp-prediction-chart" className="w-full h-80 mb-6" />

      {prediction && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">趋势</div>
            <div className={`text-2xl font-bold ${getTrendColor(prediction.trend)}`}>
              {getTrendIcon(prediction.trend)} {prediction.trend === 'rising' ? '上升' : prediction.trend === 'falling' ? '下降' : '稳定'}
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">预测置信度</div>
            <div className="text-2xl font-bold text-white">
              {(prediction.confidence * 100).toFixed(0)}%
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${prediction.confidence * 100}%` }}
              />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">距离温度阈值</div>
            <div className={`text-2xl font-bold ${prediction.timeToThermalLimit && prediction.timeToThermalLimit < 10 ? 'text-red-400' : 'text-green-400'}`}>
              {prediction.timeToThermalLimit
                ? `${prediction.timeToThermalLimit.toFixed(1)} 分钟`
                : '安全'}
            </div>
          </div>
        </div>
      )}

      {prediction && prediction.suggestedActions.length > 0 && (
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
          <h3 className="text-yellow-400 font-medium mb-2">⚠️ 建议操作</h3>
          <ul className="space-y-1">
            {prediction.suggestedActions.map((action, index) => (
              <li key={index} className="text-yellow-200 text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                {action}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={generateMockData}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          刷新数据
        </button>
      </div>
    </div>
  );
};

export default TemperaturePrediction;
