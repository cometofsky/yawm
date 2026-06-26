'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { CalendarDays, Globe, MapPin, Moon, Plus, Minus } from 'lucide-react';
import MonthlyCalendar from './MonthlyCalendar';
import LocationPicker from './LocationPicker';
import { resolveHijri, ResolvedLocation } from '../lib/hijri';
import { CITIES, nearestCity, cityByTimezone, City } from '../lib/locations';

const banglaCalendar = require('bangla-calendar');

const NONE_LOCATION: ResolvedLocation = { name: '', country: '', lat: null, lon: null, tz: null, source: 'none' };

// Honest label per location source (see spec). All date math stays in resolveHijri.
function locationLabel(loc: ResolvedLocation): string {
  switch (loc.source) {
    case 'gps': return loc.name + ' (GPS)';
    case 'city': return loc.name + ', ' + loc.country;
    case 'timezone': return loc.name + ' · approx';
    default: return 'Umm al-Qura (Saudi)';
  }
}

export default function CalendarDisplay() {
  const [hijriDateStr, setHijriDateStr] = useState<string>('Calculating...');
  const [bengaliDate, setBengaliDate] = useState<string>('Calculating...');
  const [englishDate, setEnglishDate] = useState<string>('Calculating...');
  const [rolledOver, setRolledOver] = useState<boolean>(false);

  const [location, setLocation] = useState<ResolvedLocation>(NONE_LOCATION);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [recents, setRecents] = useState<City[]>([]);
  const [pickerOpen, setPickerOpen] = useState<boolean>(false);
  const manualSelectionRef = useRef<boolean>(false);

  const [hijriOffset, setHijriOffset] = useState<number>(0);
  const [isOffsetLoaded, setIsOffsetLoaded] = useState<boolean>(false);
  const [tick, setTick] = useState<number>(0);

  // Re-evaluate dates once a minute so an always-on display rolls over at midnight and Maghrib.
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  // Load offset from localStorage on mount
  useEffect(() => {
    try {
      const savedOffset = localStorage.getItem('hijriOffset');
      if (savedOffset) {
        const n = parseInt(savedOffset, 10);
        if (!isNaN(n)) setHijriOffset(n); // ignore corrupt storage rather than brick the date
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

  // Resolve location automatically: timezone gives an instant base, GPS (non-blocking) upgrades it.
  // Precedence: a manually selected city wins, so the GPS callback bails if one was chosen.
  const resolveAuto = useCallback(() => {
    let applied = false;
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) {
        const c = cityByTimezone(tz);
        setLocation(c
          ? { name: c.name, country: c.country, lat: c.lat, lon: c.lon, tz: c.tz, source: 'timezone' }
          : { name: tz, country: '', lat: null, lon: null, tz: tz, source: 'timezone' });
        applied = true;
      }
    } catch (e) {
      // Intl may be missing on Safari 10 — fall through to 'none'.
    }
    if (!applied) setLocation(NONE_LOCATION);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (manualSelectionRef.current) return; // a selected city outranks GPS
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const c = nearestCity(lat, lon);
          setLocation({
            name: c ? c.name : lat.toFixed(2) + ',' + lon.toFixed(2),
            country: c ? c.country : '',
            lat: lat, lon: lon,
            tz: c ? c.tz : null,
            source: 'gps',
          });
        },
        () => { /* keep timezone/none base */ },
        { timeout: 10000, maximumAge: 600000 }
      );
    }
  }, []);

  // Load saved location / recents, then resolve. A saved city has top precedence.
  useEffect(() => {
    try {
      const r = localStorage.getItem('iyyam.recentLocations');
      if (r) { const parsed = JSON.parse(r); if (parsed && parsed.length) setRecents(parsed); }
    } catch (e) { /* ignore */ }

    let saved: City | null = null;
    try {
      const s = localStorage.getItem('iyyam.location');
      if (s) {
        const p = JSON.parse(s);
        // Untrusted storage: only accept a well-formed city (lat/lon feed sunset math).
        if (p && typeof p.lat === 'number' && typeof p.lon === 'number' && typeof p.name === 'string') saved = p;
      }
    } catch (e) { /* ignore */ }

    if (saved) {
      manualSelectionRef.current = true;
      setSelectedCity(saved);
      setLocation({ name: saved.name, country: saved.country, lat: saved.lat, lon: saved.lon, tz: saved.tz, source: 'city' });
      return;
    }
    resolveAuto();
  }, [resolveAuto]);

  // Headline dates — computed offline. Hijri goes through the shared resolver (with Maghrib rollover).
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

    // Hijri — shared resolver: region offset + Maghrib rollover + manual sighting adjustment.
    const result = resolveHijri({ now: today, location: location, manualOffset: hijriOffset, applyRollover: true });
    setHijriDateStr(result.text);
    setRolledOver(result.rolledOver);
  }, [hijriOffset, isOffsetLoaded, location, tick]);

  // Persist a picked city + push to recents (max 5). A manual choice outranks auto-detection.
  const handleSelectCity = (c: City) => {
    manualSelectionRef.current = true;
    setSelectedCity(c);
    setLocation({ name: c.name, country: c.country, lat: c.lat, lon: c.lon, tz: c.tz, source: 'city' });
    setPickerOpen(false);
    try { localStorage.setItem('iyyam.location', JSON.stringify(c)); } catch (e) { /* ignore */ }
    setRecents((prev) => {
      const filtered = prev.filter((p) => !(p.name === c.name && p.country === c.country && p.lat === c.lat && p.lon === c.lon));
      const next = [c].concat(filtered).slice(0, 5);
      try { localStorage.setItem('iyyam.recentLocations', JSON.stringify(next)); } catch (e) { /* ignore */ }
      return next;
    });
  };

  // Clear back to automatic (timezone/GPS) detection.
  const clearLocation = () => {
    manualSelectionRef.current = false;
    setSelectedCity(null);
    try { localStorage.removeItem('iyyam.location'); } catch (e) { /* ignore */ }
    resolveAuto();
  };

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
