import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QuizProvider } from '@/hooks/useQuizState';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'RetireDiary — Find Your Path to Financial Independence',
  description:
    'Take the 2-minute quiz, get matched with your FIRE strategy, and see exactly what financial advisor fees are really costing you.',
  keywords: 'FIRE, financial independence, retire early, index funds, coast FIRE, lean FIRE, barista FIRE, retirement calculator, investment fees',
  metadataBase: new URL('https://retirediary.com'), // Replace with actual domain
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'RetireDiary — Free FIRE Calculator & Strategy Quiz',
    description: 'Find your FIRE strategy. See the math. Retire earlier. Stop letting traditional finance steal 30% of your life.',
    url: 'https://retirediary.com',
    siteName: 'RetireDiary',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RetireDiary — Escape the system. Find your FIRE number.',
    description: 'Take the 2-minute quiz and get matched with your customized FIRE (Financial Independence, Retire Early) strategy.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Placeholder for Google AdSense Script */}
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body suppressHydrationWarning className="min-h-screen" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
        <QuizProvider>
          {children}
        </QuizProvider>
      </body>
    </html>
  );
}
