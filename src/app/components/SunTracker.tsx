'use client';

import React from 'react';
import { Sunrise, Sunset, Clock } from 'lucide-react';
import type { SunInfo } from '@/types/weather';

interface SunTrackerProps {
  sunInfo: SunInfo;
}

export default function SunTracker({ sunInfo }: SunTrackerProps) {
  const parseUTCTime = (iso: string) => {
    const d = new Date(iso);
    return { h: d.getUTCHours(), m: d.getUTCMinutes() };
  };

  const toMinutes = (h: number, m: number) => h * 60 + m;

  const sunrise = parseUTCTime(sunInfo.sunrise);
  const sunset = parseUTCTime(sunInfo.sunset);
  const now = parseUTCTime(sunInfo.currentTime);

  const sunriseMin = toMinutes(sunrise.h, sunrise.m);
  const sunsetMin = toMinutes(sunset.h, sunset.m);
  const nowMin = toMinutes(now.h, now.m);

  const totalDaylight = sunsetMin - sunriseMin;
  const elapsed = Math.max(0, Math.min(nowMin - sunriseMin, totalDaylight));
  const progress = totalDaylight > 0 ? elapsed / totalDaylight : 0;

  // Arc path: semicircle from left to right
  const W = 280;
  const H = 120;
  const cx = W / 2;
  const cy = H;
  const r = 100;

  // Sun position along arc
  const angle = Math.PI - progress * Math.PI; // from left (sunrise) to right (sunset)
  const sunX = cx + r * Math.cos(angle);
  const sunY = cy + r * Math.sin(angle);

  const isDay = progress > 0 && progress < 1;

  const formatT = (h: number, m: number) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  const daylightH = Math.floor(sunInfo.daylightDuration / 60);
  const daylightM = sunInfo.daylightDuration % 60;

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Sun Position</h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock size={12} />
          <span>{daylightH}h {daylightM}m daylight</span>
        </div>
      </div>

      {/* SVG Arc */}
      <div className="flex justify-center mb-4">
        <svg
          width="100%"
          viewBox={`0 0 ${W} ${H + 20}`}
          preserveAspectRatio="xMidYMid meet"
          aria-label={`Sun arc showing ${Math.round(progress * 100)}% through the day`}
        >
          {/* Gradient definition */}
          <defs>
            <linearGradient id="sunArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
              <stop offset={`${progress * 100}%`} stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset={`${progress * 100}%`} stopColor="rgba(255,255,255,0.1)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.05)" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="horizonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(99,102,241,0.1)" />
              <stop offset="50%" stopColor="rgba(34,211,238,0.15)" />
              <stop offset="100%" stopColor="rgba(99,102,241,0.1)" />
            </linearGradient>
          </defs>

          {/* Horizon line */}
          <line
            x1="20"
            y1={cy}
            x2={W - 20}
            y2={cy}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Arc track (full) */}
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="2"
          />

          {/* Arc progress */}
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${sunX} ${sunY}`}
            fill="none"
            stroke="url(#sunArcGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Glow fill under arc */}
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${sunX} ${sunY} L ${sunX} ${cy} Z`}
            fill="url(#horizonGrad)"
            opacity="0.4"
          />

          {/* Sun dot */}
          {isDay && (
            <>
              <circle cx={sunX} cy={sunY} r="12" fill="rgba(245,158,11,0.15)" />
              <circle cx={sunX} cy={sunY} r="7" fill="#f59e0b" />
              <circle cx={sunX} cy={sunY} r="4" fill="#fde68a" />
            </>
          )}

          {/* Sunrise marker */}
          <circle cx={cx - r} cy={cy} r="3" fill="rgba(245,158,11,0.5)" />
          <text x={cx - r} y={cy + 14} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">
            {formatT(sunrise.h, sunrise.m)}
          </text>

          {/* Sunset marker */}
          <circle cx={cx + r} cy={cy} r="3" fill="rgba(245,158,11,0.3)" />
          <text x={cx + r} y={cy + 14} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">
            {formatT(sunset.h, sunset.m)}
          </text>
        </svg>
      </div>

      {/* Times Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/5">
          <Sunrise size={16} className="text-yellow-400 shrink-0" />
          <div>
            <p className="metric-label">Sunrise</p>
            <p className="text-sm font-mono-nums font-semibold text-foreground mt-0.5">
              {formatT(sunrise.h, sunrise.m)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/5">
          <Sunset size={16} className="text-orange-400 shrink-0" />
          <div>
            <p className="metric-label">Sunset</p>
            <p className="text-sm font-mono-nums font-semibold text-foreground mt-0.5">
              {formatT(sunset.h, sunset.m)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}