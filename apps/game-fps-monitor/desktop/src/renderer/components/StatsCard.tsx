import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  trend?: 'up' | 'down' | 'stable';
  subtitle?: string;
}

const colorMap = {
  blue: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    icon: 'text-blue-400',
  },
  green: {
    bg: 'bg-green-500/20',
    text: 'text-green-400',
    icon: 'text-green-400',
  },
  yellow: {
    bg: 'bg-yellow-500/20',
    text: 'text-yellow-400',
    icon: 'text-yellow-400',
  },
  red: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    icon: 'text-red-400',
  },
  purple: {
    bg: 'bg-purple-500/20',
    text: 'text-purple-400',
    icon: 'text-purple-400',
  },
};

export default function StatsCard({
  title,
  value,
  unit,
  icon: Icon,
  color = 'blue',
  subtitle,
}: StatsCardProps) {
  const colors = colorMap[color];

  return (
    <div className="bg-dark-200 rounded-xl p-4 border border-gray-800">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-2xl font-bold ${colors.text}`}>{value}</span>
            {unit && <span className="text-gray-500 text-sm">{unit}</span>}
          </div>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2 rounded-lg ${colors.bg}`}>
          <Icon className={`w-5 h-5 ${colors.icon}`} />
        </div>
      </div>
    </div>
  );
}
