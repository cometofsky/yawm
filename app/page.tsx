'use client';

import Clock from './components/Clock';
import CalendarDisplay from './components/CalendarDisplay';
import { WaqtCountdownCard, TodayPrayerRibbon } from './components/PrayerDisplay';
import { useLocationState, locationLabel } from './lib/useLocationState';

export default function Home() {
  const locationState = useLocationState();

  return (
    // Desk-clock layout optimized for iPad 4 / desktop clock
    <main className="min-h-screen flex flex-col items-center px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-8 lg:pb-10 relative overflow-hidden bg-black text-white">
      <div className="z-10 w-full max-w-6xl mx-auto flex flex-col items-center space-y-3 sm:space-y-4 md:space-y-5">
        <header className="text-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white/90 tracking-tight">
            Universal Time
          </h1>
        </header>

        {/* Top Hero Section. The two cards are deliberately NOT co-equal, and width runs
            COUNTER to the hierarchy on purpose: the waqt keeps 5 of 8 tracks (62.5%) because its
            countdown is 8 monospace characters, but the local clock in the narrower 3 (37.5%) is
            the primary. Scale, luminance and elevation carry that alone — do not "fix" the widths
            to match the emphasis. */}
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
              timeZone={locationState.location.tz || undefined}
              label={locationLabel(locationState.location)}
            />
          </div>
        </section>

        {/* Full-Width Prayer Timetable Ribbon */}
        <section className="w-full">
          <TodayPrayerRibbon
            location={locationState.location}
            isLoaded={locationState.isLoaded}
          />
        </section>

        {/* World Clocks Bar — tertiary. Left-anchored to the same rail as the cards above;
            centring left them floating once the local clock stopped being full-width. */}
        <section className="flex flex-row justify-start items-center space-x-3 sm:space-x-4 w-full">
          <Clock timeZone="Europe/London" label="London" />
          <Clock timeZone="Australia/Sydney" label="Sydney" />
        </section>

        {/* Calendar Section: Gregorian, Hijri, Bengali & Monthly Calendar */}
        <section className="w-full">
          <CalendarDisplay locationState={locationState} />
        </section>
      </div>
    </main>
  );
}
