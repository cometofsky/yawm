import Clock from './components/Clock';
import CalendarDisplay from './components/CalendarDisplay';

export default function Home() {
  return (
    // Desk-clock layout: anchor to the top (no vertical centering) with a small top inset,
    // so the clock sits near the top edge on iPad / smaller screens instead of floating mid-screen.
    <main className="min-h-screen flex flex-col items-center px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 lg:pt-6 pb-8 lg:pb-10 relative overflow-hidden">

      {/* Background gradients removed for battery optimization */}

      <div className="z-10 w-full max-w-7xl mx-auto flex flex-col items-center space-y-4 md:space-y-5 lg:space-y-6">
        <header className="text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white/90 tracking-tight">
            Universal Time
          </h1>
        </header>

        <section className="w-full flex flex-col items-center gap-4 sm:gap-6">
          <div className="w-full flex justify-center">
            <Clock isMain={true} />
          </div>

          <div className="flex flex-row justify-center items-center gap-4 sm:gap-8 lg:gap-12 w-full scale-90 sm:scale-100">
            <Clock timeZone="Europe/London" label="London" />
            <Clock timeZone="Australia/Sydney" label="Sydney" />
          </div>
        </section>

        <section className="w-full">
          <CalendarDisplay />
        </section>
      </div>

    </main>
  );
}
