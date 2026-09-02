'use client';

import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

interface ClockProps {
  timeZone?: string;
  label?: string;
  sublabel?: string;
  isMain?: boolean;
}

export default function Clock({ timeZone, label, sublabel, isMain = false }: ClockProps) {
  const [time, setTime] = useState<Date | null>(null);
  const [localLabel, setLocalLabel] = useState<string>('');

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const syncToMinute = () => {
      setTime(new Date());
      const now = new Date();
      const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
      timeoutId = setTimeout(syncToMinute, msToNextMinute + 50);
    };

    syncToMinute();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        clearTimeout(timeoutId);
        syncToMinute();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (!label) {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const city = tz.split('/').pop()?.replace('_', ' ');
        setLocalLabel(city || 'Local');
      } catch (e) {
        setLocalLabel('Local');
      }
    }

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [label]);

  if (!time) {
    // Same chrome as the resolved render below, so nothing jumps when the clock hydrates.
    if (isMain) {
      return (
        <div className="relative overflow-hidden rounded-3xl bg-[#111] border border-white/10 p-5 sm:p-6 md:p-8 shadow-2xl h-full flex flex-col justify-between animate-pulse">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-cyan-400 opacity-80"></div>

          <div>
            <div className="flex justify-between items-start mb-2 sm:mb-3">
              <span className="text-white/60 uppercase tracking-widest text-xs sm:text-sm font-semibold">
                Local Time
              </span>
              <span className="text-xs text-white/40 font-medium truncate max-w-[150px] sm:max-w-none">
                {label || '\u00a0'}
              </span>
            </div>

            <div className="flex items-center space-x-3 mb-1 sm:mb-2">
              <div className="p-2 bg-blue-500/20 rounded-2xl">
                <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white/90 drop-shadow-sm truncate">
                {label || '\u00a0'}
              </h2>
            </div>
          </div>

          <div className="flex flex-col items-start mt-2">
            <div className="flex items-baseline space-x-3">
              <span className="text-7xl sm:text-8xl md:text-9xl font-bold font-mono text-white/50 tracking-tight drop-shadow-md leading-none">
                --:--
              </span>
            </div>
            <div className="flex items-center space-x-2 mt-2 text-xs sm:text-sm text-white/60">
              <span>{'\u00a0'}</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex justify-center items-center h-24 sm:h-32 animate-pulse text-white/50 text-4xl font-light font-mono tracking-wider">
        --:--
      </div>
    );
  }

  const formatOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: timeZone || undefined,
  };

  let formattedTime = '';
  try {
    formattedTime = new Intl.DateTimeFormat('en-GB', formatOptions).format(time);
  } catch (e) {
    delete formatOptions.timeZone;
    formattedTime = new Intl.DateTimeFormat('en-GB', formatOptions).format(time);
  }

  const displayLabel = label || localLabel;

  if (isMain) {
    let enDate = '';
    try {
      enDate = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        timeZone: timeZone || undefined,
      }).format(time);
    } catch (e) {
      enDate = time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    }

    return (
      <div className="relative group overflow-hidden rounded-3xl bg-[#111] border border-white/10 p-5 sm:p-6 md:p-8 shadow-2xl transition-all h-full flex flex-col justify-between">
        {/* Accent top gradient */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-cyan-400 opacity-80"></div>

        <div>
          <div className="flex justify-between items-start mb-2 sm:mb-3">
            <span className="text-white/60 uppercase tracking-widest text-xs sm:text-sm font-semibold">
              Local Time
            </span>
            <span className="text-xs text-white/40 font-medium truncate max-w-[150px] sm:max-w-none">
              {displayLabel}
            </span>
          </div>

          <div className="flex items-center space-x-3 mb-1 sm:mb-2">
            <div className="p-2 bg-blue-500/20 rounded-2xl">
              <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white/90 drop-shadow-sm truncate">
              {displayLabel}
            </h2>
          </div>
        </div>

        <div className="flex flex-col items-start mt-2">
          <div className="flex items-baseline space-x-3">
            <span className="text-7xl sm:text-8xl md:text-9xl font-bold font-mono text-white tracking-tight drop-shadow-md leading-none">
              {formattedTime}
            </span>
          </div>

          <div className="flex items-center space-x-2 mt-2 text-xs sm:text-sm text-white/60">
            <span>{sublabel || enDate}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="relative group">
        <div className="relative flex flex-col items-center bg-white/[0.02] px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl border border-white/[0.06]">
          <span className="text-white/50 uppercase tracking-widest text-[10px] sm:text-xs font-medium mb-1">
            {displayLabel}
          </span>
          <div className="flex items-end">
            <span className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white/80 font-mono tracking-tight leading-none">
              {formattedTime}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
