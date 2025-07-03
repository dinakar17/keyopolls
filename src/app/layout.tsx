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
  title: 'Keyo - Where opinions matter',
  description:
    'Join Keyo, the platform where every opinion counts. Create polls, participate in discussions, earn aura, and connect with a community that values authentic perspectives. Express yourself freely with pseudonymous profiles.',
  keywords:
    'polls, voting, opinions, community, discussions, aura system, pseudonymous, authentic conversations, multiple choice polls, ranking polls, opinion platform, social polling, community engagement, real perspectives',
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
    title: 'Keyo - Where opinions matter',
    description:
      'Create diverse polls, earn aura by participating, engage in rich discussions, and express yourself safely with pseudonymous profiles. Join the community where every opinion counts.',
    siteName: 'Keyo',
    images: [
      {
        url: 'https://keyo.in/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Keyo - Where opinions matter',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Keyo - Where opinions matter',
    description:
      'Create diverse polls, earn aura by participating, engage in rich discussions, and express yourself safely with pseudonymous profiles. Join the community where every opinion counts.',
    images: [
      {
        url: 'https://keyo.in/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Keyo - Where opinions matter',
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
