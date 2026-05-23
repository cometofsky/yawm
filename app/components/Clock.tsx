'use client';

import { useState, useEffect } from 'react';

export default function Clock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) {
    return (
      <div className="flex justify-center items-center h-48 animate-pulse text-white/50 text-6xl font-light font-mono tracking-wider">
        --:--:--
      </div>
    );
  }

  const formatOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  };

  const formattedTime = new Intl.DateTimeFormat('en-US', formatOptions).format(time);
  const [timeString, period] = formattedTime.split(' ');

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative flex items-end bg-black/40 backdrop-blur-xl px-8 py-6 sm:px-10 sm:py-8 md:px-12 md:py-8 rounded-3xl border border-white/10 shadow-2xl">
          <span className="text-6xl sm:text-7xl md:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-white/70 font-mono tracking-tighter drop-shadow-sm leading-none">
            {timeString}
          </span>
          <span className="text-xl sm:text-2xl md:text-3xl font-medium text-white/60 ml-2 sm:ml-4 mb-1 sm:mb-2 md:mb-3 leading-none">
            {period}
          </span>
        </div>
      </div>
    </div>
  );
}
