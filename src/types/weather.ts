export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  country_code: string;
  admin1?: string;
  admin2?: string;
  timezone: string;
  population?: number;
}

export interface CurrentWeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  precipitation: number;
  uvIndex: number;
  visibility: number;
  pressure: number;
  weatherCode: number;
  isDay: boolean;
  cloudCover: number;
  dewPoint: number;
}

export interface HourlyForecastPoint {
  time: string;
  temperature: number;
  feelsLike: number;
  precipitation: number;
  precipitationProbability: number;
  weatherCode: number;
  windSpeed: number;
  humidity: number;
  uvIndex: number;
  visibility: number;
  isDay: number;
}

export interface DailyForecastDay {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
  precipitationProbability: number;
  weatherCode: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
  windSpeedMax: number;
  windGusts: number;
}

export interface SunInfo {
  sunrise: string;
  sunset: string;
  currentTime: string;
  daylightDuration: number;
}

export interface WeatherData {
  location: GeocodingResult;
  current: CurrentWeatherData;
  hourly: HourlyForecastPoint[];
  daily: DailyForecastDay[];
  sunInfo: SunInfo;
  lastUpdated: string;
}

export type WeatherConditionCategory =
  | 'clear' |'partly-cloudy' |'cloudy' |'fog' |'drizzle' |'rain' |'snow' |'storm' |'hail';

export interface WmoCodeInfo {
  label: string;
  category: WeatherConditionCategory;
  icon: string;
  bgClass: string;
  accentColor: string;
}

export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type WindUnit = 'kmh' | 'mph';
export type PrecipUnit = 'mm' | 'inch';

export interface UnitSettings {
  temperature: TemperatureUnit;
  wind: WindUnit;
  precip: PrecipUnit;
}

export interface SavedLocation {
  id: string;
  name: string;
  country: string;
  country_code: string;
  latitude: number;
  longitude: number;
  timezone: string;
  pinnedAt: string;
}

export interface CompareWeatherState {
  locationA: WeatherData | null;
  locationB: WeatherData | null;
  loadingA: boolean;
  loadingB: boolean;
  errorA: string | null;
  errorB: string | null;
}