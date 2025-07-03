'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useKeyopollsProfileApiAuthCompleteGoogleRegistration } from '@/api/default/default';
import { GoogleDataSchema, ProfileDetailsSchema } from '@/api/schemas';
import { toast } from '@/components/ui/toast';
import { useProfileStore } from '@/stores/useProfileStore';

// Updated schema - only username required
const googleRegistrationSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
});

type GoogleRegistrationData = z.infer<typeof googleRegistrationSchema>;

interface GoogleRegistrationCompletionProps {
  googleData: GoogleDataSchema | undefined;
  onSuccess?: (user: ProfileDetailsSchema | undefined) => void;
  onBack?: () => void;
}

const GoogleRegistrationCompletion = ({
  googleData,
  onSuccess,
  onBack,
}: GoogleRegistrationCompletionProps) => {
  const { setAccessToken, setProfileData } = useProfileStore();
  const { mutate: completeGoogleRegistration, isPending } =
    useKeyopollsProfileApiAuthCompleteGoogleRegistration();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GoogleRegistrationData>({
    resolver: zodResolver(googleRegistrationSchema),
    defaultValues: {
      username: '', // No auto-fill from Google data
    },
  });

  const completeRegistration = (data: GoogleRegistrationData) => {
    completeGoogleRegistration(
      {
        data: {
          google_id: googleData?.google_id || '',
          username: data.username,
          // Remove display_name - it's optional and not needed
        },
      },
      {
        onSuccess: (response) => {
          setAccessToken(response.data.token);
          setProfileData(response.data.user);
          toast.success('Profile completed successfully!');
          onSuccess?.(response.data.user);
        },
        onError: (error) => {
          toast.error(
            `${error.response?.data?.message || 'An unexpected error occurred. Please try again.'}`
          );
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-text text-lg font-medium">Complete Your Profile</h3>
        <p className="text-text-secondary mt-1 text-sm">
          Google account verified for {googleData?.email}
        </p>
      </div>

      <form onSubmit={handleSubmit(completeRegistration)} className="space-y-4">
        <div>
          <label className="text-text mb-2 block text-sm font-medium">Username</label>
          <input
            type="text"
            {...register('username')}
            className="border-border bg-background text-text placeholder-text-muted focus:ring-primary focus:border-primary w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Choose a username"
            disabled={isPending}
          />
          {errors.username && <p className="text-error mt-1 text-sm">{errors.username.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="bg-primary text-background w-full rounded-md px-4 py-2 font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? 'Completing Profile...' : 'Complete Profile'}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="text-primary w-full transition-opacity hover:opacity-80"
          disabled={isPending}
        >
          ← Back to sign-in options
        </button>
      </form>
    </div>
  );
};

export default GoogleRegistrationCompletion;
