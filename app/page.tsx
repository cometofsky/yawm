import Clock from './components/Clock';
import CalendarDisplay from './components/CalendarDisplay';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 relative overflow-hidden">
      
      {/* Subtle animated background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-900/20 blur-[120px] pointer-events-none" />

      <div className="z-10 w-full max-w-7xl mx-auto flex flex-col items-center space-y-4 md:space-y-6 lg:space-y-8 mt-2 md:mt-4">
        <header className="text-center mb-2 md:mb-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 tracking-tight">
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

        <section className="w-full mt-2 md:mt-6">
          <CalendarDisplay />
        </section>
      </div>
      
    </main>
  );
}
