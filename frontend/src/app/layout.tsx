import type { Metadata } from 'next';
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

export const metadata: Metadata = {
  title: 'Mandarin Mentor',
  description: 'Taiwanese Mandarin Coaching',
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