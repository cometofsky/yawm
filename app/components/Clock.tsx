'use client';

import { useState, useEffect } from 'react';
import { Globe, MapPin } from 'lucide-react';

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
    return (
      <div
        className={`flex justify-center items-center ${
          isMain ? 'h-48' : 'h-16'
        } animate-pulse text-white/50 text-4xl font-light font-mono tracking-wider`}
      >
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
        year: 'numeric',
        timeZone: timeZone || undefined,
      }).format(time);
    } catch (e) {
      enDate = time.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }

    return (
      <div className="relative group overflow-hidden rounded-3xl bg-[#121212] border border-white/10 p-5 sm:p-6 md:p-7 shadow-2xl h-full flex flex-col justify-between">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-cyan-400 opacity-80"></div>

        <div>
          {/* Top line */}
          <div className="flex justify-between items-center mb-3 sm:mb-4 gap-2">
            <span className="text-white/60 uppercase tracking-widest text-xs font-semibold whitespace-nowrap">
              Local Time
            </span>
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white/80 max-w-[200px] truncate">
              <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
              <span className="truncate">{displayLabel}</span>
            </div>
          </div>

          {/* Location Title */}
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-500/15 rounded-2xl">
              <Globe className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white/90 truncate">
              {displayLabel}
            </h2>
          </div>
        </div>

        {/* Big Digital Clock */}
        <div className="flex flex-col items-start mt-1">
          <span className="text-4xl sm:text-5xl md:text-6xl font-bold font-mono text-white tracking-tight leading-none">
            {formattedTime}
          </span>

          <div className="flex items-center space-x-2 mt-2.5 text-xs sm:text-sm text-white/60">
            <span>{sublabel || enDate}</span>
          </div>
        </div>
      </div>
    );
  }

  // Secondary world clock pill
  return (
    <div className="flex flex-col items-center justify-center bg-[#121212] px-4 py-2.5 rounded-2xl border border-white/10 shadow-lg min-w-[110px]">
      <span className="text-white/50 uppercase tracking-wider text-[10px] font-semibold">
        {displayLabel}
      </span>
      <span className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight mt-0.5">
        {formattedTime}
      </span>
    </div>
  );
}
