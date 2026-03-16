# World Clock & Calendar

A lightweight web application displaying current times in Bangladesh, London, and Sydney, along with dates in English, Bengali, and Hijri calendars. **Optimized for old browsers including iOS 10.3.4 Safari.**

## Features

- ⏰ Real-time clocks for Bangladesh (Dhaka), London, and Sydney
- 📅 Current date in English (Gregorian), Bengali (বাংলা), and Hijri (Islamic) calendars
- 🔋 Lightweight and fast - works on very old devices
- 📱 Responsive design for all screen sizes

## Compatibility

- iOS 10.3.4 Safari and other older browsers
- Uses ES5 JavaScript only (no modern features)
- No external dependencies or API calls
- Works completely offline after loading

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Build

```bash
npm run build
```

The static export will be generated in the `out` directory.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

1. Push this repository to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will automatically detect Next.js and deploy
6. Your site will be live and accessible from your old iPad!

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Manual Hosting

The `out` folder contains static HTML/CSS/JS that can be hosted on any static hosting service (Vercel, Netlify, GitHub Pages, etc.).

