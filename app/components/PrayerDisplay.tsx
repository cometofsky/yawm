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
      return <Sunrise className="w-5 h-5 text-amber-300" />;
    case 'Sunrise':
      return <Sun className="w-5 h-5 text-amber-400" />;
    case 'Dhuhr':
      return <Sun className="w-5 h-5 text-yellow-400" />;
    case 'Asr':
      return <Sun className="w-5 h-5 text-orange-400" />;
    case 'Maghrib':
      return <Sunset className="w-5 h-5 text-rose-400" />;
    case 'Isha':
      return <Moon className="w-5 h-5 text-indigo-300" />;
    default:
      return <ClockIcon className="w-5 h-5 text-blue-400" />;
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

export function WaqtCountdownCard({ location, isLoaded }: PrayerDisplayProps) {
  const [asrMethod, setAsrMethod] = useState<AsrJuristicMethod>('standard');
  const [waqtStatus, setWaqtStatus] = useState<WaqtStatus | null>(null);
  const [remaining, setRemaining] = useState<string>('00:00:00');
  const [epoch, setEpoch] = useState<number>(0);

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

  useEffect(() => {
    const status = resolveCurrentWaqt(new Date(), location.lat, location.lon, {
      asrMethod: asrMethod,
      timeZone: location.tz,
    });
    setWaqtStatus(status);
    setRemaining(status ? status.remainingFormatted : '00:00:00');
  }, [location.lat, location.lon, location.tz, asrMethod, epoch]);

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

  if (!isLoaded) {
    return (
      <div className="w-full h-48 bg-[#121212] border border-white/10 rounded-3xl animate-pulse flex items-center justify-center text-white/40">
        Calculating Prayer Times...
      </div>
    );
  }

  if (location.lat == null || location.lon == null) {
    return (
      <div className="w-full h-full min-h-[190px] rounded-3xl bg-[#121212] border border-white/10 p-5 sm:p-6 flex flex-col items-start justify-center space-y-2">
        <div className="flex items-center space-x-2 text-amber-400">
          <MapPinOff className="w-5 h-5" />
          <h2 className="text-base font-semibold">Location Required</h2>
        </div>
        <p className="text-xs text-white/50">
          Select your city below to calculate exact Waqt prayer times.
        </p>
      </div>
    );
  }

  if (!waqtStatus) {
    return (
      <div className="w-full h-48 bg-[#121212] border border-white/10 rounded-3xl animate-pulse flex items-center justify-center text-white/40">
        Calculating Prayer Times...
      </div>
    );
  }

  const endsAtStr = formatTime12(waqtStatus.currentWaqtEndMs, location.tz);
  const iftarStr = formatTime(waqtStatus.iftarMs, location.tz);

  return (
    <div className="relative group overflow-hidden rounded-3xl bg-[#121212] border border-white/10 p-5 sm:p-6 md:p-7 shadow-2xl h-full flex flex-col justify-between">
      {/* Top accent gradient */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 opacity-80"></div>

      <div>
        {/* Top line: Label on left, controls on right */}
        <div className="flex justify-between items-center mb-3 sm:mb-4 gap-2">
          <span className="text-white/60 uppercase tracking-widest text-xs font-semibold whitespace-nowrap">
            {waqtStatus.isPrayerTime ? 'Current Waqt' : 'Current Period'}
          </span>

          <div className="flex items-center space-x-2">
            {/* IFTAR pill */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white/80">
              <span className="text-[10px] tracking-wider uppercase text-amber-400 font-bold">Iftar</span>
              <span className="font-mono">{iftarStr}</span>
            </div>

            {/* Asr Method Toggle */}
            <div
              role="group"
              aria-label="Asr juristic method"
              className="flex items-center bg-black/50 rounded-xl p-0.5 border border-white/10 text-[10px]"
            >
              <button
                type="button"
                aria-pressed={asrMethod === 'standard'}
                onClick={() => handleToggleAsrMethod('standard')}
                className={`px-2 py-0.5 rounded-lg transition-colors ${
                  asrMethod === 'standard' ? 'bg-white/20 text-white font-medium' : 'text-white/40 hover:text-white/70'
                }`}
                title="Standard (Shafi'i/Maliki/Hanbali) Asr"
              >
                Standard
              </button>
              <button
                type="button"
                aria-pressed={asrMethod === 'hanafi'}
                onClick={() => handleToggleAsrMethod('hanafi')}
                className={`px-2 py-0.5 rounded-lg transition-colors ${
                  asrMethod === 'hanafi' ? 'bg-white/20 text-white font-medium' : 'text-white/40 hover:text-white/70'
                }`}
                title="Hanafi Asr (2x shadow)"
              >
                Hanafi
              </button>
            </div>
          </div>
        </div>

        {/* Waqt Name Header */}
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-amber-500/15 rounded-2xl">
            {getWaqtIcon(waqtStatus.currentWaqt)}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-amber-400">
            {waqtStatus.currentWaqtLabel}
          </h2>
        </div>
      </div>

      {/* Large Countdown Display */}
      <div className="flex flex-col items-start mt-1">
        <span className="text-4xl sm:text-5xl md:text-6xl font-bold font-mono text-white tracking-tight leading-none">
          {remaining}
        </span>

        {/* Subtitle Status */}
        <div className="flex items-center space-x-2 mt-2.5 text-xs sm:text-sm text-white/60">
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
  );
}

export function TodayPrayerRibbon({ location, isLoaded }: PrayerDisplayProps) {
  const [asrMethod, setAsrMethod] = useState<AsrJuristicMethod>('standard');
  const [waqtStatus, setWaqtStatus] = useState<WaqtStatus | null>(null);

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

  useEffect(() => {
    if (location.lat == null || location.lon == null) return;
    const status = resolveCurrentWaqt(new Date(), location.lat, location.lon, {
      asrMethod: asrMethod,
      timeZone: location.tz,
    });
    setWaqtStatus(status);
  }, [location.lat, location.lon, location.tz, asrMethod]);

  if (!isLoaded || !waqtStatus || location.lat == null || location.lon == null) {
    return null;
  }

  return (
    <div className="w-full bg-[#121212] border border-white/10 rounded-2xl p-2 sm:p-3 shadow-xl overflow-hidden">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
        {waqtStatus.todayPrayers.map((item) => {
          const timeStr = formatTime(item.timeMs, location.tz);
          const isCurrent = item.isCurrent;

          return (
            <div
              key={item.name}
              aria-current={isCurrent ? 'true' : undefined}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl transition-all text-center ${
                isCurrent
                  ? 'bg-white text-black font-bold shadow-lg'
                  : 'bg-white/5 text-white/75 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center space-x-1">
                <span
                  className={`text-[11px] sm:text-xs uppercase tracking-wider font-semibold ${
                    isCurrent ? 'text-black' : 'text-white/60'
                  }`}
                >
                  {item.label}
                </span>
                {isCurrent && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                )}
              </div>
              <span
                className={`font-mono text-xs sm:text-sm md:text-base mt-0.5 font-bold ${
                  isCurrent ? 'text-black font-black' : 'text-white'
                }`}
              >
                {timeStr}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PrayerDisplay({ location, isLoaded }: PrayerDisplayProps) {
  return (
    <div className="w-full flex flex-col space-y-4">
      <WaqtCountdownCard location={location} isLoaded={isLoaded} />
      <TodayPrayerRibbon location={location} isLoaded={isLoaded} />
    </div>
  );
}
