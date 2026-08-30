import type { UnitSettings } from '@/types/weather';

export function celsiusToFahrenheit(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

export function fahrenheitToCelsius(f: number): number {
  return Math.round(((f - 32) * 5) / 9);
}

export function kmhToMph(kmh: number): number {
  return Math.round(kmh * 0.621371);
}

export function mphToKmh(mph: number): number {
  return Math.round(mph / 0.621371);
}

export function mmToInch(mm: number): number {
  return parseFloat((mm * 0.0393701).toFixed(2));
}

export function inchToMm(inch: number): number {
  return parseFloat((inch / 0.0393701).toFixed(1));
}

export function kmToMiles(km: number): number {
  return parseFloat((km * 0.621371).toFixed(1));
}

export function formatTemperature(celsius: number, unit: UnitSettings['temperature']): string {
  if (unit === 'fahrenheit') {
    return `${celsiusToFahrenheit(celsius)}°F`;
  }
  return `${Math.round(celsius)}°C`;
}

export function formatTemperatureValue(celsius: number, unit: UnitSettings['temperature']): number {
  if (unit === 'fahrenheit') {
    return celsiusToFahrenheit(celsius);
  }
  return Math.round(celsius);
}

export function formatWind(kmh: number, unit: UnitSettings['wind']): string {
  if (unit === 'mph') {
    return `${kmhToMph(kmh)} mph`;
  }
  return `${Math.round(kmh)} km/h`;
}

export function formatPrecip(mm: number, unit: UnitSettings['precip']): string {
  if (unit === 'inch') {
    return `${mmToInch(mm)} in`;
  }
  return `${mm.toFixed(1)} mm`;
}

export function formatVisibility(km: number, unit: UnitSettings['wind']): string {
  if (unit === 'mph') {
    return `${kmToMiles(km)} mi`;
  }
  return `${km.toFixed(1)} km`;
}

export function formatTime(isoString: string, timezone?: string): string {
  const date = new Date(isoString);
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  const m = minutes.toString().padStart(2, '0');
  return `${h}:${m} ${ampm}`;
}

export function formatHour(isoString: string): string {
  const date = new Date(isoString);
  const hours = date.getUTCHours();
  if (hours === 0) return '12 AM';
  if (hours === 12) return '12 PM';
  if (hours < 12) return `${hours} AM`;
  return `${hours - 12} PM`;
}

export function getDayLabel(dateStr: string, index: number): string {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const date = new Date(dateStr + 'T00:00:00Z');
  return days[date.getUTCDay()];
}

export function getFullDayLabel(dateStr: string): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const date = new Date(dateStr + 'T00:00:00Z');
  return days[date.getUTCDay()];
}