"use client"

import { useState, useEffect, useCallback } from 'react';
import { AngleData } from '../types';

interface DeviceOrientationResult {
  angle: AngleData;
  isSupported: boolean;
  requestPermission: () => Promise<boolean>;
  hasPermission: boolean;
}

export function useDeviceOrientation(): DeviceOrientationResult {
  const [angle, setAngle] = useState<AngleData>({ alpha: 0, beta: 0, gamma: 0 });
  const [isSupported, setIsSupported] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        const granted = permission === 'granted';
        setHasPermission(granted);
        return granted;
      } catch (error) {
        console.error('Permission request failed:', error);
        return false;
      }
    }
    setHasPermission(true);
    return true;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) {
      setIsSupported(false);
      return;
    }

    const handleOrientation = (event: DeviceOrientationEvent) => {
      setAngle({
        alpha: event.alpha || 0,
        beta: event.beta || 0,
        gamma: event.gamma || 0,
      });
    };

    if (typeof (DeviceOrientationEvent as any).requestPermission !== 'function') {
      window.addEventListener('deviceorientation', handleOrientation);
      setHasPermission(true);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  useEffect(() => {
    if (!hasPermission) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      setAngle({
        alpha: event.alpha || 0,
        beta: event.beta || 0,
        gamma: event.gamma || 0,
      });
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [hasPermission]);

  return { angle, isSupported, requestPermission, hasPermission };
}

export function getAngleQuality(gamma: number): { text: string; color: string } {
  const absGamma = Math.abs(gamma);
  if (absGamma < 15) return { text: '正视角度', color: 'text-green-500' };
  if (absGamma < 30) return { text: '轻微偏转', color: 'text-yellow-500' };
  if (absGamma < 45) return { text: '中度偏转', color: 'text-orange-500' };
  return { text: '大角度偏转', color: 'text-red-500' };
}
