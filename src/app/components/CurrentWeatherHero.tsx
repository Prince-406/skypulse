'use client';

import React from 'react';
import { RefreshCw, MapPin, Thermometer, Eye } from 'lucide-react';
import type { WeatherData, UnitSettings } from '@/types/weather';
import { getWmoInfo } from '@/utils/wmoCodeMap';
import { formatTemperatureValue,  } from '@/utils/unitConverters';

interface CurrentWeatherHeroProps {
  data: WeatherData;
  units: UnitSettings;
  onRefresh: () => void;
  loading: boolean;
}

export default function CurrentWeatherHero({
  data,
  units,
  onRefresh,
  loading,
}: CurrentWeatherHeroProps) {
  const { current, location, lastUpdated } = data;
  const wmo = getWmoInfo(current.weatherCode);
  const isNight = !current.isDay;

  const bgClass = isNight ? 'bg-weather-night' : wmo.bgClass;

  const tempValue = formatTemperatureValue(current.temperature, units.temperature);
  const feelsValue = formatTemperatureValue(current.feelsLike, units.temperature);
  const highValue = formatTemperatureValue(data.daily[0].tempMax, units.temperature);
  const lowValue = formatTemperatureValue(data.daily[0].tempMin, units.temperature);
  const unit = units.temperature === 'celsius' ? '°C' : '°F';

  const lastUpdatedStr = (() => {
    const d = new Date(lastUpdated);
    const h = d.getUTCHours();
    const m = d.getUTCMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  })();

  return (
    <div
      className={`relative rounded-3xl overflow-hidden ${bgClass} border border-border`}
      style={{ minHeight: '320px' }}
    >
      {/* Animated overlay for rain */}
      {(wmo.category === 'rain' || wmo.category === 'drizzle') && (
        <div className="absolute inset-0 rain-overlay opacity-60 pointer-events-none" />
      )}

      {/* Content */}
      <div className="relative z-10 p-6 lg:p-8 flex flex-col justify-between h-full" style={{ minHeight: '320px' }}>
        {/* Top Row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-white/70 shrink-0" />
            <div>
              <h1 className="text-xl lg:text-2xl font-semibold text-white leading-tight">
                {location.name}
              </h1>
              <p className="text-sm text-white/60 mt-0.5">
                {[location.admin1, location.country].filter(Boolean).join(', ')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="px-2.5 py-1 rounded-full text-xs font-medium text-white/90"
              style={{ background: `${wmo.accentColor}30`, border: `1px solid ${wmo.accentColor}50` }}
            >
              {wmo.label}
            </span>
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all duration-150 active:scale-95"
              aria-label="Refresh weather data"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Main Temperature */}
        <div className="flex items-end justify-between mt-4">
          <div>
            <div className="flex items-start gap-2">
              <span
                className="font-mono-nums font-bold text-white leading-none tabular-nums"
                style={{ fontSize: 'clamp(64px, 10vw, 96px)' }}
              >
                {tempValue}
              </span>
              <span className="text-3xl lg:text-4xl font-medium text-white/70 mt-2">{unit}</span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1 text-white/70 text-sm">
                <Thermometer size={13} />
                <span>Feels {feelsValue}{unit}</span>
              </div>
              <span className="text-white/30">·</span>
              <span className="text-white/70 text-sm font-mono-nums">
                H:{highValue}{unit} L:{lowValue}{unit}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {/* Large Weather Icon */}
            <span
              className="animate-float select-none"
              style={{ fontSize: 'clamp(48px, 8vw, 80px)' }}
              aria-label={wmo.label}
            >
              {isNight && current.weatherCode === 0 ? '🌙' : wmo.icon}
            </span>

            {/* Cloud Cover */}
            <div className="flex items-center gap-1 text-white/50 text-xs">
              <Eye size={11} />
              <span>{current.cloudCover}% cloud cover</span>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="pulse-dot" />
            <span className="text-xs text-white/50">Updated {lastUpdatedStr}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-white/50">
            <span>{location.timezone?.replace('_', ' ')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}