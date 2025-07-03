'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { GoogleOAuthProvider } from '@react-oauth/google';

import { GoogleDataSchema, ProfileDetailsSchema } from '@/api/schemas';
import { useProfileStore } from '@/stores/useProfileStore';

import EmailRegistration from './EmailRegistration';
import GoogleRegistrationCompletion from './GoogleRegistrationCompletion';
import GoogleSignIn from './GoogleSignIn';
import LoginForm from './LoginForm';

const AuthPage = () => {
  const [mode, setMode] = useState('signin'); // 'signin', 'signup', 'google-complete'
  const [googleData, setGoogleData] = useState<GoogleDataSchema | undefined>(undefined);
  const { isAuthenticated } = useProfileStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleAuthSuccess = (user: ProfileDetailsSchema | undefined) => {
    if (!user) {
      console.error('Authentication failed, no user data received');
      return;
    }
    router.push('/');
  };

  const handleGoogleRequiresCompletion = (data: GoogleDataSchema | undefined) => {
    setGoogleData(data);
    setMode('google-complete');
  };

  const handleBackToAuth = () => {
    setGoogleData(undefined);
    setMode('signin');
  };

  if (isAuthenticated()) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-text-secondary mt-2">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
      <div className="bg-background flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <h2 className="text-text text-3xl font-bold">
              {mode === 'google-complete'
                ? 'Complete Your Profile'
                : mode === 'signin'
                  ? 'Sign in to your account'
                  : 'Create your account'}
            </h2>
            {mode !== 'google-complete' && (
              <p className="text-text-secondary mt-2 text-sm">
                {mode === 'signin' ? (
                  <>
                    Don't have an account?{' '}
                    <button
                      onClick={() => setMode('signup')}
                      className="text-primary font-medium transition-opacity hover:opacity-80"
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      onClick={() => setMode('signin')}
                      className="text-primary font-medium transition-opacity hover:opacity-80"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-surface border-border border px-4 py-8 shadow-sm sm:rounded-lg sm:px-10">
            {mode === 'google-complete' ? (
              <GoogleRegistrationCompletion
                googleData={googleData}
                onSuccess={handleAuthSuccess}
                onBack={handleBackToAuth}
              />
            ) : (
              <>
                {/* Google Sign-in Button */}
                <div className="mb-6 flex w-full justify-center">
                  <GoogleSignIn
                    onSuccess={handleAuthSuccess}
                    onRequiresCompletion={handleGoogleRequiresCompletion}
                  />
                </div>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="border-border w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-surface text-text-secondary px-2">OR</span>
                  </div>
                </div>

                {/* Email Authentication */}
                {mode === 'signin' ? (
                  <LoginForm onSuccess={handleAuthSuccess} />
                ) : (
                  <EmailRegistration onSuccess={handleAuthSuccess} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default AuthPage;
