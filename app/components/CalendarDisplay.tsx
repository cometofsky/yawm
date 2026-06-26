'use client';

import { useState, useEffect } from 'react';
import { CalendarDays, Globe, MapPin, Moon, Plus, Minus } from 'lucide-react';
import MonthlyCalendar from './MonthlyCalendar';
import { formatHijri } from '../lib/umalqura';

const banglaCalendar = require('bangla-calendar');

// Date no longer depends on location — Umm al-Qura is computed offline. Geolocation is used only to
// flag the timezone label as GPS-confirmed; failure never affects the date.
type LocationStatus = 'local' | 'geolocation';

export default function CalendarDisplay() {
  const [hijriDateStr, setHijriDateStr] = useState<string>('Calculating...');
  const [bengaliDate, setBengaliDate] = useState<string>('Calculating...');
  const [englishDate, setEnglishDate] = useState<string>('Calculating...');
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('local');
  const [locationName, setLocationName] = useState<string>('');

  const [hijriOffset, setHijriOffset] = useState<number>(0);
  const [isOffsetLoaded, setIsOffsetLoaded] = useState<boolean>(false);

  // Load offset from localStorage on mount
  useEffect(() => {
    try {
      const savedOffset = localStorage.getItem('hijriOffset');
      if (savedOffset) {
        setHijriOffset(parseInt(savedOffset, 10));
      }
    } catch (e) {
      console.warn('localStorage unavailable');
    }
    setIsOffsetLoaded(true);
  }, []);

  const updateOffset = (newOffset: number) => {
    setHijriOffset(newOffset);
    try {
      localStorage.setItem('hijriOffset', newOffset.toString());
    } catch (e) {
      // skip
    }
  };

  // All three dates are computed synchronously and offline. Re-runs only when the manual offset changes.
  useEffect(() => {
    if (!isOffsetLoaded) return;

    const today = new Date();

    // English
    const enOptions: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    setEnglishDate(today.toLocaleDateString('en-US', enOptions));

    // Bengali
    try {
      const bnDate = banglaCalendar.getDate(today);
      setBengaliDate(bnDate);
    } catch (err) {
      setBengaliDate('Unavailable');
    }

    // Hijri — offline Umm al-Qura, shifted by the manual moon-sighting offset
    const target = new Date();
    target.setDate(target.getDate() + hijriOffset);
    setHijriDateStr(formatHijri(target));

    // Informational location label (timezone). Available offline, no permission needed.
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) setLocationName(tz);
    } catch (e) {
      // ignore — label is optional
    }
  }, [hijriOffset, isOffsetLoaded]);

  // Optional, non-blocking GPS confirmation for the label only — never touches the date.
  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      () => setLocationStatus('geolocation'),
      () => { /* stay 'local'; the date is unaffected */ },
      { timeout: 10000, maximumAge: 600000 }
    );
  }, []);

  const totalGridOffset = hijriOffset;

  return (
    <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 gap-6 mt-6 md:mt-12 px-2 sm:px-4 md:px-6 lg:px-8">
      
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
          </div>
          <div className="flex items-center bg-white/10 rounded-lg p-0.5 border border-white/10 shrink-0 ml-2">
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
        
        <div className="flex items-center space-x-2 text-[10px] text-white/40 pt-2 border-t border-white/5 mt-1">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">
            {locationName ? (locationStatus === 'geolocation' ? `${locationName} (GPS)` : locationName) : 'Local time'}
          </span>
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
            
            <div className="flex items-center bg-white/10 rounded-lg p-1 border border-white/10 shrink-0 ml-2">
              <button 
                onClick={() => updateOffset(hijriOffset - 1)}
                className="p-1 hover:bg-white/20 rounded-md transition-colors text-white/60 hover:text-white"
                title="Shift date -1 day"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono w-8 text-center text-white/80">
                {hijriOffset > 0 ? `+${hijriOffset}` : hijriOffset}
              </span>
              <button 
                onClick={() => updateOffset(hijriOffset + 1)}
                className="p-1 hover:bg-white/20 rounded-md transition-colors text-white/60 hover:text-white"
                title="Shift date +1 day"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <p className="text-xl sm:text-2xl md:text-3xl font-medium text-white/80 leading-snug mb-3 md:mb-4 break-words">
            {hijriDateStr}
          </p>
          
          <div className="flex items-center space-x-2 text-xs md:text-sm text-white/50">
            <MapPin className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
            <span>
              {locationName ? (locationStatus === 'geolocation' ? `${locationName} (GPS)` : locationName) : 'Local time'}
            </span>
          </div>
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
        <MonthlyCalendar hijriOffset={totalGridOffset} />
      </div>

    </div>
  );
}
