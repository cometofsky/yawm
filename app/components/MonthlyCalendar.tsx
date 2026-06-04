'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Globe, Moon, CalendarDays, X } from 'lucide-react';
const banglaCalendar = require('bangla-calendar');

interface MonthlyCalendarProps {
  hijriOffset: number;
}

type CalendarType = 'none' | 'gregorian' | 'hijri' | 'bengali';

const bnDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function MonthlyCalendar({ hijriOffset }: MonthlyCalendarProps) {
  const [focusDate, setFocusDate] = useState<Date>(new Date());
  const [hoveredType, setHoveredType] = useState<CalendarType>('none');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="w-full mx-auto mb-12 relative h-96 bg-white/5 rounded-3xl animate-pulse"></div>;
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
    newFocus.setMonth(newFocus.getMonth() + dir);
    setFocusDate(newFocus);
  };

  const getHijriDetails = (gregorianDate: Date) => {
    try {
      const shifted = new Date(gregorianDate);
      shifted.setDate(shifted.getDate() + hijriOffset);
      const day = new Intl.DateTimeFormat('en-US-u-ca-islamic', { day: 'numeric' }).format(shifted);
      const monthStr = new Intl.DateTimeFormat('en-US-u-ca-islamic', { month: 'long' }).format(shifted);
      let yearStr = new Intl.DateTimeFormat('en-US-u-ca-islamic', { year: 'numeric' }).format(shifted);
      yearStr = yearStr.replace(/ AH/i, '').trim();
      return { day, full: `${day} ${monthStr} ${yearStr} AH` };
    } catch (e) {
      return { day: '-', full: 'Unavailable' };
    }
  };

  const getBengaliDetails = (gregorianDate: Date) => {
    try {
      const day = banglaCalendar.getDay(gregorianDate);
      const full = banglaCalendar.getDate(gregorianDate);
      return { day, full };
    } catch (e) {
      return { day: '১', full: 'Unavailable' };
    }
  };

  const renderCells = () => {
    const cells = [];
    
    for (let i = 0; i < startWeekday; i++) {
      cells.push(<div key={`empty-${i}`} className="h-16 sm:h-20 md:h-24 lg:h-28 xl:h-32"></div>);
    }
    
    for (let d = 1; d <= daysInMonth; d++) {
      const currentCellDate = new Date(year, month, d);
      const isToday = new Date().toDateString() === currentCellDate.toDateString();
      
      const hijri = getHijriDetails(currentCellDate);
      const bengali = getBengaliDetails(currentCellDate);

      // Determine Opacities based on Hover State
      const gregOpacity = hoveredType === 'none' || hoveredType === 'gregorian' ? 'opacity-100' : 'opacity-20';
      const hijriOpacity = hoveredType === 'none' || hoveredType === 'hijri' ? 'opacity-100' : 'opacity-20';
      const bengaliOpacity = hoveredType === 'none' || hoveredType === 'bengali' ? 'opacity-100' : 'opacity-20';
      
      const glowEffect = hoveredType !== 'none' ? 'hover:bg-white/10' : 'hover:bg-white/10 hover:border-white/30';

      cells.push(
        <div 
          key={`day-${d}`} 
          onClick={() => setSelectedDate(currentCellDate)}
          className={`relative h-16 sm:h-20 md:h-24 lg:h-28 xl:h-32 flex items-center justify-center rounded-xl border transition-all duration-300 cursor-pointer shadow-sm group overflow-hidden
            ${isToday && hoveredType === 'none'
              ? 'bg-blue-500/10 border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
              : 'bg-white/5 border-white/5'} ${glowEffect}`}
        >
          {/* Bengali Day */}
          <span className={`absolute bottom-1 left-1.5 sm:bottom-1.5 sm:left-2 md:bottom-2 md:left-2 text-[10px] sm:text-xs md:text-sm lg:text-base font-medium text-orange-400 transition-opacity duration-300 ${bengaliOpacity} ${hoveredType === 'bengali' ? 'drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]' : ''}`}>
            {bengali.day}
          </span>
          
          {/* Hijri Day */}
          <span className={`absolute top-1 right-1.5 sm:top-1.5 sm:right-2 md:top-2 md:right-2 text-[10px] sm:text-xs md:text-sm lg:text-base font-bold text-emerald-400 transition-opacity duration-300 ${hijriOpacity} ${hoveredType === 'hijri' ? 'drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]' : ''}`}>
            {hijri.day}
          </span>

          {/* Gregorian Day */}
          <span className={`text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-semibold transition-opacity duration-300 ${gregOpacity} ${isToday ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'text-white/90'} ${hoveredType === 'gregorian' ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] scale-110' : ''}`}>
            {d}
          </span>
        </div>
      );
    }
    return cells;
  };

  return (
    <div className="w-full mx-auto mb-12 relative">
      <div className="rounded-3xl bg-white/5 border border-white/10 p-4 sm:p-6 md:p-8 backdrop-blur-md shadow-2xl transition-all duration-500">
        
        {/* Header & Legend */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 md:mb-8 space-y-4 md:space-y-0 md:space-x-6">
          <div className="flex items-center space-x-3 text-white/80">
            <CalendarIcon className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold tracking-tight">Unified Calendar</h2>
          </div>
          
          {/* Interactive Legend */}
          <div className="flex flex-wrap justify-center bg-black/40 px-2 py-2 rounded-2xl border border-white/5 space-x-2">
            <div 
              onMouseEnter={() => setHoveredType('gregorian')}
              onMouseLeave={() => setHoveredType('none')}
              className="flex items-center space-x-2 text-sm text-blue-400 px-4 py-2 rounded-xl cursor-pointer hover:bg-blue-500/20 transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span className="font-medium hidden md:inline">Gregorian</span>
            </div>
            <div 
              onMouseEnter={() => setHoveredType('hijri')}
              onMouseLeave={() => setHoveredType('none')}
              className="flex items-center space-x-2 text-sm text-emerald-400 px-4 py-2 rounded-xl cursor-pointer hover:bg-emerald-500/20 transition-colors"
            >
              <Moon className="w-4 h-4" />
              <span className="font-medium hidden md:inline">Hijri</span>
            </div>
            <div 
              onMouseEnter={() => setHoveredType('bengali')}
              onMouseLeave={() => setHoveredType('none')}
              className="flex items-center space-x-2 text-sm text-orange-400 px-4 py-2 rounded-xl cursor-pointer hover:bg-orange-500/20 transition-colors"
            >
              <CalendarDays className="w-4 h-4" />
              <span className="font-medium hidden md:inline">Bengali</span>
            </div>
          </div>
        </div>

        {/* Navigation & Month Title */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navMonth(-1)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10 text-white/70 hover:text-white active:scale-95">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
            {monthName}
          </h3>
          <button onClick={() => navMonth(1)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10 text-white/70 hover:text-white active:scale-95">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-2 md:gap-4 mb-2">
          {WEEKDAYS.map(wd => (
            <div key={wd} className="text-center font-semibold text-white/40 text-[10px] sm:text-xs md:text-sm lg:text-base uppercase tracking-wider mb-1 md:mb-2">
              {wd}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2 md:gap-4">
          {renderCells()}
        </div>
      </div>

      {/* Expanded Day Modal */}
      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedDate(null)}>
          <div 
            className="w-full max-w-md bg-[#0a0a0a] rounded-3xl border border-white/10 p-6 md:p-8 shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-white/90">Detailed View</h3>
              <button onClick={() => setSelectedDate(null)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-white/60">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 md:space-y-6">
              <div className="flex items-center space-x-3 md:space-x-4 p-3 md:p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                <Globe className="w-6 h-6 md:w-8 md:h-8 text-blue-400 shrink-0" />
                <div>
                  <p className="text-[10px] md:text-xs text-blue-400/80 font-semibold uppercase tracking-wider mb-1">Gregorian</p>
                  <p className="text-base md:text-lg text-white/90 font-medium">{selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 md:space-x-4 p-3 md:p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <Moon className="w-6 h-6 md:w-8 md:h-8 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-[10px] md:text-xs text-emerald-400/80 font-semibold uppercase tracking-wider mb-1">Hijri</p>
                  <p className="text-base md:text-lg text-white/90 font-medium">{getHijriDetails(selectedDate).full}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 md:space-x-4 p-3 md:p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20">
                <CalendarDays className="w-6 h-6 md:w-8 md:h-8 text-orange-400 shrink-0" />
                <div>
                  <p className="text-[10px] md:text-xs text-orange-400/80 font-semibold uppercase tracking-wider mb-1">Bengali</p>
                  <p className="text-base md:text-lg text-white/90 font-medium">{getBengaliDetails(selectedDate).full}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
