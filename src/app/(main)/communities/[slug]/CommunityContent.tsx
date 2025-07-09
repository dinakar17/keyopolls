'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import {
  Archive,
  BarChart3,
  BookOpen,
  Brain,
  Briefcase,
  Building,
  CheckCircle,
  ChevronDown,
  Clock,
  DollarSign,
  ExternalLink,
  Eye,
  FileText,
  Heart,
  Lock,
  MapPin,
  MessageSquare,
  Play,
  Share,
  Star,
  TrendingUp,
  Trophy,
  Users,
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

interface CommunityContentProps {
  community: CommunityDetails;
  activeTab: 'polls' | 'leaderboard' | 'about' | 'jobs' | 'articles' | 'flashcards';
  onCreatePoll: () => void;
}

const CommunityContent: React.FC<CommunityContentProps> = ({
  community,
  activeTab,
  onCreatePoll,
}) => {
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
        headers: accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : {},
      },
      query: {
        enabled: !!community.id && activeTab === 'polls',
        refetchOnWindowFocus: false,
      },
    }
  );

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

  // Posts Content
  const PostsContent = () => {
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

        {/* Polls Content */}
        <div className="flex-1">
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
      </>
    );
  };

  // Leaderboard Content
  const LeaderboardContent = () => {
    // Mock data for preview
    const mockLeaderboardData = [
      { rank: 1, username: 'alex_chen', aura: 2847, streak: 23, avatar: null },
      { rank: 2, username: 'sarah_m', aura: 2634, streak: 19, avatar: null },
      { rank: 3, username: 'dev_mike', aura: 2521, streak: 17, avatar: null },
      { rank: 4, username: 'poll_master', aura: 2398, streak: 15, avatar: null },
      { rank: 5, username: 'community_hero', aura: 2156, streak: 12, avatar: null },
      { rank: 6, username: 'vote_ninja', aura: 1987, streak: 8, avatar: null },
      { rank: 7, username: 'debate_queen', aura: 1843, streak: 6, avatar: null },
      { rank: 8, username: 'poll_wizard', aura: 1729, streak: 4, avatar: null },
    ];

    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    return (
      <div className="flex-1">
        <div className="px-4 py-6">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="text-primary mb-2">
              <Trophy className="mx-auto h-8 w-8" />
            </div>
            <h2 className="text-text mb-2 text-xl font-bold">Community Leaderboard</h2>
            <p className="text-text-secondary text-sm">
              {currentMonth} • Top contributors ranked by Aura & Daily Streaks
            </p>
          </div>

          {/* Preview Label */}
          <div className="bg-warning/10 border-warning/20 mb-4 rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <div className="bg-warning/20 text-warning flex h-6 w-6 items-center justify-center rounded-full">
                <span className="text-xs font-bold">!</span>
              </div>
              <span className="text-warning text-sm font-medium">Preview Mode</span>
            </div>
            <p className="text-warning/80 mt-1 text-xs">
              This is a preview of the leaderboard. Real data will be available once the feature is
              live.
            </p>
          </div>

          {/* Leaderboard List */}
          <div className="space-y-3">
            {mockLeaderboardData.map((user, index) => (
              <div
                key={user.username}
                className={`border-border bg-surface hover:bg-surface-elevated flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                  index < 3 ? 'ring-primary/20 ring-1' : ''
                }`}
              >
                {/* Rank */}
                <div className="flex-shrink-0">
                  {index < 3 ? (
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-white ${
                        index === 0
                          ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                          : index === 1
                            ? 'bg-gradient-to-r from-gray-300 to-gray-500'
                            : 'bg-gradient-to-r from-amber-600 to-amber-800'
                      }`}
                    >
                      {user.rank}
                    </div>
                  ) : (
                    <div className="bg-surface-elevated text-text-secondary flex h-8 w-8 items-center justify-center rounded-full font-medium">
                      {user.rank}
                    </div>
                  )}
                </div>

                {/* Avatar */}
                <div className="flex-shrink-0">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.username}
                      className="h-10 w-10 rounded-full object-cover"
                      width={40}
                      height={40}
                    />
                  ) : (
                    <div className="text-background flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 font-medium">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-text truncate font-medium">@{user.username}</span>
                    {index < 3 && (
                      <div className="text-primary">
                        <Trophy className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                  <div className="text-text-secondary text-sm">
                    {user.aura.toLocaleString()} Aura • {user.streak} day streak
                  </div>
                </div>

                {/* Streak Badge */}
                <div className="flex-shrink-0">
                  <div className="bg-success/10 text-success flex items-center gap-1 rounded-full px-2 py-1">
                    <div className="h-2 w-2 rounded-full bg-current"></div>
                    <span className="text-xs font-medium">{user.streak}d</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Coming Soon Footer */}
          <div className="mt-8 text-center">
            <div className="text-text-muted mb-2">
              <Clock className="mx-auto h-5 w-5" />
            </div>
            <p className="text-text-secondary text-sm">
              Full leaderboard functionality launching soon
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Jobs Content
  const JobsContent = () => {
    const mockJobs = [
      {
        id: 1,
        title: 'Senior Software Engineer',
        company: 'TechCorp Inc.',
        location: 'San Francisco, CA',
        type: 'Full-time',
        salary: '$120k - $160k',
        postedAt: '2 days ago',
        tags: ['React', 'TypeScript', 'Node.js'],
        logo: null,
        remote: true,
        featured: true,
      },
      {
        id: 2,
        title: 'Product Manager',
        company: 'StartupXYZ',
        location: 'New York, NY',
        type: 'Full-time',
        salary: '$100k - $130k',
        postedAt: '1 week ago',
        tags: ['Product Strategy', 'Analytics', 'Agile'],
        logo: null,
        remote: false,
        featured: false,
      },
      {
        id: 3,
        title: 'UX Designer',
        company: 'DesignStudio',
        location: 'Remote',
        type: 'Contract',
        salary: '$80k - $100k',
        postedAt: '3 days ago',
        tags: ['Figma', 'User Research', 'Prototyping'],
        logo: null,
        remote: true,
        featured: false,
      },
      {
        id: 4,
        title: 'Data Scientist',
        company: 'DataCorp',
        location: 'Boston, MA',
        type: 'Full-time',
        salary: '$110k - $140k',
        postedAt: '5 days ago',
        tags: ['Python', 'Machine Learning', 'SQL'],
        logo: null,
        remote: false,
        featured: true,
      },
      {
        id: 5,
        title: 'DevOps Engineer',
        company: 'CloudTech',
        location: 'Seattle, WA',
        type: 'Full-time',
        salary: '$95k - $125k',
        postedAt: '1 week ago',
        tags: ['AWS', 'Docker', 'Kubernetes'],
        logo: null,
        remote: true,
        featured: false,
      },
    ];

    return (
      <div className="flex-1">
        {/* Header */}
        <div className="border-border-subtle border-b px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-text text-lg font-semibold">Community Jobs</h2>
              <p className="text-text-secondary text-sm">
                {mockJobs.length} opportunities from community members
              </p>
            </div>
            <button className="bg-primary text-background rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90">
              Post Job
            </button>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-4 p-4">
          {mockJobs.map((job) => (
            <div
              key={job.id}
              className={`border-border bg-surface hover:bg-surface-elevated rounded-lg border p-4 transition-colors ${
                job.featured ? 'ring-primary/20 ring-1' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Company Logo */}
                <div className="flex-shrink-0">
                  {job.logo ? (
                    <Image
                      src={job.logo}
                      alt={job.company}
                      className="h-12 w-12 rounded-lg object-cover"
                      width={48}
                      height={48}
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 font-medium text-white">
                      {job.company.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Job Details */}
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h3 className="text-text font-semibold">{job.title}</h3>
                      <div className="text-text-secondary flex items-center gap-2 text-sm">
                        <Building className="h-4 w-4" />
                        <span>{job.company}</span>
                        {job.featured && (
                          <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="text-text-muted hover:text-text transition-colors">
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="text-text-secondary mb-3 flex flex-wrap items-center gap-3 text-sm">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{job.type}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span>{job.salary}</span>
                    </div>
                    {job.remote && (
                      <span className="bg-success/10 text-success rounded-full px-2 py-0.5 text-xs font-medium">
                        Remote
                      </span>
                    )}
                  </div>

                  <div className="mb-3 flex flex-wrap gap-2">
                    {job.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-surface-elevated text-text-secondary rounded-full px-2 py-1 text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="text-text-muted text-sm">Posted {job.postedAt}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Coming Soon Footer */}
        <div className="mt-8 pb-8 text-center">
          <div className="text-text-muted mb-2">
            <Briefcase className="mx-auto h-5 w-5" />
          </div>
          <p className="text-text-secondary text-sm">Job board functionality launching soon</p>
        </div>
      </div>
    );
  };

  // Articles Content
  const ArticlesContent = () => {
    const mockArticles = [
      {
        id: 1,
        title: 'The Future of Web Development: Trends to Watch in 2024',
        author: 'Sarah Chen',
        authorAvatar: null,
        publishedAt: '2 days ago',
        readTime: '5 min read',
        excerpt:
          'Exploring the latest trends in web development including AI integration, serverless architecture, and the rise of WebAssembly.',
        tags: ['Web Development', 'AI', 'Trends'],
        likes: 142,
        comments: 28,
        views: 1847,
        featured: true,
      },
      {
        id: 2,
        title: 'Building Scalable React Applications: Best Practices',
        author: 'Mike Johnson',
        authorAvatar: null,
        publishedAt: '1 week ago',
        readTime: '8 min read',
        excerpt:
          'Learn how to structure your React applications for maximum scalability and maintainability with proven patterns and practices.',
        tags: ['React', 'JavaScript', 'Best Practices'],
        likes: 89,
        comments: 15,
        views: 923,
        featured: false,
      },
      {
        id: 3,
        title: 'Machine Learning for Beginners: A Comprehensive Guide',
        author: 'Dr. Lisa Wang',
        authorAvatar: null,
        publishedAt: '3 days ago',
        readTime: '12 min read',
        excerpt:
          'Everything you need to know to get started with machine learning, from basic concepts to practical implementation.',
        tags: ['Machine Learning', 'AI', 'Tutorial'],
        likes: 256,
        comments: 42,
        views: 2134,
        featured: true,
      },
      {
        id: 4,
        title: 'The Art of Code Review: Building Better Software Together',
        author: 'Alex Rodriguez',
        authorAvatar: null,
        publishedAt: '5 days ago',
        readTime: '6 min read',
        excerpt:
          'Code reviews are more than just bug hunting. Learn how to give constructive feedback and create a positive review culture.',
        tags: ['Code Review', 'Team Collaboration', 'Software Development'],
        likes: 67,
        comments: 12,
        views: 745,
        featured: false,
      },
      {
        id: 5,
        title: 'Designing User Interfaces That Convert',
        author: 'Emma Thompson',
        authorAvatar: null,
        publishedAt: '1 week ago',
        readTime: '7 min read',
        excerpt:
          'Discover the psychology behind effective UI design and how to create interfaces that drive user engagement and conversions.',
        tags: ['UI Design', 'UX', 'Conversion Optimization'],
        likes: 198,
        comments: 31,
        views: 1456,
        featured: false,
      },
    ];

    return (
      <div className="flex-1">
        {/* Header */}
        <div className="border-border-subtle border-b px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-text text-lg font-semibold">Community Articles</h2>
              <p className="text-text-secondary text-sm">
                {mockArticles.length} articles from community members
              </p>
            </div>
            <button className="bg-primary text-background rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90">
              Write Article
            </button>
          </div>
        </div>

        {/* Articles List */}
        <div className="space-y-4 p-4">
          {mockArticles.map((article) => (
            <div
              key={article.id}
              className={`border-border bg-surface hover:bg-surface-elevated rounded-lg border p-4 transition-colors ${
                article.featured ? 'ring-primary/20 ring-1' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Author Avatar */}
                <div className="flex-shrink-0">
                  {article.authorAvatar ? (
                    <Image
                      src={article.authorAvatar}
                      alt={article.author}
                      className="h-10 w-10 rounded-full object-cover"
                      width={40}
                      height={40}
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-blue-600 font-medium text-white">
                      {article.author.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Article Details */}
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-text leading-tight font-semibold">{article.title}</h3>
                      <div className="text-text-secondary mt-1 flex items-center gap-2 text-sm">
                        <span>{article.author}</span>
                        <span>•</span>
                        <span>{article.publishedAt}</span>
                        <span>•</span>
                        <span>{article.readTime}</span>
                        {article.featured && (
                          <>
                            <span>•</span>
                            <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                              Featured
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <button className="text-text-muted hover:text-text ml-2 flex-shrink-0 transition-colors">
                      <Share className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="text-text-secondary mb-3 text-sm leading-relaxed">
                    {article.excerpt}
                  </p>

                  <div className="mb-3 flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-surface-elevated text-text-secondary rounded-full px-2 py-1 text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="text-text-secondary flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      <span>{article.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{article.comments}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{article.views}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Coming Soon Footer */}
        <div className="mt-8 pb-8 text-center">
          <div className="text-text-muted mb-2">
            <FileText className="mx-auto h-5 w-5" />
          </div>
          <p className="text-text-secondary text-sm">Articles platform launching soon</p>
        </div>
      </div>
    );
  };

  // Flashcards Content
  const FlashcardsContent = () => {
    const mockFlashcardSets = [
      {
        id: 1,
        title: 'JavaScript Fundamentals',
        description:
          'Master the basics of JavaScript programming with these essential concepts and syntax.',
        cardCount: 45,
        studyTime: '30 min',
        difficulty: 'Beginner',
        author: 'CodeMaster',
        authorAvatar: null,
        createdAt: '2 days ago',
        tags: ['JavaScript', 'Programming', 'Fundamentals'],
        studyCount: 1247,
        rating: 4.8,
        featured: true,
      },
      {
        id: 2,
        title: 'React Hooks Deep Dive',
        description:
          'Comprehensive study set covering all React hooks with practical examples and use cases.',
        cardCount: 28,
        studyTime: '20 min',
        difficulty: 'Intermediate',
        author: 'ReactPro',
        authorAvatar: null,
        createdAt: '1 week ago',
        tags: ['React', 'Hooks', 'Advanced'],
        studyCount: 892,
        rating: 4.9,
        featured: false,
      },
      {
        id: 3,
        title: 'Data Structures & Algorithms',
        description:
          'Essential data structures and algorithms for technical interviews and competitive programming.',
        cardCount: 67,
        studyTime: '45 min',
        difficulty: 'Advanced',
        author: 'AlgoExpert',
        authorAvatar: null,
        createdAt: '3 days ago',
        tags: ['Algorithms', 'Data Structures', 'Interview Prep'],
        studyCount: 2156,
        rating: 4.7,
        featured: true,
      },
      {
        id: 4,
        title: 'CSS Grid & Flexbox',
        description:
          'Master modern CSS layout techniques with practical examples and real-world applications.',
        cardCount: 32,
        studyTime: '25 min',
        difficulty: 'Intermediate',
        author: 'CSSNinja',
        authorAvatar: null,
        createdAt: '5 days ago',
        tags: ['CSS', 'Layout', 'Web Design'],
        studyCount: 634,
        rating: 4.6,
        featured: false,
      },
      {
        id: 5,
        title: 'Machine Learning Concepts',
        description:
          'Core ML concepts, algorithms, and terminology explained in simple, digestible cards.',
        cardCount: 52,
        studyTime: '35 min',
        difficulty: 'Intermediate',
        author: 'MLGuru',
        authorAvatar: null,
        createdAt: '1 week ago',
        tags: ['Machine Learning', 'AI', 'Data Science'],
        studyCount: 1089,
        rating: 4.8,
        featured: false,
      },
    ];

    const getDifficultyColor = (difficulty: string) => {
      switch (difficulty) {
        case 'Beginner':
          return 'bg-green-100 text-green-800';
        case 'Intermediate':
          return 'bg-yellow-100 text-yellow-800';
        case 'Advanced':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div className="flex-1">
        {/* Header */}
        <div className="border-border-subtle border-b px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-text text-lg font-semibold">Study Flashcards</h2>
              <p className="text-text-secondary text-sm">
                {mockFlashcardSets.length} flashcard sets from community members
              </p>
            </div>
            <button className="bg-primary text-background rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90">
              Create Set
            </button>
          </div>
        </div>

        {/* Flashcard Sets List */}
        <div className="space-y-4 p-4">
          {mockFlashcardSets.map((set) => (
            <div
              key={set.id}
              className={`border-border bg-surface hover:bg-surface-elevated rounded-lg border p-4 transition-colors ${
                set.featured ? 'ring-primary/20 ring-1' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Author Avatar */}
                <div className="flex-shrink-0">
                  {set.authorAvatar ? (
                    <Image
                      src={set.authorAvatar}
                      alt={set.author}
                      className="h-10 w-10 rounded-full object-cover"
                      width={40}
                      height={40}
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600 font-medium text-white">
                      {set.author.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Flashcard Set Details */}
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-text leading-tight font-semibold">{set.title}</h3>
                      <div className="text-text-secondary mt-1 flex items-center gap-2 text-sm">
                        <span>{set.author}</span>
                        <span>•</span>
                        <span>{set.createdAt}</span>
                        {set.featured && (
                          <>
                            <span>•</span>
                            <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                              Featured
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <button className="text-text-muted hover:text-text ml-2 flex-shrink-0 transition-colors">
                      <Play className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="text-text-secondary mb-3 text-sm leading-relaxed">
                    {set.description}
                  </p>

                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <div className="text-text-secondary flex items-center gap-1 text-sm">
                      <BookOpen className="h-4 w-4" />
                      <span>{set.cardCount} cards</span>
                    </div>
                    <div className="text-text-secondary flex items-center gap-1 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>{set.studyTime}</span>
                    </div>
                    <div className="text-text-secondary flex items-center gap-1 text-sm">
                      <Users className="h-4 w-4" />
                      <span>{set.studyCount} students</span>
                    </div>
                    <div className="text-text-secondary flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-current text-yellow-500" />
                      <span>{set.rating}</span>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${getDifficultyColor(set.difficulty)}`}
                    >
                      {set.difficulty}
                    </span>
                  </div>

                  <div className="mb-3 flex flex-wrap gap-2">
                    {set.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-surface-elevated text-text-secondary rounded-full px-2 py-1 text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    <button className="bg-primary text-background rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90">
                      Study Now
                    </button>
                    <button className="border-border text-text hover:bg-surface-elevated rounded-md border px-4 py-2 text-sm font-medium transition-colors">
                      Preview
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Coming Soon Footer */}
        <div className="mt-8 pb-8 text-center">
          <div className="text-text-muted mb-2">
            <Brain className="mx-auto h-5 w-5" />
          </div>
          <p className="text-text-secondary text-sm">Flashcards platform launching soon</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1">
      {activeTab === 'polls' && <PostsContent />}
      {activeTab === 'leaderboard' && <LeaderboardContent />}
      {activeTab === 'jobs' && <JobsContent />}
      {activeTab === 'articles' && <ArticlesContent />}
      {activeTab === 'flashcards' && <FlashcardsContent />}
    </div>
  );
};

export default CommunityContent;
