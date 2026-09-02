'use client';

import Clock from './components/Clock';
import CalendarDisplay from './components/CalendarDisplay';
import PrayerDisplay from './components/PrayerDisplay';
import { useLocationState, locationLabel } from './lib/useLocationState';

export default function Home() {
  const locationState = useLocationState();

  return (
    // Desk-clock layout: anchor to the top with small inset for iPad / wall clock usage
    <main className="min-h-screen flex flex-col items-center px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4 lg:pt-6 pb-8 lg:pb-10 relative overflow-hidden">
      <div className="z-10 w-full max-w-7xl mx-auto flex flex-col items-center space-y-4 md:space-y-5 lg:space-y-6">
        <header className="text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white/90 tracking-tight">
            Universal Time
          </h1>
        </header>

        {/* Top Hero Section: Prayer Waqt on Left, Local Clock & World Clocks on Right */}
        <section className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 items-start">
            {/* Left Column: Current Waqt & Prayer Times — secondary, so it takes the narrower track */}
            <div className="w-full md:col-span-5">
              <PrayerDisplay location={locationState.location} isLoaded={locationState.isLoaded} />
            </div>

            {/* Right Column: Main Local Clock & Secondary World Clocks — primary, wider track */}
            <div className="w-full md:col-span-7 flex flex-col space-y-4">
              <div className="w-full">
                <Clock
                  isMain={true}
                  timeZone={locationState.location.tz || undefined}
                  label={locationLabel(locationState.location)}
                />
              </div>

              <div className="flex flex-row justify-start items-center gap-3 sm:gap-4 w-full">
                <Clock timeZone="Europe/London" label="London" />
                <Clock timeZone="Australia/Sydney" label="Sydney" />
              </div>
            </div>
          </div>
        </section>

        {/* Calendar Section: Gregorian, Hijri, Bengali & Monthly Calendar */}
        <section className="w-full">
          <CalendarDisplay locationState={locationState} />
        </section>
      </div>
    </main>
  );
}
