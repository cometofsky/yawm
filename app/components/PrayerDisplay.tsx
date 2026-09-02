'use client';

import { useState, useEffect, useMemo } from 'react';
import { Sun, Sunset, Sunrise, Moon, Clock as ClockIcon, MapPinOff } from 'lucide-react';
import { resolveCurrentWaqt, formatCountdown, civilDayKey, WaqtStatus, PrayerName, AsrJuristicMethod } from '../lib/prayer';
import { ResolvedLocation } from '../lib/hijri';

interface PrayerDisplayProps {
  location: ResolvedLocation;
  isLoaded: boolean;
}

function getWaqtIcon(name: PrayerName | 'Sunrise') {
  switch (name) {
    case 'Fajr':
      return <Sunrise className="w-4 h-4 text-amber-300" />;
    case 'Sunrise':
      return <Sun className="w-4 h-4 text-amber-400" />;
    case 'Dhuhr':
      return <Sun className="w-4 h-4 text-yellow-400" />;
    case 'Asr':
      return <Sun className="w-4 h-4 text-orange-400" />;
    case 'Maghrib':
      return <Sunset className="w-4 h-4 text-rose-400" />;
    case 'Isha':
      return <Moon className="w-4 h-4 text-indigo-300" />;
    default:
      return <ClockIcon className="w-4 h-4 text-blue-400" />;
  }
}

function formatTime(timeMs: number, timeZone?: string | null): string {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: timeZone || undefined,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(timeMs));
  } catch (e) {
    const d = new Date(timeMs);
    const h = d.getHours();
    const m = d.getMinutes();
    return (h < 10 ? '0' + h : '' + h) + ':' + (m < 10 ? '0' + m : '' + m);
  }
}

function formatTime12(timeMs: number, timeZone?: string | null): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timeZone || undefined,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(timeMs));
  } catch (e) {
    return formatTime(timeMs, timeZone);
  }
}

