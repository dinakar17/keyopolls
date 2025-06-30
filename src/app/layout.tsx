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
  title: 'Connect - Connecting real humans in the age of AI',
  description:
    'Connect brings together authentic relationships beyond algorithms. Join the platform where real human connections matter while earning money for your content.',
  keywords:
    'human connections, authentic relationships, social platform, content monetization, real people, AI-free networking, genuine community, social media alternative, human-first platform, content creators',
  applicationName: 'Connect',
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
  metadataBase: new URL('https://connect.keyo.in'),

  // Social Media
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://connect.keyo.in',
    title: 'Connect - Connecting real humans in the age of AI',
    description:
      "The iPhone moment of social media is here. Connect connects everything most importantly real humans to real humans - all while rewarding you for content that other platforms simply can't.",
    siteName: 'Connect',
    images: [
      {
        url: 'https://connect.keyo.in/og-image.png', // Use full URL
        width: 1200,
        height: 630,
        alt: 'Connect - Connecting real humans in the age of AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Connect - Connecting real humans in the age of AI',
    description:
      "The iPhone moment of social media is here. Connect connects everything most importantly real humans to real humans - all while rewarding you for content that other platforms simply can't.",
    images: [
      {
        url: 'https://connect.keyo.in/og-image.png', // Use full URL and consistent image
        width: 1200,
        height: 630,
        alt: 'Connect - Connecting real humans in the age of AI', // Fixed alt text
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
    canonical: 'https://connect.keyo.in',
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
