import type { Metadata } from 'next';
import type { Viewport } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';
import { Outfit } from 'next/font/google';
import { Providers } from './providers';

const nunito = Nunito({ 
  subsets: ['latin'],
  variable: '--font-nunito'
});

const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-outfit'
});

// Architectural Note: viewport-fit=cover and userScalable=false eliminate elastic bounce and zooming shifts during mobile virtual keyboard activation.
export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Mandarin Mentor',
  description: 'Taiwanese Mandarin Coaching',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Mandarin',
  },
  icons: {
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${nunito.variable} ${outfit.variable}`}>
      <body className={`${nunito.className} ${nunito.variable} ${outfit.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}