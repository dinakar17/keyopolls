'use client';

import React, { useRef, useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, ChevronDown, Plus, Upload, X } from 'lucide-react';
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
import { COMMUNITY_CATEGORIES } from '@/constants/categories';
import { useProfileStore } from '@/stores/useProfileStore';

const communitySchema = z.object({
  name: z
    .string()
    .min(3, 'Community name must be at least 3 characters')
    .max(25, 'Community name cannot exceed 25 characters')
    .regex(/^[a-z0-9_]+$/, 'Name can only contain lowercase letters, numbers, and underscores'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(300, 'Description cannot exceed 300 characters'),
  community_type: z.enum(['public', 'private', 'restricted']),
  category_id: z.number({ required_error: 'Please select a category' }),
  tag_names: z
    .array(
      z
        .string()
        .min(2, 'Topic must be at least 2 characters')
        .max(50, 'Topic cannot exceed 50 characters')
    )
    .min(1, 'At least 1 topic is required')
    .max(3, 'Maximum 3 topics allowed'),
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
          router.push(`/communities/${response.data.name}`);
        },
        onError: (error) => {
          console.error('Error creating community:', error);
          toast.error(
            `${error.response?.data?.message || 'An unexpected error occurred. Please try again.'}`
          );
        },
      },
    });

  const [topics, setTopics] = useState<string[]>([]);
  const [topicInput, setTopicInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<(typeof COMMUNITY_CATEGORIES)[0] | null>(
    null
  );
  const [selectedCommunityType, setSelectedCommunityType] = useState(communityTypes[0]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [typeDrawerOpen, setTypeDrawerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      tag_names: [],
    },
  });

  const watchedFields = watch();

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('root', { message: 'Avatar file size must be less than 5MB' });
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('root', { message: 'Only JPEG, PNG, and WebP images are allowed' });
        return;
      }

      setAvatarFile(file);
      clearErrors('root');

      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addTopic = () => {
    const trimmedTopic = topicInput.trim().toLowerCase();
    if (trimmedTopic && !topics.includes(trimmedTopic) && topics.length < 3) {
      const newTopics = [...topics, trimmedTopic];
      setTopics(newTopics);
      setValue('tag_names', newTopics);
      setTopicInput('');
      trigger('tag_names');
    }
  };

  const removeTopic = (topicToRemove: string) => {
    const newTopics = topics.filter((topic) => topic !== topicToRemove);
    setTopics(newTopics);
    setValue('tag_names', newTopics);
    trigger('tag_names');
  };

  const handleTopicInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTopic();
    }
  };

  const selectCategory = (category: (typeof COMMUNITY_CATEGORIES)[0]) => {
    setSelectedCategory(category);
    setValue('category_id', category.id);
    setCategoryDrawerOpen(false);
    trigger('category_id');
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
        category_id: data.category_id,
        tag_names: data.tag_names,
      };
      createCommunity({
        data: {
          data: communityData,
          avatar: avatarFile || undefined,
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

          {/* Avatar Upload */}
          <div className="space-y-3">
            <label className="text-text block text-sm font-medium">Community Avatar</label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="border-border bg-surface flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border">
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
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-border bg-surface text-text hover:bg-surface-elevated inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium transition-colors"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Choose Image
                </button>
                <p className="text-text-muted text-xs">PNG, JPG, WebP (max 5MB)</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          {/* Community Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-text block text-sm font-medium">
              Community Name
            </label>
            <div className="relative">
              <input
                {...register('name')}
                id="name"
                type="text"
                placeholder="community_name"
                className="border-border bg-background text-text placeholder:text-text-muted focus:border-primary focus:ring-primary w-full rounded-md border px-3 py-2 focus:ring-1 focus:outline-none"
              />
            </div>
            <p className="text-text-muted text-xs">
              3-25 characters, lowercase letters, numbers, and underscores only.
            </p>
            {errors.name && <p className="text-error text-sm">{errors.name.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-text block text-sm font-medium">
              Description
            </label>
            <textarea
              {...register('description')}
              id="description"
              rows={4}
              placeholder="What's your community about? What kind of polls will be created here?"
              className="border-border bg-background text-text placeholder:text-text-muted focus:border-primary focus:ring-primary w-full resize-none rounded-md border px-3 py-2 focus:ring-1 focus:outline-none"
            />
            <div className="text-text-muted flex justify-between text-xs">
              <span>{errors.description?.message || ''}</span>
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

          {/* Category Selection */}
          <div className="space-y-3">
            <label className="text-text block text-sm font-medium">Category</label>
            <Drawer open={categoryDrawerOpen} onOpenChange={setCategoryDrawerOpen}>
              <DrawerTrigger asChild>
                <button
                  type="button"
                  className="border-border bg-background hover:bg-surface-elevated focus:border-primary focus:ring-primary flex w-full items-center justify-between rounded-md border px-3 py-2 text-left transition-colors focus:ring-1 focus:outline-none"
                >
                  {selectedCategory ? (
                    <div className="flex items-center gap-3">
                      <div
                        className="text-background flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium"
                        style={{ backgroundColor: selectedCategory.icon_color }}
                      >
                        {selectedCategory.icon.charAt(0)}
                      </div>
                      <span className="text-text font-medium">{selectedCategory.name}</span>
                    </div>
                  ) : (
                    <span className="text-text-muted">Select a category</span>
                  )}
                  <ChevronDown className="text-text-muted h-4 w-4" />
                </button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Choose Category</DrawerTitle>
                </DrawerHeader>
                <div className="max-h-[60vh] space-y-2 overflow-y-auto p-4">
                  {COMMUNITY_CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => selectCategory(category)}
                      className="border-border hover:bg-surface-elevated w-full rounded-md border p-3 text-left transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="text-background flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium"
                          style={{ backgroundColor: category.icon_color }}
                        >
                          {category.icon.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-text font-medium">{category.name}</h3>
                          <p className="text-text-secondary text-sm">{category.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </DrawerContent>
            </Drawer>
            {errors.category_id && (
              <p className="text-error text-sm">{errors.category_id.message}</p>
            )}
          </div>

          {/* Topics */}
          <div className="space-y-3">
            <label className="text-text block text-sm font-medium">Topics (1-3 required)</label>
            <p className="text-text-secondary text-sm">
              Add topics to help people find your community
            </p>

            {/* Topic Input */}
            <div className="flex gap-2">
              <input
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyDown={handleTopicInputKeyPress}
                placeholder="Type a topic and press Enter"
                disabled={topics.length >= 3}
                maxLength={50}
                className="border-border bg-background text-text placeholder:text-text-muted focus:border-primary focus:ring-primary flex-1 rounded-md border px-3 py-2 focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
              <button
                type="button"
                onClick={addTopic}
                disabled={!topicInput.trim() || topics.length >= 3}
                className="bg-primary text-background rounded-md px-3 py-2 transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Topic Display */}
            {topics.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {topics.map((topic, index) => (
                  <div
                    key={index}
                    className="bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm"
                  >
                    <span>{topic}</span>
                    <button
                      type="button"
                      onClick={() => removeTopic(topic)}
                      className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {errors.tag_names && <p className="text-error text-sm">{errors.tag_names.message}</p>}
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
