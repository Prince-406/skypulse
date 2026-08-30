'use client';

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { DailyForecastDay, UnitSettings } from '@/types/weather';
import { getWmoInfo } from '@/utils/wmoCodeMap';
import { getDayLabel, formatTemperatureValue } from '@/utils/unitConverters';

interface DailyForecastProps {
  daily: DailyForecastDay[];
  units: UnitSettings;
  onDaySelect?: (index: number) => void;
  selectedDay?: number;
}

export default function DailyForecast({
  daily,
  units,
  onDaySelect,
  selectedDay = 0,
}: DailyForecastProps) {
  const allMaxes = daily.map((d) => d.tempMax);
  const allMins = daily.map((d) => d.tempMin);
  const globalMax = Math.max(...allMaxes);
  const globalMin = Math.min(...allMins);
  const range = globalMax - globalMin || 1;

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">7-Day Forecast</h3>
        <span className="text-xs text-muted-foreground">Tap a day for hourly view</span>
      </div>

      <div className="space-y-1">
        {daily.map((day, i) => {
          const wmo = getWmoInfo(day.weatherCode);
          const maxVal = formatTemperatureValue(day.tempMax, units.temperature);
          const minVal = formatTemperatureValue(day.tempMin, units.temperature);
          const unit = units.temperature === 'celsius' ? '°' : '°';

          // Temperature bar positioning
          const barLeft = ((day.tempMin - globalMin) / range) * 100;
          const barWidth = ((day.tempMax - day.tempMin) / range) * 100;

          const isSelected = i === selectedDay;

          return (
            <button
              key={`daily-${day.date}`}
              onClick={() => onDaySelect?.(i)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-left group ${
                isSelected
                  ? 'forecast-day-active'
                  : 'hover:bg-white/5'
              }`}
              aria-label={`${getDayLabel(day.date, i)}: ${wmo.label}, high ${maxVal}${unit}, low ${minVal}${unit}`}
            >
              {/* Day label */}
              <div className="w-16 shrink-0">
                <span
                  className={`text-sm font-medium ${
                    isSelected ? 'text-primary' : i === 0 ? 'text-foreground' : 'text-secondary-foreground'
                  }`}
                >
                  {getDayLabel(day.date, i)}
                </span>
              </div>

              {/* Weather icon + condition */}
              <div className="flex items-center gap-1.5 w-28 shrink-0">
                <span className="text-lg" aria-hidden="true">{wmo.icon}</span>
                <span className="text-xs text-muted-foreground truncate hidden sm:block">
                  {wmo.label}
                </span>
              </div>

              {/* Precipitation probability */}
              <div className="w-10 shrink-0 text-center">
                {day.precipitationProbability > 20 ? (
                  <span className="text-xs text-blue-400 font-mono-nums">
                    {day.precipitationProbability}%
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>

              {/* Temperature range bar */}
              <div className="flex-1 flex items-center gap-2 min-w-0">
                <span className="text-xs font-mono-nums text-muted-foreground w-8 text-right shrink-0">
                  {minVal}{unit}
                </span>
                <div className="flex-1 relative h-1.5 rounded-full bg-white/10">
                  <div
                    className="absolute top-0 h-full rounded-full"
                    style={{
                      left: `${barLeft}%`,
                      width: `${Math.max(barWidth, 8)}%`,
                      background: `linear-gradient(90deg, #60a5fa, #f59e0b)`,
                    }}
                  />
                </div>
                <span className="text-xs font-mono-nums text-foreground w-8 shrink-0">
                  {maxVal}{unit}
                </span>
              </div>

              {/* Trend indicator */}
              <div className="w-6 shrink-0">
                {i > 0 ? (
                  day.tempMax > daily[i - 1].tempMax ? (
                    <TrendingUp size={12} className="text-orange-400" />
                  ) : (
                    <TrendingDown size={12} className="text-blue-400" />
                  )
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}