'use client';

import React from 'react';
import {
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  Sun,
  Eye,
  Gauge,
  Activity,
} from 'lucide-react';
import type { WeatherData, UnitSettings } from '@/types/weather';
import { getUvLabel, getWindDirection, getVisibilityLabel } from '@/utils/wmoCodeMap';
import {
  formatTemperature,
  formatWind,
  formatPrecip,
  formatVisibility,
} from '@/utils/unitConverters';

interface WeatherMetricsGridProps {
  data: WeatherData;
  units: UnitSettings;
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
  accentClass?: string;
  alert?: boolean;
  children?: React.ReactNode;
}

function MetricCard({
  icon,
  label,
  value,
  subtext,
  accentClass = 'text-accent',
  alert = false,
  children,
}: MetricCardProps) {
  return (
    <div
      className={`glass-card p-4 metric-card-hover ${
        alert ? 'border-orange-500/30 bg-orange-500/5' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="metric-label">{label}</span>
        <span className={`${alert ? 'text-orange-400' : accentClass}`}>{icon}</span>
      </div>
      <div className={`font-mono-nums text-2xl font-semibold tabular-nums ${alert ? 'text-orange-300' : 'text-foreground'}`}>
        {value}
      </div>
      {subtext && (
        <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
      )}
      {children}
    </div>
  );
}

export default function WeatherMetricsGrid({ data, units }: WeatherMetricsGridProps) {
  const { current } = data;
  const uvInfo = getUvLabel(current.uvIndex);
  const windDir = getWindDirection(current.windDirection);
  const visLabel = getVisibilityLabel(current.visibility);

  const isUvHigh = current.uvIndex >= 6;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-3">
      {/* Feels Like */}
      <MetricCard
        icon={<Thermometer size={16} />}
        label="Feels Like"
        value={formatTemperature(current.feelsLike, units.temperature)}
        subtext={
          current.feelsLike < current.temperature
            ? `${Math.abs(Math.round(current.temperature - current.feelsLike))}° colder than actual`
            : `${Math.abs(Math.round(current.feelsLike - current.temperature))}° warmer than actual`
        }
        accentClass="text-orange-400"
      />

      {/* Humidity */}
      <MetricCard
        icon={<Droplets size={16} />}
        label="Humidity"
        value={`${current.humidity}%`}
        subtext={`Dew point ${formatTemperature(current.dewPoint, units.temperature)}`}
        accentClass="text-blue-400"
      >
        <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-400/70 transition-all duration-500"
            style={{ width: `${current.humidity}%` }}
          />
        </div>
      </MetricCard>

      {/* Wind */}
      <MetricCard
        icon={<Wind size={16} />}
        label="Wind Speed"
        value={formatWind(current.windSpeed, units.wind)}
        subtext={`Direction: ${windDir} (${current.windDirection}°)`}
        accentClass="text-cyan-400"
      />

      {/* Precipitation */}
      <MetricCard
        icon={<CloudRain size={16} />}
        label="Precipitation"
        value={formatPrecip(current.precipitation, units.precip)}
        subtext={`${data.daily[0].precipitationProbability}% chance today`}
        accentClass="text-blue-300"
      />

      {/* UV Index */}
      <MetricCard
        icon={<Sun size={16} />}
        label="UV Index"
        value={`${current.uvIndex.toFixed(1)}`}
        subtext={uvInfo.label}
        alert={isUvHigh}
        accentClass={uvInfo.color}
      >
        <div className="mt-2 flex gap-0.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((level) => (
            <div
              key={`uv-bar-${level}`}
              className="flex-1 h-1.5 rounded-sm transition-all duration-300"
              style={{
                background:
                  level <= current.uvIndex
                    ? level <= 2
                      ? '#22c55e'
                      : level <= 5
                      ? '#eab308'
                      : level <= 7
                      ? '#f97316'
                      : level <= 10
                      ? '#ef4444' :'#7c3aed' :'rgba(255,255,255,0.08)',
              }}
            />
          ))}
        </div>
      </MetricCard>

      {/* Visibility */}
      <MetricCard
        icon={<Eye size={16} />}
        label="Visibility"
        value={formatVisibility(current.visibility, units.wind)}
        subtext={visLabel}
        accentClass="text-purple-400"
      />

      {/* Pressure */}
      <MetricCard
        icon={<Gauge size={16} />}
        label="Air Pressure"
        value={`${current.pressure}`}
        subtext="hPa — Normal range"
        accentClass="text-indigo-400"
      >
        <div className="mt-2 flex items-center gap-1">
          <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-indigo-400/70"
              style={{ width: `${Math.min(100, Math.max(0, ((current.pressure - 960) / 80) * 100))}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground font-mono-nums">
            {current.pressure < 1000 ? '↓ Low' : current.pressure > 1020 ? '↑ High' : '→ Steady'}
          </span>
        </div>
      </MetricCard>

      {/* Cloud Cover */}
      <MetricCard
        icon={<Activity size={16} />}
        label="Cloud Cover"
        value={`${current.cloudCover}%`}
        subtext={
          current.cloudCover < 20
            ? 'Clear skies'
            : current.cloudCover < 50
            ? 'Partly cloudy'
            : current.cloudCover < 80
            ? 'Mostly cloudy' :'Overcast'
        }
        accentClass="text-slate-400"
      >
        <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-slate-400/60 transition-all duration-500"
            style={{ width: `${current.cloudCover}%` }}
          />
        </div>
      </MetricCard>
    </div>
  );
}