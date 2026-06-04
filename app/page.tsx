import Clock from './components/Clock';
import CalendarDisplay from './components/CalendarDisplay';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 relative overflow-hidden">
      
      {/* Subtle animated background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-900/20 blur-[120px] pointer-events-none" />

      <div className="z-10 w-full max-w-7xl mx-auto flex flex-col items-center space-y-6 md:space-y-8 lg:space-y-12 mt-4 md:mt-8">
        <header className="text-center space-y-4 mb-4 md:mb-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 tracking-tight">
            Universal Time
          </h1>
        </header>

        <section className="w-full">
          <div className="flex flex-col lg:flex-row justify-center items-center gap-6 lg:gap-8 xl:gap-12 w-full">
            <div className="order-2 lg:order-1 scale-90 lg:scale-100">
              <Clock timeZone="Europe/London" label="London" />
            </div>
            
            <div className="order-1 lg:order-2">
              <Clock isMain={true} />
            </div>
            
            <div className="order-3 lg:order-3 scale-90 lg:scale-100">
              <Clock timeZone="Australia/Sydney" label="Sydney" />
            </div>
          </div>
        </section>

        <section className="w-full mt-4 md:mt-8">
          <CalendarDisplay />
        </section>
      </div>
      
    </main>
  );
}
