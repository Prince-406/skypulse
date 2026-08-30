'use client';

import React, { useState, useEffect } from 'react';
import { Star, X, MapPin, Plus } from 'lucide-react';
import type { GeocodingResult, SavedLocation } from '@/types/weather';
import { toast } from 'sonner';

interface FavoritesBarProps {
  currentLocation: GeocodingResult | null;
  onLocationSelect: (location: GeocodingResult) => void;
}

const STORAGE_KEY = 'skypulse_favorites';

const DEFAULT_FAVORITES: SavedLocation[] = [
  {
    id: 'fav-2643743',
    name: 'London',
    country: 'United Kingdom',
    country_code: 'GB',
    latitude: 51.5085,
    longitude: -0.1257,
    timezone: 'Europe/London',
    pinnedAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'fav-1850147',
    name: 'Tokyo',
    country: 'Japan',
    country_code: 'JP',
    latitude: 35.6895,
    longitude: 139.6917,
    timezone: 'Asia/Tokyo',
    pinnedAt: '2026-08-05T10:00:00Z',
  },
  {
    id: 'fav-2988507',
    name: 'Paris',
    country: 'France',
    country_code: 'FR',
    latitude: 48.8534,
    longitude: 2.3488,
    timezone: 'Europe/Paris',
    pinnedAt: '2026-08-10T14:00:00Z',
  },
  {
    id: 'fav-2147714',
    name: 'Sydney',
    country: 'Australia',
    country_code: 'AU',
    latitude: -33.8678,
    longitude: 151.2073,
    timezone: 'Australia/Sydney',
    pinnedAt: '2026-08-15T09:00:00Z',
  },
];

export default function FavoritesBar({ currentLocation, onLocationSelect }: FavoritesBarProps) {
  const [favorites, setFavorites] = useState<SavedLocation[]>(DEFAULT_FAVORITES);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch {
      // ignore parse errors
    }
    setLoaded(true);
  }, []);

  const saveToStorage = (faves: SavedLocation[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(faves));
    } catch {
      // ignore storage errors
    }
  };

  const isCurrentLocationSaved = currentLocation
    ? favorites.some((f) => f.name === currentLocation.name)
    : false;

  const handleAddCurrent = () => {
    if (!currentLocation || isCurrentLocationSaved) return;
    const newFav: SavedLocation = {
      id: `fav-${currentLocation.id}`,
      name: currentLocation.name,
      country: currentLocation.country,
      country_code: currentLocation.country_code,
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      timezone: currentLocation.timezone,
      pinnedAt: new Date().toISOString(),
    };
    const updated = [...favorites, newFav];
    setFavorites(updated);
    saveToStorage(updated);
    toast.success(`${currentLocation.name} added to favorites`);
  };

  const handleRemove = (id: string, name: string) => {
    const updated = favorites.filter((f) => f.id !== id);
    setFavorites(updated);
    saveToStorage(updated);
    toast.success(`${name} removed from favorites`);
  };

  const handleSelect = (fav: SavedLocation) => {
    onLocationSelect({
      id: parseInt(fav.id.replace('fav-', '')) || 0,
      name: fav.name,
      country: fav.country,
      country_code: fav.country_code,
      latitude: fav.latitude,
      longitude: fav.longitude,
      timezone: fav.timezone,
    });
  };

  if (!loaded) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <div className="flex items-center gap-1 shrink-0">
        <Star size={13} className="text-yellow-400" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">
          Saved
        </span>
      </div>

      <div className="flex items-center gap-2 flex-1 overflow-x-auto">
        {favorites.map((fav) => {
          const isActive = currentLocation?.name === fav.name;
          return (
            <div
              key={fav.id}
              className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-primary/20 border-primary/40 text-primary' :'glass border-border text-secondary-foreground hover:text-foreground hover:border-border/60'
              }`}
              onClick={() => handleSelect(fav)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleSelect(fav)}
            >
              <span className="text-xs">{getFlagEmoji(fav.country_code)}</span>
              <span>{fav.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(fav.id, fav.name);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 ml-0.5 hover:text-red-400"
                aria-label={`Remove ${fav.name} from favorites`}
              >
                <X size={11} />
              </button>
            </div>
          );
        })}
      </div>

      {currentLocation && !isCurrentLocationSaved && (
        <button
          onClick={handleAddCurrent}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-dashed border-border text-xs font-medium text-muted-foreground hover:text-accent hover:border-accent/40 transition-all duration-150 whitespace-nowrap"
          aria-label={`Save ${currentLocation.name} to favorites`}
        >
          <Plus size={11} />
          <MapPin size={11} />
          Save {currentLocation.name}
        </button>
      )}
    </div>
  );
}

function getFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '🌍';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((c) => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}