import './globals.css';


export const metadata = {
  title: 'Universal Time Clock',
  description: 'A beautiful location-aware universal time clock featuring English, Hijri, and Bengali calendars.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* The Safari-10 globalThis shim + self-hosted core-js are injected at the very top of
          <head> (before Next's chunks) by scripts/transpile-legacy.js — ordering React/Next
          can't guarantee here, and it must work offline. */}
      <body className="antialiased selection:bg-blue-500/30">
        {children}
      </body>
    </html>
  );
}
