'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

import {
  useKeyopollsProfileApiAuthCompleteRegistration,
  useKeyopollsProfileApiAuthSendOtp,
  useKeyopollsProfileApiAuthVerifyOtp,
} from '@/api/default/default';
import { ProfileDetailsSchema } from '@/api/schemas';
import { toast } from '@/components/ui/toast';
import { useProfileStore } from '@/stores/useProfileStore';
import { emailSchema, otpSchema, registrationSchema } from '@/types';

type EmailData = z.infer<typeof emailSchema>;
type OtpData = z.infer<typeof otpSchema>;
type RegistrationData = z.infer<typeof registrationSchema>;

interface EmailRegistrationProps {
  onSuccess?: (user: ProfileDetailsSchema | undefined) => void;
}

const EmailRegistration = ({ onSuccess }: EmailRegistrationProps) => {
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: details
  const [email, setEmail] = useState('');
  const { setAccessToken, setProfileData } = useProfileStore();

  const { mutate: sendOtp, isPending: isSendingOtp } = useKeyopollsProfileApiAuthSendOtp();
  const { mutate: verifyOtp, isPending: isVerifyingOtp } = useKeyopollsProfileApiAuthVerifyOtp();
  const { mutate: completeRegistration, isPending: isCompletingRegistration } =
    useKeyopollsProfileApiAuthCompleteRegistration();

  // Form for step 1 (email)
  const emailForm = useForm<EmailData>({
    resolver: zodResolver(emailSchema),
  });

  // Form for step 2 (OTP)
  const otpForm = useForm<OtpData>({
    resolver: zodResolver(otpSchema),
  });

  // Form for step 3 (registration details)
  const registrationForm = useForm<RegistrationData>({
    resolver: zodResolver(registrationSchema),
  });

  const sendOTP = (data: EmailData) => {
    sendOtp(
      { data: { email: data.email } },
      {
        onSuccess: () => {
          setEmail(data.email);
          setStep(2);
          toast.success('OTP sent to your email!');
        },
        onError: (error) => {
          toast.error(
            `${error.response?.data?.message || 'An unexpected error occurred. Please try again.'}`
          );
        },
      }
    );
  };

  const verifyOTP = (data: OtpData) => {
    verifyOtp(
      { data: { email, otp: data.otp } },
      {
        onSuccess: () => {
          setStep(3);
          toast.success('Email verified successfully!');
        },
        onError: (error) => {
          console.error('Verify OTP error:', error);
          toast.error('Failed to verify OTP');
        },
      }
    );
  };

  const completeRegistrationSubmit = (data: RegistrationData) => {
    completeRegistration(
      {
        data: {
          email,
          username: data.username,
          password: data.password,
        },
      },
      {
        onSuccess: (response) => {
          setAccessToken(response.data.token);
          setProfileData(response.data.user);
          toast.success('Registration completed successfully!');
          onSuccess?.(response.data.user);
        },
        onError: (error) => {
          console.error('Registration error:', error);
          toast.error('Registration failed');
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Email */}
      {step === 1 && (
        <form onSubmit={emailForm.handleSubmit(sendOTP)} className="space-y-4">
          <div>
            <label className="text-text mb-2 block text-sm font-medium">Email Address</label>
            <input
              type="email"
              {...emailForm.register('email')}
              className="border-border bg-background text-text placeholder-text-muted focus:ring-primary focus:border-primary w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Enter your email"
              disabled={isSendingOtp}
            />
            {emailForm.formState.errors.email && (
              <p className="text-error mt-1 text-sm">{emailForm.formState.errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSendingOtp}
            className="bg-primary text-background w-full rounded-md px-4 py-2 font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSendingOtp ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
      )}

      {/* Step 2: OTP Verification */}
      {step === 2 && (
        <form onSubmit={otpForm.handleSubmit(verifyOTP)} className="space-y-4">
          <div>
            <label className="text-text mb-2 block text-sm font-medium">Verification Code</label>
            <p className="text-text-secondary mb-3 text-sm">
              Enter the 6-digit code sent to {email}
            </p>
            <input
              type="text"
              {...otpForm.register('otp')}
              className="border-border bg-background text-text placeholder-text-muted focus:ring-primary focus:border-primary w-full rounded-md border px-3 py-2 text-center text-lg focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="000000"
              maxLength={6}
              disabled={isVerifyingOtp}
            />
            {otpForm.formState.errors.otp && (
              <p className="text-error mt-1 text-sm">{otpForm.formState.errors.otp.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isVerifyingOtp}
            className="bg-primary text-background w-full rounded-md px-4 py-2 font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isVerifyingOtp ? 'Verifying...' : 'Verify OTP'}
          </button>

          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-primary w-full transition-opacity hover:opacity-80"
          >
            ← Back to email
          </button>
        </form>
      )}

      {/* Step 3: Complete Registration */}
      {step === 3 && (
        <form
          onSubmit={registrationForm.handleSubmit(completeRegistrationSubmit)}
          className="space-y-4"
        >
          <div>
            <label className="text-text mb-2 block text-sm font-medium">Username</label>
            <input
              type="text"
              {...registrationForm.register('username')}
              className="border-border bg-background text-text placeholder-text-muted focus:ring-primary focus:border-primary w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Choose a username"
              disabled={isCompletingRegistration}
            />
            {registrationForm.formState.errors.username && (
              <p className="text-error mt-1 text-sm">
                {registrationForm.formState.errors.username.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-text mb-2 block text-sm font-medium">Password</label>
            <input
              type="password"
              {...registrationForm.register('password')}
              className="border-border bg-background text-text placeholder-text-muted focus:ring-primary focus:border-primary w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Create a password"
              disabled={isCompletingRegistration}
            />
            {registrationForm.formState.errors.password && (
              <p className="text-error mt-1 text-sm">
                {registrationForm.formState.errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-text mb-2 block text-sm font-medium">Confirm Password</label>
            <input
              type="password"
              {...registrationForm.register('confirmPassword')}
              className="border-border bg-background text-text placeholder-text-muted focus:ring-primary focus:border-primary w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Confirm your password"
              disabled={isCompletingRegistration}
            />
            {registrationForm.formState.errors.confirmPassword && (
              <p className="text-error mt-1 text-sm">
                {registrationForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isCompletingRegistration}
            className="bg-primary text-background w-full rounded-md px-4 py-2 font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCompletingRegistration ? 'Creating Account...' : 'Complete Registration'}
          </button>

          <button
            type="button"
            onClick={() => setStep(2)}
            className="text-primary w-full transition-opacity hover:opacity-80"
          >
            ← Back to OTP verification
          </button>
        </form>
      )}
    </div>
  );
};

export default EmailRegistration;
