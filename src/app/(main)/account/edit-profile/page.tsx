'use client';

import React, { useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Camera, X } from 'lucide-react';

import { useKeyopollsProfileApiGeneralEditProfileInfo } from '@/api/profile-general/profile-general';
import toast from '@/components/ui/toast';
import { useProfileStore } from '@/stores/useProfileStore';

const EditProfile = () => {
  const { accessToken, profileData, setProfileData } = useProfileStore();
  const router = useRouter();

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [about, setAbout] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // Refs
  const displayNameRef = useRef<HTMLTextAreaElement>(null);
  const aboutRef = useRef<HTMLTextAreaElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with profile data
  useEffect(() => {
    if (profileData) {
      setDisplayName(profileData.display_name || '');
      setAbout(profileData.about || '');
      setAvatarPreview(profileData.avatar || null);
      setBannerPreview(profileData.banner || null);
    }
  }, [profileData]);

  // Auto-resize textarea function
  const autoResize = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  };

  // Handle textarea changes with auto-resize
  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDisplayName(e.target.value);
    autoResize(e.target);
  };

  const handleAboutChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAbout(e.target.value);
    autoResize(e.target);
  };

  // Auto-resize on content load
  useEffect(() => {
    if (displayNameRef.current) {
      autoResize(displayNameRef.current);
    }
    if (aboutRef.current) {
      autoResize(aboutRef.current);
    }
  }, [displayName, about]);

  // Handle file uploads
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error('Avatar file size must be less than 5MB');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        toast.error('Banner file size must be less than 10MB');
        return;
      }
      setBannerFile(file);
      const reader = new FileReader();
      reader.onload = () => setBannerPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Remove image previews
  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = '';
    }
  };

  const removeBanner = () => {
    setBannerFile(null);
    setBannerPreview(null);
    if (bannerInputRef.current) {
      bannerInputRef.current.value = '';
    }
  };

  const { mutate: editProfile, isPending } = useKeyopollsProfileApiGeneralEditProfileInfo({
    request: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName.trim()) {
      toast.error('Display name is required');
      return;
    }

    // Check if any changes were made
    const hasChanges =
      displayName.trim() !== (profileData?.display_name || '') ||
      about.trim() !== (profileData?.about || '') ||
      avatarFile !== null ||
      bannerFile !== null;

    if (!hasChanges) {
      toast.info('No changes made');
      return;
    }

    editProfile(
      {
        data: {
          data: { display_name: displayName.trim(), about: about.trim() },
          avatar: avatarFile || undefined,
          banner: bannerFile || undefined,
        },
      },
      {
        onSuccess: (response) => {
          toast.success('Profile updated successfully');
          setProfileData(response.data);
          router.push(`/profiles/${profileData?.username}`);
        },
        onError: (error) => {
          console.error('Error updating profile:', error);
          const errorMessage =
            error.response?.data?.message || error.message || 'Failed to update profile';
          toast.error(errorMessage);
        },
      }
    );
  };

  const handleCancel = () => {
    router.push(`/profile/${profileData?.username}`);
  };

  if (!profileData) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen py-8">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl">
          {/* Header */}
          <div className="border-border border-b px-8 py-6">
            <h1 className="text-text text-2xl font-semibold">Edit Profile</h1>
            <p className="text-text-secondary mt-1 text-sm">
              Update your profile information and personalize your presence
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-8">
              {/* Banner Upload */}
              <div className="group">
                <label className="text-text mb-3 block text-sm font-medium">
                  Banner Image
                  <span className="text-text-secondary ml-2 text-xs font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <div className="border-border bg-surface-elevated hover:border-border-subtle relative h-32 w-full overflow-hidden rounded-xl border-2 border-dashed transition-all duration-200">
                    {bannerPreview ? (
                      <>
                        <Image
                          src={bannerPreview}
                          alt="Banner preview"
                          className="h-full w-full object-cover"
                          width={800}
                          height={128}
                        />
                        <button
                          type="button"
                          onClick={removeBanner}
                          className="bg-text/50 text-background hover:bg-text/70 absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center">
                        <Camera size={24} className="text-text-muted mb-2" />
                        <p className="text-text-secondary text-sm">Click to upload banner</p>
                        <p className="text-text-muted text-xs">Max 10MB</p>
                      </div>
                    )}
                    <input
                      ref={bannerInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleBannerChange}
                      disabled={isPending}
                      className="absolute inset-0 cursor-pointer opacity-0"
                    />
                  </div>
                </div>
              </div>

              {/* Avatar Upload */}
              <div className="group">
                <label className="text-text mb-3 block text-sm font-medium">
                  Profile Picture
                  <span className="text-text-secondary ml-2 text-xs font-normal">(Optional)</span>
                </label>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="border-border bg-surface-elevated h-20 w-20 overflow-hidden rounded-full border-2">
                      {avatarPreview ? (
                        <Image
                          src={avatarPreview}
                          alt="Avatar preview"
                          className="h-full w-full object-cover"
                          width={80}
                          height={80}
                        />
                      ) : (
                        <div className="bg-primary text-background flex h-full w-full items-center justify-center text-xl font-bold">
                          {displayName.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="bg-error text-background absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:opacity-80"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <div>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      disabled={isPending}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={isPending}
                      className="border-border text-text hover:bg-surface-elevated flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Camera size={16} />
                      Change Picture
                    </button>
                    <p className="text-text-secondary mt-1 text-xs">Max 5MB</p>
                  </div>
                </div>
              </div>

              {/* Display Name Field */}
              <div className="group">
                <label className="text-text mb-3 block text-sm font-medium">
                  Display Name <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <textarea
                    ref={displayNameRef}
                    value={displayName}
                    onChange={handleDisplayNameChange}
                    disabled={isPending}
                    maxLength={50}
                    rows={1}
                    className="border-border text-text placeholder-text-muted focus:border-border disabled:bg-surface-elevated w-full resize-none border-0 border-b-2 bg-transparent px-0 py-3 text-lg font-medium transition-all duration-200 focus:ring-0 focus:outline-none disabled:cursor-not-allowed"
                    placeholder="Enter your display name..."
                    style={{
                      lineHeight: '1.4',
                      minHeight: '2.8rem',
                      overflow: 'hidden',
                    }}
                    required
                  />
                  {/* Animated underline */}
                  <div className="bg-primary absolute bottom-1.5 left-0 h-0.5 w-0 transition-all duration-300 group-focus-within:w-full"></div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-text-secondary text-xs">
                    This is how others will see your name
                  </div>
                  <div
                    className={`text-xs transition-colors ${
                      displayName.length > 45 ? 'text-error' : 'text-text-muted'
                    }`}
                  >
                    {displayName.length}/50
                  </div>
                </div>
              </div>

              {/* About Field */}
              <div className="group">
                <label className="text-text mb-3 block text-sm font-medium">
                  About
                  <span className="text-text-secondary ml-2 text-xs font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <textarea
                    ref={aboutRef}
                    value={about}
                    onChange={handleAboutChange}
                    disabled={isPending}
                    rows={4}
                    maxLength={500}
                    className="border-border text-text placeholder-text-muted focus:border-border disabled:bg-surface-elevated w-full resize-none border-0 border-b-2 bg-transparent px-0 py-3 text-base transition-all duration-200 focus:ring-0 focus:outline-none disabled:cursor-not-allowed"
                    placeholder="Tell others about yourself..."
                    style={{
                      lineHeight: '1.5',
                      minHeight: '6rem',
                      overflow: 'hidden',
                    }}
                  />
                  {/* Animated underline */}
                  <div
                    className="bg-primary absolute bottom-2 left-0 h-0.5 w-0 transition-all duration-300 group-focus-within:w-full"
                    style={{ marginBottom: '-2px' }}
                  ></div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-text-secondary text-xs">
                    Share a bit about yourself with the community
                  </div>
                  <div
                    className={`text-xs transition-colors ${
                      about.length > 450 ? 'text-warning' : 'text-text-muted'
                    }`}
                  >
                    {about.length}/500
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-10 flex gap-4">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isPending}
                className="border-border text-text hover:border-border-subtle hover:bg-surface-elevated flex-1 rounded-xl border-2 px-6 py-3 text-base font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || !displayName.trim()}
                className="bg-primary text-background focus:ring-primary/20 flex-1 rounded-xl px-6 py-3 text-base font-medium transition-all duration-200 hover:opacity-90 focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="border-background h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                    Updating...
                  </div>
                ) : (
                  'Update Profile'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
