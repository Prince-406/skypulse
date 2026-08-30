import React from 'react';

export default function WeatherLoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Hero skeleton */}
      <div className="rounded-3xl bg-muted h-[320px] w-full" />

      {/* Metrics grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={`metric-skel-${i + 1}`} className="rounded-2xl bg-muted h-28" />
        ))}
      </div>

      {/* Sun tracker + bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-muted h-52" />
        <div className="lg:col-span-2 rounded-2xl bg-muted h-52" />
      </div>

      {/* Forecast skeleton */}
      <div className="rounded-2xl bg-muted h-72" />

      {/* Hourly skeleton */}
      <div className="rounded-2xl bg-muted h-64" />
    </div>
  );
}