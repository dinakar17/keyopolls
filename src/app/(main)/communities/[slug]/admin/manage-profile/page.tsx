'use client';

import React, { useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

import {
  ArrowLeft,
  Calendar,
  Camera,
  Check,
  Edit3,
  FileText,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  Twitter,
  X,
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
  const searchParams = useSearchParams();

  // Check if edit mode is enabled via query param
  const isEditMode = searchParams.get('edit') === 'true';

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [headline, setHeadline] = useState('');
  const [about, setAbout] = useState('');
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // Edit field states
  const [editingField, setEditingField] = useState<string | null>(null);

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

  // Handle social links changes
  const handleSocialLinkChange = (platform: keyof SocialLinks, value: string) => {
    setSocialLinks((prev) => ({
      ...prev,
      [platform]: value,
    }));
  };

  // Handle file uploads
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
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
        toast.error('Banner file size must be less than 10MB');
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

  // Handle field updates
  const handleFieldUpdate = (field: string, value: string) => {
    editProfile(
      {
        data: {
          data: {
            display_name: field === 'displayName' ? value : displayName,
            headline: field === 'headline' ? value : headline,
            about: field === 'about' ? value : about,
            linkedin: field === 'linkedin' ? value : socialLinks.linkedin,
            twitter: field === 'twitter' ? value : socialLinks.twitter,
            substack: field === 'substack' ? value : socialLinks.substack,
            instagram: field === 'instagram' ? value : socialLinks.instagram,
            youtube: field === 'youtube' ? value : socialLinks.youtube,
          },
        },
      },
      {
        onSuccess: (response) => {
          toast.success('Profile updated successfully');
          setProfileData(response.data);
          setEditingField(null);
          refetchProfile();
        },
        onError: (error) => {
          const errorMessage = error.response?.data?.message || 'Failed to update profile';
          toast.error(errorMessage);
        },
      }
    );
  };

  // Handle image updates
  const handleImageUpdate = (type: 'avatar' | 'banner') => {
    const file = type === 'avatar' ? avatarFile : bannerFile;
    if (!file) return;

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
          ...(type === 'avatar' ? { avatar: file } : { banner: file }),
        },
      },
      {
        onSuccess: (response) => {
          toast.success(`${type === 'avatar' ? 'Profile picture' : 'Banner'} updated successfully`);
          setProfileData(response.data);
          if (type === 'avatar') setAvatarFile(null);
          if (type === 'banner') setBannerFile(null);
          refetchProfile();
        },
        onError: (error) => {
          const errorMessage = error.response?.data?.message || 'Failed to update image';
          toast.error(errorMessage);
        },
      }
    );
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    const params = new URLSearchParams(searchParams);
    if (isEditMode) {
      params.delete('edit');
    } else {
      params.set('edit', 'true');
    }
    router.push(`?${params.toString()}`);
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

  // Format social link URL
  const formatSocialUrl = (platform: keyof SocialLinks, value: string) => {
    if (!value) return '';

    const baseUrls = {
      linkedin: 'https://linkedin.com/in/',
      twitter: 'https://twitter.com/',
      substack: 'https://',
      instagram: 'https://instagram.com/',
      youtube: 'https://youtube.com/@',
    };

    if (value.startsWith('http')) return value;
    return baseUrls[platform] + value;
  };

  // Editable field component
  const EditableField = ({
    label,
    value,
    field,
    placeholder,
    maxLength = 100,
    multiline = false,
  }: {
    label: string;
    value: string;
    field: string;
    placeholder: string;
    maxLength?: number;
    multiline?: boolean;
  }) => {
    const [tempValue, setTempValue] = useState(value);
    const isEditing = editingField === field;

    useEffect(() => {
      setTempValue(value);
    }, [value]);

    const handleSave = () => {
      if (tempValue.trim() !== value) {
        if (field.startsWith('social-')) {
          const platform = field.replace('social-', '') as keyof SocialLinks;
          handleSocialLinkChange(platform, tempValue.trim());
          handleFieldUpdate(platform, tempValue.trim());
        } else {
          handleFieldUpdate(field, tempValue.trim());
        }
      }
      setEditingField(null);
    };

    const handleCancel = () => {
      setTempValue(value);
      setEditingField(null);
    };

    if (!isEditMode) {
      return (
        <div className="py-4">
          <div className="text-text-secondary mb-1 text-sm">{label}</div>
          <div className="text-text text-base">
            {value || <span className="text-text-muted italic">Not set</span>}
          </div>
        </div>
      );
    }

    if (isEditing) {
      return (
        <div className="py-4">
          <div className="text-text-secondary mb-2 text-sm">{label}</div>
          <div className="flex items-center gap-2">
            {multiline ? (
              <textarea
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                placeholder={placeholder}
                maxLength={maxLength}
                rows={3}
                className="border-primary text-text placeholder-text-muted flex-1 resize-none rounded-lg border-2 bg-transparent px-3 py-2 text-base focus:outline-none"
                autoFocus
              />
            ) : (
              <input
                type="text"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                placeholder={placeholder}
                maxLength={maxLength}
                className="border-primary text-text placeholder-text-muted flex-1 rounded-lg border-2 bg-transparent px-3 py-2 text-base focus:outline-none"
                autoFocus
              />
            )}
            <button
              onClick={handleSave}
              disabled={isPending}
              className="bg-primary text-background hover:bg-primary/90 rounded-full p-2 transition-colors disabled:opacity-50"
            >
              <Check size={16} />
            </button>
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="bg-surface-elevated text-text hover:bg-surface rounded-full p-2 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          {maxLength && (
            <div className="text-text-muted mt-1 text-right text-xs">
              {tempValue.length}/{maxLength}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        onClick={() => setEditingField(field)}
        className="hover:bg-surface-elevated -mx-2 w-full rounded-lg px-2 py-4 text-left transition-colors"
      >
        <div className="text-text-secondary mb-1 text-sm">{label}</div>
        <div className="text-text flex items-center justify-between text-base">
          <span>
            {value || <span className="text-text-muted italic">Add {label.toLowerCase()}</span>}
          </span>
          <Edit3 size={16} className="text-text-muted" />
        </div>
      </button>
    );
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
        {/* Header */}
        <div className="bg-primary text-background flex items-center gap-4 px-4 py-4">
          <button
            onClick={() => router.back()}
            className="hover:bg-primary/20 rounded-full p-2 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-medium">Profile</h1>
          <div className="ml-auto">
            <button
              onClick={toggleEditMode}
              className="hover:bg-primary/20 rounded-full p-2 transition-colors"
            >
              {isEditMode ? <Check size={20} /> : <Edit3 size={20} />}
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

            {isEditMode && (
              <div className="absolute right-4 bottom-4 flex gap-2">
                {bannerFile && (
                  <button
                    onClick={() => handleImageUpdate('banner')}
                    disabled={isPending}
                    className="bg-primary text-background hover:bg-primary/90 rounded-full p-2 shadow-lg transition-colors disabled:opacity-50"
                  >
                    <Check size={16} />
                  </button>
                )}
                <button
                  onClick={() => bannerInputRef.current?.click()}
                  disabled={isPending}
                  className="rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                >
                  <Camera size={16} />
                </button>
              </div>
            )}

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

              {isEditMode && (
                <div className="absolute right-2 bottom-2 flex gap-1">
                  {avatarFile && (
                    <button
                      onClick={() => handleImageUpdate('avatar')}
                      disabled={isPending}
                      className="bg-primary text-background hover:bg-primary/90 rounded-full p-1.5 shadow-lg transition-colors disabled:opacity-50"
                    >
                      <Check size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isPending}
                    className="bg-surface text-text hover:bg-surface-elevated border-border rounded-full border p-1.5 shadow-lg transition-colors"
                  >
                    <Camera size={14} />
                  </button>
                </div>
              )}

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

        {/* Profile Information */}
        <div className="bg-surface mt-16 px-6 pb-6">
          {/* Basic Info */}
          <div className="border-border-subtle border-b pb-6">
            <EditableField
              label="Name"
              value={displayName}
              field="displayName"
              placeholder="Enter your display name"
              maxLength={50}
            />

            <EditableField
              label="Headline"
              value={headline}
              field="headline"
              placeholder="What do you do?"
              maxLength={100}
            />

            <EditableField
              label="About"
              value={about}
              field="about"
              placeholder="Tell others about yourself"
              maxLength={500}
              multiline={true}
            />

            {/* Static Fields */}
            <div className="py-4">
              <div className="text-text-secondary mb-1 text-sm">Username</div>
              <div className="text-text text-base">@{profile.username}</div>
            </div>

            <div className="py-4">
              <div className="text-text-secondary mb-1 text-sm">Member since</div>
              <div className="text-text flex items-center gap-2 text-base">
                <Calendar size={16} />
                {formatDate(profile.created_at)}
              </div>
            </div>

            {profile.is_email_verified && (
              <div className="py-4">
                <div className="text-text-secondary mb-1 text-sm">Email</div>
                <div className="text-text flex items-center gap-2 text-base">
                  <Mail size={16} />
                  Verified
                </div>
              </div>
            )}
          </div>

          {/* Social Links */}
          <div className="pt-6">
            <div className="text-text mb-4 text-lg font-medium">Social Links</div>

            {Object.entries(socialLinks).map(([platform, value]) => (
              <div key={platform} className="flex items-center gap-4">
                <div className="text-text-secondary flex h-10 w-10 items-center justify-center">
                  {getSocialIcon(platform as keyof SocialLinks)}
                </div>
                <div className="flex-1">
                  <EditableField
                    label={platform.charAt(0).toUpperCase() + platform.slice(1)}
                    value={value || ''}
                    field={`social-${platform}`}
                    placeholder={`${platform === 'substack' ? 'URL' : 'Username'}`}
                    maxLength={100}
                  />
                </div>
                {value && !isEditMode && (
                  <a
                    href={formatSocialUrl(platform as keyof SocialLinks, value)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 p-2"
                  >
                    <Globe size={16} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageProfilePage;
