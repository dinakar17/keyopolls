'use client';

import React, { useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import {
  ArrowLeft,
  Calendar,
  Camera,
  FileText,
  Instagram,
  Linkedin,
  Mail,
  Twitter,
  Youtube,
} from 'lucide-react';

import { useKeyopollsProfileApiGeneralGetProfileInfo } from '@/api/profile-general/profile-general';
import { useKeyopollsProfileApiGeneralEditProfileInfo } from '@/api/profile-general/profile-general';
import toast from '@/components/ui/toast';
import { useProfileStore } from '@/stores/useProfileStore';
import { formatDate } from '@/utils';

interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  substack?: string;
  instagram?: string;
  youtube?: string;
}

const ManageProfilePage = () => {
  const { accessToken, profileData, setProfileData } = useProfileStore();
  const router = useRouter();

  // Always start in edit mode since this is an edit page
  const [hasChanges, setHasChanges] = useState(false);

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [headline, setHeadline] = useState('');
  const [about, setAbout] = useState('');
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // Refs
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Fetch profile info
  const {
    data: profileInfo,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useKeyopollsProfileApiGeneralGetProfileInfo(profileData?.username || '', {
    request: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  const profile = profileInfo?.data;

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setHeadline(profile.headline || '');
      setAbout(profile.about || '');
      setSocialLinks({
        linkedin: profile.linkedin || '',
        twitter: profile.twitter || '',
        substack: profile.substack || '',
        instagram: profile.instagram || '',
        youtube: profile.youtube || '',
      });
      setAvatarPreview(profile.avatar || null);
      setBannerPreview(profile.banner || null);
    }
  }, [profile]);

  // Track changes to enable/disable save
  useEffect(() => {
    if (!profile) return;

    const hasTextChanges =
      displayName !== (profile.display_name || '') ||
      headline !== (profile.headline || '') ||
      about !== (profile.about || '') ||
      socialLinks.linkedin !== (profile.linkedin || '') ||
      socialLinks.twitter !== (profile.twitter || '') ||
      socialLinks.substack !== (profile.substack || '') ||
      socialLinks.instagram !== (profile.instagram || '') ||
      socialLinks.youtube !== (profile.youtube || '');

    const hasImageChanges = !!(avatarFile || bannerFile);

    setHasChanges(hasTextChanges || hasImageChanges);
  }, [profile, displayName, headline, about, socialLinks, avatarFile, bannerFile]);

  // Handle social links changes
  const handleSocialLinkChange = (platform: keyof SocialLinks, value: string) => {
    setSocialLinks((prev) => ({
      ...prev,
      [platform]: value,
    }));
  };

  // Handle file uploads with immediate preview
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
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
        toast.error('Image must be less than 10MB');
        return;
      }
      setBannerFile(file);
      const reader = new FileReader();
      reader.onload = () => setBannerPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Edit profile mutation
  const { mutate: editProfile, isPending } = useKeyopollsProfileApiGeneralEditProfileInfo({
    request: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  // Save all changes
  const handleSaveChanges = () => {
    editProfile(
      {
        data: {
          data: {
            display_name: displayName,
            headline: headline,
            about: about,
            linkedin: socialLinks.linkedin,
            twitter: socialLinks.twitter,
            substack: socialLinks.substack,
            instagram: socialLinks.instagram,
            youtube: socialLinks.youtube,
          },
          ...(avatarFile && { avatar: avatarFile }),
          ...(bannerFile && { banner: bannerFile }),
        },
      },
      {
        onSuccess: (response) => {
          toast.success('Profile updated successfully');
          setProfileData(response.data);
          setAvatarFile(null);
          setBannerFile(null);
          setHasChanges(false);
          refetchProfile();
          // Navigate back after successful save
          router.back();
        },
        onError: (error) => {
          const errorMessage = error.response?.data?.message || 'Failed to update profile';
          toast.error(errorMessage);
        },
      }
    );
  };

  // Cancel editing - navigate back without saving
  const handleCancel = () => {
    router.back();
  };

  // Get social link icon
  const getSocialIcon = (platform: keyof SocialLinks) => {
    const icons = {
      linkedin: <Linkedin size={20} />,
      twitter: <Twitter size={20} />,
      substack: <FileText size={20} />,
      instagram: <Instagram size={20} />,
      youtube: <Youtube size={20} />,
    };
    return icons[platform];
  };

  if (profileLoading) {
    return (
      <div className="bg-background min-h-screen">
        <div className="mx-auto max-w-md">
          <div className="animate-pulse">
            <div className="bg-surface-elevated mb-4 h-16"></div>
            <div className="bg-surface-elevated h-64 rounded-t-xl"></div>
            <div className="bg-surface rounded-b-xl p-6">
              <div className="bg-surface-elevated mb-4 h-6 rounded"></div>
              <div className="bg-surface-elevated mb-2 h-4 rounded"></div>
              <div className="bg-surface-elevated h-4 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-text mb-2 text-xl font-bold">Profile not found</h2>
          <p className="text-text-secondary">The profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-md">
        {/* Header - Always in edit mode */}
        <div className="bg-primary text-background flex items-center gap-4 px-4 py-4">
          <button
            onClick={handleCancel}
            className="hover:bg-primary/20 rounded-full p-2 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-medium">Edit Profile</h1>

          {/* Save and Cancel buttons */}
          <div className="ml-auto flex gap-2">
            <button
              onClick={handleCancel}
              className="hover:bg-primary/20 rounded-full px-3 py-1 text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={!hasChanges || isPending}
              className="text-primary rounded-full bg-white px-3 py-1 text-sm font-medium transition-colors hover:bg-gray-100 disabled:opacity-50"
            >
              {isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Profile Photo Section */}
        <div className="bg-surface-elevated relative">
          {/* Banner */}
          <div className="relative h-48 overflow-hidden">
            {bannerPreview ? (
              <Image
                src={bannerPreview}
                alt="Banner"
                className="h-full w-full object-cover"
                width={400}
                height={192}
              />
            ) : (
              <div className="from-primary to-secondary h-full w-full bg-gradient-to-br"></div>
            )}

            <button
              onClick={() => bannerInputRef.current?.click()}
              className="absolute right-4 bottom-4 rounded-full bg-black/50 p-3 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
            >
              <Camera size={18} />
            </button>

            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              onChange={handleBannerChange}
              className="hidden"
            />
          </div>

          {/* Avatar */}
          <div className="absolute -bottom-16 left-6">
            <div className="relative">
              <div className="bg-background border-background h-32 w-32 rounded-full border-4 p-1">
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt={profile.display_name}
                    className="h-full w-full rounded-full object-cover"
                    width={128}
                    height={128}
                  />
                ) : (
                  <div className="from-primary to-secondary text-background flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br text-3xl font-bold">
                    {profile.display_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <button
                onClick={() => avatarInputRef.current?.click()}
                className="bg-surface text-text hover:bg-surface-elevated border-border absolute right-2 bottom-2 rounded-full border p-2 shadow-lg transition-colors"
              >
                <Camera size={16} />
              </button>

              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Profile Information - Always in edit mode */}
        <div className="bg-surface mt-16 px-6 pb-6">
          {/* Basic Info */}
          <div className="border-border-subtle space-y-4 border-b pb-6">
            {/* Name Field */}
            <div>
              <label className="text-text-secondary mb-2 block text-sm font-medium">Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                maxLength={50}
                className="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
              />
            </div>

            {/* Headline Field */}
            <div>
              <label className="text-text-secondary mb-2 block text-sm font-medium">Headline</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="What do you do?"
                maxLength={100}
                className="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
              />
            </div>

            {/* About Field */}
            <div>
              <label className="text-text-secondary mb-2 block text-sm font-medium">About</label>
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Tell others about yourself"
                maxLength={500}
                rows={3}
                className="focus:ring-primary w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
              />
            </div>

            {/* Static Fields - Read only */}
            <div>
              <label className="text-text-secondary mb-2 block text-sm font-medium">Username</label>
              <p className="text-text">@{profile.username}</p>
            </div>

            <div>
              <label className="text-text-secondary mb-2 block text-sm font-medium">
                Member since
              </label>
              <div className="text-text flex items-center gap-2">
                <Calendar size={16} />
                {formatDate(profile.created_at)}
              </div>
            </div>

            {profile.is_email_verified && (
              <div>
                <label className="text-text-secondary mb-2 block text-sm font-medium">Email</label>
                <div className="text-text flex items-center gap-2">
                  <Mail size={16} />
                  Verified
                </div>
              </div>
            )}
          </div>

          {/* Social Links */}
          <div className="pt-6">
            <h3 className="text-text mb-4 text-lg font-medium">Social Links</h3>
            <div className="space-y-4">
              {Object.entries(socialLinks).map(([platform, value]) => (
                <div key={platform} className="flex items-center gap-4">
                  <div className="text-text-secondary flex h-10 w-10 items-center justify-center">
                    {getSocialIcon(platform as keyof SocialLinks)}
                  </div>
                  <div className="flex-1">
                    <label className="text-text-secondary mb-1 block text-sm font-medium">
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </label>
                    <input
                      type="text"
                      value={value || ''}
                      onChange={(e) =>
                        handleSocialLinkChange(platform as keyof SocialLinks, e.target.value)
                      }
                      placeholder={`${platform === 'substack' ? 'URL' : 'Username'}`}
                      maxLength={100}
                      className="focus:ring-primary w-full rounded border border-gray-300 px-3 py-1 focus:border-transparent focus:ring-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageProfilePage;
