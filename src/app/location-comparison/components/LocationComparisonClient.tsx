'use client';

import React, { useState, useCallback } from 'react';
import Header from '@/components/Header';
import SearchBar from '@/app/components/SearchBar';
import type { WeatherData, UnitSettings, GeocodingResult } from '@/types/weather';
import { getWeatherData } from '@/services/weatherApi';
import { toast } from 'sonner';
import { getWmoInfo, getUvLabel, getWindDirection } from '@/utils/wmoCodeMap';
import { formatTemperature, formatTemperatureValue, formatWind, formatVisibility, getDayLabel,  } from '@/utils/unitConverters';
import { Thermometer, Droplets, Wind, Eye, Sun, Gauge, ArrowUp, ArrowDown, Minus, MapPin, BarChart2, RefreshCw,  } from 'lucide-react';
import dynamic from 'next/dynamic';

const CompareChart = dynamic(() => import('./CompareChart'), { ssr: false });

const DEFAULT_UNITS: UnitSettings = {
  temperature: 'celsius',
  wind: 'kmh',
  precip: 'mm',
};

const PRESET_LOCATIONS: { name: string; country: string; country_code: string } [] = [
  { name: 'New York City', country: 'United States', country_code: 'US' },
  { name: 'Tokyo', country: 'Japan', country_code: 'JP' },
  { name: 'London', country: 'United Kingdom', country_code: 'GB' },
  { name: 'Sydney', country: 'Australia', country_code: 'AU' },
  { name: 'Dubai', country: 'UAE', country_code: 'AE' },
  { name: 'Paris', country: 'France', country_code: 'FR' },
];

