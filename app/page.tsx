import Clock from './components/Clock';
import CalendarDisplay from './components/CalendarDisplay';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 relative overflow-hidden">
      
      {/* Subtle animated background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-900/20 blur-[120px] pointer-events-none" />

      <div className="z-10 w-full max-w-7xl mx-auto flex flex-col items-center space-y-6 md:space-y-8 lg:space-y-12">
        <header className="text-center space-y-4 mb-6 md:mb-8">
          <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 tracking-tight">
            Universal Time Clock
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-white/50 max-w-2xl lg:max-w-4xl mx-auto font-light">
            Synchronized global time featuring Gregorian, accurate location-based Hijri, and official Bengali calendars.
          </p>
        </header>

        <section className="w-full">
          <Clock />
        </section>

        <section className="w-full mt-4 md:mt-8">
          <CalendarDisplay />
        </section>
      </div>
      
    </main>
  );
}
