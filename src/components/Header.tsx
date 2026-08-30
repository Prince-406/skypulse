'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import { Wind, BarChart3, ChevronDown, Check, Menu, X } from 'lucide-react';
import type { UnitSettings } from '@/types/weather';

interface HeaderProps {
  units: UnitSettings;
  onUnitsChange: (units: UnitSettings) => void;
}

export default function Header({ units, onUnitsChange }: HeaderProps) {
  const [unitMenuOpen, setUnitMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Dashboard', icon: Wind },
    { href: '/location-comparison', label: 'Compare', icon: BarChart3 },
  ];

  return (
    <header className="glass sticky top-0 z-50 border-b border-border">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 2xl:px-16">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <AppLogo size={32} />
            <span className="font-semibold text-lg tracking-tight gradient-text hidden sm:block">
              SkyPulse
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={`nav-${link.href}`}
                href={link.href}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-secondary-foreground hover:text-foreground hover:bg-white/5 transition-all duration-150"
              >
                <link.icon size={15} />
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Unit Switcher */}
            <div className="relative">
              <button
                onClick={() => setUnitMenuOpen((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass border border-border text-sm font-medium text-foreground hover:border-primary/40 transition-all duration-150 focus-ring"
                aria-label="Switch units"
                aria-expanded={unitMenuOpen}
              >
                <span className="font-mono-nums text-accent">
                  {units.temperature === 'celsius' ? '°C' : '°F'}
                </span>
                <span className="text-muted-foreground">/</span>
                <span className="text-muted-foreground text-xs">
                  {units.wind === 'kmh' ? 'km/h' : 'mph'}
                </span>
                <ChevronDown
                  size={12}
                  className={`text-muted-foreground transition-transform duration-150 ${unitMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {unitMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 glass-card shadow-glass-lg z-50 animate-slide-down overflow-hidden">
                  <div className="p-3 border-b border-border">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Temperature
                    </p>
                    <div className="flex gap-2 mt-2">
                      {(['celsius', 'fahrenheit'] as const).map((u) => (
                        <button
                          key={`temp-unit-${u}`}
                          onClick={() => {
                            onUnitsChange({ ...units, temperature: u });
                          }}
                          className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                            units.temperature === u
                              ? 'bg-primary/20 text-primary border border-primary/30' :'text-muted-foreground hover:text-foreground hover:bg-white/5'
                          }`}
                        >
                          {u === 'celsius' ? '°C Celsius' : '°F Fahrenheit'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 border-b border-border">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Wind Speed
                    </p>
                    <div className="flex gap-2 mt-2">
                      {(['kmh', 'mph'] as const).map((u) => (
                        <button
                          key={`wind-unit-${u}`}
                          onClick={() => {
                            onUnitsChange({ ...units, wind: u });
                          }}
                          className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                            units.wind === u
                              ? 'bg-primary/20 text-primary border border-primary/30' :'text-muted-foreground hover:text-foreground hover:bg-white/5'
                          }`}
                        >
                          {u === 'kmh' ? 'km/h' : 'mph'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Precipitation
                    </p>
                    <div className="flex gap-2 mt-2">
                      {(['mm', 'inch'] as const).map((u) => (
                        <button
                          key={`precip-unit-${u}`}
                          onClick={() => {
                            onUnitsChange({ ...units, precip: u });
                            setUnitMenuOpen(false);
                          }}
                          className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                            units.precip === u
                              ? 'bg-primary/20 text-primary border border-primary/30' :'text-muted-foreground hover:text-foreground hover:bg-white/5'
                          }`}
                        >
                          {u === 'mm' ? 'mm' : 'inches'}
                          {units.precip === u && <Check size={12} className="inline ml-1" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="md:hidden btn-ghost p-2"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-3 animate-slide-down">
            {navLinks.map((link) => (
              <Link
                key={`mobile-nav-${link.href}`}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-secondary-foreground hover:text-foreground hover:bg-white/5 transition-all duration-150"
              >
                <link.icon size={16} />
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {unitMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setUnitMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );
}