'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ResolvedLocation } from './hijri';
import { CITIES, nearestCity, cityByTimezone, City } from './locations';

export const NONE_LOCATION: ResolvedLocation = {
  name: '',
  country: '',
  lat: null,
  lon: null,
  tz: null,
  source: 'none',
};

export function locationLabel(loc: ResolvedLocation): string {
  switch (loc.source) {
    case 'gps':
      return loc.name + ' (GPS)';
    case 'city':
      return loc.name + ', ' + loc.country;
    case 'timezone':
      return loc.name + ' · approx';
    default:
      return 'Umm al-Qura (Saudi)';
  }
}

export function useLocationState() {
  const [location, setLocation] = useState<ResolvedLocation>(NONE_LOCATION);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [recents, setRecents] = useState<City[]>([]);
  const [pickerOpen, setPickerOpen] = useState<boolean>(false);
  const manualSelectionRef = useRef<boolean>(false);

  const [hijriOffset, setHijriOffset] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load offset from localStorage on mount
  useEffect(() => {
    try {
      const savedOffset = localStorage.getItem('hijriOffset');
      if (savedOffset) {
        const n = parseInt(savedOffset, 10);
        if (!isNaN(n)) setHijriOffset(n);
      }
    } catch (e) {
      console.warn('localStorage unavailable');
    }
  }, []);

  const updateOffset = (newOffset: number) => {
    setHijriOffset(newOffset);
    try {
      localStorage.setItem('hijriOffset', newOffset.toString());
    } catch (e) {
      // skip
    }
  };

  // Resolve location automatically: timezone gives an instant base, GPS upgrades it
  const resolveAuto = useCallback(() => {
    let applied = false;
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) {
        const c = cityByTimezone(tz);
        setLocation(
          c
            ? { name: c.name, country: c.country, lat: c.lat, lon: c.lon, tz: c.tz, source: 'timezone' }
            : { name: tz, country: '', lat: null, lon: null, tz: tz, source: 'timezone' }
        );
        applied = true;
      }
    } catch (e) {
      // Intl missing on older Safari
    }
    if (!applied) setLocation(NONE_LOCATION);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (manualSelectionRef.current) return;
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const c = nearestCity(lat, lon);
          setLocation({
            name: c ? c.name : lat.toFixed(2) + ',' + lon.toFixed(2),
            country: c ? c.country : '',
            lat: lat,
            lon: lon,
            tz: c ? c.tz : null,
            source: 'gps',
          });
        },
        () => {
          // keep timezone base
        },
        { timeout: 10000, maximumAge: 600000 }
      );
    }
  }, []);

  // Load saved location / recents
  useEffect(() => {
    try {
      const r = localStorage.getItem('iyyam.recentLocations');
      if (r) {
        const parsed = JSON.parse(r);
        if (parsed && parsed.length) setRecents(parsed);
      }
    } catch (e) {
      // ignore
    }

    let saved: City | null = null;
    try {
      const s = localStorage.getItem('iyyam.location');
      if (s) {
        const p = JSON.parse(s);
        if (p && typeof p.lat === 'number' && typeof p.lon === 'number' && typeof p.name === 'string') {
          saved = p;
        }
      }
    } catch (e) {
      // ignore
    }

    if (saved) {
      manualSelectionRef.current = true;
      setSelectedCity(saved);
      setLocation({ name: saved.name, country: saved.country, lat: saved.lat, lon: saved.lon, tz: saved.tz, source: 'city' });
      setIsLoaded(true);
      return;
    }
    resolveAuto();
    setIsLoaded(true);
  }, [resolveAuto]);

  const handleSelectCity = (c: City) => {
    manualSelectionRef.current = true;
    setSelectedCity(c);
    setLocation({ name: c.name, country: c.country, lat: c.lat, lon: c.lon, tz: c.tz, source: 'city' });
    setPickerOpen(false);
    try {
      localStorage.setItem('iyyam.location', JSON.stringify(c));
    } catch (e) {
      // ignore
    }
    setRecents((prev) => {
      const filtered = prev.filter(
        (p) => !(p.name === c.name && p.country === c.country && p.lat === c.lat && p.lon === c.lon)
      );
      const next = [c].concat(filtered).slice(0, 5);
      try {
        localStorage.setItem('iyyam.recentLocations', JSON.stringify(next));
      } catch (e) {
        // ignore
      }
      return next;
    });
  };

  const clearLocation = () => {
    manualSelectionRef.current = false;
    setSelectedCity(null);
    try {
      localStorage.removeItem('iyyam.location');
    } catch (e) {
      // ignore
    }
    resolveAuto();
  };

  return {
    location,
    selectedCity,
    recents,
    pickerOpen,
    setPickerOpen,
    hijriOffset,
    updateOffset,
    handleSelectCity,
    clearLocation,
    isLoaded,
  };
}
