'use client';

import { useState, useEffect } from 'react';
import { CalendarDays, Globe, MapPin, Moon, Plus, Minus } from 'lucide-react';
import MonthlyCalendar from './MonthlyCalendar';
import LocationPicker from './LocationPicker';
import { resolveHijri, ResolvedLocation } from '../lib/hijri';
import { CITIES, City } from '../lib/locations';
import { useLocationState, locationLabel } from '../lib/useLocationState';

const banglaCalendar = require('bangla-calendar');

interface CalendarDisplayProps {
  // Required: an internal fallback would mount a SECOND location state machine, duplicating
  // the geolocation request and the localStorage reads on every load.
  locationState: ReturnType<typeof useLocationState>;
}

export default function CalendarDisplay({ locationState }: CalendarDisplayProps) {
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
  } = locationState;

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

    // English. Device-local on purpose: the Hijri and Bengali lines below both read
    // device-local Date fields (hijri.ts is deliberately Intl-free for Safari 10), so
    // formatting this one in location.tz would let the three lines disagree by a day.
    const enOptions: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    try {
      setEnglishDate(today.toLocaleDateString('en-US', enOptions));
    } catch (e) {
      setEnglishDate(today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    }

    // Bengali
    try {
      const bnDate = banglaCalendar.getDate(today);
      setBengaliDate(bnDate);
    } catch (err) {
      setBengaliDate('Unavailable');
    }

    // Hijri — shared resolver: region offset + Maghrib rollover + manual sighting adjustment.
    const result = resolveHijri({ now: today, location: location, manualOffset: hijriOffset, applyRollover: true });
    setHijriDateStr(result.text);
    setRolledOver(result.rolledOver);
  }, [hijriOffset, isLoaded, location, tick]);

  return (
    <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 gap-4 md:gap-6 mt-2 md:mt-4 px-2 sm:px-4 md:px-6 lg:px-8">
      {/* --- MOBILE/TABLET COMPACT VIEW --- */}
      <div className="md:hidden flex flex-col space-y-3 bg-[#111] border border-white/10 rounded-3xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-emerald-400 to-orange-400 opacity-70"></div>

        {/* Gregorian Row */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400 shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <p className="text-lg font-medium text-white/90 truncate">{englishDate}</p>
        </div>

        {/* Hijri Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400 shrink-0">
              <Moon className="w-5 h-5" />
            </div>
            <p className="text-lg font-medium text-white/90 truncate">{hijriDateStr}</p>
            {rolledOver && <span className="text-[10px] text-emerald-400/70 shrink-0 whitespace-nowrap">· after Maghrib</span>}
          </div>
          <div className="flex items-center bg-white/10 rounded-lg p-0.5 border border-white/10 shrink-0 ml-2" title="Local sighting adjustment">
            <button onClick={() => updateOffset(hijriOffset - 1)} className="p-1 hover:bg-white/20 rounded-md text-white/60">
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-xs font-mono w-6 text-center text-white/80">{hijriOffset}</span>
            <button onClick={() => updateOffset(hijriOffset + 1)} className="p-1 hover:bg-white/20 rounded-md text-white/60">
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Bengali Row */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-500/20 rounded-xl text-orange-400 shrink-0">
            <CalendarDays className="w-5 h-5" />
          </div>
          <p className="text-lg font-medium text-white/90 truncate">{bengaliDate}</p>
        </div>

        <div className="flex flex-col space-y-1 pt-2 border-t border-white/5 mt-1">
          <div className="flex items-center space-x-2 text-[10px] text-white/40">
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="flex items-center space-x-1 min-w-0 hover:text-white/70 transition-colors"
              title="Change location"
            >
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{locationLabel(location)}</span>
            </button>
            {location.source === 'city' && (
              <button type="button" onClick={clearLocation} className="underline hover:text-white/70 shrink-0">Auto</button>
            )}
          </div>
          <p className="text-[10px] text-white/30">Calculated; may differ from your local moon-sighting committee.</p>
        </div>
      </div>

      {/* --- DESKTOP EXPANDED CARDS --- */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {/* English Card */}
        <div className="group relative overflow-hidden rounded-3xl bg-[#111] border border-white/10 p-5 lg:p-8 transition-all hover:bg-[#1a1a1a] hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.2)]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-70"></div>
          <div className="flex items-center space-x-3 md:space-x-4 mb-4 md:mb-6">
            <div className="p-2 md:p-3 bg-blue-500/20 rounded-xl text-blue-400">
              <Globe className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-white/90 tracking-wide uppercase">Gregorian</h2>
          </div>
          <p className="text-xl sm:text-2xl md:text-3xl font-medium text-white/80 leading-snug break-words">
            {englishDate}
          </p>
        </div>

        {/* Hijri Card */}
        <div className="group relative overflow-hidden rounded-3xl bg-[#111] border border-white/10 p-5 lg:p-8 transition-all hover:bg-[#1a1a1a] hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.2)]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-70"></div>
          <div className="flex justify-between items-start mb-4 md:mb-6">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="p-2 md:p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
                <Moon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-white/90 tracking-wide uppercase">Hijri</h2>
            </div>

            <div className="flex items-center bg-white/10 rounded-lg p-1 border border-white/10 shrink-0 ml-2" title="Local sighting adjustment">
              <button
                onClick={() => updateOffset(hijriOffset - 1)}
                className="p-1 hover:bg-white/20 rounded-md transition-colors text-white/60 hover:text-white"
                title="Local sighting adjustment −1 day"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono w-8 text-center text-white/80">
                {hijriOffset > 0 ? `+${hijriOffset}` : hijriOffset}
              </span>
              <button
                onClick={() => updateOffset(hijriOffset + 1)}
                className="p-1 hover:bg-white/20 rounded-md transition-colors text-white/60 hover:text-white"
                title="Local sighting adjustment +1 day"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p className="text-xl sm:text-2xl md:text-3xl font-medium text-white/80 leading-snug mb-3 md:mb-4 break-words">
            {hijriDateStr}
            {rolledOver && <span className="ml-2 text-xs md:text-sm font-normal text-emerald-400/70 whitespace-nowrap">· after Maghrib</span>}
          </p>

          <div className="flex items-center space-x-2 text-xs md:text-sm text-white/50">
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="flex items-center space-x-1.5 min-w-0 hover:text-white/80 transition-colors"
              title="Change location"
            >
              <MapPin className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
              <span className="truncate">{locationLabel(location)}</span>
            </button>
            {location.source === 'city' && (
              <button type="button" onClick={clearLocation} className="underline hover:text-white/80 shrink-0">Auto</button>
            )}
          </div>
          <p className="mt-2 text-[11px] md:text-xs text-white/30">Calculated; may differ from your local moon-sighting committee.</p>
        </div>

        {/* Bengali Card */}
        <div className="md:col-span-2 xl:col-span-1 group relative overflow-hidden rounded-3xl bg-[#111] border border-white/10 p-5 lg:p-8 transition-all hover:bg-[#1a1a1a] hover:shadow-[0_0_40px_-10px_rgba(245,158,11,0.2)]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-amber-500 opacity-70"></div>
          <div className="flex items-center space-x-3 md:space-x-4 mb-4 md:mb-6">
            <div className="p-2 md:p-3 bg-orange-500/20 rounded-xl text-orange-400">
              <CalendarDays className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-white/90 tracking-wide uppercase">Bengali</h2>
          </div>
          <p className="text-xl sm:text-2xl md:text-3xl font-medium text-white/80 leading-snug break-words">
            {bengaliDate}
          </p>
        </div>
      </div>

      {/* Monthly Calendar Section */}
      <div className="mt-2 md:mt-6">
        <MonthlyCalendar location={location} manualOffset={hijriOffset} />
      </div>

      {/* Location picker modal */}
      {pickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 animate-in fade-in duration-200" onClick={() => setPickerOpen(false)}>
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
