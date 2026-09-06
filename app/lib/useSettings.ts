'use client';

import { useState, useEffect, useCallback } from 'react';

export interface CustomizationSettings {
  showWorldClocks: boolean;
  showPrayerTimes: boolean;
  prayerDisplayMode: 'current_next' | 'all';
  showGregorian: boolean;
  showHijri: boolean;
  showBengali: boolean;
  showMonthlyCalendar: boolean;
}

export const DEFAULT_SETTINGS: CustomizationSettings = {
  showWorldClocks: true,
  showPrayerTimes: true,
  prayerDisplayMode: 'all',
  showGregorian: true,
  showHijri: true,
  showBengali: true,
  showMonthlyCalendar: true,
};

const STORAGE_KEY = 'iyyam.settings';

export function useSettings() {
  const [settings, setSettings] = useState<CustomizationSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings((prev) => ({
          ...prev,
          ...parsed,
        }));
      }
    } catch (e) {
      // localStorage may fail in restricted/private modes
    }
    setIsLoaded(true);
  }, []);

  const updateSetting = useCallback(<K extends keyof CustomizationSettings>(
    key: K,
    value: CustomizationSettings[K]
  ) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        // ignore
      }
      return next;
    });
  }, []);

  const resetDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  }, []);

  return {
    settings,
    updateSetting,
    resetDefaults,
    isLoaded,
  };
}
