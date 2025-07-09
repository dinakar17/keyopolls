'use client';

import React, { useRef, useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, ChevronDown, Upload, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useKeyopollsCommunitiesApiOperationsCreateCommunity } from '@/api/communities/communities';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { toast } from '@/components/ui/toast';
import { useProfileStore } from '@/stores/useProfileStore';

const communitySchema = z.object({
  name: z.string().min(1, 'Community name is required'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(300, 'Description cannot exceed 300 characters'),
  community_type: z.enum(['public', 'private', 'restricted']),
  avatar: z.any().refine((file) => file !== null, 'Community avatar is required'),
  banner: z.any().optional(),
});

type CommunityFormData = z.infer<typeof communitySchema>;

const communityTypes = [
  {
    value: 'public',
    label: 'Public',
    description: 'Anyone can join and create polls',
    disabled: false,
  },
  {
    value: 'private',
    label: 'Private',
    description: 'Members only, invite required',
    disabled: true,
    comingSoon: true,
  },
  {
    value: 'restricted',
    label: 'Restricted',
    description: 'Join requests need approval',
    disabled: true,
    comingSoon: true,
  },
];

const CommunityCreateForm = () => {
  const router = useRouter();
  const { accessToken } = useProfileStore();

  const { mutate: createCommunity, isPending: isCreating } =
    useKeyopollsCommunitiesApiOperationsCreateCommunity({
      request: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      mutation: {
        onSuccess: (response) => {
          toast.success('Congratulations! Your community has been created successfully.');
          router.push(`/communities/${response.data.slug}`);
        },
        onError: (error) => {
          console.error('Error creating community:', error);
          toast.error(
            `${error.response?.data?.message || 'An unexpected error occurred. Please try again.'}`
          );
        },
      },
    });

  const [selectedCommunityType, setSelectedCommunityType] = useState(communityTypes[0]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [typeDrawerOpen, setTypeDrawerOpen] = useState(false);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    trigger,
    setError,
    clearErrors,
  } = useForm<CommunityFormData>({
    resolver: zodResolver(communitySchema),
    mode: 'onChange',
    defaultValues: {
      community_type: 'public',
      avatar: null,
      banner: null,
    },
  });

  const watchedFields = watch();

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('avatar', { message: 'Avatar file size must be less than 5MB' });
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('avatar', { message: 'Only JPEG, PNG, and WebP images are allowed' });
        return;
      }

      setAvatarFile(file);
      setValue('avatar', file);
      clearErrors('avatar');
      trigger('avatar');

      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('banner', { message: 'Banner file size must be less than 10MB' });
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('banner', { message: 'Only JPEG, PNG, and WebP images are allowed' });
        return;
      }

      setBannerFile(file);
      setValue('banner', file);
      clearErrors('banner');
      trigger('banner');

      const reader = new FileReader();
      reader.onload = (e) => {
        setBannerPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setValue('avatar', null);
    trigger('avatar');
    if (avatarFileInputRef.current) {
      avatarFileInputRef.current.value = '';
    }
  };

  const removeBanner = () => {
    setBannerFile(null);
    setBannerPreview(null);
    setValue('banner', null);
    trigger('banner');
    if (bannerFileInputRef.current) {
      bannerFileInputRef.current.value = '';
    }
  };

  const selectCommunityType = (type: (typeof communityTypes)[0]) => {
    if (type.disabled) return;
    setSelectedCommunityType(type);
    setValue('community_type', type.value as 'public' | 'private' | 'restricted');
    setTypeDrawerOpen(false);
    trigger('community_type');
  };

  const onSubmit = async (data: CommunityFormData) => {
    try {
      // Add community data as JSON
      const communityData = {
        name: data.name,
        description: data.description,
        community_type: data.community_type,
      };
      createCommunity({
        data: {
          data: communityData,
          avatar: avatarFile || undefined,
          banner: bannerFile || undefined,
        },
      });
    } catch (error) {
      console.error('Error preparing community data:', error);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="border-border flex items-center justify-between border-b p-4">
        <button
          onClick={handleGoBack}
          className="hover:bg-surface-elevated flex h-9 w-9 items-center justify-center rounded-full transition-colors"
        >
          <X className="text-text-secondary h-5 w-5" />
        </button>
        <h1 className="text-text text-lg font-semibold">Create Community</h1>
        <div className="w-9" /> {/* Spacer */}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="mx-auto max-w-lg space-y-6">
          {/* Global Error Display */}
          {errors.root && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-800">{errors.root.message}</p>
            </div>
          )}

          {/* Banner Upload */}
          <div className="space-y-3">
            <label className="text-text block text-sm font-medium">
              Community Banner (Optional)
            </label>
            <div className="space-y-3">
              <div className="relative">
                <div
                  className={`border-border bg-surface flex h-32 w-full items-center justify-center overflow-hidden rounded-lg border ${errors.banner ? 'border-error' : ''}`}
                >
                  {bannerPreview ? (
                    <Image
                      src={bannerPreview}
                      alt="Banner preview"
                      className="h-full w-full object-cover"
                      width={400}
                      height={128}
                    />
                  ) : (
                    <div className="text-center">
                      <Camera className="text-text-muted mx-auto mb-2 h-8 w-8" />
                      <p className="text-text-muted text-sm">No banner selected</p>
                    </div>
                  )}
                </div>
                {bannerPreview && (
                  <button
                    type="button"
                    onClick={removeBanner}
                    className="bg-error text-background absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full text-xs transition-colors hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => bannerFileInputRef.current?.click()}
                  className="border-border bg-surface text-text hover:bg-surface-elevated inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium transition-colors"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {bannerPreview ? 'Change Banner' : 'Choose Banner'}
                </button>
                <p className="text-text-muted text-xs">
                  PNG, JPG, WebP (max 10MB) - Recommended: 1200x400px
                </p>
              </div>
            </div>
            <input
              ref={bannerFileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleBannerChange}
              className="hidden"
            />
            {errors.banner && <p className="text-error text-sm">{String(errors.banner.message)}</p>}
          </div>

          {/* Avatar Upload - Required */}
          <div className="space-y-3">
            <label className="text-text block text-sm font-medium">
              Community Avatar <span className="text-error">*</span>
            </label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div
                  className={`border-border bg-surface flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border ${errors.avatar ? 'border-error' : ''}`}
                >
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="h-full w-full object-cover"
                      width={64}
                      height={64}
                    />
                  ) : (
                    <Camera className="text-text-muted h-6 w-6" />
                  )}
                </div>
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="bg-error text-background absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs transition-colors hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => avatarFileInputRef.current?.click()}
                  className="border-border bg-surface text-text hover:bg-surface-elevated inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium transition-colors"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {avatarPreview ? 'Change Image' : 'Choose Image'}
                </button>
                <p className="text-text-muted text-xs">PNG, JPG, WebP (max 5MB)</p>
              </div>
            </div>
            <input
              ref={avatarFileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
            />
            {errors.avatar && <p className="text-error text-sm">{String(errors.avatar.message)}</p>}
          </div>

          {/* Community Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-text block text-sm font-medium">
              Community Name <span className="text-error">*</span>
            </label>
            <div className="relative">
              <input
                {...register('name')}
                id="name"
                type="text"
                placeholder="Enter community name"
                className="border-border bg-background text-text placeholder:text-text-muted focus:border-primary focus:ring-primary w-full rounded-md border px-3 py-2 focus:ring-1 focus:outline-none"
              />
            </div>
            <p className="text-text-muted text-xs">Choose any name for your community.</p>
            {errors.name && <p className="text-error text-sm">{errors.name.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-text block text-sm font-medium">
              Description <span className="text-error">*</span>
            </label>
            <textarea
              {...register('description')}
              id="description"
              rows={4}
              placeholder="What's your community about? What kind of polls will be created here?"
              className="border-border bg-background text-text placeholder:text-text-muted focus:border-primary focus:ring-primary w-full resize-none rounded-md border px-3 py-2 focus:ring-1 focus:outline-none"
            />
            <div className="text-text-muted flex justify-between text-xs">
              <span className="text-error">{errors.description?.message || ''}</span>
              <span>{watchedFields.description?.length || 0}/300</span>
            </div>
          </div>

          {/* Community Type */}
          <div className="space-y-3">
            <label className="text-text block text-sm font-medium">Community Type</label>
            <Drawer open={typeDrawerOpen} onOpenChange={setTypeDrawerOpen}>
              <DrawerTrigger asChild>
                <button
                  type="button"
                  className="border-border bg-background hover:bg-surface-elevated focus:border-primary focus:ring-primary flex w-full items-center justify-between rounded-md border px-3 py-2 text-left transition-colors focus:ring-1 focus:outline-none"
                >
                  <div>
                    <div className="text-text font-medium">{selectedCommunityType.label}</div>
                    <div className="text-text-secondary text-sm">
                      {selectedCommunityType.description}
                    </div>
                  </div>
                  <ChevronDown className="text-text-muted h-4 w-4" />
                </button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Choose Community Type</DrawerTitle>
                </DrawerHeader>
                <div className="space-y-2 p-4">
                  {communityTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => selectCommunityType(type)}
                      disabled={type.disabled}
                      className={`w-full rounded-md border p-3 text-left transition-colors ${
                        type.disabled
                          ? 'border-border bg-surface cursor-not-allowed opacity-60'
                          : 'border-border hover:bg-surface-elevated'
                      } ${selectedCommunityType.value === type.value ? 'border-primary ring-primary ring-1' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-text font-medium">{type.label}</h3>
                          <p className="text-text-secondary text-sm">{type.description}</p>
                        </div>
                        {type.comingSoon && (
                          <span className="bg-warning/20 text-warning rounded-full px-2 py-1 text-xs">
                            Coming Soon
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>

      {/* Fixed Create Button */}
      <div className="border-border bg-surface fixed right-0 bottom-0 left-0 border-t p-4">
        <div className="mx-auto max-w-lg">
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid || isCreating}
            className="bg-primary text-background w-full rounded-md px-4 py-3 font-medium transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCreating ? 'Creating Community...' : 'Create Community'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityCreateForm;
