'use client';

import React, { useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Crown,
  Settings,
  Shield,
  Star,
  Users,
  Video,
} from 'lucide-react';

import { useKeyopollsCommunitiesApiOperationsToggleCommunityMembership } from '@/api/communities/communities';
import { useKeyopollsProfileApiGeneralGetUsersList } from '@/api/profile-general/profile-general';
import { CommunityDetails, UserListItemSchema } from '@/api/schemas';
import { toast } from '@/components/ui/toast';
import { useProfileStore } from '@/stores/useProfileStore';

interface AboutContentProps {
  community: CommunityDetails;
  onCommunityUpdate: () => void;
}

const AboutContent: React.FC<AboutContentProps> = ({ community, onCommunityUpdate }) => {
  const { accessToken } = useProfileStore();
  const router = useRouter();
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Join/Leave membership mutation
  const { mutate: toggleMembership, isPending: isToggling } =
    useKeyopollsCommunitiesApiOperationsToggleCommunityMembership({
      request: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      mutation: {
        onSuccess: (response) => {
          toast.success(response.data.message);
          onCommunityUpdate();
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || 'Failed to update membership');
        },
      },
    });

  // Fetch moderators (users with moderator, admin, or creator roles)
  const { data: moderatorsData, isLoading: moderatorsLoading } =
    useKeyopollsProfileApiGeneralGetUsersList(
      {
        community_id: community.id,
        role: 'moderator',
        per_page: 10,
        order_by: '-total_aura',
      },
      {
        request: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
        query: {
          enabled: !!community.id,
        },
      }
    );

  // Fetch creators separately
  const { data: creatorsData, isLoading: creatorsLoading } =
    useKeyopollsProfileApiGeneralGetUsersList(
      {
        community_id: community.id,
        role: 'creator',
        per_page: 5,
      },
      {
        request: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
        query: {
          enabled: !!community.id,
        },
      }
    );

  const membership = community.membership_details;
  const permissions = community.user_permissions;
  const isModerator = ['creator', 'admin', 'moderator'].includes(membership?.role || '');
  const isMember = membership?.is_active;

  // Handlers
  const handleJoinCommunity = () => {
    toggleMembership({
      communityId: community.id,
      data: { action: 'join' },
    });
  };

  const handleLeaveCommunity = () => {
    toggleMembership({
      communityId: community.id,
      data: { action: 'leave' },
    });
  };

  const getCommunityIcon = (type: string) => {
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
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'creator':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-red-600" />;
      case 'moderator':
        return <Shield className="h-4 w-4 text-blue-600" />;
      default:
        return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'creator':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'admin':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'moderator':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getActionButton = () => {
    if (isMember) {
      if (isModerator) {
        return (
          <button
            onClick={() => router.push(`/communities/${community.slug}/admin`)}
            className="bg-surface border-border text-text hover:bg-surface-elevated flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors"
          >
            <Settings className="h-4 w-4" />
            Manage
          </button>
        );
      }
      return (
        <button
          onClick={handleLeaveCommunity}
          disabled={isToggling}
          className="rounded-md bg-red-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
        >
          {isToggling ? 'Leaving...' : 'Leave'}
        </button>
      );
    }

    if (permissions?.can_join) {
      return (
        <button
          onClick={handleJoinCommunity}
          disabled={isToggling}
          className="bg-primary text-background rounded-md px-4 py-1.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isToggling ? 'Joining...' : 'Join'}
        </button>
      );
    }

    return null;
  };

  const truncateDescription = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Combine all moderators from different role queries
  const allModerators: UserListItemSchema[] = [
    ...(creatorsData?.data?.users || []),
    ...(moderatorsData?.data?.users || []),
  ].filter((moderator, index, array) => array.findIndex((m) => m.id === moderator.id) === index);

  return (
    <div className="p-4">
      {/* Banner and Avatar Section */}
      <div className="relative mb-6">
        <div className="relative h-32 overflow-hidden rounded-lg">
          {community.banner ? (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${community.banner})` }}
            />
          ) : (
            <div className="from-primary to-secondary absolute inset-0 bg-gradient-to-r" />
          )}
        </div>
        <div className="absolute -bottom-8 left-4">
          {community.avatar ? (
            <Image
              src={community.avatar}
              alt={community.name}
              className="border-background h-16 w-16 rounded-full border-4 object-cover"
              width={64}
              height={64}
            />
          ) : (
            <div className="border-background bg-surface-elevated flex h-16 w-16 items-center justify-center rounded-full border-4">
              <Users className="text-text-muted h-6 w-6" />
            </div>
          )}
        </div>
      </div>

      {/* Community Info */}
      <div className="mb-8 pt-8">
        <div className="mb-3 flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-text text-xl leading-tight font-bold">{community.name}</h1>
          </div>
          {getActionButton() && <div className="ml-3 flex-shrink-0">{getActionButton()}</div>}
        </div>

        {community.description && (
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

        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-surface-elevated text-text-secondary flex items-center gap-1 rounded-full px-2 py-1 text-xs">
            {getCommunityIcon(community.community_type)}
            <span className="capitalize">{community.community_type}</span>
          </div>
          <div className="text-text-muted flex items-center gap-1 text-xs">
            <Users className="h-3 w-3" />
            <span>{community.member_count.toLocaleString()} members</span>
          </div>
          {membership && (
            <div className="bg-primary/10 text-primary flex items-center gap-1 rounded-full px-2 py-1 text-xs">
              {getRoleIcon(membership.role)}
              <span className="capitalize">{membership.role}</span>
            </div>
          )}
        </div>
      </div>

      {/* 1x1 Call Booking Banner */}
      <div className="mb-8 rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 p-6 dark:border-purple-700 dark:from-purple-900/20 dark:to-blue-900/20">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 rounded-lg bg-purple-500 p-3">
            <Video className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-text mb-2 flex items-center gap-2 text-lg font-semibold">
              1-on-1 Calls with Moderators
              <span className="rounded-full bg-yellow-400 px-2 py-1 text-xs font-bold text-yellow-900">
                COMING SOON
              </span>
            </h3>
            <p className="text-text-secondary mb-4 text-sm">
              Book personalized sessions with community moderators for guidance, mentorship, or
              detailed discussions about topics you're passionate about.
            </p>

            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-600" />
                <span className="text-text-secondary text-sm">15-60 min sessions</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                <span className="text-text-secondary text-sm">Flexible scheduling</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-purple-600" />
                <span className="text-text-secondary text-sm">Expert guidance</span>
              </div>
            </div>

            <button
              disabled
              className="cursor-not-allowed rounded-lg bg-purple-500/50 px-4 py-2 text-sm font-medium text-white opacity-60"
            >
              Book a Call - Coming Soon
            </button>
          </div>
        </div>
      </div>

      {/* Moderators Section */}
      <div className="mb-8">
        <h2 className="text-text mb-4 flex items-center gap-2 text-lg font-semibold">
          <Shield className="text-primary h-5 w-5" />
          Community Team
        </h2>

        {moderatorsLoading || creatorsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-surface border-border flex items-center gap-3 rounded-lg border p-4">
                  <div className="bg-surface-elevated h-12 w-12 rounded-full"></div>
                  <div className="flex-1">
                    <div className="bg-surface-elevated mb-2 h-4 w-32 rounded"></div>
                    <div className="bg-surface-elevated h-3 w-24 rounded"></div>
                  </div>
                  <div className="bg-surface-elevated h-6 w-20 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : allModerators.length > 0 ? (
          <div className="space-y-3">
            {allModerators.map((moderator) => (
              <div
                key={moderator.id}
                className="bg-surface border-border hover:bg-surface-elevated flex items-center gap-4 rounded-lg border p-4 transition-colors"
              >
                {/* Avatar */}
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full">
                  {moderator.avatar ? (
                    <Image
                      src={moderator.avatar}
                      alt={moderator.username}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="bg-primary flex h-full w-full items-center justify-center">
                      <Users className="text-background h-6 w-6" />
                    </div>
                  )}
                </div>

                {/* Moderator Info */}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="text-text truncate font-medium">{moderator.display_name}</h3>
                    <span className="text-text-muted text-sm">@{moderator.username}</span>
                  </div>
                  <div className="text-text-secondary flex items-center gap-3 text-xs">
                    <span>{moderator.total_aura} aura</span>
                    {moderator.joined_at && (
                      <span>Since {new Date(moderator.joined_at).getFullYear()}</span>
                    )}
                  </div>
                </div>

                {/* Role Badge */}
                <div
                  className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getRoleColor(moderator.role || '')}`}
                >
                  {getRoleIcon(moderator.role || '')}
                  <span className="capitalize">{moderator.role || 'member'}</span>
                </div>

                {/* Book Call Button (Coming Soon) */}
                <button
                  disabled
                  className="cursor-not-allowed rounded-lg bg-purple-500/20 px-3 py-2 text-xs font-medium text-purple-600 opacity-60 transition-colors hover:bg-purple-500/30"
                  title="1-on-1 calls coming soon"
                >
                  <Calendar className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <Shield className="text-text-muted mx-auto mb-3 h-12 w-12" />
            <p className="text-text-secondary">No moderators found for this community.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AboutContent;
