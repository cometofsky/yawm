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
  colorTheme: 'original' | 'slate' | 'forest' | 'warm';
  textScale: 100 | 125 | 150 | 200;
  highContrast: boolean;
  reducedMotion: boolean;
  largerControls: boolean;
  luminance: 'normal' | 'dim';
}

export const DEFAULT_SETTINGS: CustomizationSettings = {
  showWorldClocks: true,
  showPrayerTimes: true,
  prayerDisplayMode: 'all',
  showGregorian: true,
  showHijri: true,
  showBengali: true,
  showMonthlyCalendar: true,
  colorTheme: 'original',
  textScale: 100,
  highContrast: false,
  reducedMotion: false,
  largerControls: false,
  luminance: 'normal',
};

const STORAGE_KEY = 'iyyam.settings';
const DISPLAY_KEYS = ['showWorldClocks', 'showPrayerTimes', 'showGregorian', 'showHijri', 'showBengali', 'showMonthlyCalendar'] as const;
const ACCESSIBILITY_KEYS = ['textScale', 'highContrast', 'reducedMotion', 'largerControls', 'luminance'] as const;

// Stored data is an input boundary: keep existing choices, discard unknown or invalid fields.
export function normalizeSettings(value: unknown): CustomizationSettings {
  const result = { ...DEFAULT_SETTINGS };
  if (!value || typeof value !== 'object' || Array.isArray(value)) return result;
  const stored = value as Record<string, unknown>;
  for (const key of DISPLAY_KEYS) {
    if (typeof stored[key] === 'boolean') result[key] = stored[key];
  }
  for (const key of ['highContrast', 'reducedMotion', 'largerControls'] as const) {
    if (typeof stored[key] === 'boolean') result[key] = stored[key];
  }
  if (stored.prayerDisplayMode === 'all' || stored.prayerDisplayMode === 'current_next') result.prayerDisplayMode = stored.prayerDisplayMode;
  if (stored.colorTheme === 'original' || stored.colorTheme === 'slate' || stored.colorTheme === 'forest' || stored.colorTheme === 'warm') result.colorTheme = stored.colorTheme;
  if (stored.textScale === 100 || stored.textScale === 125 || stored.textScale === 150 || stored.textScale === 200) result.textScale = stored.textScale;
  if (stored.luminance === 'normal' || stored.luminance === 'dim') result.luminance = stored.luminance;
  return result;
}

function save(settings: CustomizationSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Preferences still work for this visit when storage is restricted.
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<CustomizationSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSettings(normalizeSettings(JSON.parse(stored)));
    } catch {
      // Corrupt data or private browsing must not block the clock.
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = settings.textScale + '%';
    root.setAttribute('data-theme', settings.colorTheme);
    root.setAttribute('data-contrast', settings.highContrast ? 'high' : 'normal');
    root.setAttribute('data-motion', settings.reducedMotion ? 'reduce' : 'system');
    root.setAttribute('data-controls', settings.largerControls ? 'large' : 'normal');
    root.setAttribute('data-luminance', settings.luminance);
  }, [settings]);

  const updateSetting = useCallback(<K extends keyof CustomizationSettings>(key: K, value: CustomizationSettings[K]) => {
    setSettings((prev) => {
      const next = normalizeSettings({ ...prev, [key]: value });
      save(next);
      return next;
    });
  }, []);

  const resetDefaults = useCallback(() => {
    setSettings((prev) => {
      const next = { ...prev, prayerDisplayMode: DEFAULT_SETTINGS.prayerDisplayMode };
      for (const key of DISPLAY_KEYS) next[key] = DEFAULT_SETTINGS[key];
      save(next);
      return next;
    });
  }, []);

  const resetAccessibility = useCallback(() => {
    setSettings((prev) => {
      const next = { ...prev };
      for (const key of ACCESSIBILITY_KEYS) {
        Object.assign(next, { [key]: DEFAULT_SETTINGS[key] });
      }
      save(next);
      return next;
    });
  }, []);

  const resetAppearance = useCallback(() => {
    setSettings((prev) => {
      const next = { ...prev, colorTheme: DEFAULT_SETTINGS.colorTheme };
      save(next);
      return next;
    });
  }, []);

  return { settings, updateSetting, resetDefaults, resetAccessibility, resetAppearance, isLoaded };
}
