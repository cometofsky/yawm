'use client';

import { useState, useEffect } from 'react';

interface ClockProps {
  timeZone?: string;
  label?: string;
  sublabel?: string;
  isMain?: boolean;
  isFullHero?: boolean;
}

export default function Clock({
  timeZone,
  label,
  sublabel,
  isMain = false,
  isFullHero = false,
}: ClockProps) {
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
    return <div className={isMain ? 'local-clock clock-loading' : 'world-clock'} aria-label="Loading clock"><span className={isMain ? 'clock-numerals' : 'world-numerals'}>--:--</span></div>;
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

    return (
      <div className="local-clock">
        <span className="clock-numerals">{formattedTime}</span>
        <span className="clock-date">{sublabel || enDate}</span>
      </div>
    );
  }

  return (
    <div className="world-clock">
      <span className="world-label">{displayLabel}</span>
      <span className="world-numerals">{formattedTime}</span>
    </div>
  );
}
