'use client';

import { useState, useEffect } from 'react';

interface ClockProps {
  timeZone?: string;
  label?: string;
  isMain?: boolean;
}

export default function Clock({ timeZone, label, isMain = false }: ClockProps) {
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
      <div className={`flex justify-center items-center ${isMain ? 'h-32 sm:h-48' : 'h-24 sm:h-32'} animate-pulse text-white/50 text-4xl font-light font-mono tracking-wider`}>
        --:--:--
      </div>
    );
  }

  const formatOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: timeZone,
  };

  let formattedTime = '';
  try {
    formattedTime = new Intl.DateTimeFormat('en-GB', formatOptions).format(time);
  } catch (e) {
    // Fallback if timeZone is invalid or undefined explicitly is unsupported
    delete formatOptions.timeZone;
    formattedTime = new Intl.DateTimeFormat('en-GB', formatOptions).format(time);
  }

  const displayLabel = label || localLabel;

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="relative group">
        <div className={`relative flex flex-col items-center bg-[#111] ${isMain ? 'px-6 py-4 sm:px-10 sm:py-8' : 'px-4 py-3 sm:px-6 sm:py-4'} rounded-3xl border border-white/10 shadow-2xl`}>
          <span className="text-white/60 uppercase tracking-widest text-xs sm:text-sm font-semibold mb-1 sm:mb-2">{displayLabel}</span>
          <div className="flex items-end">
            <span className={`${isMain ? 'text-5xl sm:text-7xl md:text-8xl lg:text-9xl' : 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl'} font-bold text-white font-mono tracking-tighter drop-shadow-sm leading-none`}>
              {formattedTime}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
