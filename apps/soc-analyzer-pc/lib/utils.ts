import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFrequency(mhz: number): string {
  if (mhz >= 1000) {
    return `${(mhz / 1000).toFixed(2)} GHz`
  }
  return `${mhz} MHz`
}

export function formatTemperature(celsius: number): string {
  return `${celsius.toFixed(1)}°C`
}

export function formatMemory(mb: number): string {
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(1)} GB`
  }
  return `${mb} MB`
}

export function formatPower(mw: number): string {
  if (mw >= 1000) {
    return `${(mw / 1000).toFixed(2)} W`
  }
  return `${mw} mW`
}

export function getTemperatureColor(temp: number): string {
  if (temp < 40) return 'text-green-400'
  if (temp < 50) return 'text-yellow-400'
  if (temp < 60) return 'text-orange-400'
  return 'text-red-400'
}

export function getCoreTypeColor(type: string): string {
  switch (type.toLowerCase()) {
    case 'prime':
      return 'bg-red-500'
    case 'big':
      return 'bg-orange-500'
    case 'middle':
      return 'bg-yellow-500'
    case 'little':
      return 'bg-green-500'
    default:
      return 'bg-blue-500'
  }
}
