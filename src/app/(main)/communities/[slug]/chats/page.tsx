'use client';

import React, { useCallback, useMemo, useState } from 'react';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

import {
  ChevronDown,
  ChevronUp,
  Crown,
  MessageCircle,
  Settings,
  Share,
  Shield,
  Users,
  X,
} from 'lucide-react';

import { useKeyopollsCommunitiesApiGeneralGetCommunity } from '@/api/communities-general/communities-general';
import { useKeyopollsCommunitiesApiOperationsToggleCommunityMembership } from '@/api/communities/communities';
import BottomNavigation from '@/components/common/BottomNavigation';
import { toast } from '@/components/ui/toast';
import { useProfileStore } from '@/stores/useProfileStore';

import ChatsList from './ChatsList';

// Loading Skeleton Components
const CommunityHeaderSkeleton = () => (
  <div className="mb-6 flex animate-pulse items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="bg-surface-elevated h-8 w-8 rounded-full" />
      <div>
        <div className="bg-surface-elevated mb-1 h-5 w-32 rounded" />
        <div className="bg-surface-elevated h-3 w-20 rounded" />
      </div>
    </div>
  </div>
);

const ChatsPage = () => {
  const { accessToken } = useProfileStore();
  const router = useRouter();
  const { slug: communitySlug } = useParams<{ slug: string }>();

  // State management
  const [showCommunityDrawer, setShowCommunityDrawer] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Fetch community data
  const {
    data: communityData,
    isLoading: communityLoading,
    refetch: refetchCommunity,
  } = useKeyopollsCommunitiesApiGeneralGetCommunity(communitySlug, {
    request: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  const community = communityData?.data;

  // Join/Leave membership mutation
  const { mutate: toggleMembership, isPending: isToggling } =
    useKeyopollsCommunitiesApiOperationsToggleCommunityMembership({
      request: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

  // Community handlers
  const handleJoinCommunity = useCallback(() => {
    if (!community) return;
    toggleMembership(
      {
        communityId: community.id,
        data: { action: 'join' },
      },
      {
        onSuccess: (response) => {
          toast.success(response.data.message);
          refetchCommunity();
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || 'Failed to join community');
        },
      }
    );
  }, [community, toggleMembership, refetchCommunity]);

  const handleLeaveCommunity = useCallback(() => {
    if (!community) return;
    toggleMembership(
      {
        communityId: community.id,
        data: { action: 'leave' },
      },
      {
        onSuccess: (response) => {
          toast.success(response.data.message);
          refetchCommunity();
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || 'Failed to leave community');
        },
      }
    );
  }, [community, toggleMembership, refetchCommunity]);

  const handleShare = useCallback(async () => {
    const shareData = {
      title: `${community?.name} Community`,
      text: `Check out the ${community?.name} community!`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Community link copied to clipboard!');
      }
    } catch {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Community link copied to clipboard!');
      } catch {
        toast.error('Failed to share community link');
      }
    }
  }, [community]);

  // Helper functions
  const getCommunityIcon = useCallback((type: string) => {
    switch (type) {
      case 'public':
        return <Users className="h-3 w-3" />;
      case 'private':
        return <Shield className="h-3 w-3" />;
      case 'restricted':
        return <Shield className="h-3 w-3" />;
      default:
        return <Users className="h-3 w-3" />;
    }
  }, []);

  const getRoleIcon = useCallback((role: string) => {
    switch (role) {
      case 'creator':
        return <Crown className="text-warning h-4 w-4" />;
      case 'admin':
        return <Shield className="text-error h-4 w-4" />;
      case 'moderator':
        return <Shield className="text-primary h-4 w-4" />;
      default:
        return <Users className="text-text-secondary h-4 w-4" />;
    }
  }, []);

  const truncateDescription = useCallback((text: string, maxLength = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }, []);

  // Memoize computed values
  const membership = useMemo(() => community?.membership_details, [community]);
  const permissions = useMemo(() => community?.user_permissions, [community]);
  const isMember = useMemo(() => membership?.is_active, [membership]);
  const isModerator = useMemo(
    () => ['creator', 'admin', 'moderator'].includes(membership?.role || ''),
    [membership]
  );

  // Community Drawer Component
  const CommunityDrawer = useMemo(() => {
    const DrawerComponent = () => (
      <div className="bg-background/80 fixed inset-0 z-50 flex items-end justify-center backdrop-blur-sm">
        <div className="bg-surface border-border max-h-[80vh] w-full max-w-md overflow-y-auto rounded-t-xl border-t shadow-xl">
          {/* Header */}
          <div className="border-border flex items-center justify-between border-b p-4">
            <h2 className="text-text text-lg font-semibold">Community Info</h2>
            <button
              onClick={() => setShowCommunityDrawer(false)}
              className="text-text-muted hover:text-text hover:bg-surface-elevated rounded-full p-1.5 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Community Info */}
          <div className="p-4">
            {/* Avatar and Name */}
            <div className="mb-4 flex items-center gap-3">
              {community?.avatar ? (
                <Image
                  src={community.avatar}
                  alt={community.name}
                  className="h-12 w-12 rounded-full object-cover"
                  width={48}
                  height={48}
                />
              ) : (
                <div className="bg-surface-elevated flex h-12 w-12 items-center justify-center rounded-full">
                  <Users className="text-text-muted h-6 w-6" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="text-text text-lg font-semibold">{community?.name}</h3>
                <div className="text-text-muted flex items-center gap-1 text-sm">
                  <Users className="h-3 w-3" />
                  <span>{community?.member_count.toLocaleString()} members</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {community?.description && (
              <div className="mb-4">
                <p className="text-text-secondary text-sm leading-relaxed">
                  {showFullDescription
                    ? community.description
                    : truncateDescription(community.description)}
                </p>
                {community.description.length > 120 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-primary mt-1 flex items-center gap-1 text-xs transition-opacity hover:opacity-80"
                  >
                    {showFullDescription ? (
                      <>
                        <ChevronUp className="h-3 w-3" />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3" />
                        Read more
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Community Type and Member Status */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <div className="bg-surface-elevated text-text-secondary flex items-center gap-1 rounded-full px-2 py-1 text-xs">
                {getCommunityIcon(community?.community_type || '')}
                <span className="capitalize">{community?.community_type}</span>
              </div>
              {membership && (
                <div className="bg-primary/10 text-primary flex items-center gap-1 rounded-full px-2 py-1 text-xs">
                  {getRoleIcon(membership.role)}
                  <span className="capitalize">{membership.role}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleShare}
                className="border-border bg-surface text-text hover:bg-surface-elevated flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors"
              >
                <Share className="mx-auto h-4 w-4" />
              </button>

              {isMember ? (
                isModerator ? (
                  <button
                    onClick={() => router.push(`/communities/${community?.slug}/admin`)}
                    className="bg-surface border-border text-text hover:bg-surface-elevated flex flex-1 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Manage
                  </button>
                ) : (
                  <button
                    onClick={handleLeaveCommunity}
                    disabled={isToggling}
                    className="bg-error text-background flex-1 rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {isToggling ? 'Leaving...' : 'Leave'}
                  </button>
                )
              ) : permissions?.can_join ? (
                <button
                  onClick={handleJoinCommunity}
                  disabled={isToggling}
                  className="bg-primary text-background flex-1 rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {isToggling ? 'Joining...' : 'Join'}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );

    DrawerComponent.displayName = 'CommunityDrawer';
    return DrawerComponent;
  }, [
    community,
    membership,
    showFullDescription,
    isMember,
    isModerator,
    permissions,
    isToggling,
    handleShare,
    handleJoinCommunity,
    handleLeaveCommunity,
    getCommunityIcon,
    getRoleIcon,
    truncateDescription,
    router,
  ]);

  // Show loading state
  if (communityLoading && !community) {
    return (
      <div className="bg-background min-h-screen">
        <div className="mx-auto max-w-2xl px-4 py-6">
          <CommunityHeaderSkeleton />
          <div className="mb-6">
            <div className="bg-surface-elevated mb-4 h-8 w-32 animate-pulse rounded" />
            <div className="bg-surface-elevated h-10 w-full animate-pulse rounded-lg" />
          </div>
          {/* Show loading skeleton for chats */}
          <div>
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`${i < 7 ? 'border-border-subtle border-b' : ''}`}>
                <div className="flex animate-pulse items-center gap-3 p-4">
                  <div className="bg-surface-elevated h-12 w-12 flex-shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="bg-surface-elevated h-4 w-32 rounded" />
                      <div className="bg-surface-elevated h-3 w-12 rounded" />
                    </div>
                    <div className="bg-surface-elevated h-3 w-3/4 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-error mb-2 text-lg font-medium">Community not found</div>
          <div className="text-text-secondary text-sm">
            The community you're looking for doesn't exist or you don't have access to it.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-2xl">
        {/* Community Header */}
        <div className="border-border-subtle border-b px-4 py-6">
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => setShowCommunityDrawer(true)}
              className="hover:bg-surface-elevated/30 -ml-2 flex items-center gap-3 rounded-lg p-2 transition-colors"
            >
              {community.avatar ? (
                <Image
                  src={community.avatar}
                  alt={community.name}
                  className="h-8 w-8 rounded-full object-cover"
                  width={32}
                  height={32}
                />
              ) : (
                <div className="bg-surface-elevated flex h-8 w-8 items-center justify-center rounded-full">
                  <Users className="text-text-muted h-4 w-4" />
                </div>
              )}
              <div className="text-left">
                <h1 className="text-text text-lg font-semibold">{community.name}</h1>
                <div className="text-text-secondary text-xs">
                  {community.member_count.toLocaleString()} members
                </div>
              </div>
            </button>
          </div>

          {/* Header */}
          <div className="mb-4">
            <h2 className="text-text mb-1 flex items-center gap-2 text-2xl font-bold">
              <MessageCircle className="text-primary h-6 w-6" />
              Chats
            </h2>
            <p className="text-text-secondary text-sm">
              Connect and learn from your favorite people
            </p>
          </div>
        </div>

        {/* Chats List Component */}
        <ChatsList communityId={community.id} communitySlug={communitySlug} />

        {/* Community Drawer */}
        {showCommunityDrawer && <CommunityDrawer />}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ChatsPage;
