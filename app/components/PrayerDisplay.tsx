'use client';

import { useState, useEffect } from 'react';
import { resolveCurrentWaqt, formatCountdown, civilDayKey, WaqtStatus, AsrJuristicMethod } from '../lib/prayer';
import { ResolvedLocation } from '../lib/hijri';

interface PrayerDisplayProps {
  location: ResolvedLocation;
  isLoaded: boolean;
  onChooseLocation?: () => void;
  asrMethod: AsrJuristicMethod;
  onAsrMethodChange: (method: AsrJuristicMethod) => void;
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

function waqtElapsed(status: WaqtStatus, nowMs: number): number {
  const span = status.currentWaqtEndMs - status.currentWaqtStartMs;
  if (!(span > 0)) return 0;
  const fraction = (nowMs - status.currentWaqtStartMs) / span;
  if (!(fraction > 0)) return 0;
  return fraction > 1 ? 1 : fraction;
}

export function WaqtCountdownCard({ location, isLoaded, onChooseLocation, asrMethod, onAsrMethodChange }: PrayerDisplayProps) {
  const [waqtStatus, setWaqtStatus] = useState<WaqtStatus | null>(null);
  const [remaining, setRemaining] = useState<string>('00:00:00');
  const [elapsed, setElapsed] = useState<number>(0);
  const [epoch, setEpoch] = useState<number>(0);

  useEffect(() => {
    const status = resolveCurrentWaqt(new Date(), location.lat, location.lon, {
      asrMethod: asrMethod,
      timeZone: location.tz,
    });
    setWaqtStatus(status);
    setRemaining(status ? status.remainingFormatted : '00:00:00');
    setElapsed(status ? waqtElapsed(status, Date.now()) : 0);
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
      setElapsed(waqtElapsed(waqtStatus, now.getTime()));
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

  if (!isLoaded) return <div className="ui-empty" role="status">Calculating the current waqt…</div>;
  if (location.lat == null || location.lon == null) return <div className="ui-empty"><h2>Choose a city for the current waqt</h2><p>Your clock and calendars remain available. A city supplies the coordinates needed for prayer calculations.</p><button type="button" className="ui-button" onClick={onChooseLocation}>Choose city</button></div>;
  if (!waqtStatus) return <div className="ui-empty"><h2>Waqt unavailable</h2><p>Prayer boundaries could not be calculated for this location.</p><button type="button" className="ui-button" onClick={onChooseLocation}>Choose another city</button></div>;

  const endsAtStr = formatTime12(waqtStatus.currentWaqtEndMs, location.tz);
  return (
    <div className="waqt-band">
      <div className="waqt-session" role="group" aria-label={waqtStatus.currentWaqtLabel + ' time remaining'}>
      <div className="waqt-heading"><h2>{waqtStatus.currentWaqtLabel}</h2><p>{waqtStatus.isPrayerTime ? 'Current waqt' : 'Current period'}</p></div>
      <div className="waqt-count"><p className="countdown-label">Time left</p><div className="countdown">{remaining}</div><p className="waqt-next">{waqtStatus.isPrayerTime ? 'Ends' : 'Starts'} at {endsAtStr} · Next: {waqtStatus.nextWaqt}</p><div className="waqt-progress" aria-hidden="true"><span style={{ width: (elapsed * 100).toFixed(2) + '%' }}/></div></div>
      </div>
      <div className="waqt-utility"><p className="iftar">Iftar <span>{formatTime(waqtStatus.iftarMs, location.tz)}</span></p><div className="ui-segmented" role="group" aria-label="Asr juristic method"><button type="button" aria-pressed={asrMethod === 'standard'} className={asrMethod === 'standard' ? 'is-selected' : ''} onClick={() => onAsrMethodChange('standard')} title="Shafi’i, Maliki and Hanbali Asr">Standard</button><button type="button" aria-pressed={asrMethod === 'hanafi'} className={asrMethod === 'hanafi' ? 'is-selected' : ''} onClick={() => onAsrMethodChange('hanafi')} title="Hanafi Asr">Hanafi</button></div></div>
    </div>
  );
}

export function TodayPrayerRibbon({ location, isLoaded, asrMethod }: PrayerDisplayProps) {
  const [tick, setTick] = useState(0);
  const [waqtStatus, setWaqtStatus] = useState<WaqtStatus | null>(null);

  useEffect(() => {
    const refresh = () => setTick(value => value + 1);
    const timer = setInterval(refresh, 60000);
    document.addEventListener('visibilitychange', refresh);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', refresh); };
  }, []);

  useEffect(() => {
    if (location.lat == null || location.lon == null) { setWaqtStatus(null); return; }
    setWaqtStatus(resolveCurrentWaqt(new Date(), location.lat, location.lon, { asrMethod, timeZone: location.tz }));
  }, [location.lat, location.lon, location.tz, asrMethod, tick]);

  if (!isLoaded || !waqtStatus || location.lat == null || location.lon == null) return null;
  return <div className="prayer-ribbon">{waqtStatus.todayPrayers.map((item) => <div key={item.name} aria-current={item.isCurrent ? 'true' : undefined} className={'prayer-stop' + (item.isCurrent ? ' is-current' : '')}>{item.label}<span>{formatTime(item.timeMs, location.tz)}</span></div>)}</div>;
}

export default function PrayerDisplay({ location, isLoaded, onChooseLocation, asrMethod, onAsrMethodChange }: PrayerDisplayProps) {
  return <><WaqtCountdownCard asrMethod={asrMethod} onAsrMethodChange={onAsrMethodChange} location={location} isLoaded={isLoaded} onChooseLocation={onChooseLocation}/><TodayPrayerRibbon asrMethod={asrMethod} onAsrMethodChange={onAsrMethodChange} location={location} isLoaded={isLoaded}/></>;
}
