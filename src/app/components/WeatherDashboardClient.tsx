'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import SearchBar from './SearchBar';
import FavoritesBar from './FavoritesBar';
import CurrentWeatherHero from './CurrentWeatherHero';
import WeatherMetricsGrid from './WeatherMetricsGrid';
import SunTracker from './SunTracker';
import DailyForecast from './DailyForecast';
import HourlyForecastChart from './HourlyForecastChart';
import WeatherLoadingSkeleton from './WeatherLoadingSkeleton';
import WeatherErrorState from './WeatherErrorState';
import type { WeatherData, UnitSettings, GeocodingResult } from '@/types/weather';
import { getWeatherData, getReverseGeocode } from '@/services/weatherApi';
import { toast } from 'sonner';

const DEFAULT_UNITS: UnitSettings = {
  temperature: 'celsius',
  wind: 'kmh',
  precip: 'mm',
};

const DEFAULT_LOCATION: GeocodingResult = {
  id: 2643743,
  name: 'London',
  latitude: 51.5085,
  longitude: -0.1257,
  country: 'United Kingdom',
  country_code: 'GB',
  admin1: 'England',
  timezone: 'Europe/London',
  population: 7556900,
};

export default function WeatherDashboardClient() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [units, setUnits] = useState<UnitSettings>(DEFAULT_UNITS);
  const [selectedLocation, setSelectedLocation] = useState<GeocodingResult>(DEFAULT_LOCATION);
  const [selectedDay, setSelectedDay] = useState(0);

  const loadUnits = () => {
    try {
      const stored = localStorage.getItem('skypulse_units');
      if (stored) setUnits(JSON.parse(stored));
    } catch {
      // ignore
    }
  };

  const handleUnitsChange = (newUnits: UnitSettings) => {
    setUnits(newUnits);
    try {
      localStorage.setItem('skypulse_units', JSON.stringify(newUnits));
    } catch {
      // ignore
    }
  };

  const fetchWeather = useCallback(async (location: GeocodingResult, isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
      setError(null);
    }
    try {
      // Backend integration: call Open-Meteo API with location.latitude + location.longitude
      const data = await getWeatherData(location);
      setWeatherData(data);
      if (isRefresh) {
        toast.success(`Weather updated for ${location.name}`);
      }
    } catch (err) {
      const msg = 'Failed to load weather data. Check your connection and try again.';
      setError(msg);
      if (isRefresh) toast.error(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleLocationSelect = useCallback(
    (location: GeocodingResult) => {
      setSelectedLocation(location);
      setSelectedDay(0);
      fetchWeather(location);
      toast.success(`Switched to ${location.name}`);
    },
    [fetchWeather]
  );

  const handleRefresh = useCallback(() => {
    fetchWeather(selectedLocation, true);
  }, [fetchWeather, selectedLocation]);

  // Geolocation on mount
  useEffect(() => {
    loadUnits();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            // Backend integration: reverse geocode lat/lon to location
            const loc = await getReverseGeocode(pos.coords.latitude, pos.coords.longitude);
            if (loc) {
              setSelectedLocation(loc);
              fetchWeather(loc);
              return;
            }
          } catch {
            // fall through to default
          }
          fetchWeather(DEFAULT_LOCATION);
        },
        () => {
          fetchWeather(DEFAULT_LOCATION);
        },
        { timeout: 5000 }
      );
    } else {
      fetchWeather(DEFAULT_LOCATION);
    }
  }, [fetchWeather]);

  return (
    <div className="min-h-screen bg-background">
      <Header units={units} onUnitsChange={handleUnitsChange} />

      <main className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 2xl:px-16 py-6 space-y-5">
        {/* Search + Favorites */}
        <div className="space-y-3">
          <SearchBar
            onLocationSelect={handleLocationSelect}
            placeholder="Search any city worldwide..."
          />
          <FavoritesBar
            currentLocation={selectedLocation}
            onLocationSelect={handleLocationSelect}
          />
        </div>

        {/* Main Content */}
        {loading ? (
          <WeatherLoadingSkeleton />
        ) : error ? (
          <WeatherErrorState message={error} onRetry={() => fetchWeather(selectedLocation)} />
        ) : weatherData ? (
          <div className="space-y-4 animate-fade-in-up">
            {/* Hero */}
            <CurrentWeatherHero
              data={weatherData}
              units={units}
              onRefresh={handleRefresh}
              loading={refreshing}
            />

            {/* Metrics Grid */}
            <WeatherMetricsGrid data={weatherData} units={units} />

            {/* Sun Tracker + Additional Info Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <SunTracker sunInfo={weatherData.sunInfo} />

              {/* Today's Summary */}
              <div className="lg:col-span-2 glass-card p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Today&apos;s Summary</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-white/5">
                    <p className="metric-label mb-1">Max Wind Gust</p>
                    <p className="font-mono-nums text-xl font-semibold text-foreground">
                      {weatherData.daily[0].windGusts} km/h
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Max {weatherData.daily[0].windSpeedMax} km/h avg
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5">
                    <p className="metric-label mb-1">Total Precipitation</p>
                    <p className="font-mono-nums text-xl font-semibold text-foreground">
                      {weatherData.daily[0].precipitationSum.toFixed(1)} mm
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {weatherData.daily[0].precipitationProbability}% probability
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5">
                    <p className="metric-label mb-1">Peak UV Index</p>
                    <p
                      className={`font-mono-nums text-xl font-semibold ${
                        weatherData.daily[0].uvIndexMax >= 6 ? 'text-orange-300' : 'text-foreground'
                      }`}
                    >
                      {weatherData.daily[0].uvIndexMax.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {weatherData.daily[0].uvIndexMax >= 8
                        ? 'Very High — use SPF 50+'
                        : weatherData.daily[0].uvIndexMax >= 6
                        ? 'High — sunscreen recommended' :'Moderate — minimal protection'}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5">
                    <p className="metric-label mb-1">Dew Point</p>
                    <p className="font-mono-nums text-xl font-semibold text-foreground">
                      {weatherData.current.dewPoint.toFixed(1)}°C
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {weatherData.current.dewPoint > 20 ? 'Humid — muggy conditions' : 'Comfortable humidity'}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 sm:col-span-2">
                    <p className="metric-label mb-2">Precipitation Outlook</p>
                    <div className="flex items-end gap-1 h-10">
                      {weatherData.daily.map((d, idx) => (
                        <div
                          key={`precip-bar-${d.date}`}
                          className="flex-1 rounded-sm bg-blue-400/60 transition-all duration-300"
                          style={{
                            height: `${Math.max(8, d.precipitationProbability)}%`,
                            opacity: idx === 0 ? 1 : 0.6 - idx * 0.04,
                          }}
                          title={`${d.date}: ${d.precipitationProbability}%`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-muted-foreground">Today</span>
                      <span className="text-xs text-muted-foreground">+7 days</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 7-Day Forecast */}
            <DailyForecast
              daily={weatherData.daily}
              units={units}
              selectedDay={selectedDay}
              onDaySelect={setSelectedDay}
            />

            {/* Hourly Chart */}
            <HourlyForecastChart
              hourly={weatherData.hourly}
              units={units}
              selectedDay={selectedDay}
              onDayChange={setSelectedDay}
              dailyDates={weatherData.daily.map((d) => d.date)}
            />
          </div>
        ) : null}
      </main>
    </div>
  );
}