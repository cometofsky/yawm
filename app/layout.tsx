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
      <head>
        <script 
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && typeof window.globalThis === 'undefined') {
                window.globalThis = window;
              }
            `
          }}
        />
        <script src="https://unpkg.com/core-js-bundle@3.37.1/minified.js"></script>
      </head>
      <body className="antialiased selection:bg-blue-500/30">
        {children}
      </body>
    </html>
  );
}
