"use client"

import { useState, useEffect, useRef } from 'react';
import { FrameData } from '../types';

interface FrameRateStats {
  fps: number;
  avgFps: number;
  minDelta: number;
  maxDelta: number;
  frameCount: number;
}

export function useFrameRate(sampleWindow: number = 60): FrameRateStats {
  const [stats, setStats] = useState<FrameRateStats>({
    fps: 0,
    avgFps: 0,
    minDelta: Infinity,
    maxDelta: 0,
    frameCount: 0,
  });

  const frameDataRef = useRef<FrameData[]>([]);
  const lastTimeRef = useRef(0);
  const frameCountRef = useRef(0);

  useEffect(() => {
    let isRunning = true;
    let animationRef: number;

    const measureFrame = (timestamp: number) => {
      if (!isRunning) return;

      if (lastTimeRef.current > 0) {
        const delta = timestamp - lastTimeRef.current;
        frameDataRef.current.push({ timestamp, delta });

        if (frameDataRef.current.length > sampleWindow) {
          frameDataRef.current.shift();
        }

        const deltas = frameDataRef.current.map(f => f.delta);
        const avgDelta = deltas.reduce((a, b) => a + b, 0) / deltas.length;
        const currentFps = Math.round(1000 / delta);
        const calculatedAvgFps = Math.round(1000 / avgDelta);

        setStats({
          fps: currentFps,
          avgFps: calculatedAvgFps,
          minDelta: Math.min(...deltas),
          maxDelta: Math.max(...deltas),
          frameCount: frameCountRef.current,
        });
      }

      lastTimeRef.current = timestamp;
      frameCountRef.current++;
      animationRef = requestAnimationFrame(measureFrame);
    };

    animationRef = requestAnimationFrame(measureFrame);

    return () => {
      isRunning = false;
      if (animationRef) {
        cancelAnimationFrame(animationRef);
      }
    };
  }, [sampleWindow]);

  return stats;
}

export function getRefreshRateLabel(fps: number): string {
  if (fps >= 140) return '144Hz+';
  if (fps >= 115) return '120Hz';
  if (fps >= 85) return '90Hz';
  if (fps >= 55) return '60Hz';
  return '低刷新率';
}
