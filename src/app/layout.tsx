import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import { ReactQueryClientProvider } from '@/api/ReactQueryProvider';
import { ToastProvider } from '@/components/ui/toast';
import { ThemeProvider } from '@/stores/ThemeContext';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Keyo - Daily interaction, micro-learning, and opinion expression',
  description:
    'Transform your daily routine with Keyo - the platform for active learning through interactive polls, quick quizzes, and meaningful opinion expression. Build habits, gain knowledge, and engage with a community that values authentic perspectives through daily interactions.',
  keywords:
    'daily interaction, micro-learning, opinion expression, interactive polls, quick quizzes, habit building, active learning, community engagement, daily habits, knowledge building, authentic perspectives, pseudonymous profiles, aura system, opinion platform, learning community, daily engagement',
  applicationName: 'Keyo',
  authors: [{ name: 'Dinakar Chennupati' }],
  creator: 'Dinakar',
  publisher: 'Dinakar',
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  // PWA manifest
  manifest: '/manifest.json',
  metadataBase: new URL('https://keyo.in'),

  // Social Media
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://keyo.in',
    title: 'Keyo - Daily interaction, micro-learning, and opinion expression',
    description:
      'Transform your daily routine with active learning through interactive polls, quick quizzes, and meaningful opinion expression. Build knowledge-building habits while engaging with a community that values authentic perspectives.',
    siteName: 'Keyo',
    images: [
      {
        url: 'https://keyo.in/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Keyo - Daily interaction, micro-learning, and opinion expression',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Keyo - Daily interaction, micro-learning, and opinion expression',
    description:
      'Transform your daily routine with active learning through interactive polls, quick quizzes, and meaningful opinion expression. Build knowledge-building habits while engaging with a community that values authentic perspectives.',
    images: [
      {
        url: 'https://keyo.in/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Keyo - Daily interaction, micro-learning, and opinion expression',
      },
    ],
    creator: '@DinakarChennup1',
    site: '@DinakarChennup1',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [{ url: '/favicon.ico' }],
    apple: [{ url: '/icon-512-maskable.png', sizes: '180x180', type: 'image/png' }],
    other: [
      {
        rel: 'manifest',
        url: '/manifest.json',
      },
    ],
  },
  alternates: {
    canonical: 'https://keyo.in',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <ReactQueryClientProvider>
          <ThemeProvider>
            <ToastProvider position="top-center">
              <div className="bg-background text-text">{children}</div>
            </ToastProvider>
          </ThemeProvider>
        </ReactQueryClientProvider>
      </body>
    </html>
  );
}
