'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

import {
  Archive,
  BarChart3,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Crown,
  Globe,
  Lock,
  Settings,
  Shield,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';

import { useKeyopollsCommunitiesApiGeneralGetCommunity } from '@/api/communities-general/communities-general';
import { useKeyopollsCommunitiesApiOperationsToggleCommunityMembership } from '@/api/communities/communities';
import { useKeyopollsPollsApiGeneralListPolls } from '@/api/polls/polls';
import { PollDetails } from '@/api/schemas';
import BottomNavigation from '@/components/common/BottomNavigation';
import CreateButton from '@/components/common/CreateButton';
import Poll from '@/components/common/Poll';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { toast } from '@/components/ui/toast';
import { useProfileStore } from '@/stores/useProfileStore';

type SortFilter = 'newest' | 'oldest' | 'most_votes' | 'trending';
type StatusFilter = 'active' | 'closed' | 'all';
type PollTypeFilter = 'all' | 'single' | 'multiple' | 'ranking';
type VotedFilter = 'all' | 'voted' | 'not_voted';

interface FilterOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

const CommunityPage = () => {
  const { accessToken } = useProfileStore();
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  // UI State
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  // Filter State
  const [sortFilter, setSortFilter] = useState<SortFilter>('newest');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');
  const [pollTypeFilter, setPollTypeFilter] = useState<PollTypeFilter>('all');
  const [votedFilter, setVotedFilter] = useState<VotedFilter>('all');

  // Polls State
  const [polls, setPolls] = useState<PollDetails[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [communityId, setCommunityId] = useState<number | null>(null);

  // Filter loading state
  const [isFiltering, setIsFiltering] = useState(false);
  const prevFiltersRef = useRef({ sortFilter, statusFilter, pollTypeFilter, votedFilter });

  // Infinite scroll ref
  const observer = useRef<IntersectionObserver | null>(null);
  const lastPollElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (pollsLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          setCurrentPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasNextPage]
  );

  // Fetch community data
  const {
    data: communityData,
    isLoading,
    error,
    refetch, // after membership toggle
  } = useKeyopollsCommunitiesApiGeneralGetCommunity(slug, {
    request: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  const community = communityData?.data;

  // Update community ID when community data loads
  useEffect(() => {
    if (community?.id) {
      setCommunityId(community.id);
    }
  }, [community]);

  // Fetch polls
  const {
    data: pollsData,
    isLoading: pollsLoading,
    error: pollsError,
  } = useKeyopollsPollsApiGeneralListPolls(
    {
      community_id: communityId,
      page: currentPage,
      page_size: 20,
      sort: sortFilter,
      status: statusFilter === 'all' ? undefined : [statusFilter],
      poll_type: pollTypeFilter === 'all' ? undefined : pollTypeFilter,
      voted: votedFilter === 'all' ? undefined : votedFilter === 'voted',
      include_expired: statusFilter === 'all',
    },
    {
      request: {
        headers: accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : {},
      },
      query: {
        enabled: !!communityId,
        refetchOnWindowFocus: false,
      },
    }
  );

  const { mutate: toggleMembership, isPending: isToggling } =
    useKeyopollsCommunitiesApiOperationsToggleCommunityMembership({
      request: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

  // Handle filter changes
  useEffect(() => {
    const currentFilters = { sortFilter, statusFilter, pollTypeFilter, votedFilter };
    const filtersChanged =
      JSON.stringify(currentFilters) !== JSON.stringify(prevFiltersRef.current);

    if (filtersChanged) {
      setIsFiltering(true);
      prevFiltersRef.current = currentFilters;
    }

    setCurrentPage(1);
    setHasNextPage(true);
  }, [sortFilter, statusFilter, pollTypeFilter, votedFilter, communityId]);

  // Handle polls data
  useEffect(() => {
    if (pollsData?.data.items) {
      if (currentPage === 1) {
        setPolls(pollsData.data.items);
        setIsFiltering(false);
      } else {
        setPolls((prevPolls) => {
          const existingIds = new Set(prevPolls.map((poll) => poll.id));
          const newPolls = pollsData.data.items.filter((poll) => !existingIds.has(poll.id));
          return [...prevPolls, ...newPolls];
        });
      }
      setHasNextPage(pollsData.data.has_next || false);
    }
  }, [pollsData, currentPage]);

  // Handle poll deletion
  const handlePollDelete = (pollId: number) => {
    setPolls((prevPolls) => prevPolls.filter((poll) => poll.id !== pollId));
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
          refetch(); // Refetch community data to update membership status
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || 'Failed to join community');
        },
      }
    );
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
          refetch(); // Refetch community data to update membership status
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || 'Failed to leave community');
          setShowLeaveModal(false);
        },
      }
    );
  };

  // Filter options
  const sortOptions: FilterOption[] = [
    { value: 'newest', label: 'Newest', icon: <Clock size={16} /> },
    { value: 'oldest', label: 'Oldest', icon: <Archive size={16} /> },
    { value: 'most_votes', label: 'Most Votes', icon: <BarChart3 size={16} /> },
    { value: 'trending', label: 'Trending', icon: <TrendingUp size={16} /> },
  ];

  const statusOptions: FilterOption[] = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active', icon: <CheckCircle size={16} /> },
    { value: 'closed', label: 'Closed', icon: <Lock size={16} /> },
  ];

  const pollTypeOptions: FilterOption[] = [
    { value: 'all', label: 'All Types' },
    { value: 'single', label: 'Single Choice' },
    { value: 'multiple', label: 'Multiple Choice' },
    { value: 'ranking', label: 'Ranking' },
  ];

  const votedOptions: FilterOption[] = [
    { value: 'all', label: 'All Polls' },
    { value: 'voted', label: 'Voted' },
    { value: 'not_voted', label: 'Not Voted' },
  ];

  if (isLoading) {
    return (
      <div className="bg-background min-h-screen">
        <div className="animate-pulse">
          {/* Banner Loading */}
          <div className="bg-surface-elevated h-32"></div>
          {/* Avatar & Content Loading */}
          <div className="px-4 pb-4">
            <div className="bg-surface-elevated -mt-8 mb-4 h-16 w-16 rounded-full"></div>
            <div className="bg-surface-elevated mb-2 h-6 w-3/4 rounded"></div>
            <div className="bg-surface-elevated mb-3 h-4 w-full rounded"></div>
            <div className="mb-4 flex gap-2">
              <div className="bg-surface-elevated h-8 w-20 rounded"></div>
              <div className="bg-surface-elevated h-8 w-16 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <div className="text-error mb-2 text-lg font-medium">Community not found</div>
          <div className="text-text-secondary text-sm">
            The community you're looking for doesn't exist or you don't have access to it.
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
          <div className="flex gap-2">
            <button
              className="bg-surface border-border text-text hover:bg-surface-elevated flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors"
              onClick={() => router.push(`/communities/${community.name}/admin`)}
            >
              <Settings className="h-4 w-4" />
              Manage
            </button>
            {!isCreator && (
              <button
                className="border-success/20 bg-success/10 text-success rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                onClick={() => setShowLeaveModal(true)}
                disabled={isToggling}
              >
                ✓ Member
              </button>
            )}
          </div>
        );
      }
      return (
        <button
          className="border-success/20 bg-success/10 text-success rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700"
          onClick={() => setShowLeaveModal(true)}
          disabled={isToggling}
        >
          ✓ Member
        </button>
      );
    }

    if (permissions?.can_join) {
      return (
        <button
          className="bg-primary text-background rounded-md px-4 py-1.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
          onClick={handleJoinCommunity}
          disabled={isToggling}
        >
          {isToggling ? 'Joining...' : 'Join Community'}
        </button>
      );
    }

    return (
      <div className="bg-surface-elevated text-text-muted rounded-md px-3 py-1.5 text-sm font-medium">
        Private
      </div>
    );
  };

  const truncateDescription = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Filter drawer component
  const FilterDrawer = ({
    options,
    value,
    onChange,
    title,
    showIcon = true,
  }: {
    options: FilterOption[];
    value: string;
    onChange: (value: string) => void;
    title: string;
    showIcon?: boolean;
  }) => {
    const selectedOption = options.find((opt) => opt.value === value);
    const [open, setOpen] = useState(false);

    const handleSelect = (optionValue: string) => {
      onChange(optionValue);
      setOpen(false);
    };

    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <button className="border-border bg-surface text-text hover:border-border-subtle focus:border-primary focus:ring-primary flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus:ring-1 focus:outline-none">
            {showIcon && selectedOption?.icon && (
              <span className="flex-shrink-0">{selectedOption.icon}</span>
            )}
            <span>{selectedOption?.label}</span>
            <ChevronDown className="text-text-muted h-3 w-3 flex-shrink-0" />
          </button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6">
            <div className="space-y-2">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                    value === option.value
                      ? 'bg-primary/10 text-primary'
                      : 'text-text hover:bg-surface-elevated'
                  }`}
                >
                  {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
                  <span className="font-medium">{option.label}</span>
                  {value === option.value && (
                    <CheckCircle className="ml-auto h-4 w-4 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  };

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

  // Loading skeleton
  const PollSkeleton = () => (
    <div className="border-border-subtle animate-pulse border-b p-4">
      <div className="flex space-x-3">
        <div className="bg-surface-elevated h-10 w-10 flex-shrink-0 rounded-full"></div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <div className="bg-surface-elevated h-3 w-24 rounded"></div>
            <div className="bg-surface-elevated h-3 w-16 rounded"></div>
          </div>
          <div className="bg-surface-elevated mb-2 h-4 w-3/4 rounded"></div>
          <div className="space-y-2">
            <div className="bg-surface-elevated h-8 rounded"></div>
            <div className="bg-surface-elevated h-8 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-background min-h-screen">
      {/* Banner */}
      {community.banner ? (
        <div
          className="bg-surface-elevated h-32 bg-cover bg-center"
          style={{ backgroundImage: `url(${community.banner})` }}
        />
      ) : (
        <div className="from-primary to-secondary h-32 bg-gradient-to-r" />
      )}

      {/* Community Header */}
      <div className="border-border-subtle border-b">
        <div className="px-4 pb-4">
          {/* Avatar */}
          <div className="-mt-8 mb-4">
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

          {/* Name and Action Button */}
          <div className="mb-3 flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-text text-xl leading-tight font-bold">{community.name}</h1>
            </div>
            <div className="ml-3 flex-shrink-0">{getActionButton()}</div>
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

          {/* Community Info Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Community Type */}
              <div className="bg-surface-elevated text-text-secondary flex items-center gap-1 rounded-full px-2 py-1 text-xs">
                {getCommunityIcon(community.community_type)}
                <span className="capitalize">{community.community_type}</span>
              </div>

              {/* Member Count */}
              <div className="text-text-muted flex items-center gap-1 text-xs">
                <Users className="h-3 w-3" />
                <span>{community.member_count.toLocaleString()}</span>
              </div>

              {/* Member Role Badge */}
              {membership && (
                <div className="bg-primary/10 text-primary flex items-center gap-1 rounded-full px-2 py-1 text-xs">
                  {getRoleIcon(membership.role)}
                  <span className="capitalize">{membership.role}</span>
                </div>
              )}
            </div>

            {/* Category */}
            <div className="bg-surface text-text-secondary rounded px-2 py-1 text-xs">
              {community.category.name}
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="border-border-subtle border-b px-4 py-3">
        {/* Horizontal Scrollable Filters */}
        <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
          <div className="flex-shrink-0">
            <FilterDrawer
              options={sortOptions}
              value={sortFilter}
              onChange={(value) => setSortFilter(value as SortFilter)}
              title="Sort by"
            />
          </div>

          <div className="flex-shrink-0">
            <FilterDrawer
              options={statusOptions}
              value={statusFilter}
              onChange={(value) => setStatusFilter(value as StatusFilter)}
              title="Poll Status"
              showIcon={false}
            />
          </div>

          <div className="flex-shrink-0">
            <FilterDrawer
              options={pollTypeOptions}
              value={pollTypeFilter}
              onChange={(value) => setPollTypeFilter(value as PollTypeFilter)}
              title="Poll Type"
              showIcon={false}
            />
          </div>

          {/* Only show voted filter for authenticated users */}
          {accessToken && (
            <div className="flex-shrink-0">
              <FilterDrawer
                options={votedOptions}
                value={votedFilter}
                onChange={(value) => setVotedFilter(value as VotedFilter)}
                title="Voting Status"
                showIcon={false}
              />
            </div>
          )}
        </div>
      </div>

      {/* Polls Section */}
      <div className="flex-1">
        {/* Polls Content */}
        <div className="min-h-[60vh]">
          {/* Error State */}
          {pollsError && !pollsLoading && (
            <div className="p-6 text-center">
              <p className="text-error text-sm">Error loading polls. Please try again.</p>
            </div>
          )}

          {/* Empty State */}
          {!pollsError &&
            !pollsLoading &&
            !isFiltering &&
            polls.length === 0 &&
            currentPage === 1 &&
            pollsData && (
              <div className="py-12 text-center">
                <div className="text-text-muted mb-4">
                  <BarChart3 className="mx-auto h-12 w-12" />
                </div>
                <h3 className="text-text mb-2 text-base font-medium">No polls found</h3>
                <p className="text-text-secondary mx-auto mb-6 max-w-sm text-sm">
                  {isMember
                    ? 'Be the first to create a poll and start the conversation!'
                    : 'Join the community to participate in polls and discussions.'}
                </p>
                {isMember && permissions?.can_post && (
                  <button className="bg-primary text-background rounded-md px-6 py-2 text-sm font-medium transition-opacity hover:opacity-90">
                    Create First Poll
                  </button>
                )}
              </div>
            )}

          {/* Polls List */}
          {polls.length > 0 && (
            <div>
              {polls.map((poll, index) => (
                <Poll
                  key={poll.id}
                  poll={poll}
                  isLastPoll={index === polls.length - 1}
                  lastPollElementCallback={
                    index === polls.length - 1 ? lastPollElementRef : undefined
                  }
                  onDelete={handlePollDelete}
                />
              ))}
            </div>
          )}

          {/* Loading States */}
          {pollsLoading && currentPage === 1 && polls.length === 0 && (
            <div>
              {Array.from({ length: 3 }).map((_, index) => (
                <PollSkeleton key={index} />
              ))}
            </div>
          )}

          {pollsLoading && currentPage > 1 && (
            <div className="py-4">
              <PollSkeleton />
            </div>
          )}

          {/* End of Results */}
          {!hasNextPage && polls.length > 0 && (
            <div className="text-text-muted py-8 text-center">
              <p className="text-sm">You've seen all polls! 🎉</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Create Poll Button (for members) */}
      {isMember && permissions?.can_post && <CreateButton path="/polls/create-poll" />}

      {/* Leave Community Modal */}
      {showLeaveModal && <LeaveModal />}

      <BottomNavigation />
    </div>
  );
};

export default CommunityPage;