function getFlagEmoji(code: string): string {
  if (!code || code.length !== 2) return '🌍';
  const codePoints = code.toUpperCase().split('').map((c) => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

interface DiffBadgeProps {
  a: number;
  b: number;
  unit: string;
  higherIsBetter?: boolean;
}

function DiffBadge({ a, b, unit, higherIsBetter = true }: DiffBadgeProps) {
  const diff = a - b;
  if (Math.abs(diff) < 0.5) {
    return (
      <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
        <Minus size={10} />
        <span>Equal</span>
      </div>
    );
  }
  const aIsBetter = higherIsBetter ? diff > 0 : diff < 0;
  return (
    <div className={`flex items-center gap-0.5 text-xs font-mono-nums ${aIsBetter ? 'text-green-400' : 'text-red-400'}`}>
      {diff > 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
      <span>{Math.abs(diff).toFixed(1)}{unit}</span>
    </div>
  );
}

export default function LocationComparisonClient() {
  const [units] = useState<UnitSettings>(DEFAULT_UNITS);
  const [weatherA, setWeatherA] = useState<WeatherData | null>(null);
  const [weatherB, setWeatherB] = useState<WeatherData | null>(null);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);
  const [errorA, setErrorA] = useState<string | null>(null);
  const [errorB, setErrorB] = useState<string | null>(null);

  const loadWeatherA = useCallback(async (loc: GeocodingResult) => {
    setLoadingA(true);
    setErrorA(null);
    try {
      const data = await getWeatherData(loc);
      setWeatherA(data);
      toast.success(`Loaded weather for ${loc.name}`);
    } catch {
      setErrorA(`Failed to load weather for ${loc.name}`);
    } finally {
      setLoadingA(false);
    }
  }, []);

  const loadWeatherB = useCallback(async (loc: GeocodingResult) => {
    setLoadingB(true);
    setErrorB(null);
    try {
      const data = await getWeatherData(loc);
      setWeatherB(data);
      toast.success(`Loaded weather for ${loc.name}`);
    } catch {
      setErrorB(`Failed to load weather for ${loc.name}`);
    } finally {
      setLoadingB(false);
    }
  }, []);

  const handlePresetA = (name: string) => {
    const presets: Record<string, GeocodingResult> = {
      'New York City': { id: 5128581, name: 'New York City', latitude: 40.7128, longitude: -74.006, country: 'United States', country_code: 'US', admin1: 'New York', timezone: 'America/New_York' },
      'London': { id: 2643743, name: 'London', latitude: 51.5085, longitude: -0.1257, country: 'United Kingdom', country_code: 'GB', admin1: 'England', timezone: 'Europe/London' },
      'Tokyo': { id: 1850147, name: 'Tokyo', latitude: 35.6895, longitude: 139.6917, country: 'Japan', country_code: 'JP', admin1: 'Tokyo', timezone: 'Asia/Tokyo' },
      'Sydney': { id: 2147714, name: 'Sydney', latitude: -33.8678, longitude: 151.2073, country: 'Australia', country_code: 'AU', admin1: 'New South Wales', timezone: 'Australia/Sydney' },
      'Paris': { id: 2988507, name: 'Paris', latitude: 48.8534, longitude: 2.3488, country: 'France', country_code: 'FR', admin1: 'Île-de-France', timezone: 'Europe/Paris' },
    };
    const loc = presets[name];
    if (loc) loadWeatherA(loc);
  };

  const handlePresetB = (name: string) => {
    const presets: Record<string, GeocodingResult> = {
      'New York City': { id: 5128581, name: 'New York City', latitude: 40.7128, longitude: -74.006, country: 'United States', country_code: 'US', admin1: 'New York', timezone: 'America/New_York' },
      'London': { id: 2643743, name: 'London', latitude: 51.5085, longitude: -0.1257, country: 'United Kingdom', country_code: 'GB', admin1: 'England', timezone: 'Europe/London' },
      'Tokyo': { id: 1850147, name: 'Tokyo', latitude: 35.6895, longitude: 139.6917, country: 'Japan', country_code: 'JP', admin1: 'Tokyo', timezone: 'Asia/Tokyo' },
      'Sydney': { id: 2147714, name: 'Sydney', latitude: -33.8678, longitude: 151.2073, country: 'Australia', country_code: 'AU', admin1: 'NewSouth Wales', timezone: 'Australia/Sydney' },
      'Paris': { id: 2988507, name: 'Paris', latitude: 48.8534, longitude: 2.3488, country: 'France', country_code: 'FR', admin1: 'Île-de-France', timezone: 'Europe/Paris' },
      'Mumbai': { id: 1275339, name: 'Mumbai', latitude: 19.0144, longitude: 72.8479, country: 'India', country_code: 'IN', admin1: 'Maharashtra', timezone: 'Asia/Kolkata' },
    };
    const loc = presets[name];
    if (loc) loadWeatherB(loc);
  };

  const metrics = weatherA && weatherB ? [
    {
      id: 'temperature',
      label: 'Temperature',
      icon: <Thermometer size={14} />,
      valA: formatTemperature(weatherA.current.temperature, units.temperature),
      valB: formatTemperature(weatherB.current.temperature, units.temperature),
      numA: formatTemperatureValue(weatherA.current.temperature, units.temperature),
      numB: formatTemperatureValue(weatherB.current.temperature, units.temperature),
      unit: units.temperature === 'celsius' ? '°C' : '°F',
      higherIsBetter: false,
    },
    {
      id: 'feels-like',
      label: 'Feels Like',
      icon: <Thermometer size={14} />,
      valA: formatTemperature(weatherA.current.feelsLike, units.temperature),
      valB: formatTemperature(weatherB.current.feelsLike, units.temperature),
      numA: formatTemperatureValue(weatherA.current.feelsLike, units.temperature),
      numB: formatTemperatureValue(weatherB.current.feelsLike, units.temperature),
      unit: units.temperature === 'celsius' ? '°C' : '°F',
      higherIsBetter: false,
    },
    {
      id: 'humidity',
      label: 'Humidity',
      icon: <Droplets size={14} />,
      valA: `${weatherA.current.humidity}%`,
      valB: `${weatherB.current.humidity}%`,
      numA: weatherA.current.humidity,
      numB: weatherB.current.humidity,
      unit: '%',
      higherIsBetter: false,
    },
    {
      id: 'wind',
      label: 'Wind Speed',
      icon: <Wind size={14} />,
      valA: formatWind(weatherA.current.windSpeed, units.wind),
      valB: formatWind(weatherB.current.windSpeed, units.wind),
      numA: weatherA.current.windSpeed,
      numB: weatherB.current.windSpeed,
      unit: units.wind === 'kmh' ? ' km/h' : ' mph',
      higherIsBetter: false,
    },
    {
      id: 'visibility',
      label: 'Visibility',
      icon: <Eye size={14} />,
      valA: formatVisibility(weatherA.current.visibility, units.wind),
      valB: formatVisibility(weatherB.current.visibility, units.wind),
      numA: weatherA.current.visibility,
      numB: weatherB.current.visibility,
      unit: units.wind === 'kmh' ? ' km' : ' mi',
      higherIsBetter: true,
    },
    {
      id: 'uv',
      label: 'UV Index',
      icon: <Sun size={14} />,
      valA: weatherA.current.uvIndex.toFixed(1),
      valB: weatherB.current.uvIndex.toFixed(1),
      numA: weatherA.current.uvIndex,
      numB: weatherB.current.uvIndex,
      unit: '',
      higherIsBetter: false,
    },
    {
      id: 'pressure',
      label: 'Air Pressure',
      icon: <Gauge size={14} />,
      valA: `${weatherA.current.pressure} hPa`,
      valB: `${weatherB.current.pressure} hPa`,
      numA: weatherA.current.pressure,
      numB: weatherB.current.pressure,
      unit: ' hPa',
      higherIsBetter: true,
    },
  ] : [];

  return (
    <div className="min-h-screen bg-background">
      <Header units={units} onUnitsChange={() => {}} />

      <main className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 2xl:px-16 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2.5 mb-1">
            <BarChart2 size={20} className="text-accent" />
            <h1 className="text-2xl font-semibold text-foreground">Compare Locations</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Select two cities to compare current conditions, forecasts, and meteorological metrics side by side.
          </p>
        </div>

        {/* Preset Quick-Pick */}
        <div className="glass-card p-4 mb-6">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Quick-pick popular cities
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESET_LOCATIONS.map((p) => (
              <div key={`preset-${p.name}`} className="flex items-center gap-1">
                <button
                  onClick={() => handlePresetA(p.name)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium glass border border-border text-secondary-foreground hover:border-primary/40 hover:text-primary transition-all duration-150"
                  title={`Load ${p.name} as City A`}
                >
                  {getFlagEmoji(p.country_code)} {p.name} → A
                </button>
                <button
                  onClick={() => handlePresetB(p.name)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium glass border border-border text-secondary-foreground hover:border-accent/40 hover:text-accent transition-all duration-150"
                  title={`Load ${p.name} as City B`}
                >
                  → B
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Dual Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* City A */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-sm font-semibold text-foreground">City A</span>
            </div>
            <SearchBar
              onLocationSelect={loadWeatherA}
              placeholder="Search City A..."
              compact
            />
            <CityWeatherCard
              data={weatherA}
              loading={loadingA}
              error={errorA}
              units={units}
              colorClass="compare-card-a"
              accentColor="text-primary"
              onRefresh={weatherA ? () => loadWeatherA(weatherA.location) : undefined}
            />
          </div>

          {/* City B */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <span className="text-sm font-semibold text-foreground">City B</span>
            </div>
            <SearchBar
              onLocationSelect={loadWeatherB}
              placeholder="Search City B..."
              compact
            />
            <CityWeatherCard
              data={weatherB}
              loading={loadingB}
              error={errorB}
              units={units}
              colorClass="compare-card-b"
              accentColor="text-accent"
              onRefresh={weatherB ? () => loadWeatherB(weatherB.location) : undefined}
            />
          </div>
        </div>

        {/* Metrics Comparison Table */}
        {weatherA && weatherB && (
          <div className="glass-card p-5 mb-6 animate-fade-in-up">
            <h2 className="text-sm font-semibold text-foreground mb-4">Side-by-Side Metrics</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 text-xs text-muted-foreground font-medium uppercase tracking-wide w-1/4">
                      Metric
                    </th>
                    <th className="text-center py-2 px-4 text-xs font-medium w-1/4">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-foreground">{weatherA.location.name}</span>
                      </div>
                    </th>
                    <th className="text-center py-2 px-4 text-xs text-muted-foreground font-medium uppercase tracking-wide w-1/4">
                      Difference
                    </th>
                    <th className="text-center py-2 pl-4 text-xs font-medium w-1/4">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-accent" />
                        <span className="text-foreground">{weatherB.location.name}</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((m) => {
                    const aWins = m.higherIsBetter ? m.numA > m.numB : m.numA < m.numB;
                    const bWins = m.higherIsBetter ? m.numB > m.numA : m.numB < m.numA;
                    return (
                      <tr
                        key={`compare-metric-${m.id}`}
                        className="border-b border-border/50 hover:bg-white/5 transition-colors duration-100"
                      >
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            {m.icon}
                            <span className="text-xs font-medium">{m.label}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`font-mono-nums text-sm font-semibold tabular-nums ${
                              aWins ? 'text-green-400' : bWins ? 'text-red-400' : 'text-foreground'
                            }`}
                          >
                            {m.valA}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center">
                            <DiffBadge
                              a={m.numA}
                              b={m.numB}
                              unit={m.unit}
                              higherIsBetter={m.higherIsBetter}
                            />
                          </div>
                        </td>
                        <td className="py-3 pl-4 text-center">
                          <span
                            className={`font-mono-nums text-sm font-semibold tabular-nums ${
                              bWins ? 'text-green-400' : aWins ? 'text-red-400' : 'text-foreground'
                            }`}
                          >
                            {m.valB}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Compare Chart */}
        {weatherA && weatherB && (
          <div className="glass-card p-5 mb-6 animate-fade-in-up">
            <h2 className="text-sm font-semibold text-foreground mb-1">7-Day Temperature Comparison</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Daily high temperatures for {weatherA.location.name} vs {weatherB.location.name}
            </p>
            <div className="h-[240px]">
              <CompareChart dataA={weatherA.daily} dataB={weatherB.daily} units={units} nameA={weatherA.location.name} nameB={weatherB.location.name} />
            </div>
          </div>
        )}

        {/* 7-Day Forecast strips side by side */}
        {weatherA && weatherB && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in-up">
            <MiniDailyForecast data={weatherA} units={units} accent="primary" />
            <MiniDailyForecast data={weatherB} units={units} accent="accent" />
          </div>
        )}

        {/* Empty state when neither loaded */}
        {!weatherA && !weatherB && !loadingA && !loadingB && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <BarChart2 size={28} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No cities selected yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
              Search for two cities above or use the quick-pick presets to start comparing weather conditions side by side.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handlePresetA('London')}
                className="btn-primary text-sm"
              >
                Load London as A
              </button>
              <button
                onClick={() => handlePresetB('Tokyo')}
                className="btn-ghost text-sm border border-border"
              >
                Load Tokyo as B
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ─── City Weather Card ───────────────────────────────────────────────────────

interface CityWeatherCardProps {
  data: WeatherData | null;
  loading: boolean;
  error: string | null;
  units: UnitSettings;
  colorClass: string;
  accentColor: string;
  onRefresh?: () => void;
}

function CityWeatherCard({
  data,
  loading,
  error,
  units,
  colorClass,
  accentColor,
  onRefresh,
}: CityWeatherCardProps) {
  if (loading) {
    return (
      <div className="glass-card p-6 animate-pulse space-y-4">
        <div className="h-6 bg-muted rounded-lg w-1/2" />
        <div className="h-16 bg-muted rounded-xl" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={`city-card-skel-${i + 1}`} className="h-16 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6 border-red-500/20">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="glass-card p-8 flex flex-col items-center justify-center text-center border-dashed">
        <MapPin size={24} className="text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">Search for a city to load its weather</p>
      </div>
    );
  }

  const wmo = getWmoInfo(data.current.weatherCode);
  const uvInfo = getUvLabel(data.current.uvIndex);
  const windDir = getWindDirection(data.current.windDirection);

  return (
    <div className={`glass-card p-5 ${colorClass} space-y-4`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-lg">{getFlagEmoji(data.location.country_code)}</span>
            <h2 className="text-lg font-semibold text-foreground">{data.location.name}</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            {[data.location.admin1, data.location.country].filter(Boolean).join(', ')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ background: `${wmo.accentColor}20`, color: wmo.accentColor, border: `1px solid ${wmo.accentColor}40` }}
          >
            {wmo.label}
          </span>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all duration-150"
              aria-label="Refresh"
            >
              <RefreshCw size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Temperature Hero */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5">
        <div>
          <div className="flex items-end gap-1">
            <span className={`font-mono-nums text-5xl font-bold tabular-nums ${accentColor}`}>
              {formatTemperatureValue(data.current.temperature, units.temperature)}
            </span>
            <span className="text-2xl text-muted-foreground mb-1">
              {units.temperature === 'celsius' ? '°C' : '°F'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Feels {formatTemperature(data.current.feelsLike, units.temperature)} ·{' '}
            H:{formatTemperatureValue(data.daily[0].tempMax, units.temperature)}°{' '}
            L:{formatTemperatureValue(data.daily[0].tempMin, units.temperature)}°
          </p>
        </div>
        <span className="text-5xl animate-float" aria-hidden="true">
          {data.current.isDay ? wmo.icon : '🌙'}
        </span>
      </div>

      {/* Mini Metrics Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-xl bg-white/5">
          <p className="metric-label mb-1">Humidity</p>
          <p className="font-mono-nums text-base font-semibold text-foreground tabular-nums">
            {data.current.humidity}%
          </p>
        </div>
        <div className="p-3 rounded-xl bg-white/5">
          <p className="metric-label mb-1">Wind</p>
          <p className="font-mono-nums text-base font-semibold text-foreground tabular-nums">
            {formatWind(data.current.windSpeed, units.wind)}
          </p>
          <p className="text-xs text-muted-foreground">{windDir}</p>
        </div>
        <div className="p-3 rounded-xl bg-white/5">
          <p className="metric-label mb-1">UV Index</p>
          <p className={`font-mono-nums text-base font-semibold tabular-nums ${uvInfo.color}`}>
            {data.current.uvIndex.toFixed(1)} — {uvInfo.label}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-white/5">
          <p className="metric-label mb-1">Visibility</p>
          <p className="font-mono-nums text-base font-semibold text-foreground tabular-nums">
            {formatVisibility(data.current.visibility, units.wind)}
          </p>
        </div>
      </div>

      {/* Pressure */}
      <div className="p-3 rounded-xl bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <Gauge size={13} />
          <span>Pressure</span>
        </div>
        <span className="font-mono-nums text-sm font-semibold text-foreground tabular-nums">
          {data.current.pressure} hPa
        </span>
      </div>
    </div>
  );
}

// ─── Mini Daily Forecast ─────────────────────────────────────────────────────

interface MiniDailyForecastProps {
  data: WeatherData;
  units: UnitSettings;
  accent: 'primary' | 'accent';
}

function MiniDailyForecast({ data, units, accent }: MiniDailyForecastProps) {
  const accentClass = accent === 'primary' ? 'text-primary' : 'text-accent';
  const dotClass = accent === 'primary' ? 'bg-primary' : 'bg-accent';

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-2 h-2 rounded-full ${dotClass}`} />
        <h3 className="text-sm font-semibold text-foreground">
          {data.location.name} — 7-Day
        </h3>
      </div>
      <div className="space-y-2">
        {data.daily.map((day, i) => {
          const wmo = getWmoInfo(day.weatherCode);
          const maxVal = formatTemperatureValue(day.tempMax, units.temperature);
          const minVal = formatTemperatureValue(day.tempMin, units.temperature);
          const unit = units.temperature === 'celsius' ? '°' : '°';
          return (
            <div
              key={`mini-daily-${data.location.name}-${day.date}`}
              className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors duration-100"
            >
              <span className="text-xs text-muted-foreground w-14 shrink-0">
                {getDayLabel(day.date, i)}
              </span>
              <span className="text-sm shrink-0" aria-hidden="true">{wmo.icon}</span>
              <div className="flex-1 flex items-center gap-2 min-w-0">
                <span className="text-xs text-muted-foreground font-mono-nums w-8 text-right">
                  {minVal}{unit}
                </span>
                <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, Math.max(20, ((day.tempMax - day.tempMin + 5) / 20) * 100))}%`,
                      background: accent === 'primary' ?'linear-gradient(90deg, #6366f1, #a5b4fc)' :'linear-gradient(90deg, #22d3ee, #67e8f9)',
                    }}
                  />
                </div>
                <span className={`text-xs font-mono-nums font-semibold w-8 ${accentClass}`}>
                  {maxVal}{unit}
                </span>
              </div>
              {day.precipitationProbability > 20 && (
                <span className="text-xs text-blue-400 font-mono-nums w-8 text-right shrink-0">
                  {day.precipitationProbability}%
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}