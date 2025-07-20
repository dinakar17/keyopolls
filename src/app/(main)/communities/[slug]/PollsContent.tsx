'use client';

import React, { useEffect, useRef, useState } from 'react';

import {
  Archive,
  BarChart3,
  CheckCircle,
  ChevronDown,
  Clock,
  Lock,
  TrendingUp,
} from 'lucide-react';

import { useKeyopollsPollsApiGeneralListPolls } from '@/api/polls/polls';
import { CommunityDetails, PollDetails } from '@/api/schemas';
import Poll from '@/components/common/Poll';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
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

interface PollsContentProps {
  community: CommunityDetails;
  onCreatePoll: () => void;
}

const PollsContent: React.FC<PollsContentProps> = ({ community, onCreatePoll }) => {
  const { accessToken } = useProfileStore();

  // Filter State
  const [sortFilter, setSortFilter] = useState<SortFilter>('newest');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');
  const [pollTypeFilter, setPollTypeFilter] = useState<PollTypeFilter>('all');
  const [votedFilter, setVotedFilter] = useState<VotedFilter>('all');

  // Polls State
  const [polls, setPolls] = useState<PollDetails[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);

  // Refs
  const observer = useRef<IntersectionObserver | null>(null);
  const prevFiltersRef = useRef({ sortFilter, statusFilter, pollTypeFilter, votedFilter });

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

  // Fetch polls
  const {
    data: pollsData,
    isLoading: pollsLoading,
    error: pollsError,
  } = useKeyopollsPollsApiGeneralListPolls(
    {
      community_id: community.id,
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
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      },
      query: {
        enabled: !!community.id,
        refetchOnWindowFocus: false,
      },
    }
  );

  // Infinite scroll callback
  const lastPollElementRef = (node: HTMLElement | null) => {
    if (pollsLoading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFiltering) {
          setCurrentPage((prevPage) => prevPage + 1);
        }
      },
      { rootMargin: '200px' }
    );

    if (node) observer.current.observe(node);
  };

  // Handle filter changes
  useEffect(() => {
    const currentFilters = { sortFilter, statusFilter, pollTypeFilter, votedFilter };
    const filtersChanged =
      JSON.stringify(currentFilters) !== JSON.stringify(prevFiltersRef.current);

    if (filtersChanged) {
      setIsFiltering(true);
      setCurrentPage(1);
      setHasNextPage(true);
      setPolls([]);
      prevFiltersRef.current = currentFilters;
    }
  }, [sortFilter, statusFilter, pollTypeFilter, votedFilter]);

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

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

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

  const membership = community.membership_details;
  const permissions = community.user_permissions;
  const isMember = membership?.is_active;

  return (
    <>
      {/* Filters Section */}
      <div className="border-border-subtle border-b px-4 py-3">
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

      {/* Content */}
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
                <button
                  className="bg-primary text-background rounded-md px-6 py-2 text-sm font-medium transition-opacity hover:opacity-90"
                  onClick={onCreatePoll}
                >
                  Create First Poll
                </button>
              )}
            </div>
          )}

        {/* Polls List */}
        {polls.map((poll, index) => (
          <Poll
            key={poll.id}
            poll={poll}
            isLastPoll={index === polls.length - 1}
            lastPollElementCallback={index === polls.length - 1 ? lastPollElementRef : undefined}
            onDelete={handlePollDelete}
          />
        ))}

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
        {!hasNextPage && polls.length > 0 && !pollsLoading && (
          <div className="text-text-muted py-8 text-center">
            <p className="text-sm">You've seen all polls! 🎉</p>
          </div>
        )}
      </div>
    </>
  );
};

export default PollsContent;
