import type {
  GeocodingResult,
  WeatherData,
  HourlyForecastPoint,
  DailyForecastDay,
} from '@/types/weather';

// Backend integration point: Replace mock data with real Open-Meteo API calls
// Geocoding: https://geocoding-api.open-meteo.com/v1/search?name={query}&count=8&language=en&format=json
// Weather: https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&...

export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  // Backend integration: GET https://geocoding-api.open-meteo.com/v1/search
  if (!query || query.length < 2) return [];

  const mockResults: GeocodingResult[] = [
    {
      id: 2643743,
      name: 'London',
      latitude: 51.5085,
      longitude: -0.1257,
      country: 'United Kingdom',
      country_code: 'GB',
      admin1: 'England',
      timezone: 'Europe/London',
      population: 7556900,
    },
    {
      id: 5128581,
      name: 'New York City',
      latitude: 40.7128,
      longitude: -74.006,
      country: 'United States',
      country_code: 'US',
      admin1: 'New York',
      timezone: 'America/New_York',
      population: 8336817,
    },
    {
      id: 1850147,
      name: 'Tokyo',
      latitude: 35.6895,
      longitude: 139.6917,
      country: 'Japan',
      country_code: 'JP',
      admin1: 'Tokyo',
      timezone: 'Asia/Tokyo',
      population: 13960000,
    },
    {
      id: 2988507,
      name: 'Paris',
      latitude: 48.8534,
      longitude: 2.3488,
      country: 'France',
      country_code: 'FR',
      admin1: 'Île-de-France',
      timezone: 'Europe/Paris',
      population: 2138551,
    },
    {
      id: 2147714,
      name: 'Sydney',
      latitude: -33.8678,
      longitude: 151.2073,
      country: 'Australia',
      country_code: 'AU',
      admin1: 'New South Wales',
      timezone: 'Australia/Sydney',
      population: 4627345,
    },
    {
      id: 1275339,
      name: 'Mumbai',
      latitude: 19.0144,
      longitude: 72.8479,
      country: 'India',
      country_code: 'IN',
      admin1: 'Maharashtra',
      timezone: 'Asia/Kolkata',
      population: 12691836,
    },
    {
      id: 360630,
      name: 'Cairo',
      latitude: 30.0626,
      longitude: 31.2497,
      country: 'Egypt',
      country_code: 'EG',
      admin1: 'Cairo',
      timezone: 'Africa/Cairo',
      population: 7734614,
    },
    {
      id: 3448439,
      name: 'São Paulo',
      latitude: -23.5489,
      longitude: -46.6388,
      country: 'Brazil',
      country_code: 'BR',
      admin1: 'São Paulo',
      timezone: 'America/Sao_Paulo',
      population: 10021295,
    },
  ].filter(
    (r) =>
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.country.toLowerCase().includes(query.toLowerCase()) ||
      (r.admin1 ?? '').toLowerCase().includes(query.toLowerCase())
  );

  return mockResults.slice(0, 6);
}

export async function getWeatherData(location: GeocodingResult): Promise<WeatherData> {
  // Backend integration: GET https://api.open-meteo.com/v1/forecast
  // params: latitude, longitude, current, hourly, daily, timezone, forecast_days=7

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Generate mock hourly data for 7 days
  const hourlyData: HourlyForecastPoint[] = [];
  const baseTemp = getBaseTemp(location.name);

  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const date = new Date(now);
      date.setDate(date.getDate() + day);
      date.setHours(hour, 0, 0, 0);
      const tempVariation = Math.sin((hour - 6) * (Math.PI / 12)) * 8;
      const dayVariation = [0, -2, 1, -1, 3, -3, 2][day];
      hourlyData.push({
        time: date.toISOString(),
        temperature: Math.round(baseTemp + tempVariation + dayVariation),
        feelsLike: Math.round(baseTemp + tempVariation + dayVariation - 2),
        precipitation: hour >= 14 && hour <= 17 && day % 3 === 1 ? 1.2 : 0,
        precipitationProbability: hour >= 12 && hour <= 18 && day % 3 === 1 ? 65 : 10,
        weatherCode: hour >= 14 && hour <= 17 && day % 3 === 1 ? 61 : hour >= 8 ? 1 : 0,
        windSpeed: 12 + Math.sin(hour * 0.3) * 6,
        humidity: 55 + Math.sin(hour * 0.2) * 20,
        uvIndex: hour >= 8 && hour <= 18 ? Math.max(0, 8 * Math.sin(((hour - 6) * Math.PI) / 12)) : 0,
        visibility: 9.5 + Math.sin(hour * 0.1) * 2,
        isDay: hour >= 6 && hour <= 20 ? 1 : 0,
      });
    }
  }

  // Generate daily forecast
  const dailyData: DailyForecastDay[] = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const dayVar = [0, -3, 2, -1, 4, -2, 1][i];
    const codes = [0, 1, 2, 61, 3, 0, 2];
    return {
      date: dateStr,
      tempMax: baseTemp + 7 + dayVar,
      tempMin: baseTemp - 5 + dayVar,
      precipitationSum: i === 3 ? 8.4 : i === 5 ? 2.1 : 0,
      precipitationProbability: [10, 15, 30, 75, 20, 40, 15][i],
      weatherCode: codes[i],
      sunrise: `${dateStr}T06:${24 + i}:00`,
      sunset: `${dateStr}T19:${48 - i * 2}:00`,
      uvIndexMax: [7, 8, 5, 3, 9, 6, 8][i],
      windSpeedMax: [18, 22, 15, 28, 12, 20, 16][i],
      windGusts: [28, 35, 22, 45, 18, 30, 24][i],
    };
  });

  const weather: WeatherData = {
    location,
    current: {
      temperature: baseTemp + 3,
      feelsLike: baseTemp + 1,
      humidity: 62,
      windSpeed: 18,
      windDirection: 245,
      precipitation: 0,
      uvIndex: 7,
      visibility: 9.8,
      pressure: 1013,
      weatherCode: 1,
      isDay: true,
      cloudCover: 20,
      dewPoint: baseTemp - 8,
    },
    hourly: hourlyData,
    daily: dailyData,
    sunInfo: {
      sunrise: `${todayStr}T06:24:00`,
      sunset: `${todayStr}T19:48:00`,
      currentTime: now.toISOString(),
      daylightDuration: 13 * 60 + 24,
    },
    lastUpdated: now.toISOString(),
  };

  return weather;
}

function getBaseTemp(locationName: string): number {
  const tempMap: Record<string, number> = {
    London: 14,
    'New York City': 18,
    Tokyo: 22,
    Paris: 16,
    Sydney: 19,
    Mumbai: 31,
    Cairo: 34,
    'São Paulo': 24,
  };
  return tempMap[locationName] ?? 20;
}

export async function getReverseGeocode(lat: number, lon: number): Promise<GeocodingResult | null> {
  // Backend integration: Use reverse geocoding API or nearest city lookup
  return {
    id: 999999,
    name: 'Current Location',
    latitude: lat,
    longitude: lon,
    country: 'Auto-detected',
    country_code: 'XX',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    admin1: 'Local',
  };
}