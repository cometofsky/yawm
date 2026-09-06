'use client';

import { useState } from 'react';
import { Settings } from 'lucide-react';
import Clock from './components/Clock';
import CalendarDisplay from './components/CalendarDisplay';
import SettingsModal from './components/SettingsModal';
import { WaqtCountdownCard, TodayPrayerRibbon } from './components/PrayerDisplay';
import { useLocationState, locationLabel } from './lib/useLocationState';
import { useSettings } from './lib/useSettings';

export default function Home() {
  const locationState = useLocationState();
  const { settings, updateSetting, resetDefaults } = useSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    // Desk-clock layout optimized for iPad 4 / desktop clock
    <main className="min-h-screen flex flex-col items-center px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-8 lg:pb-10 relative overflow-hidden bg-black text-white">
      <div className="z-10 w-full max-w-6xl mx-auto flex flex-col items-center space-y-3 sm:space-y-4 md:space-y-5">
        <header className="relative w-full flex items-center justify-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white/90 tracking-tight">
            Universal Time
          </h1>

          {/* Cogwheel Settings Icon — subtle and unobtrusive */}
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            aria-label="Customize display features"
            title="Customize display features"
            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-xl text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
          >
            <Settings className="w-5 h-5" />
          </button>
        </header>

        {/* Top Hero Section: adaptively changes shape based on active sections.
            When prayer time is active: split grid (5:3 waqt:clock).
            When prayer time is disabled: clock expands to take the entire hero container. */}
        {settings.showPrayerTimes ? (
          <section className="w-full grid grid-cols-1 md:grid-cols-8 gap-3 sm:gap-4 md:gap-5 items-stretch">
            {/* Secondary: Current Waqt & Countdown — wider, but dimmer and smaller */}
            <div className="w-full md:col-span-5">
              <WaqtCountdownCard
                location={locationState.location}
                isLoaded={locationState.isLoaded}
              />
            </div>

            {/* Primary: Local Clock & Date — narrower, but largest and fully white */}
            <div className="w-full md:col-span-3">
              <Clock
                isMain={true}
                isFullHero={false}
                timeZone={locationState.location.tz || undefined}
                label={locationLabel(locationState.location)}
              />
            </div>
          </section>
        ) : (
          /* Full-width adaptive clock centerpiece when prayer times are turned off */
          <section className="w-full">
            <Clock
              isMain={true}
              isFullHero={true}
              timeZone={locationState.location.tz || undefined}
              label={locationLabel(locationState.location)}
            />
          </section>
        )}

        {/* Full-Width Prayer Timetable Ribbon: shown only if prayer times are on AND full mode is chosen */}
        {settings.showPrayerTimes && settings.prayerDisplayMode === 'all' && (
          <section className="w-full">
            <TodayPrayerRibbon
              location={locationState.location}
              isLoaded={locationState.isLoaded}
            />
          </section>
        )}

        {/* World Clocks Bar: shown only if enabled in customization settings */}
        {settings.showWorldClocks && (
          <section className="flex flex-row justify-start items-center space-x-3 sm:space-x-4 w-full">
            <Clock timeZone="Europe/London" label="London" />
            <Clock timeZone="Australia/Sydney" label="Sydney" />
          </section>
        )}

        {/* Calendar Section: Gregorian, Hijri, Bengali & Monthly Calendar */}
        <section className="w-full">
          <CalendarDisplay locationState={locationState} settings={settings} />
        </section>
      </div>

      {/* Customization Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        updateSetting={updateSetting}
        resetDefaults={resetDefaults}
      />
    </main>
  );
}
