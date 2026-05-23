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
      <body className="antialiased selection:bg-blue-500/30">
        {children}
      </body>
    </html>
  );
}
