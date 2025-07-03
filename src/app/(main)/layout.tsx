'use client';

import { useEffect, useState } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import InitialLoader from '@/components/common/InitialLoader';
import { useProfileStore } from '@/stores/useProfileStore';

// Define which routes require authentication
// All other routes are considered public
const PROTECTED_ROUTES = [
  '/account/profile',
  '/settings',
  '/inbox',
  '/create-poll',
  '/create-community',
];

export default function ConnectLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, isInitialized, initializeProfile } = useProfileStore();

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeProfile();
      } catch (error) {
        console.error('Failed to initialize profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [initializeProfile]);

  useEffect(() => {
    // Only check authentication after initialization is complete and loading is done
    if (isInitialized && !isLoading) {
      const userIsAuthenticated = isAuthenticated();

      // Check if current route is protected
      const isProtectedRoute = PROTECTED_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(route + '/')
      );

      if (userIsAuthenticated) {
        // If user is authenticated and trying to visit login/register pages, redirect to home
        if (pathname === '/auth') {
          router.push('/');
        }
      } else {
        // If user is not authenticated and trying to visit protected routes
        if (isProtectedRoute) {
          // Optionally store the intended destination for redirect after login
          const redirectUrl = pathname !== '/' ? `?redirect=${encodeURIComponent(pathname)}` : '';
          router.push(`/auth${redirectUrl}`);
        }
        // All other routes are public and accessible
      }
    }
  }, [isAuthenticated, isInitialized, isLoading, router, pathname]);

  // Loading state
  if (isLoading || !isInitialized) {
    return <InitialLoader />;
  }

  return <div className="min-h-screen">{children}</div>;
}
