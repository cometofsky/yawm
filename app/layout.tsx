import './globals.css';


export const metadata = {
  title: 'iyyam — time, prayer & calendars',
  description: 'Your local clock, current waqt and Gregorian, Hijri and Bengali calendars. A quiet, customizable desk clock.',
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
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
