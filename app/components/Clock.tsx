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
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    if (!label) {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const city = tz.split('/').pop()?.replace('_', ' ');
        setLocalLabel(city || 'Local');
      } catch (e) {
        setLocalLabel('Local');
      }
    }

    return () => clearInterval(interval);
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
    second: '2-digit',
    hour12: false,
    timeZone: timeZone,
  };

  let formattedTime = '';
  try {
    formattedTime = new Intl.DateTimeFormat('en-GB', formatOptions).format(time);
  } catch (e) {
    // Fallback if timeZone is invalid
    formatOptions.timeZone = undefined;
    formattedTime = new Intl.DateTimeFormat('en-GB', formatOptions).format(time);
  }

  const displayLabel = label || localLabel;

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="relative group">
        <div className={`absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200`}></div>
        <div className={`relative flex flex-col items-center bg-black/40 backdrop-blur-xl ${isMain ? 'px-6 py-4 sm:px-10 sm:py-8' : 'px-4 py-3 sm:px-6 sm:py-4'} rounded-3xl border border-white/10 shadow-2xl`}>
          <span className="text-white/60 uppercase tracking-widest text-xs sm:text-sm font-semibold mb-1 sm:mb-2">{displayLabel}</span>
          <div className="flex items-end">
            <span className={`${isMain ? 'text-5xl sm:text-7xl md:text-8xl lg:text-9xl' : 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl'} font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-white/70 font-mono tracking-tighter drop-shadow-sm leading-none`}>
              {formattedTime}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
