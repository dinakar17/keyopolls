'use client';

import React, { useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

import { ArrowLeft, Camera, Minus, Plus, Users, X } from 'lucide-react';

import { useKeyopollsCommunitiesApiGeneralGetCommunity } from '@/api/communities-general/communities-general';
import { useKeyopollsCommunitiesApiOperationsUpdateCommunity } from '@/api/communities/communities';
import toast from '@/components/ui/toast';
import { useProfileStore } from '@/stores/useProfileStore';

const EditCommunity = () => {
  const { accessToken } = useProfileStore();
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();

  // Form state
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState<string[]>(['']);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // Refs
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const rulesRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

  // Fetch community data
  const {
    data: communityData,
    isLoading: communityLoading,
    error: communityError,
  } = useKeyopollsCommunitiesApiGeneralGetCommunity(slug, {
    request: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  const community = communityData?.data;

  // Check permissions
  const canEdit =
    community?.membership_details?.role &&
    ['creator', 'admin'].includes(community.membership_details.role);

  // Initialize form with community data
  useEffect(() => {
    if (community) {
      setDescription(community.description || '');
      setRules(community.rules && community.rules.length > 0 ? community.rules : ['']);
      setAvatarPreview(community.avatar || null);
      setBannerPreview(community.banner || null);
    }
  }, [community]);

  // Auto-resize textarea function
  const autoResize = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  };

  // Handle textarea changes with auto-resize
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    autoResize(e.target);
  };

  const handleRuleChange = (index: number, value: string) => {
    const newRules = [...rules];
    newRules[index] = value;
    setRules(newRules);

    // Auto-resize the specific rule textarea
    setTimeout(() => {
      if (rulesRefs.current[index]) {
        autoResize(rulesRefs.current[index]!);
      }
    }, 0);
  };

  // Auto-resize on content load
  useEffect(() => {
    if (descriptionRef.current) {
      autoResize(descriptionRef.current);
    }
    rulesRefs.current.forEach((ref) => {
      if (ref) autoResize(ref);
    });
  }, [description, rules]);

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

  // Handle rules management
  const addRule = () => {
    setRules([...rules, '']);
  };

  const removeRule = (index: number) => {
    if (rules.length > 1) {
      const newRules = rules.filter((_, i) => i !== index);
      setRules(newRules);
      rulesRefs.current = rulesRefs.current.filter((_, i) => i !== index);
    }
  };

  const { mutate: updateCommunity, isPending } =
    useKeyopollsCommunitiesApiOperationsUpdateCommunity({
      request: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!community) return;

    // Filter out empty rules
    const filteredRules = rules.filter((rule) => rule.trim() !== '');

    // Check if any changes were made
    const hasChanges =
      description.trim() !== (community.description || '') ||
      JSON.stringify(filteredRules) !== JSON.stringify(community.rules || []) ||
      avatarFile !== null ||
      bannerFile !== null;

    if (!hasChanges) {
      toast.info('No changes made');
      return;
    }

    updateCommunity(
      {
        communityId: community.id,
        data: {
          data: {
            description: description.trim(),
            rules: filteredRules,
          },
          avatar: avatarFile ? avatarFile : undefined,
          banner: bannerFile ? bannerFile : undefined,
        },
      },
      {
        onSuccess: (response) => {
          toast.success('Community updated successfully');
          const updatedCommunity = response.data;
          // Update local state with new community data
          setDescription(updatedCommunity.description || '');
          setRules(
            updatedCommunity.rules && updatedCommunity.rules.length > 0
              ? updatedCommunity.rules
              : ['']
          );
          setAvatarPreview(updatedCommunity.avatar || null);
          setBannerPreview(updatedCommunity.banner || null);
        },
        onError: (error) => {
          console.error('Error updating community:', error);
          const errorMessage =
            error.response?.data?.message || error.message || 'Failed to update community';
          toast.error(errorMessage);
        },
      }
    );
  };

  const handleCancel = () => {
    if (community) {
      router.push(`/communities/${community.name}`);
    } else {
      router.back();
    }
  };

  if (communityLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary">Loading community...</p>
        </div>
      </div>
    );
  }

  if (communityError || !community) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-text mb-2 text-xl font-bold">Community not found</h2>
          <p className="text-text-secondary">The community you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-text mb-2 text-xl font-bold">Access Denied</h2>
          <p className="text-text-secondary">You don't have permission to edit this community.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen py-8">
      <div className="mx-auto max-w-2xl">
        <div className="bg-surface border-border rounded-2xl border shadow-sm">
          {/* Header */}
          <div className="border-border border-b px-8 py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="text-text-secondary hover:text-text hover:bg-surface-elevated flex items-center justify-center rounded-lg p-2 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-text text-2xl font-semibold">Edit Community</h1>
                <p className="text-text-secondary mt-1 text-sm">
                  Update your community information and settings
                </p>
              </div>
            </div>
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
                  Community Icon
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
                          <Users size={32} className="text-background" />
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
                      Change Icon
                    </button>
                    <p className="text-text-secondary mt-1 text-xs">Max 5MB</p>
                  </div>
                </div>
              </div>

              {/* Description Field */}
              <div className="group">
                <label className="text-text mb-3 block text-sm font-medium">
                  Description
                  <span className="text-text-secondary ml-2 text-xs font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <textarea
                    ref={descriptionRef}
                    value={description}
                    onChange={handleDescriptionChange}
                    disabled={isPending}
                    rows={4}
                    maxLength={1000}
                    className="border-border text-text placeholder-text-muted focus:border-border disabled:bg-surface-elevated w-full resize-none border-0 border-b-2 bg-transparent px-0 py-3 text-base transition-all duration-200 focus:ring-0 focus:outline-none disabled:cursor-not-allowed"
                    placeholder="Describe what your community is about..."
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
                    Help new members understand what your community is about
                  </div>
                  <div
                    className={`text-xs transition-colors ${
                      description.length > 900 ? 'text-warning' : 'text-text-muted'
                    }`}
                  >
                    {description.length}/1000
                  </div>
                </div>
              </div>

              {/* Rules Field */}
              <div className="group">
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-text block text-sm font-medium">
                    Community Rules
                    <span className="text-text-secondary ml-2 text-xs font-normal">(Optional)</span>
                  </label>
                  <button
                    type="button"
                    onClick={addRule}
                    disabled={isPending || rules.length >= 10}
                    className="bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus size={14} />
                    Add Rule
                  </button>
                </div>

                <div className="space-y-4">
                  {rules.map((rule, index) => (
                    <div key={index} className="group/rule relative">
                      <div className="flex items-start gap-3">
                        <div className="bg-surface-elevated text-text-secondary mt-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium">
                          {index + 1}
                        </div>
                        <div className="relative flex-1">
                          <textarea
                            ref={(el) => {
                              rulesRefs.current[index] = el;
                            }}
                            value={rule}
                            onChange={(e) => handleRuleChange(index, e.target.value)}
                            disabled={isPending}
                            rows={2}
                            maxLength={200}
                            className="border-border text-text placeholder-text-muted focus:border-border disabled:bg-surface-elevated w-full resize-none border-0 border-b-2 bg-transparent px-0 py-3 text-sm transition-all duration-200 focus:ring-0 focus:outline-none disabled:cursor-not-allowed"
                            placeholder={`Rule ${index + 1}...`}
                            style={{
                              lineHeight: '1.4',
                              minHeight: '3rem',
                              overflow: 'hidden',
                            }}
                          />
                          {/* Animated underline */}
                          <div className="bg-primary absolute bottom-2 left-0 h-0.5 w-0 transition-all duration-300 group-focus-within/rule:w-full"></div>
                        </div>
                        {rules.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRule(index)}
                            disabled={isPending}
                            className="text-text-muted hover:bg-error/10 hover:text-error mt-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Minus size={14} />
                          </button>
                        )}
                      </div>
                      <div className="mt-1 ml-9 flex items-center justify-between">
                        <div className="text-text-secondary text-xs">
                          Keep rules clear and enforceable
                        </div>
                        <div
                          className={`text-xs transition-colors ${
                            rule.length > 180 ? 'text-warning' : 'text-text-muted'
                          }`}
                        >
                          {rule.length}/200
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {rules.length >= 10 && (
                  <p className="text-warning mt-2 text-xs">Maximum of 10 rules allowed</p>
                )}
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
                disabled={isPending}
                className="bg-primary text-background focus:ring-primary/20 flex-1 rounded-xl px-6 py-3 text-base font-medium transition-all duration-200 hover:opacity-90 focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="border-background h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                    Updating...
                  </div>
                ) : (
                  'Update Community'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCommunity;
