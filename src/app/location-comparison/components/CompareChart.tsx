'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { DailyForecastDay, UnitSettings } from '@/types/weather';
import { formatTemperatureValue, getDayLabel } from '@/utils/unitConverters';

interface CompareChartProps {
  dataA: DailyForecastDay[];
  dataB: DailyForecastDay[];
  units: UnitSettings;
  nameA: string;
  nameB: string;
}

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="glass-card px-3 py-2.5 shadow-glass text-xs space-y-1.5">
      <p className="text-muted-foreground font-medium mb-1">{label}</p>
      {payload.map((entry) => (
        <div key={`tooltip-${entry.name}`} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-mono-nums font-semibold text-foreground">{entry.value}°</span>
        </div>
      ))}
    </div>
  );
}

export default function CompareChart({ dataA, dataB, units, nameA, nameB }: CompareChartProps) {
  const chartData = dataA.slice(0, 7).map((dayA, i) => {
    const dayB = dataB[i];
    return {
      day: getDayLabel(dayA.date, i),
      [nameA]: formatTemperatureValue(dayA.tempMax, units.temperature),
      [nameB]: dayB ? formatTemperatureValue(dayB.tempMax, units.temperature) : 0,
    };
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }} barGap={4}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={28}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '11px', color: 'var(--muted-foreground)', paddingTop: '8px' }}
        />
        <Bar
          dataKey={nameA}
          fill="var(--primary)"
          radius={[4, 4, 0, 0]}
          maxBarSize={32}
          opacity={0.85}
        />
        <Bar
          dataKey={nameB}
          fill="var(--accent)"
          radius={[4, 4, 0, 0]}
          maxBarSize={32}
          opacity={0.75}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}