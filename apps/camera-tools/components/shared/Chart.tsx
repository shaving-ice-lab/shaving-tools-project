'use client'

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts'
import { cn } from '@/lib/utils'

interface DataPoint {
  x: number
  y: number
  [key: string]: number | string
}

interface AxisConfig {
  label: string
  domain?: [number, number]
  tickFormatter?: (value: number) => string
}

interface ChartProps {
  type: 'line' | 'bar' | 'scatter'
  data: DataPoint[]
  xAxis: AxisConfig
  yAxis: AxisConfig
  series?: { key: string; name: string; color: string }[]
  legend?: boolean
  exportable?: boolean
  className?: string
}

const COLORS = ['hsl(221, 83%, 53%)', 'hsl(24, 95%, 53%)', 'hsl(142, 76%, 36%)', 'hsl(0, 84%, 60%)', 'hsl(48, 96%, 53%)']

export function Chart({ type, data, xAxis, yAxis, series, legend = true, className }: ChartProps) {
  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 20 },
    }

    const xAxisProps = {
      dataKey: 'x',
      label: { value: xAxis.label, position: 'bottom', offset: 0 },
      domain: xAxis.domain,
      tickFormatter: xAxis.tickFormatter,
    }

    const yAxisProps = {
      label: { value: yAxis.label, angle: -90, position: 'insideLeft' },
      domain: yAxis.domain,
      tickFormatter: yAxis.tickFormatter,
    }

    switch (type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis {...xAxisProps} className="text-xs" />
            <YAxis {...yAxisProps} className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem',
              }}
            />
            {legend && <Legend />}
            {series ? (
              series.map((s, i) => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.name}
                  stroke={s.color || COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                />
              ))
            ) : (
              <Line type="monotone" dataKey="y" stroke={COLORS[0]} strokeWidth={2} dot={false} />
            )}
          </LineChart>
        )

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis {...xAxisProps} className="text-xs" />
            <YAxis {...yAxisProps} className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem',
              }}
            />
            {legend && <Legend />}
            {series ? (
              series.map((s, i) => <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color || COLORS[i % COLORS.length]} />)
            ) : (
              <Bar dataKey="y" fill={COLORS[0]} />
            )}
          </BarChart>
        )

      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis {...xAxisProps} className="text-xs" />
            <YAxis {...yAxisProps} className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem',
              }}
            />
            {legend && <Legend />}
            <Scatter name="数据点" data={data} fill={COLORS[0]} />
          </ScatterChart>
        )

      default:
        return null
    }
  }

  return (
    <div className={cn('w-full h-[300px]', className)}>
      <ResponsiveContainer width="100%" height="100%">
        {renderChart() as React.ReactElement}
      </ResponsiveContainer>
    </div>
  )
}
