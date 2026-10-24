'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DisplayDialog from './DisplayDialog';
import { resolveHijri, ResolvedLocation } from '../lib/hijri';
const banglaCalendar = require('bangla-calendar');

interface MonthlyCalendarProps {
  location: ResolvedLocation;
  manualOffset: number;
}

type CalendarType = 'none' | 'gregorian' | 'hijri' | 'bengali';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function MonthlyCalendar({ location, manualOffset }: MonthlyCalendarProps) {
  const [focusDate, setFocusDate] = useState<Date>(new Date());
  const [hoveredType, setHoveredType] = useState<CalendarType>('none');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="ui-empty" role="status">Loading calendar…</div>;
  }

  const year = focusDate.getFullYear();
  const month = focusDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const startWeekday = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const monthName = firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const navMonth = (dir: number) => {
    const newFocus = new Date(focusDate);
    newFocus.setDate(1);
    newFocus.setMonth(newFocus.getMonth() + dir);
    setFocusDate(newFocus);
  };

  const getHijriDetails = (gregorianDate: Date) => {
    // Grid shares the headline's resolver (region offset + manual adjustment); whole-day, no Maghrib rollover.
    const r = resolveHijri({ now: gregorianDate, location: location, manualOffset: manualOffset, applyRollover: false });
    if (!r.hijri) return { day: '-', full: 'Out of range' };
    return { day: String(r.hijri.d), full: r.text };
  };

  const getBengaliDetails = (gregorianDate: Date) => {
    try {
      const day = banglaCalendar.getDay(gregorianDate);
      const full = banglaCalendar.getDate(gregorianDate);
      return { day, full };
    } catch (e) {
      return { day: '—', full: 'Unavailable' };
    }
  };

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(<div key={'empty-' + i} className="calendar-blank" aria-hidden="true" />);
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const today = new Date().toDateString() === date.toDateString();
    const hijri = getHijriDetails(date);
    const bengali = getBengaliDetails(date);
    const dim = (kind: CalendarType) => hoveredType !== 'none' && hoveredType !== kind ? ' is-dimmed' : '';
    cells.push(<button type="button" key={d} className={'calendar-day' + (today ? ' is-today' : '')} onClick={() => setSelectedDate(date)} aria-current={today ? 'date' : undefined} aria-label={date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ', Hijri ' + hijri.full + ', Bengali ' + bengali.full}><span className={'day-hijri' + dim('hijri')}>{hijri.day}</span><span className={'day-gregorian' + dim('gregorian')}>{d}</span><span lang="bn" className={'day-bengali' + dim('bengali')}>{bengali.day}</span></button>);
  }

  return (
    <section className="month-calendar" aria-label="Monthly calendar">
      <div className="month-heading"><h2 aria-live="polite">{monthName}</h2><div className="month-nav"><button type="button" className="ui-icon-button" onClick={() => navMonth(-1)} aria-label="Previous month"><ChevronLeft aria-hidden="true" size={18}/></button><button type="button" className="ui-icon-button" onClick={() => navMonth(1)} aria-label="Next month"><ChevronRight aria-hidden="true" size={18}/></button></div></div>
      <div className="calendar-legend" role="group" aria-label="Highlight a calendar">{(['gregorian', 'hijri', 'bengali'] as CalendarType[]).map(kind => <button key={kind} type="button" className={hoveredType === kind ? 'is-selected' : ''} aria-label={'Highlight ' + kind + ' days'} aria-pressed={hoveredType === kind} onMouseEnter={() => setHoveredType(kind)} onMouseLeave={() => setHoveredType('none')} onFocus={() => setHoveredType(kind)} onBlur={() => setHoveredType('none')} onClick={() => setHoveredType(hoveredType === kind ? 'none' : kind)}>{kind.charAt(0).toUpperCase() + kind.slice(1)}</button>)}</div>
      <div className="calendar-scroll"><div className="calendar-grid">{WEEKDAYS.map(day => <div key={day} className="calendar-weekday">{day}</div>)}{cells}</div></div>
      <p className="calendar-note">Choose a day for all three dates. Hijri dates are predictions with your sighting adjustment.</p>
      <DisplayDialog isOpen={selectedDate !== null} onClose={() => setSelectedDate(null)} title="Day details">
        <div className="ui-dialog-body">{selectedDate && <><div className="day-detail-row"><h3>Gregorian</h3><p>{selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p></div><div className="day-detail-row"><h3>Hijri · predicted</h3><p>{getHijriDetails(selectedDate).full}</p></div><div className="day-detail-row"><h3>Bengali</h3><p lang="bn">{getBengaliDetails(selectedDate).full}</p></div></>}</div>
      </DisplayDialog>
    </section>
  );
}
