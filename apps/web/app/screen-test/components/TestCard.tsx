"use client"

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TestConfig } from '../types';
import {
  Grid3x3,
  Gauge,
  Zap,
  Palette,
  Timer,
  Sun,
  Rainbow,
  Contrast,
  Flame,
  Move3d,
  LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Grid3x3,
  Gauge,
  Zap,
  Palette,
  Timer,
  Sun,
  Rainbow,
  Contrast,
  Flame,
  Move3d,
};

interface TestCardProps {
  config: TestConfig;
}

export function TestCard({ config }: TestCardProps) {
  const Icon = iconMap[config.icon] || Grid3x3;

  return (
    <Link href={config.path}>
      <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50 cursor-pointer">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{config.name}</CardTitle>
              <CardDescription className="mt-1">{config.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}
