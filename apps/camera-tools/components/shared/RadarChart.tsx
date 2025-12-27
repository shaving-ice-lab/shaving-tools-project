'use client'

import { useMemo } from 'react'

interface RadarChartProps {
  data: { category: string; score: number }[]
  size?: number
  className?: string
}

export function RadarChart({ data, size = 300, className = '' }: RadarChartProps) {
  const center = size / 2
  const radius = size * 0.35
  const levels = 5

  const angleStep = (2 * Math.PI) / data.length
  const startAngle = -Math.PI / 2

  const points = useMemo(() => {
    return data.map((d, i) => {
      const angle = startAngle + i * angleStep
      const r = (d.score / 100) * radius
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
        labelX: center + (radius + 30) * Math.cos(angle),
        labelY: center + (radius + 30) * Math.sin(angle),
        category: d.category,
        score: d.score,
      }
    })
  }, [data, center, radius, angleStep, startAngle])

  const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ')

  const gridLines = useMemo(() => {
    const lines = []
    for (let level = 1; level <= levels; level++) {
      const levelRadius = (level / levels) * radius
      const levelPoints = data.map((_, i) => {
        const angle = startAngle + i * angleStep
        return {
          x: center + levelRadius * Math.cos(angle),
          y: center + levelRadius * Math.sin(angle),
        }
      })
      lines.push(levelPoints.map(p => `${p.x},${p.y}`).join(' '))
    }
    return lines
  }, [data, center, radius, levels, angleStep, startAngle])

  const axisLines = useMemo(() => {
    return data.map((_, i) => {
      const angle = startAngle + i * angleStep
      return {
        x1: center,
        y1: center,
        x2: center + radius * Math.cos(angle),
        y2: center + radius * Math.sin(angle),
      }
    })
  }, [data, center, radius, angleStep, startAngle])

  return (
    <svg width={size} height={size} className={className}>
      {/* 背景网格 */}
      {gridLines.map((points, i) => (
        <polygon key={i} points={points} fill="none" stroke="#e2e8f0" strokeWidth="1" />
      ))}

      {/* 轴线 */}
      {axisLines.map((line, i) => (
        <line key={i} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke="#e2e8f0" strokeWidth="1" />
      ))}

      {/* 数据多边形 */}
      <polygon points={polygonPoints} fill="rgba(59, 130, 246, 0.3)" stroke="#3b82f6" strokeWidth="2" />

      {/* 数据点 */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#3b82f6" stroke="white" strokeWidth="2" />
      ))}

      {/* 标签 */}
      {points.map((p, i) => (
        <text key={i} x={p.labelX} y={p.labelY} textAnchor="middle" dominantBaseline="middle" className="text-xs fill-slate-600" fontSize="12">
          {p.category}
          <tspan x={p.labelX} dy="14" className="fill-slate-400" fontSize="10">
            {p.score}分
          </tspan>
        </text>
      ))}
    </svg>
  )
}
