'use client';

import { useState, useEffect, useCallback } from 'react';
import { CalendarDays, Globe, MapPin, Moon, Plus, Minus } from 'lucide-react';
import MonthlyCalendar from './MonthlyCalendar';

const banglaCalendar = require('bangla-calendar');

type LocationStatus = 'pending' | 'geolocation' | 'ip' | 'error';

export default function CalendarDisplay() {
  const [hijriDateStr, setHijriDateStr] = useState<string>('Calculating...');
  const [bengaliDate, setBengaliDate] = useState<string>('Calculating...');
  const [englishDate, setEnglishDate] = useState<string>('Calculating...');
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('pending');
  const [locationName, setLocationName] = useState<string>('');
  
  const [hijriOffset, setHijriOffset] = useState<number>(0);
  const [isOffsetLoaded, setIsOffsetLoaded] = useState<boolean>(false);
  const [autoCorrectionOffset, setAutoCorrectionOffset] = useState<number>(0);

  // Load offset from localStorage on mount
  useEffect(() => {
    try {
      const savedOffset = localStorage.getItem('hijriOffset');
      if (savedOffset) {
        setHijriOffset(parseInt(savedOffset, 10));
      }
    } catch (e) {
      console.warn('localStorage unavailable');
    }
    setIsOffsetLoaded(true);
  }, []);

  const updateOffset = (newOffset: number) => {
    setHijriOffset(newOffset);
    try {
      localStorage.setItem('hijriOffset', newOffset.toString());
    } catch (e) {
      // skip
    }
  };

  const fetchHijriDate = useCallback(async () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocationStatus('geolocation');
          await getHijriFromCoords(latitude, longitude);
        },
        async (error) => {
          console.warn('Geolocation denied or failed. Falling back to IP.', error);
          await fetchFallbackIpLocation();
        },
        { timeout: 5000 }
      );
    } else {
      await fetchFallbackIpLocation();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hijriOffset]); 

  useEffect(() => {
    if (!isOffsetLoaded) return;

    const today = new Date();
    
    // English
    const enOptions: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    setEnglishDate(today.toLocaleDateString('en-US', enOptions));

    // Bengali
    try {
      const bnDate = banglaCalendar.getDate(today);
      setBengaliDate(bnDate);
    } catch (err) {
      setBengaliDate('Unavailable');
    }

    fetchHijriDate();
  }, [fetchHijriDate, isOffsetLoaded]);

  const fetchFallbackIpLocation = async () => {
    try {
      setLocationStatus('ip');
      const ipRes = await fetch('http://ip-api.com/json/');
      const ipData = await ipRes.json();
      
      if (ipData.status === 'success') {
        setLocationName(`${ipData.city}, ${ipData.country}`);
        await getHijriFromCoords(ipData.lat, ipData.lon);
      } else {
        throw new Error('IP API failed');
      }
    } catch (err) {
      console.error(err);
      setLocationStatus('error');
      fallbackGenericHijri();
    }
  };

  const getHijriFromCoords = async (lat: number, lon: number) => {
    try {
      const today = new Date();
      const todayDateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
      
      const res = await fetch(`https://api.aladhan.com/v1/timings/${todayDateStr}?latitude=${lat}&longitude=${lon}`);
      const data = await res.json();
      
      let maghribOffset = 0;
      if (data && data.data && data.data.timings && data.data.timings.Maghrib) {
         const timeStr = data.data.timings.Maghrib.split(' ')[0];
         const [mHours, mMins] = timeStr.split(':').map(Number);
         if (today.getHours() > mHours || (today.getHours() === mHours && today.getMinutes() >= mMins)) {
            maghribOffset = 1;
         }
      }

      const totalOffset = hijriOffset + maghribOffset;
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + totalOffset);
      const targetDateStr = `${targetDate.getDate()}-${targetDate.getMonth() + 1}-${targetDate.getFullYear()}`;
      
      let finalData = data;
      if (totalOffset !== 0) {
         const res2 = await fetch(`https://api.aladhan.com/v1/timings/${targetDateStr}?latitude=${lat}&longitude=${lon}`);
         finalData = await res2.json();
      }
      
      if (finalData && finalData.data && finalData.data.date && finalData.data.date.hijri) {
        const h = finalData.data.date.hijri;
        setHijriDateStr(`${h.day} ${h.month.en} ${h.year} AH`);
        if (locationStatus === 'geolocation') {
           setLocationName(finalData.data.meta.timezone);
        }

        // --- Calculate autoCorrectionOffset for the grid ---
        const aladhanDay = parseInt(h.day, 10);
        let bestOffset = 0;
        for (let test = -3; test <= 3; test++) {
          try {
            const tDate = new Date();
            tDate.setDate(tDate.getDate() + totalOffset + test);
            const dayStr = new Intl.DateTimeFormat('en-US-u-ca-islamic', {day: 'numeric'}).format(tDate);
            const intlDay = parseInt(dayStr, 10);
            if (intlDay === aladhanDay) {
              bestOffset = test;
              break;
            }
          } catch (e) {
            break; // Safari 10 throws RangeError on exotic extensions, break early
          }
        }
        setAutoCorrectionOffset(bestOffset + maghribOffset);

      } else {
        fallbackGenericHijri();
      }
    } catch (err) {
      console.error(err);
      fallbackGenericHijri();
    }
  };

  const fallbackGenericHijri = () => {
    const formatOptions: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };
    try {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + hijriOffset);
      const hDate = new Intl.DateTimeFormat('en-US-u-ca-islamic', formatOptions).format(targetDate);
      setHijriDateStr(hDate + ' (Approx)');
      setAutoCorrectionOffset(0);
    } catch (e) {
      setHijriDateStr('Unavailable');
    }
  };

  const totalGridOffset = hijriOffset + autoCorrectionOffset;

  return (
    <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 gap-6 mt-6 md:mt-12 px-2 sm:px-4 md:px-6 lg:px-8">
      
      {/* --- MOBILE/TABLET COMPACT VIEW --- */}
      <div className="md:hidden flex flex-col space-y-3 bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-md shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-emerald-400 to-orange-400 opacity-70"></div>
        
        {/* Gregorian Row */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400 shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <p className="text-lg font-medium text-white/90 truncate">{englishDate}</p>
        </div>

        {/* Hijri Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400 shrink-0">
              <Moon className="w-5 h-5" />
            </div>
            <p className="text-lg font-medium text-white/90 truncate">{hijriDateStr}</p>
          </div>
          <div className="flex items-center bg-white/10 rounded-lg p-0.5 border border-white/10 shrink-0 ml-2">
            <button onClick={() => updateOffset(hijriOffset - 1)} className="p-1 hover:bg-white/20 rounded-md text-white/60">
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-xs font-mono w-6 text-center text-white/80">{hijriOffset}</span>
            <button onClick={() => updateOffset(hijriOffset + 1)} className="p-1 hover:bg-white/20 rounded-md text-white/60">
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Bengali Row */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-500/20 rounded-xl text-orange-400 shrink-0">
            <CalendarDays className="w-5 h-5" />
          </div>
          <p className="text-lg font-medium text-white/90 truncate">{bengaliDate}</p>
        </div>
        
        <div className="flex items-center space-x-2 text-[10px] text-white/40 pt-2 border-t border-white/5 mt-1">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">
            {locationStatus === 'geolocation' ? `Auto (${locationName})` : locationStatus === 'ip' ? `Est. (${locationName})` : 'Detecting...'}
          </span>
        </div>
      </div>

      {/* --- DESKTOP EXPANDED CARDS --- */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {/* English Card */}
        <div className="group relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-5 lg:p-8 backdrop-blur-md transition-all hover:bg-white/10 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.2)]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-70"></div>
          <div className="flex items-center space-x-3 md:space-x-4 mb-4 md:mb-6">
            <div className="p-2 md:p-3 bg-blue-500/20 rounded-xl text-blue-400">
              <Globe className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-white/90 tracking-wide uppercase">Gregorian</h2>
          </div>
          <p className="text-xl sm:text-2xl md:text-3xl font-medium text-white/80 leading-snug break-words">
            {englishDate}
          </p>
        </div>

        {/* Hijri Card */}
        <div className="group relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-5 lg:p-8 backdrop-blur-md transition-all hover:bg-white/10 hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.2)]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-70"></div>
          <div className="flex justify-between items-start mb-4 md:mb-6">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="p-2 md:p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
                <Moon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-white/90 tracking-wide uppercase">Hijri</h2>
            </div>
            
            <div className="flex items-center bg-white/10 rounded-lg p-1 border border-white/10 shrink-0 ml-2">
              <button 
                onClick={() => updateOffset(hijriOffset - 1)}
                className="p-1 hover:bg-white/20 rounded-md transition-colors text-white/60 hover:text-white"
                title="Shift date -1 day"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono w-8 text-center text-white/80">
                {hijriOffset > 0 ? `+${hijriOffset}` : hijriOffset}
              </span>
              <button 
                onClick={() => updateOffset(hijriOffset + 1)}
                className="p-1 hover:bg-white/20 rounded-md transition-colors text-white/60 hover:text-white"
                title="Shift date +1 day"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <p className="text-xl sm:text-2xl md:text-3xl font-medium text-white/80 leading-snug mb-3 md:mb-4 break-words">
            {hijriDateStr}
          </p>
          
          <div className="flex items-center space-x-2 text-xs md:text-sm text-white/50">
            <MapPin className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
            <span>
              {locationStatus === 'pending' && 'Detecting location...'}
              {locationStatus === 'geolocation' && `Auto Detected (${locationName || 'GPS'})`}
              {locationStatus === 'ip' && `Est. Location (${locationName || 'IP'})`}
              {locationStatus === 'error' && 'Location unavailable'}
            </span>
          </div>
        </div>

        {/* Bengali Card */}
        <div className="md:col-span-2 xl:col-span-1 group relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-5 lg:p-8 backdrop-blur-md transition-all hover:bg-white/10 hover:shadow-[0_0_40px_-10px_rgba(245,158,11,0.2)]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-amber-500 opacity-70"></div>
          <div className="flex items-center space-x-3 md:space-x-4 mb-4 md:mb-6">
            <div className="p-2 md:p-3 bg-orange-500/20 rounded-xl text-orange-400">
              <CalendarDays className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-white/90 tracking-wide uppercase">Bengali</h2>
          </div>
          <p className="text-xl sm:text-2xl md:text-3xl font-medium text-white/80 leading-snug break-words">
            {bengaliDate}
          </p>
        </div>
      </div>

      {/* Monthly Calendar Section */}
      <div className="mt-2 md:mt-6">
        <MonthlyCalendar hijriOffset={totalGridOffset} />
      </div>

    </div>
  );
}
