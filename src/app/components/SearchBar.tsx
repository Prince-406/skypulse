'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Search, Mic, MicOff, MapPin, Loader2, X } from 'lucide-react';
import { searchLocations } from '@/services/weatherApi';
import type { GeocodingResult } from '@/types/weather';

interface SearchBarProps {
  onLocationSelect: (location: GeocodingResult) => void;
  placeholder?: string;
  compact?: boolean;
}

export default function SearchBar({
  onLocationSelect,
  placeholder = 'Search city or location...',
  compact = false,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const handleSearch = useCallback(async (value: string) => {
    if (value.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }
    setLoading(true);
    try {
      // Backend integration: debounced call to geocoding API
      const data = await searchLocations(value);
      setResults(data);
      setShowResults(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setActiveIndex(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(val), 350);
  };

  const handleSelect = (location: GeocodingResult) => {
    setQuery(`${location.name}, ${location.country}`);
    setShowResults(false);
    setResults([]);
    onLocationSelect(location);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(results[activeIndex]);
    } else if (e.key === 'Escape') {
      setShowResults(false);
    }
  };

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SpeechRecognitionAPI =
      (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      handleSearch(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="relative w-full">
      <div
        className={`flex items-center gap-2 glass border border-border rounded-2xl transition-all duration-200 focus-within:border-primary/50 focus-within:shadow-glow-primary ${
          compact ? 'px-3 py-2' : 'px-4 py-3'
        }`}
      >
        {loading ? (
          <Loader2 size={16} className="text-muted-foreground shrink-0 animate-spin" />
        ) : (
          <Search size={16} className="text-muted-foreground shrink-0" />
        )}

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder={placeholder}
          className={`flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none ${
            compact ? 'text-sm' : 'text-base'
          }`}
          aria-label="Search location"
          aria-autocomplete="list"
          aria-expanded={showResults}
          role="combobox"
          autoComplete="off"
        />

        {query && (
          <button
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground transition-colors duration-150 shrink-0"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}

        <button
          onClick={handleVoiceSearch}
          className={`shrink-0 p-1.5 rounded-lg transition-all duration-150 ${
            isListening
              ? 'bg-red-500/20 text-red-400 animate-pulse' :'text-muted-foreground hover:text-accent hover:bg-accent/10'
          }`}
          aria-label={isListening ? 'Stop voice search' : 'Start voice search'}
          title={isListening ? 'Listening... tap to stop' : 'Voice search'}
        >
          {isListening ? <MicOff size={15} /> : <Mic size={15} />}
        </button>
      </div>

      {/* Autocomplete Dropdown */}
      {showResults && results.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-2 glass-card shadow-glass-lg z-50 overflow-hidden animate-slide-down"
          role="listbox"
          aria-label="Search suggestions"
        >
          {results.map((result, idx) => (
            <button
              key={`search-result-${result.id}`}
              role="option"
              aria-selected={idx === activeIndex}
              onClick={() => handleSelect(result)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-100 border-b border-border last:border-0 ${
                idx === activeIndex
                  ? 'bg-primary/10 text-foreground'
                  : 'hover:bg-white/5 text-foreground'
              }`}
            >
              <MapPin size={14} className="text-accent shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium truncate block">{result.name}</span>
                <span className="text-xs text-muted-foreground truncate block">
                  {[result.admin1, result.country].filter(Boolean).join(', ')}
                </span>
              </div>
              {result.population && (
                <span className="text-xs text-muted-foreground shrink-0 font-mono-nums">
                  {result.population > 1_000_000
                    ? `${(result.population / 1_000_000).toFixed(1)}M`
                    : `${Math.round(result.population / 1000)}K`}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {showResults && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-card shadow-glass z-50 px-4 py-6 text-center animate-slide-down">
          <MapPin size={24} className="text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No locations found for &ldquo;{query}&rdquo;</p>
          <p className="text-xs text-muted-foreground mt-1">Try a different city name or country</p>
        </div>
      )}

      {/* Click outside */}
      {showResults && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}