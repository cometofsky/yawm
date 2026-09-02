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

        {/* Top Hero Section: Side-by-Side Current Waqt (Left) and Local Clock (Right) */}
        <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5 items-stretch">
          {/* Left Hero Card: Current Waqt & Countdown */}
          <div className="w-full">
            <WaqtCountdownCard
              location={locationState.location}
              isLoaded={locationState.isLoaded}
            />
          </div>

          {/* Right Hero Card: Main Local Clock & Date */}
          <div className="w-full">
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

        {/* World Clocks Bar */}
        <section className="flex flex-row justify-center items-center gap-3 sm:gap-4 w-full">
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
