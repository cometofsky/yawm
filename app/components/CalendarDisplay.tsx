'use client';

import { useState, useEffect } from 'react';
import { CalendarDays, Globe, MapPin, Moon, Plus, Minus } from 'lucide-react';
import MonthlyCalendar from './MonthlyCalendar';
import LocationPicker from './LocationPicker';
import { resolveHijri } from '../lib/hijri';
import { CITIES, City } from '../lib/locations';
import { useLocationState, locationLabel } from '../lib/useLocationState';

const banglaCalendar = require('bangla-calendar');

interface CalendarDisplayProps {
  locationState?: ReturnType<typeof useLocationState>;
}

export default function CalendarDisplay({ locationState: externalState }: CalendarDisplayProps) {
  const internalState = useLocationState();
  const state = externalState || internalState;

  const {
    location,
    selectedCity,
    recents,
    pickerOpen,
    setPickerOpen,
    hijriOffset,
    updateOffset,
    handleSelectCity,
    clearLocation,
    isLoaded,
  } = state;

  const [hijriDateStr, setHijriDateStr] = useState<string>('Calculating...');
  const [bengaliDate, setBengaliDate] = useState<string>('Calculating...');
  const [englishDate, setEnglishDate] = useState<string>('Calculating...');
  const [rolledOver, setRolledOver] = useState<boolean>(false);
  const [tick, setTick] = useState<number>(0);

  // Re-evaluate dates once a minute so an always-on display rolls over at midnight and Maghrib.
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  // Headline dates — computed offline. Hijri goes through the shared resolver (with Maghrib rollover).
  useEffect(() => {
    if (!isLoaded) return;

    const today = new Date();

    // English
    const enOptions: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: location.tz || undefined,
    };
    try {
      setEnglishDate(today.toLocaleDateString('en-US', enOptions));
    } catch (e) {
      setEnglishDate(
        today.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );
    }

    // Bengali
    try {
      const bnDate = banglaCalendar.getDate(today);
      setBengaliDate(bnDate);
    } catch (err) {
      setBengaliDate('Unavailable');
    }

    // Hijri — shared resolver: region offset + Maghrib rollover + manual sighting adjustment.
    const result = resolveHijri({
      now: today,
      location: location,
      manualOffset: hijriOffset,
      applyRollover: true,
    });
    setHijriDateStr(result.text);
    setRolledOver(result.rolledOver);
  }, [hijriOffset, isLoaded, location, tick]);

  return (
    <div className="w-full grid grid-cols-1 gap-4 md:gap-5">
      {/* 3 Calendar Cards: Gregorian, Hijri, Bengali */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
        {/* Gregorian Card */}
        <div className="relative group overflow-hidden rounded-3xl bg-[#121212] border border-white/10 p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-70"></div>
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-blue-500/15 rounded-xl text-blue-400">
              <Globe className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-semibold text-white/90 tracking-wider uppercase">
              Gregorian
            </h2>
          </div>
          <p className="text-xl sm:text-2xl font-semibold text-white/90 leading-snug break-words">
            {englishDate}
          </p>
        </div>

        {/* Hijri Card */}
        <div className="relative group overflow-hidden rounded-3xl bg-[#121212] border border-white/10 p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-70"></div>
          <div>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-500/15 rounded-xl text-emerald-400">
                  <Moon className="w-5 h-5" />
                </div>
                <h2 className="text-sm font-semibold text-white/90 tracking-wider uppercase">
                  Hijri
                </h2>
              </div>

              {/* Offset adjuster */}
              <div
                className="flex items-center bg-white/10 rounded-lg p-0.5 border border-white/10"
                title="Local sighting adjustment"
              >
                <button
                  type="button"
                  onClick={() => updateOffset(hijriOffset - 1)}
                  className="p-1 hover:bg-white/20 rounded-md transition-colors text-white/60 hover:text-white"
                  title="−1 day"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-mono w-6 text-center text-white/80">
                  {hijriOffset > 0 ? `+${hijriOffset}` : hijriOffset}
                </span>
                <button
                  type="button"
                  onClick={() => updateOffset(hijriOffset + 1)}
                  className="p-1 hover:bg-white/20 rounded-md transition-colors text-white/60 hover:text-white"
                  title="+1 day"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-xl sm:text-2xl font-semibold text-white/90 leading-snug break-words">
              {hijriDateStr}
              {rolledOver && (
                <span className="ml-1.5 text-xs font-normal text-emerald-400/80 whitespace-nowrap">
                  · after Maghrib
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs text-white/50 mt-3 pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="flex items-center space-x-1.5 min-w-0 hover:text-white/80 transition-colors"
              title="Change location"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{locationLabel(location)}</span>
            </button>
            {location.source === 'city' && (
              <button
                type="button"
                onClick={clearLocation}
                className="underline hover:text-white/80 shrink-0 ml-1"
              >
                Auto
              </button>
            )}
          </div>
        </div>

        {/* Bengali Card */}
        <div className="relative group overflow-hidden rounded-3xl bg-[#121212] border border-white/10 p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-amber-500 opacity-70"></div>
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-orange-500/15 rounded-xl text-orange-400">
              <CalendarDays className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-semibold text-white/90 tracking-wider uppercase">
              Bengali
            </h2>
          </div>
          <p className="text-xl sm:text-2xl font-semibold text-white/90 leading-snug break-words">
            {bengaliDate}
          </p>
        </div>
      </div>

      {/* Monthly Calendar Section */}
      <div className="mt-1">
        <MonthlyCalendar location={location} manualOffset={hijriOffset} />
      </div>

      {/* Location picker modal */}
      {pickerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 animate-in fade-in duration-200"
          onClick={() => setPickerOpen(false)}
        >
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md">
            <LocationPicker
              cities={CITIES}
              value={selectedCity}
              recents={recents}
              onSelect={handleSelectCity}
              onClose={() => setPickerOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
