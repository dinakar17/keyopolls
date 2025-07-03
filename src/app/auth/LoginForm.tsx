'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

import { useKeyopollsProfileApiAuthLogin } from '@/api/default/default';
import { ProfileDetailsSchema } from '@/api/schemas';
import { toast } from '@/components/ui/toast';
import { useProfileStore } from '@/stores/useProfileStore';
import { loginSchema } from '@/types';

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: (user: ProfileDetailsSchema | undefined) => void;
}

const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const { setAccessToken, setProfileData } = useProfileStore();
  const { mutate: login, isPending } = useKeyopollsProfileApiAuthLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    login(
      {
        data: {
          email_or_username: data.email_or_username, // Updated field name
          password: data.password,
        },
      },
      {
        onSuccess: (response) => {
          setAccessToken(response.data.token);
          setProfileData(response.data.user);
          toast.success('Successfully logged in!');
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="text-text mb-2 block text-sm font-medium">Email or Username</label>
        <input
          type="text" // Changed from "email" to "text" to allow usernames
          {...register('email_or_username')} // Updated field name
          className="border-border bg-background text-text placeholder-text-muted focus:ring-primary focus:border-primary w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Enter your email or username"
          disabled={isPending}
          autoComplete="username" // For better browser autofill
        />
        {errors.email_or_username && (
          <p className="text-error mt-1 text-sm">{errors.email_or_username.message}</p>
        )}
      </div>

      <div>
        <label className="text-text mb-2 block text-sm font-medium">Password</label>
        <input
          type="password"
          {...register('password')}
          className="border-border bg-background text-text placeholder-text-muted focus:ring-primary focus:border-primary w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Enter your password"
          disabled={isPending}
          autoComplete="current-password"
        />
        {errors.password && <p className="text-error mt-1 text-sm">{errors.password.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-primary text-background w-full rounded-md px-4 py-2 font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? 'Signing In...' : 'Sign In'}
      </button>
    </form>
  );
};

export default LoginForm;
