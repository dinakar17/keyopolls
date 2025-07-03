'use client';

import { GoogleLogin } from '@react-oauth/google';

import { useKeyopollsProfileApiAuthGoogleSignin } from '@/api/default/default';
import { GoogleDataSchema, ProfileDetailsSchema } from '@/api/schemas';
import { toast } from '@/components/ui/toast';
import { useProfileStore } from '@/stores/useProfileStore';

interface GoogleSignInProps {
  onSuccess?: (user: ProfileDetailsSchema | undefined) => void;
  onRequiresCompletion?: (googleData: GoogleDataSchema | undefined) => void;
}

const GoogleSignIn = ({ onSuccess, onRequiresCompletion }: GoogleSignInProps) => {
  const { setAccessToken, setProfileData } = useProfileStore();
  const { mutate: googleSignin } = useKeyopollsProfileApiAuthGoogleSignin();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      googleSignin(
        { data: { credential: credentialResponse.credential } },
        {
          onSuccess: (response) => {
            if (response.data.requires_completion) {
              // Profile needs completion - pass Google data to parent
              toast.success('Google verification successful! Please complete your profile.');
              onRequiresCompletion?.(response.data.google_data);
            } else {
              // Profile is complete - log them in
              setAccessToken(response.data.token);
              setProfileData(response.data.user);
              toast.success('Successfully signed in with Google!');
              onSuccess?.(response.data.user);
            }
          },
          onError: (error) => {
            toast.error(`${error.response?.data?.message || 'Failed to sign in with Google'}`);
          },
        }
      );
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast.error('Failed to sign in with Google');
    }
  };

  const handleGoogleError = () => {
    toast.error('Google sign-in failed');
  };

  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        useOneTap={true} // Enable One-Tap through the button
        auto_select={false} // Don't auto-select accounts
        theme="outline" // Use outline theme for better theming compatibility
        size="large" // Large size for better visibility
        text="continue_with" // "Continue with Google" text
        shape="rectangular" // Rectangular shape
        logo_alignment="left" // Left-aligned logo
      />
    </div>
  );
};

export default GoogleSignIn;
