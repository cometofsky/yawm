'use client';

import { useEffect, useState } from 'react';
import type { AsrJuristicMethod } from './lib/prayer';
import { Accessibility, Settings, MapPin } from 'lucide-react';
import Clock from './components/Clock';
import CalendarDisplay from './components/CalendarDisplay';
import SettingsModal from './components/SettingsModal';
import AccessibilityModal from './components/AccessibilityModal';
import { WaqtCountdownCard, TodayPrayerRibbon } from './components/PrayerDisplay';
import { useLocationState, locationLabel } from './lib/useLocationState';
import { useSettings } from './lib/useSettings';

export default function Home() {
  const locationState = useLocationState();
  const { settings, updateSetting, resetDefaults, resetAccessibility, resetAppearance } = useSettings();
  const [asrMethod, setAsrMethod] = useState<AsrJuristicMethod>('standard');
  useEffect(() => {
    try {
      const stored = localStorage.getItem('iyyam.asrMethod');
      if (stored === 'standard' || stored === 'hanafi') setAsrMethod(stored);
    } catch { /* The method remains consistent in memory when storage is unavailable. */ }
  }, []);
  const changeAsrMethod = (method: AsrJuristicMethod) => {
    setAsrMethod(method);
    try { localStorage.setItem('iyyam.asrMethod', method); } catch { /* Keep the session choice. */ }
  };
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);

  return (
    <main className="iyyam-app" data-theme={settings.colorTheme} data-contrast={settings.highContrast ? 'high' : 'normal'} data-motion={settings.reducedMotion ? 'reduce' : 'system'} data-controls={settings.largerControls ? 'large' : 'normal'} data-luminance={settings.luminance}>
      <div className="desk-layout">
        <header className="desk-header">
          <h1 className="wordmark">iyyam</h1>
          <div className="header-actions">
            <button type="button" className="ui-button" onClick={() => setAccessibilityOpen(true)}><span className="button-content"><Accessibility aria-hidden="true" size={18} /><span>Accessibility</span></span></button>
            <button type="button" className="ui-button" onClick={() => setSettingsOpen(true)}><span className="button-content"><Settings aria-hidden="true" size={18} /><span>Appearance</span></span></button>
          </div>
        </header>
        <section className="clock-stage" aria-label="Local time">
          <button type="button" className="location-trigger ui-button" onClick={() => locationState.setPickerOpen(true)}><span className="button-content"><MapPin aria-hidden="true" size={16}/><span>{locationLabel(locationState.location)}</span></span></button>
          <Clock isMain isFullHero timeZone={locationState.location.tz || undefined} label={locationLabel(locationState.location)} />
        </section>
        {settings.showPrayerTimes && <section className="waqt-stage" aria-label="Current waqt and countdown"><WaqtCountdownCard asrMethod={asrMethod} onAsrMethodChange={changeAsrMethod} location={locationState.location} isLoaded={locationState.isLoaded} onChooseLocation={() => locationState.setPickerOpen(true)} /></section>}
        {settings.showPrayerTimes && settings.prayerDisplayMode === 'all' && <section aria-label="Today's prayer boundaries"><TodayPrayerRibbon asrMethod={asrMethod} onAsrMethodChange={changeAsrMethod} location={locationState.location} isLoaded={locationState.isLoaded} /></section>}
        <CalendarDisplay locationState={locationState} settings={settings} />
        {settings.showWorldClocks && <section className="world-clocks" aria-label="World clocks"><Clock timeZone="Europe/London" label="London" /><Clock timeZone="Australia/Sydney" label="Sydney" /></section>}
      </div>
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} settings={settings} updateSetting={updateSetting} resetDefaults={resetDefaults} resetAppearance={resetAppearance} />
      <AccessibilityModal isOpen={accessibilityOpen} onClose={() => setAccessibilityOpen(false)} settings={settings} updateSetting={updateSetting} resetAccessibility={resetAccessibility} />
    </main>
  );
}
