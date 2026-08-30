'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import type { HourlyForecastPoint, UnitSettings } from '@/types/weather';
import { getDayLabel, formatTemperatureValue, formatHour } from '@/utils/unitConverters';
import { getWmoInfo } from '@/utils/wmoCodeMap';

const HourlyChartInner = dynamic(() => import('./HourlyChartInner'), { ssr: false });

interface HourlyForecastChartProps {
  hourly: HourlyForecastPoint[];
  units: UnitSettings;
  selectedDay: number;
  onDayChange: (day: number) => void;
  dailyDates: string[];
}

export default function HourlyForecastChart({
  hourly,
  units,
  selectedDay,
  onDayChange,
  dailyDates,
}: HourlyForecastChartProps) {
  // Filter hourly data for selected day
  const dayHourly = hourly.filter((h) => {
    const d = new Date(h.time);
    const target = new Date(dailyDates[selectedDay] + 'T00:00:00Z');
    return (
      d.getUTCFullYear() === target.getUTCFullYear() &&
      d.getUTCMonth() === target.getUTCMonth() &&
      d.getUTCDate() === target.getUTCDate()
    );
  });

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Hourly Breakdown</h3>
        <div className="flex items-center gap-1 overflow-x-auto">
          {dailyDates.slice(0, 7).map((date, i) => (
            <button
              key={`hourly-tab-${date}`}
              onClick={() => onDayChange(i)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                selectedDay === i
                  ? 'hourly-tab-active' :'text-muted-foreground hover:text-foreground hover:bg-white/5'
              }`}
            >
              {getDayLabel(date, i)}
            </button>
          ))}
        </div>
      </div>

      {/* Hourly scroll strip */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {dayHourly.map((h, i) => {
          const wmo = getWmoInfo(h.weatherCode);
          const temp = formatTemperatureValue(h.temperature, units.temperature);
          const unit = units.temperature === 'celsius' ? '°' : '°';
          const hour = formatHour(h.time);
          const isNow = i === 12; // approximate "current" hour for demo

          return (
            <div
              key={`hourly-strip-${h.time}`}
              className={`flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl shrink-0 transition-all duration-150 ${
                isNow
                  ? 'bg-primary/20 border border-primary/30' :'bg-white/5 hover:bg-white/10'
              }`}
            >
              <span className={`text-xs font-medium ${isNow ? 'text-primary' : 'text-muted-foreground'}`}>
                {isNow ? 'Now' : hour}
              </span>
              <span className="text-base" aria-hidden="true">{wmo.icon}</span>
              <span className="text-sm font-mono-nums font-semibold text-foreground tabular-nums">
                {temp}{unit}
              </span>
              {h.precipitationProbability > 20 && (
                <span className="text-xs text-blue-400 font-mono-nums">
                  {h.precipitationProbability}%
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="h-[180px]">
        <HourlyChartInner hourly={dayHourly} units={units} />
      </div>
    </div>
  );
}