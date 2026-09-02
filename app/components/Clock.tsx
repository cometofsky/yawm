'use client';

import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';

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
      enDate = new Intl.DateTimeFormat('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: timeZone || undefined,
      }).format(time);
    } catch (e) {
      enDate = time.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }

    // PRIMARY hero, deliberately in the NARROWER (3/8) column. Width runs counter to the
    // hierarchy here, so scale and luminance carry it outright: this card owns the lit surface
    // (#121212 + shadow), pure white, and the page's largest numeral (~1.5-1.7x the waqt
    // countdown). The location name is stated once here, not three times.
    return (
      <div className="relative overflow-hidden rounded-3xl bg-[#121212] border border-white/10 p-5 sm:p-6 shadow-2xl h-full flex flex-col items-start justify-center">
        {/* Label, time and date are one tight group centred in the card. This card is stretched
            to the taller waqt card's height, so `justify-between` would hollow out its middle. */}
        <div className="flex items-center space-x-2 text-white/70 max-w-full mb-3">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="uppercase tracking-widest text-[11px] sm:text-xs font-semibold truncate">
            {displayLabel}
          </span>
        </div>

        <span className="text-5xl sm:text-6xl md:text-7xl lg:text-7xl font-bold font-mono text-white tracking-tight leading-none">
          {formattedTime}
        </span>

        <span className="mt-2.5 text-xs sm:text-sm text-white/60">
          {sublabel || enDate}
        </span>
      </div>
    );
  }

  // Tertiary world clock pill. Recessed #0c0c0c and no shadow, so it stays below both heroes;
  // the lit #121212 + shadow now belongs to the primary local clock.
  return (
    <div className="flex flex-col items-center justify-center bg-[#0c0c0c] px-4 py-2.5 rounded-2xl border border-white/10 min-w-[110px]">
      <span className="text-white/50 uppercase tracking-wider text-[10px] font-semibold">
        {displayLabel}
      </span>
      <span className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight mt-0.5">
        {formattedTime}
      </span>
    </div>
  );
}
