'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,  } from 'recharts';
import type { HourlyForecastPoint, UnitSettings } from '@/types/weather';
import { formatTemperatureValue, formatHour } from '@/utils/unitConverters';

interface HourlyChartInnerProps {
  hourly: HourlyForecastPoint[];
  units: UnitSettings;
}

interface TooltipPayload {
  value: number;
  dataKey: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const unit = payload[0]?.dataKey === 'precip' ? 'mm' : '°';
  return (
    <div className="glass-card px-3 py-2 shadow-glass text-xs">
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="font-mono-nums font-semibold text-foreground">
        {payload[0]?.value}{unit}
      </p>
    </div>
  );
}

export default function HourlyChartInner({ hourly, units }: HourlyChartInnerProps) {
  const chartData = hourly.map((h) => ({
    time: formatHour(h.time),
    temp: formatTemperatureValue(h.temperature, units.temperature),
    feelsLike: formatTemperatureValue(h.feelsLike, units.temperature),
    precip: parseFloat(h.precipitation.toFixed(1)),
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="feelsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.2} />
            <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.01} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="time"
          tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          interval={3}
        />
        <YAxis
          tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          width={32}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="temp"
          stroke="var(--primary)"
          strokeWidth={2}
          fill="url(#tempGrad)"
          dot={false}
          activeDot={{ r: 4, fill: 'var(--primary)', strokeWidth: 0 }}
        />
        <Area
          type="monotone"
          dataKey="feelsLike"
          stroke="var(--accent)"
          strokeWidth={1.5}
          strokeDasharray="4 2"
          fill="url(#feelsGrad)"
          dot={false}
          activeDot={{ r: 3, fill: 'var(--accent)', strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}