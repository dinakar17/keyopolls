'use client';

import React, { useState } from 'react';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

import {
  ArrowLeft,
  Brain,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Crown,
  FileText,
  Globe,
  Lock,
  LogOut,
  MoreVertical,
  Search,
  Settings,
  Share,
  Shield,
  Users,
  X,
} from 'lucide-react';

import { useKeyopollsCommunitiesApiGeneralGetCommunity } from '@/api/communities-general/communities-general';
import { useKeyopollsCommunitiesApiOperationsToggleCommunityMembership } from '@/api/communities/communities';
import BottomNavigation from '@/components/common/BottomNavigation';
import CreateButton from '@/components/common/CreateButton';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { toast } from '@/components/ui/toast';
import { useCommunityStore } from '@/stores/useCommunityStore';
import { useProfileStore } from '@/stores/useProfileStore';

import CommunityContent from './CommunityContent';

type TabType = 'polls' | 'leaderboard' | 'about' | 'jobs' | 'articles' | 'flashcards';

const CommunityPage = () => {
  const { accessToken } = useProfileStore();
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { setCommunityDetails } = useCommunityStore();

  // UI State
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showOptionsDrawer, setShowOptionsDrawer] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('polls');

  // Simple Share Component
  const SimpleShareButton = ({ communityName }: { communityName: string }) => {
    const handleShare = async () => {
      const shareData = {
        title: `${communityName} Community`,
        text: `Check out the ${communityName} community!`,
        url: window.location.href,
      };

      try {
        if (navigator.share && navigator.canShare(shareData)) {
          await navigator.share(shareData);
        } else {
          // Fallback to clipboard
          await navigator.clipboard.writeText(window.location.href);
          toast.success('Community link copied to clipboard!');
        }
      } catch {
        // Fallback to clipboard if sharing fails
        try {
          await navigator.clipboard.writeText(window.location.href);
          toast.success('Community link copied to clipboard!');
        } catch {
          toast.error('Failed to share community link');
        }
      }
    };

    return (
      <button
        onClick={handleShare}
        className="hover:bg-surface-elevated flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors"
      >
        <Share size={18} className="text-text-secondary" />
        <span className="text-text font-medium">Share Community</span>
      </button>
    );
  };

  // Fetch community data
  const {
    data: communityData,
    isLoading,
    error,
    refetch,
  } = useKeyopollsCommunitiesApiGeneralGetCommunity(slug, {
    request: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  const community = communityData?.data;

  const { mutate: toggleMembership, isPending: isToggling } =
    useKeyopollsCommunitiesApiOperationsToggleCommunityMembership({
      request: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

  // Handle back button
  const handleBackClick = () => {
    router.back();
  };

  // Handle search click
  const handleSearchClick = () => {
    if (community?.name) {
      router.push(`/explore?mode=search&community=${encodeURIComponent(community.name)}`);
    }
  };

  // Handle community name click
  const handleCommunityNameClick = () => {
    setActiveTab('about');
  };

  // Handle join community
  const handleJoinCommunity = () => {
    if (!community?.id) return;

    toggleMembership(
      {
        communityId: community.id,
        data: { action: 'join' },
      },
      {
        onSuccess: (response) => {
          toast.success(response.data.message);
          refetch();
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || 'Failed to join community');
        },
      }
    );
  };

  // Handle leave community from drawer
  const handleLeaveFromDrawer = () => {
    setShowOptionsDrawer(false);
    setShowLeaveModal(true);
  };

  // Handle leave community
  const handleLeaveCommunity = () => {
    if (!community?.id) return;

    toggleMembership(
      {
        communityId: community.id,
        data: { action: 'leave' },
      },
      {
        onSuccess: (response) => {
          toast.success(response.data.message);
          setShowLeaveModal(false);
          refetch();
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || 'Failed to leave community');
          setShowLeaveModal(false);
        },
      }
    );
  };

  const handleCreatePoll = () => {
    if (!community) return;

    const membership = community.membership_details;
    const isMember = membership?.is_active;

    if (!isMember) {
      toast.error('You must be a member of this community to create polls.');
      return;
    }
    setCommunityDetails(community);
    router.push('/create-poll');
  };

  if (isLoading) {
    return (
      <div className="bg-background min-h-screen">
        <div className="animate-pulse">
          {/* Header Loading */}
          <div className="border-border-subtle border-b px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-surface-elevated h-8 w-8 rounded-full"></div>
                <div className="bg-surface-elevated h-6 w-32 rounded"></div>
              </div>
              <div className="flex gap-2">
                <div className="bg-surface-elevated h-8 w-8 rounded-full"></div>
                <div className="bg-surface-elevated h-8 w-8 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Tabs Loading */}
          <div className="border-border-subtle border-b px-4 py-3">
            <div className="flex gap-6">
              <div className="bg-surface-elevated h-4 w-12 rounded"></div>
              <div className="bg-surface-elevated h-4 w-20 rounded"></div>
              <div className="bg-surface-elevated h-4 w-12 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="bg-background flex min-h-screen flex-col">
        {/* Header */}
        <div className="border-border-subtle border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackClick}
                className="text-text-muted hover:text-text rounded-full p-1.5 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-text text-lg font-semibold">Community</h1>
            </div>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center p-4">
          <div className="text-center">
            <div className="text-error mb-2 text-lg font-medium">Community not found</div>
            <div className="text-text-secondary text-sm">
              The community you're looking for doesn't exist or you don't have access to it.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const membership = community.membership_details;
  const permissions = community.user_permissions;

  const isModerator = ['creator', 'admin', 'moderator'].includes(membership?.role || '');
  const isMember = membership?.is_active;
  const isCreator = membership?.role === 'creator';

  const getCommunityIcon = (type: string) => {
    switch (type) {
      case 'public':
        return <Globe className="h-3 w-3" />;
      case 'private':
        return <Lock className="h-3 w-3" />;
      case 'restricted':
        return <Shield className="h-3 w-3" />;
      default:
        return <Globe className="h-3 w-3" />;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'creator':
        return <Crown className="text-warning h-3 w-3" />;
      case 'admin':
        return <Shield className="text-accent h-3 w-3" />;
      case 'moderator':
        return <Shield className="text-primary h-3 w-3" />;
      default:
        return <Users className="text-text-muted h-3 w-3" />;
    }
  };

  const getActionButton = () => {
    if (isMember) {
      if (isModerator) {
        return (
          <button
            className="bg-surface border-border text-text hover:bg-surface-elevated flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors"
            onClick={() => router.push(`/communities/${community.name}/admin`)}
          >
            <Settings className="h-4 w-4" />
            Manage
          </button>
        );
      }
      return null;
    }

    if (permissions?.can_join) {
      return (
        <button
          className="bg-primary text-background rounded-md px-4 py-1.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
          onClick={handleJoinCommunity}
          disabled={isToggling}
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

  const getTabIcon = (tab: TabType) => {
    switch (tab) {
      case 'polls':
        return <FileText className="h-4 w-4" />;
      case 'leaderboard':
        return <Crown className="h-4 w-4" />;
      case 'about':
        return <Users className="h-4 w-4" />;
      case 'jobs':
        return <Briefcase className="h-4 w-4" />;
      case 'articles':
        return <FileText className="h-4 w-4" />;
      case 'flashcards':
        return <Brain className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // About Tab Content
  const AboutContent = () => (
    <div className="p-4">
      {/* Banner with Avatar */}
      <div className="relative mb-6">
        {/* Banner */}
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

        {/* Avatar */}
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

      {/* Community Details */}
      <div className="pt-8">
        {/* Name and Action Button */}
        <div className="mb-3 flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-text text-xl leading-tight font-bold">{community.name}</h1>
          </div>
          {getActionButton() && <div className="ml-3 flex-shrink-0">{getActionButton()}</div>}
        </div>

        {/* Description */}
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

        {/* Community Info */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Community Type */}
          <div className="bg-surface-elevated text-text-secondary flex items-center gap-1 rounded-full px-2 py-1 text-xs">
            {getCommunityIcon(community.community_type)}
            <span className="capitalize">{community.community_type}</span>
          </div>

          {/* Member Count */}
          <div className="text-text-muted flex items-center gap-1 text-xs">
            <Users className="h-3 w-3" />
            <span>{community.member_count.toLocaleString()} members</span>
          </div>

          {/* Member Role Badge */}
          {membership && (
            <div className="bg-primary/10 text-primary flex items-center gap-1 rounded-full px-2 py-1 text-xs">
              {getRoleIcon(membership.role)}
              <span className="capitalize">{membership.role}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Leave Community Modal
  const LeaveModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background w-full max-w-md rounded-lg p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-text text-lg font-semibold">Leave Community</h2>
          <button
            onClick={() => setShowLeaveModal(false)}
            className="text-text-muted hover:text-text transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-text-secondary text-sm">
            Are you sure you want to leave <strong>{community.name}</strong>?
          </p>
          <p className="text-text-secondary mt-2 text-sm">
            You'll lose access to all community content and will need to rejoin to participate
            again.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowLeaveModal(false)}
            className="border-border bg-surface text-text hover:bg-surface-elevated flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleLeaveCommunity}
            disabled={isToggling}
            className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {isToggling ? 'Leaving...' : 'Leave Community'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="border-border-subtle border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackClick}
              className="text-text-muted hover:text-text rounded-full p-1.5 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <button
              onClick={handleCommunityNameClick}
              className="text-text hover:text-primary font-semibold transition-colors"
            >
              {community.name}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSearchClick}
              className="text-text-muted hover:text-text rounded-full p-1.5 transition-colors"
            >
              <Search size={18} />
            </button>

            <Drawer open={showOptionsDrawer} onOpenChange={setShowOptionsDrawer}>
              <DrawerTrigger asChild>
                <button className="text-text-muted hover:text-text rounded-full p-1.5 transition-colors">
                  <MoreVertical size={18} />
                </button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Community Options</DrawerTitle>
                </DrawerHeader>
                <div className="space-y-2 p-4">
                  <SimpleShareButton communityName={community.name} />

                  {isMember && !isCreator && (
                    <button
                      onClick={handleLeaveFromDrawer}
                      className="text-error hover:bg-error/10 flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors"
                    >
                      <LogOut size={18} />
                      <span className="font-medium">Leave Community</span>
                    </button>
                  )}
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-border-subtle border-b">
        <div className="flex overflow-x-auto px-4">
          {[
            { id: 'polls', label: 'Polls' },
            { id: 'flashcards', label: 'Flashcards' },
            { id: 'articles', label: 'Articles' },
            { id: 'leaderboard', label: 'Leaderboard' },
            { id: 'jobs', label: 'Jobs' },
            { id: 'about', label: 'About' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'text-primary border-primary border-b-2'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              {getTabIcon(tab.id as TabType)}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'about' ? (
        <AboutContent />
      ) : (
        <CommunityContent
          community={community}
          activeTab={activeTab}
          onCreatePoll={handleCreatePoll}
        />
      )}

      {/* Floating Create Poll Button (for members) */}
      {isMember && permissions?.can_post && activeTab === 'polls' && (
        <CreateButton path="/create-poll" onClick={handleCreatePoll} />
      )}

      {/* Leave Community Modal */}
      {showLeaveModal && <LeaveModal />}

      <BottomNavigation />
    </div>
  );
};

export default CommunityPage;
