import type { WmoCodeInfo } from '@/types/weather';

export const WMO_CODE_MAP: Record<number, WmoCodeInfo> = {
  0: {
    label: 'Clear Sky',
    category: 'clear',
    icon: '☀️',
    bgClass: 'bg-weather-sunny',
    accentColor: '#f59e0b',
  },
  1: {
    label: 'Mainly Clear',
    category: 'clear',
    icon: '🌤️',
    bgClass: 'bg-weather-sunny',
    accentColor: '#f59e0b',
  },
  2: {
    label: 'Partly Cloudy',
    category: 'partly-cloudy',
    icon: '⛅',
    bgClass: 'bg-weather-cloudy',
    accentColor: '#94a3b8',
  },
  3: {
    label: 'Overcast',
    category: 'cloudy',
    icon: '☁️',
    bgClass: 'bg-weather-cloudy',
    accentColor: '#64748b',
  },
  45: {
    label: 'Foggy',
    category: 'fog',
    icon: '🌫️',
    bgClass: 'bg-weather-fog',
    accentColor: '#9ca3af',
  },
  48: {
    label: 'Icy Fog',
    category: 'fog',
    icon: '🌫️',
    bgClass: 'bg-weather-fog',
    accentColor: '#9ca3af',
  },
  51: {
    label: 'Light Drizzle',
    category: 'drizzle',
    icon: '🌦️',
    bgClass: 'bg-weather-rain',
    accentColor: '#60a5fa',
  },
  53: {
    label: 'Moderate Drizzle',
    category: 'drizzle',
    icon: '🌦️',
    bgClass: 'bg-weather-rain',
    accentColor: '#60a5fa',
  },
  55: {
    label: 'Heavy Drizzle',
    category: 'drizzle',
    icon: '🌧️',
    bgClass: 'bg-weather-rain',
    accentColor: '#3b82f6',
  },
  61: {
    label: 'Slight Rain',
    category: 'rain',
    icon: '🌧️',
    bgClass: 'bg-weather-rain',
    accentColor: '#3b82f6',
  },
  63: {
    label: 'Moderate Rain',
    category: 'rain',
    icon: '🌧️',
    bgClass: 'bg-weather-rain',
    accentColor: '#2563eb',
  },
  65: {
    label: 'Heavy Rain',
    category: 'rain',
    icon: '🌧️',
    bgClass: 'bg-weather-rain',
    accentColor: '#1d4ed8',
  },
  71: {
    label: 'Slight Snow',
    category: 'snow',
    icon: '🌨️',
    bgClass: 'bg-weather-snow',
    accentColor: '#bfdbfe',
  },
  73: {
    label: 'Moderate Snow',
    category: 'snow',
    icon: '❄️',
    bgClass: 'bg-weather-snow',
    accentColor: '#93c5fd',
  },
  75: {
    label: 'Heavy Snow',
    category: 'snow',
    icon: '❄️',
    bgClass: 'bg-weather-snow',
    accentColor: '#60a5fa',
  },
  77: {
    label: 'Snow Grains',
    category: 'snow',
    icon: '🌨️',
    bgClass: 'bg-weather-snow',
    accentColor: '#93c5fd',
  },
  80: {
    label: 'Slight Showers',
    category: 'rain',
    icon: '🌦️',
    bgClass: 'bg-weather-rain',
    accentColor: '#60a5fa',
  },
  81: {
    label: 'Moderate Showers',
    category: 'rain',
    icon: '🌧️',
    bgClass: 'bg-weather-rain',
    accentColor: '#3b82f6',
  },
  82: {
    label: 'Violent Showers',
    category: 'rain',
    icon: '⛈️',
    bgClass: 'bg-weather-rain',
    accentColor: '#1d4ed8',
  },
  85: {
    label: 'Slight Snow Showers',
    category: 'snow',
    icon: '🌨️',
    bgClass: 'bg-weather-snow',
    accentColor: '#bfdbfe',
  },
  86: {
    label: 'Heavy Snow Showers',
    category: 'snow',
    icon: '❄️',
    bgClass: 'bg-weather-snow',
    accentColor: '#93c5fd',
  },
  95: {
    label: 'Thunderstorm',
    category: 'storm',
    icon: '⛈️',
    bgClass: 'bg-weather-storm',
    accentColor: '#a78bfa',
  },
  96: {
    label: 'Thunderstorm w/ Hail',
    category: 'hail',
    icon: '⛈️',
    bgClass: 'bg-weather-storm',
    accentColor: '#7c3aed',
  },
  99: {
    label: 'Heavy Thunderstorm w/ Hail',
    category: 'hail',
    icon: '⛈️',
    bgClass: 'bg-weather-storm',
    accentColor: '#6d28d9',
  },
};

export function getWmoInfo(code: number): WmoCodeInfo {
  return (
    WMO_CODE_MAP[code] ?? {
      label: 'Unknown',
      category: 'cloudy',
      icon: '🌡️',
      bgClass: 'bg-weather-cloudy',
      accentColor: '#94a3b8',
    }
  );
}

export function getUvLabel(uv: number): { label: string; color: string; bgClass: string } {
  if (uv <= 2) return { label: 'Low', color: 'text-green-400', bgClass: 'bg-green-400/10' };
  if (uv <= 5) return { label: 'Moderate', color: 'text-yellow-400', bgClass: 'bg-yellow-400/10' };
  if (uv <= 7) return { label: 'High', color: 'text-orange-400', bgClass: 'bg-orange-400/10' };
  if (uv <= 10) return { label: 'Very High', color: 'text-red-400', bgClass: 'bg-red-400/10' };
  return { label: 'Extreme', color: 'text-purple-400', bgClass: 'bg-purple-400/10' };
}

export function getWindDirection(degrees: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(degrees / 22.5) % 16];
}

export function getVisibilityLabel(km: number): string {
  if (km >= 10) return 'Excellent';
  if (km >= 5) return 'Good';
  if (km >= 2) return 'Moderate';
  if (km >= 1) return 'Poor';
  return 'Very Poor';
}