export default function PrayerDisplay({ location, isLoaded }: PrayerDisplayProps) {
  const [asrMethod, setAsrMethod] = useState<AsrJuristicMethod>('standard');
  const [waqtStatus, setWaqtStatus] = useState<WaqtStatus | null>(null);
  const [remaining, setRemaining] = useState<string>('00:00:00');
  // Bumped by the ticker to force a fresh solar computation; see the two effects below.
  const [epoch, setEpoch] = useState<number>(0);

  // Load saved Asr method preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem('iyyam.asrMethod');
      if (saved === 'hanafi' || saved === 'standard') {
        setAsrMethod(saved);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleToggleAsrMethod = (method: AsrJuristicMethod) => {
    setAsrMethod(method);
    try {
      localStorage.setItem('iyyam.asrMethod', method);
    } catch (e) {
      // ignore
    }
  };

  // The prayer instants themselves change once a day, so the solar math runs only when the
  // location, the juristic method, the active waqt window or the civil day actually changes —
  // roughly six times a day instead of 86,400 (this display runs all day on an iPad 4).
  useEffect(() => {
    const status = resolveCurrentWaqt(new Date(), location.lat, location.lon, {
      asrMethod: asrMethod,
      timeZone: location.tz,
    });
    setWaqtStatus(status);
    setRemaining(status ? status.remainingFormatted : '00:00:00');
  }, [location.lat, location.lon, location.tz, asrMethod, epoch]);

  // Per-second ticker: formats the countdown only, and asks for a recompute when the current
  // window expires or the civil day rolls over.
  useEffect(() => {
    if (!waqtStatus) return;

    const startDayKey = civilDayKey(new Date(), location.tz);
    const endMs = waqtStatus.currentWaqtEndMs;
    let intervalId: ReturnType<typeof setInterval>;

    const tick = () => {
      const now = new Date();
      if (now.getTime() >= endMs || civilDayKey(now, location.tz) !== startDayKey) {
        setEpoch((e) => e + 1);
        return;
      }
      setRemaining(formatCountdown(endMs - now.getTime()));
    };

    tick();
    intervalId = setInterval(tick, 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        clearInterval(intervalId);
        tick();
        intervalId = setInterval(tick, 1000);
      } else {
        clearInterval(intervalId);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [waqtStatus, location.tz]);

  // Only the countdown changes each second, so keep the ribbon out of the per-second render.
  const ribbon = useMemo(() => {
    if (!waqtStatus) return null;
    return waqtStatus.todayPrayers.map((item) => {
      const timeStr = formatTime(item.timeMs, location.tz);
      const isCurrent = item.isCurrent;

      return (
        <div
          key={item.name}
          aria-current={isCurrent ? 'true' : undefined}
          className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-300 text-center ${
            isCurrent
              ? 'bg-white/90 text-black font-bold'
              : 'bg-white/5 text-white/70 hover:bg-white/10'
          }`}
        >
          <span
            className={`text-[10px] sm:text-xs uppercase tracking-wider ${
              isCurrent ? 'text-black/80 font-bold' : 'text-white/50 font-medium'
            }`}
          >
            {item.label}
          </span>
          <span
            className={`font-mono text-xs sm:text-sm md:text-base mt-0.5 ${
              isCurrent ? 'text-black font-extrabold' : 'text-white/90'
            }`}
          >
            {timeStr}
          </span>
          {/* Non-colour marker for the active waqt, so the state survives greyscale and screen readers */}
          {isCurrent && (
            <span className="mt-0.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] text-black/70">
              Now
            </span>
          )}
        </div>
      );
    });
  }, [waqtStatus, location.tz]);

  if (!isLoaded) {
    return (
      <div className="w-full h-32 bg-white/[0.02] border border-white/[0.06] rounded-3xl animate-pulse flex items-center justify-center text-white/50">
        Calculating Prayer Times...
      </div>
    );
  }

  // No coordinates: show nothing rather than another city's timetable under this user's label.
  if (location.lat == null || location.lon == null) {
    return (
      <div className="w-full rounded-3xl bg-white/[0.02] border border-white/[0.06] p-4 sm:p-5 md:p-6 flex flex-col items-start justify-center min-h-32 space-y-2">
        <div className="flex items-center space-x-3">
          <div className="p-1.5 bg-white/10 rounded-xl">
            <MapPinOff className="w-4 h-4 text-white/50" />
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-white/80 tracking-tight">Prayer times unavailable</h2>
        </div>
        <p className="text-xs sm:text-sm text-white/50 max-w-prose">
          Waqt times depend on your exact latitude and longitude, and none could be resolved for{' '}
          {location.tz ? location.tz : 'this device'}. Choose your city under Location below to see them.
        </p>
      </div>
    );
  }

  if (!waqtStatus) {
    return (
      <div className="w-full h-32 bg-white/[0.02] border border-white/[0.06] rounded-3xl animate-pulse flex items-center justify-center text-white/50">
        Calculating Prayer Times...
      </div>
    );
  }

  const endsAtStr = formatTime12(waqtStatus.currentWaqtEndMs, location.tz);
  const iftarStr = formatTime(waqtStatus.iftarMs, location.tz);

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* Top Card: Current Waqt & Live Countdown */}
      <div className="relative group overflow-hidden rounded-3xl bg-white/[0.02] border border-white/[0.06] p-4 sm:p-5 md:p-6 transition-all">
        {/* Accent top gradient */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 opacity-50"></div>

        <div className="flex justify-between items-start mb-2 sm:mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-white/60 uppercase tracking-widest text-xs sm:text-sm font-semibold">
              {waqtStatus.isPrayerTime ? 'Current Waqt' : 'Current Period'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* IFTAR / SUHOOR info pill */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white/70">
              <span className="text-[10px] tracking-wider uppercase text-amber-400 font-semibold">Iftar</span>
              <span className="font-mono">{iftarStr}</span>
            </div>

            {/* Asr Juristic Method Toggle (Shafi/Hanafi) */}
            <div
              role="group"
              aria-label="Asr juristic method"
              className="flex items-center bg-black/40 rounded-xl p-0.5 border border-white/10 text-[10px]"
            >
              <button
                type="button"
                aria-pressed={asrMethod === 'standard'}
                onClick={() => handleToggleAsrMethod('standard')}
                className={`px-2 py-0.5 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-1 focus-visible:ring-offset-black ${asrMethod === 'standard' ? 'bg-white/20 text-white font-medium' : 'text-white/40 hover:text-white/70'}`}
                title="Standard / Shafi'i / Maliki / Hanbali Asr"
              >
                Standard
              </button>
              <button
                type="button"
                aria-pressed={asrMethod === 'hanafi'}
                onClick={() => handleToggleAsrMethod('hanafi')}
                className={`px-2 py-0.5 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-1 focus-visible:ring-offset-black ${asrMethod === 'hanafi' ? 'bg-white/20 text-white font-medium' : 'text-white/40 hover:text-white/70'}`}
                title="Hanafi Asr (2x shadow)"
              >
                Hanafi
              </button>
            </div>
          </div>
        </div>

        {/* Waqt Name Header */}
        <div className="flex items-center space-x-3 mb-1 sm:mb-2">
          <div className="p-1.5 bg-amber-500/10 rounded-xl">
            {getWaqtIcon(waqtStatus.currentWaqt)}
          </div>
          <h2 className="text-base sm:text-lg font-semibold uppercase tracking-[0.12em] text-amber-200/80">
            {waqtStatus.currentWaqtLabel}
          </h2>
        </div>

        {/* Large Countdown Display */}
        <div className="flex flex-col items-start mt-2">
          <div className="flex items-baseline space-x-3">
            <span className="text-3xl sm:text-4xl md:text-5xl font-semibold font-mono text-white/85 tracking-tight leading-none">
              {remaining}
            </span>
          </div>

          {/* Subtitle & Status */}
          <div className="flex items-center space-x-2 mt-2 text-xs sm:text-sm text-white/60">
            <span>
              {waqtStatus.isPrayerTime ? `Ends at ${endsAtStr}` : `Starts at ${endsAtStr}`}
            </span>
            <span>·</span>
            <span className="text-white/80 font-medium">
              Next: {waqtStatus.nextWaqt}
            </span>
          </div>
        </div>
      </div>

      {/* Horizontal Prayer Times Ribbon */}
      <div className="w-full bg-white/[0.02] border border-white/[0.06] rounded-2xl p-2 sm:p-3">
        <div className="grid grid-cols-6 gap-1.5 sm:gap-2">{ribbon}</div>
      </div>
    </div>
  );
}
