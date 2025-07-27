'use client';

import React, { useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import {
  Calendar,
  CheckCircle,
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
        return <Crown className="text-warning h-4 w-4" />;
      case 'admin':
        return <Shield className="text-error h-4 w-4" />;
      case 'moderator':
        return <Shield className="text-primary h-4 w-4" />;
      default:
        return <Users className="text-text-secondary h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'creator':
        return 'text-warning bg-warning/10';
      case 'admin':
        return 'text-error bg-error/10';
      case 'moderator':
        return 'text-primary bg-primary/10';
      default:
        return 'text-text-secondary bg-surface-elevated';
    }
  };

  const getActionButton = () => {
    if (isMember) {
      if (isModerator) {
        return (
          <button
            onClick={() => router.push(`/communities/${community.slug}/admin`)}
            className="bg-background border-border text-text hover:bg-surface-elevated flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors"
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
          className="bg-error text-background rounded-md px-4 py-1.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
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
    <div className="mx-auto max-w-2xl">
      {/* Banner and Avatar Section */}
      <div className="relative mb-6">
        <div className="relative h-32 overflow-hidden rounded-xl">
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
      <div className="mb-6 px-4 pt-8">
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
      <div className="border-accent/20 from-accent/5 to-primary/5 mx-4 mb-6 rounded-xl border bg-gradient-to-r p-6">
        <div className="flex items-start gap-4">
          <div className="bg-accent flex-shrink-0 rounded-lg p-3">
            <Video className="text-background h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-text mb-2 flex items-center gap-2 text-lg font-semibold">
              1-on-1 Calls with Moderators
              <span className="bg-warning text-background rounded-full px-2 py-1 text-xs font-bold">
                COMING SOON
              </span>
            </h3>
            <p className="text-text-secondary mb-3 text-sm leading-relaxed">
              Book personalized sessions with verified community moderators. All our moderators are
              experts in their respective fields and have been carefully vetted by our team.
            </p>

            {/* Trust indicators */}
            <div className="text-text-secondary mb-4 flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <CheckCircle className="text-success h-4 w-4" />
                <span>Verified experts</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="text-success h-4 w-4" />
                <span>Secure platform</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="text-success h-4 w-4" />
                <span>Quality guaranteed</span>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-2">
                <Clock className="text-accent h-4 w-4" />
                <span className="text-text-secondary text-xs">15-60 min sessions</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="text-accent h-4 w-4" />
                <span className="text-text-secondary text-xs">Flexible scheduling</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="text-accent h-4 w-4" />
                <span className="text-text-secondary text-xs">Expert guidance</span>
              </div>
            </div>

            <button
              disabled
              className="bg-accent/30 text-accent cursor-not-allowed rounded-lg px-4 py-2 text-sm font-medium opacity-60"
            >
              Book a Call - Coming Soon
            </button>
          </div>
        </div>
      </div>

      {/* Moderators Section */}
      <div className="px-4">
        <h2 className="text-text mb-4 flex items-center gap-2 text-lg font-semibold">
          <Shield className="text-primary h-5 w-5" />
          Community Team
        </h2>

        {moderatorsLoading || creatorsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="border-border-subtle flex items-center gap-3 border-b py-3">
                  <div className="bg-surface-elevated h-12 w-12 rounded-full"></div>
                  <div className="min-w-0 flex-1">
                    <div className="bg-surface-elevated mb-1 h-4 w-32 rounded"></div>
                    <div className="bg-surface-elevated h-3 w-24 rounded"></div>
                  </div>
                  <div className="bg-surface-elevated h-6 w-20 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : allModerators.length > 0 ? (
          <div>
            {allModerators.map((moderator, index) => (
              <div
                key={moderator.id}
                className={`hover:bg-surface-elevated/30 flex items-center gap-3 py-3 transition-colors ${
                  index !== allModerators.length - 1 ? 'border-border-subtle border-b' : ''
                }`}
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
                    <h3 className="text-text truncate text-sm font-medium">
                      {moderator.display_name}
                    </h3>
                    <span className="text-text-muted text-xs">@{moderator.username}</span>
                  </div>
                  <div className="text-text-secondary flex items-center gap-3 text-xs">
                    <span>{moderator.total_aura} aura</span>
                    {moderator.joined_at && (
                      <span>Since {new Date(moderator.joined_at).getFullYear()}</span>
                    )}
                  </div>
                </div>

                {/* Role Badge */}
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getRoleColor(moderator.role || '')}`}
                  >
                    {getRoleIcon(moderator.role || '')}
                    <span className="capitalize">{moderator.role || 'member'}</span>
                  </div>

                  {/* Book Call Button (Coming Soon) */}
                  <button
                    disabled
                    className="bg-accent/10 text-accent/60 hover:bg-accent/20 cursor-not-allowed rounded-full p-2 transition-colors"
                    title="1-on-1 calls coming soon"
                  >
                    <Calendar className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <Shield className="text-text-muted mx-auto mb-3 h-12 w-12" />
            <p className="text-text-secondary text-sm">No moderators found for this community.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AboutContent;
