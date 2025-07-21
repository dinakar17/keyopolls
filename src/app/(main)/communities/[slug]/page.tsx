'use client';

import React, { useEffect, useState } from 'react';

import { useParams, useRouter, useSearchParams } from 'next/navigation';

import {
  ArrowLeft,
  BarChart3,
  Brain,
  Briefcase,
  Crown,
  FileText,
  LogOut,
  MoreVertical,
  Share,
  Users,
  X,
  Zap,
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

import AIAnalysisContent from './AIAnalysisContent';
import AboutContent from './AboutContent';
import ArticlesContent from './ArticlesContent';
import BattlesContent from './BattlesContent';
import JobsContent from './JobsContent';
import LeaderboardContent from './LeaderBoardContent';
import PollsContent from './PollsContent';
import QuizzesContent from './QuizzesContent';

type TabType =
  | 'polls'
  | 'quizzes'
  | 'battles'
  | 'ai-analysis'
  | 'articles'
  | 'leaderboard'
  | 'jobs'
  | 'about';

const CommunityPage = () => {
  const { accessToken } = useProfileStore();
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setCommunityDetails } = useCommunityStore();

  // UI State
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showOptionsDrawer, setShowOptionsDrawer] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('polls');

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

  // Sync tab with URL query params
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') as TabType;
    const validTabs: TabType[] = [
      'polls',
      'quizzes',
      'battles',
      'ai-analysis',
      'articles',
      'leaderboard',
      'jobs',
      'about',
    ];

    if (tabFromUrl && validTabs.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    } else if (!tabFromUrl) {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set('tab', 'polls');
      router.replace(`/communities/${slug}?${newSearchParams.toString()}`, { scroll: false });
    }
  }, [searchParams, slug, router]);

  // Update URL when tab changes
  const handleTabChange = (newTab: TabType) => {
    setActiveTab(newTab);
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('tab', newTab);
    router.replace(`/communities/${slug}?${newSearchParams.toString()}`, { scroll: false });
  };

  // Handlers
  const handleBackClick = () => {
    router.back();
  };

  const handleCommunityNameClick = () => {
    handleTabChange('about');
  };

  const handleLeaveFromDrawer = () => {
    setShowOptionsDrawer(false);
    setShowLeaveModal(true);
  };

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

  const handleShare = async () => {
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
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-background min-h-screen">
        <div className="animate-pulse">
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

  // Error state
  if (error || !community) {
    return (
      <div className="bg-background flex min-h-screen flex-col">
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

  // Community data
  const membership = community.membership_details;
  const permissions = community.user_permissions;
  const isMember = membership?.is_active;
  const isCreator = membership?.role === 'creator';

  const getTabIcon = (tab: TabType) => {
    switch (tab) {
      case 'polls':
        return <FileText className="h-4 w-4" />;
      case 'quizzes':
        return <Brain className="h-4 w-4" />;
      case 'battles':
        return <Zap className="h-4 w-4" />;
      case 'ai-analysis':
        return <BarChart3 className="h-4 w-4" />;
      case 'articles':
        return <FileText className="h-4 w-4" />;
      case 'leaderboard':
        return <Crown className="h-4 w-4" />;
      case 'jobs':
        return <Briefcase className="h-4 w-4" />;
      case 'about':
        return <Users className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'polls':
        return <PollsContent community={community} onCreatePoll={handleCreatePoll} />;
      case 'quizzes':
        return <QuizzesContent />;
      case 'battles':
        return <BattlesContent />;
      case 'ai-analysis':
        return <AIAnalysisContent />;
      case 'articles':
        return <ArticlesContent community={community} />;
      case 'leaderboard':
        return <LeaderboardContent />;
      case 'jobs':
        return <JobsContent />;
      case 'about':
        return <AboutContent community={community} onCommunityUpdate={refetch} />;
      default:
        return <PollsContent community={community} onCreatePoll={handleCreatePoll} />;
    }
  };

  // Leave modal component
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
              className="text-text hover:text-primary text-lg font-semibold transition-colors"
            >
              {community.name}
            </button>
          </div>

          <div className="flex gap-2">
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
                  <button
                    onClick={handleShare}
                    className="hover:bg-surface-elevated flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors"
                  >
                    <Share size={18} className="text-text-secondary" />
                    <span className="text-text font-medium">Share Community</span>
                  </button>

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
        <div className="scrollbar-hide flex overflow-x-auto px-4">
          {[
            { id: 'polls', label: 'Polls' },
            { id: 'quizzes', label: 'Quizzes' },
            { id: 'battles', label: 'Battles' },
            { id: 'ai-analysis', label: 'AI Analysis' },
            { id: 'articles', label: 'Articles' },
            { id: 'leaderboard', label: 'Leaderboard' },
            { id: 'jobs', label: 'Jobs' },
            { id: 'about', label: 'About' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as TabType)}
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
      {renderTabContent()}

      {/* Floating Create Poll Button */}
      {isMember &&
        (membership?.role === 'creator' || membership?.role === 'moderator') &&
        permissions?.can_post &&
        activeTab === 'polls' && <CreateButton path="/create-poll" onClick={handleCreatePoll} />}

      {/* Leave Community Modal */}
      {showLeaveModal && <LeaveModal />}

      <BottomNavigation />
    </div>
  );
};

export default CommunityPage;
