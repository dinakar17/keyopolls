'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

import { ArrowLeft, Clock, MessageCircle, Search, Star, TrendingUp, X } from 'lucide-react';

import { useKeyopollsPollsApiGeneralListPolls } from '@/api/polls/polls';
import { CommentSearchResultOut, PollDetails } from '@/api/schemas';
import { useKeyopollsCommentsApiSearchSearchComments } from '@/api/search-comments/search-comments';
import BottomNavigation from '@/components/common/BottomNavigation';
import Poll from '@/components/common/Poll';
import { useProfileStore } from '@/stores/useProfileStore';
import { formatDate, formatNumber } from '@/utils';

type SearchState = 'default' | 'focused' | 'results';
type SearchTab = 'polls' | 'comments';

// Filter types based on the API endpoints
// interface PollFilters {
//   sort: 'newest' | 'oldest' | 'most_votes' | 'most_popular' | 'trending';
//   status: 'active' | 'closed' | 'archived' | 'draft';
//   poll_type: 'single' | 'multiple' | 'ranking';
//   voted: boolean | null;
//   my_polls: boolean;
//   my_communities: boolean;
//   include_expired: boolean;
// }

interface CommentFilters {
  sort: 'newest' | 'oldest' | 'most_liked' | 'most_replies';
  search_type: 'all' | 'content' | 'author' | 'media' | 'links';
}

// Filter definitions
const POLL_FILTERS = [
  {
    key: 'sort' as const,
    label: 'Sort',
    options: [
      { value: 'newest', label: 'Newest' },
      { value: 'oldest', label: 'Oldest' },
      { value: 'most_votes', label: 'Most Votes' },
      { value: 'most_popular', label: 'Most Popular' },
      { value: 'trending', label: 'Trending' },
    ],
  },
  {
    key: 'status' as const,
    label: 'Status',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'closed', label: 'Closed' },
      { value: 'archived', label: 'Archived' },
      { value: 'draft', label: 'Draft' },
    ],
  },
  {
    key: 'poll_type' as const,
    label: 'Type',
    options: [
      { value: 'single', label: 'Single Choice' },
      { value: 'multiple', label: 'Multiple Choice' },
      { value: 'ranking', label: 'Ranking' },
    ],
  },
  {
    key: 'voted' as const,
    label: 'Voted',
    options: [
      { value: 'true', label: 'Voted' },
      { value: 'false', label: 'Not Voted' },
    ],
  },
] as const;

const COMMENT_FILTERS = [
  {
    key: 'sort' as const,
    label: 'Sort',
    options: [
      { value: 'newest', label: 'Newest' },
      { value: 'oldest', label: 'Oldest' },
      { value: 'most_liked', label: 'Most Liked' },
      { value: 'most_replies', label: 'Most Replies' },
    ],
  },
  {
    key: 'search_type' as const,
    label: 'Search In',
    options: [
      { value: 'all', label: 'All' },
      { value: 'content', label: 'Content' },
      { value: 'author', label: 'Author' },
      { value: 'media', label: 'Media' },
      { value: 'links', label: 'Links' },
    ],
  },
] as const;

const TOGGLE_FILTERS = [
  { key: 'my_polls' as const, label: 'My Polls', requiresAuth: true },
  { key: 'my_communities' as const, label: 'My Communities', requiresAuth: true },
  { key: 'include_expired' as const, label: 'Include Expired' },
] as const;

// Dummy trending searches
const TRENDING_SEARCHES = [
  'Climate change solutions',
  'Remote work vs office',
  'Best programming language 2025',
  'AI impact on jobs',
  'Favorite pizza topping',
  'Morning routine habits',
  'Social media effects',
  'Electric vs gas cars',
];

// Horizontal Filter Component
interface HorizontalFiltersProps {
  activeTab: SearchTab;
  onFilterChange: (key: string, value: string | boolean | null) => void;
}

const HorizontalFilters: React.FC<HorizontalFiltersProps> = ({ activeTab, onFilterChange }) => {
  const searchParams = useSearchParams();
  const { accessToken } = useProfileStore();
  const isAuthenticated = !!accessToken;

  const currentFilters = activeTab === 'polls' ? POLL_FILTERS : COMMENT_FILTERS;

  const getFilterValue = (key: string): string | boolean | null => {
    const value = searchParams.get(key);
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  };

  const isFilterActive = (key: string, value: string | boolean): boolean => {
    const currentValue = getFilterValue(key);
    return currentValue === value || (typeof value === 'string' && currentValue === value);
  };

  const hasActiveFilters = (): boolean => {
    const allFilters = [...currentFilters, ...TOGGLE_FILTERS];
    return allFilters.some((filter) => {
      if (filter.key === 'sort') return false; // Don't count sort as active filter
      const value = getFilterValue(filter.key);
      return value !== null && value !== undefined;
    });
  };

  const clearAllFilters = (): void => {
    const params = new URLSearchParams(searchParams.toString());

    // Remove all filter params but keep search query and tab
    const keepParams = ['q', 'tab'];
    Array.from(params.keys()).forEach((key) => {
      if (!keepParams.includes(key)) {
        params.delete(key);
      }
    });

    window.history.replaceState(null, '', `/explore?${params.toString()}`);
  };

  return (
    <div className="border-border bg-background border-b px-4 py-3">
      <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto">
        {/* Clear filters button */}
        {hasActiveFilters() && (
          <button
            onClick={clearAllFilters}
            className="hover:bg-surface-elevated text-text-secondary border-border flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs whitespace-nowrap transition-colors"
          >
            <X size={12} />
            Clear
          </button>
        )}

        {/* Sort filter (always first) */}
        {currentFilters.map(
          (filter) =>
            filter.key === 'sort' && (
              <div key={filter.key} className="flex items-center gap-1">
                {filter.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onFilterChange(filter.key, option.value)}
                    className={`rounded-full px-3 py-1.5 text-xs whitespace-nowrap transition-colors ${
                      isFilterActive(filter.key, option.value)
                        ? 'bg-primary text-background'
                        : 'hover:bg-surface-elevated text-text border-border border'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )
        )}

        {/* Other dropdown filters */}
        {currentFilters.map(
          (filter) =>
            filter.key !== 'sort' && (
              <div key={filter.key} className="relative">
                <select
                  value={(getFilterValue(filter.key) as string) || ''}
                  onChange={(e) => onFilterChange(filter.key, e.target.value || null)}
                  className={`appearance-none rounded-full border px-3 py-1.5 pr-6 text-xs transition-colors ${
                    getFilterValue(filter.key)
                      ? 'border-primary bg-primary text-background'
                      : 'hover:bg-surface-elevated text-text border-border bg-background'
                  }`}
                >
                  <option value="">{filter.label}</option>
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                  <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
                    <path d="M7 7l3-3 3 3m0 6l-3 3-3-3" />
                  </svg>
                </div>
              </div>
            )
        )}

        {/* Toggle filters */}
        {activeTab === 'polls' &&
          TOGGLE_FILTERS.map(
            (filter) =>
              // (!filter.requiresAuth || isAuthenticated) && (
              isAuthenticated && (
                <button
                  key={filter.key}
                  onClick={() => onFilterChange(filter.key, !getFilterValue(filter.key))}
                  className={`rounded-full px-3 py-1.5 text-xs whitespace-nowrap transition-colors ${
                    getFilterValue(filter.key)
                      ? 'bg-primary text-background'
                      : 'hover:bg-surface-elevated text-text border-border border'
                  }`}
                >
                  {filter.label}
                </button>
              )
          )}
      </div>
    </div>
  );
};

// Display-only poll card component
interface TrendingPollCardProps {
  poll: PollDetails;
}

const TrendingPollCard: React.FC<TrendingPollCardProps> = ({ poll }) => {
  const router = useRouter();

  const handleClick = (): void => {
    router.push(`/polls/${poll.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-surface border-border hover:bg-surface-elevated cursor-pointer rounded-lg border p-3 transition-colors"
    >
      {/* Community info */}
      <div className="mb-2 flex items-center gap-2">
        <div className="bg-primary text-background flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold">
          {poll.community_name?.charAt(0).toUpperCase() || 'P'}
        </div>
        <span className="text-text text-xs font-medium">{poll.community_name || 'Poll'}</span>
      </div>

      {/* Poll title */}
      <h3 className="text-text mb-2 line-clamp-2 text-sm font-semibold">{poll.title}</h3>

      {/* Description */}
      {poll.description && (
        <p className="text-text-secondary mb-2 line-clamp-2 text-xs">{poll.description}</p>
      )}

      {/* Images if any */}
      {poll.options?.some((option) => option.image_url) && (
        <div className="mb-2 flex gap-1 overflow-x-auto">
          {poll.options
            .filter((option) => option.image_url)
            .slice(0, 4)
            .map((option, index) => (
              <Image
                key={index}
                src={option.image_url!}
                alt={option.text || 'Poll option'}
                className="h-12 w-12 flex-shrink-0 rounded object-cover"
                width={48}
                height={48}
              />
            ))}
        </div>
      )}

      {/* Stats */}
      <div className="text-text-muted flex items-center gap-3 text-xs">
        <span>{formatNumber(poll.total_votes || 0)} votes</span>
        <span>{poll.comment_count || 0} comments</span>
        <span className="text-xs">{formatDate(poll.created_at)}</span>
      </div>
    </div>
  );
};

// Poll of the Day component (coming soon)
const PollOfTheDay: React.FC = () => {
  return (
    <div className="from-primary to-accent text-background mb-4 rounded-lg bg-gradient-to-r p-4">
      <div className="mb-2 flex items-center gap-2">
        <Star size={20} className="text-warning" />
        <h2 className="text-lg font-bold">Poll of the Day</h2>
      </div>
      <div className="bg-background/10 rounded-lg p-3 backdrop-blur-sm">
        <div className="mb-2 flex items-center gap-2">
          <Clock size={16} className="text-warning" />
          <span className="text-sm font-medium">Coming Soon!</span>
        </div>
        <p className="text-background/80 text-sm">
          Get ready for our daily featured poll that everyone's talking about. Stay tuned!
        </p>
      </div>
    </div>
  );
};

// Search overlay component
interface SearchOverlayProps {
  searchState: SearchState;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setSearchState: (state: SearchState) => void;
  onSearch: (query?: string) => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({
  searchState,
  searchQuery,
  setSearchQuery,
  setSearchState,
  onSearch,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchState === 'focused' && inputRef.current) {
      // Use setTimeout to ensure DOM is updated and overlay is rendered
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          // For mobile devices, also trigger click to ensure keyboard shows
          if ('ontouchstart' in window) {
            inputRef.current.click();
          }
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [searchState]);

  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      onSearch();
    }
  };

  const handleTrendingClick = (trending: string): void => {
    setSearchQuery(trending);
    onSearch(trending);
  };

  if (searchState !== 'focused') return null;

  return (
    <div className="bg-background fixed inset-0 z-50 overflow-y-auto">
      <div className="p-4">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => setSearchState('default')}
            className="hover:bg-surface-elevated rounded-full p-2"
          >
            <ArrowLeft size={20} className="text-text" />
          </button>
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search polls and comments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="border-border bg-surface text-text focus:border-primary focus:ring-primary/20 w-full rounded-full border py-3 pr-10 pl-4 text-sm focus:ring-2 focus:outline-none"
            />
            <button
              onClick={() => onSearch()}
              disabled={!searchQuery.trim()}
              className="text-text-muted hover:text-text absolute top-1/2 right-2 -translate-y-1/2 transform p-1.5 disabled:opacity-50"
            >
              <Search size={16} />
            </button>
          </div>
        </div>

        {/* Trending Searches */}
        <div>
          <h3 className="text-text mb-3 flex items-center gap-2 text-lg font-semibold">
            <TrendingUp size={18} />
            Trending Searches
          </h3>
          <div className="space-y-1">
            {TRENDING_SEARCHES.map((trending, index) => (
              <button
                key={index}
                onClick={() => handleTrendingClick(trending)}
                className="hover:bg-surface-elevated w-full rounded-lg p-3 text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Search size={14} className="text-text-muted" />
                  <span className="text-text text-sm">{trending}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Search results component
interface SearchResultsProps {
  searchQuery: string;
  activeTab: SearchTab;
  setActiveTab: (tab: SearchTab) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ searchQuery, activeTab, setActiveTab }) => {
  const { accessToken } = useProfileStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for pagination
  const [pollsPage, setPollsPage] = useState(1);
  const [commentsPage, setCommentsPage] = useState(1);

  // State for results
  const [polls, setPolls] = useState<PollDetails[]>([]);
  const [comments, setComments] = useState<CommentSearchResultOut[]>([]);

  // State for pagination info
  const [hasNextPolls, setHasNextPolls] = useState(true);
  const [hasNextComments, setHasNextComments] = useState(true);

  // Observers for infinite scroll
  const pollsObserver = useRef<IntersectionObserver | null>(null);
  const commentsObserver = useRef<IntersectionObserver | null>(null);

  // Get filter values from URL
  const getFilterParams = () => {
    const params: Record<string, any> = {};

    // Common params
    params.search = searchQuery;
    params.page = activeTab === 'polls' ? pollsPage : commentsPage;
    params.page_size = 20;

    // Add filter params from URL
    if (activeTab === 'polls') {
      const sort = searchParams.get('sort');
      const status = searchParams.get('status');
      const poll_type = searchParams.get('poll_type');
      const voted = searchParams.get('voted');
      const my_polls = searchParams.get('my_polls');
      const my_communities = searchParams.get('my_communities');
      const include_expired = searchParams.get('include_expired');

      if (sort) params.sort = sort;
      if (status) params.status = status;
      if (poll_type) params.poll_type = poll_type;
      if (voted === 'true') params.voted = true;
      if (voted === 'false') params.voted = false;
      if (my_polls === 'true') params.my_polls = true;
      if (my_communities === 'true') params.my_communities = true;
      if (include_expired === 'true') params.include_expired = true;
    } else {
      const sort = searchParams.get('sort');
      const search_type = searchParams.get('search_type');

      if (sort) params.sort = sort;
      if (search_type) params.search_type = search_type;
    }

    return params;
  };

  // Reset states when search query or filters change
  useEffect(() => {
    setPollsPage(1);
    setCommentsPage(1);
    setPolls([]);
    setComments([]);
    setHasNextPolls(true);
    setHasNextComments(true);
  }, [searchQuery, searchParams.toString()]);

  // API calls with filter params
  const { data: pollsData, isLoading: pollsLoading } = useKeyopollsPollsApiGeneralListPolls(
    getFilterParams(),
    {
      request: {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      },
      query: {
        enabled: activeTab === 'polls' && !!searchQuery.trim(),
        refetchOnWindowFocus: false,
      },
    }
  );

  const { data: commentsData, isLoading: commentsLoading } =
    useKeyopollsCommentsApiSearchSearchComments(
      {
        q: searchQuery,
        page: commentsPage,
        page_size: 20,
        include_poll_content: true,
        sort: (searchParams.get('sort') as CommentFilters['sort']) || 'newest',
        search_type: (searchParams.get('search_type') as CommentFilters['search_type']) || 'all',
      },
      {
        request: {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        },
        query: {
          enabled: activeTab === 'comments' && !!searchQuery.trim(),
          refetchOnWindowFocus: false,
        },
      }
    );

  // Handle data updates
  useEffect(() => {
    if (pollsData?.data?.items) {
      if (pollsPage === 1) {
        setPolls(pollsData.data.items);
      } else {
        setPolls((prev) => [...prev, ...pollsData.data.items]);
      }
      setHasNextPolls(pollsData.data.has_next || false);
    }
  }, [pollsData, pollsPage]);

  useEffect(() => {
    if (commentsData?.data?.items) {
      if (commentsPage === 1) {
        setComments(commentsData.data.items);
      } else {
        setComments((prev) => [...prev, ...commentsData.data.items]);
      }
      setHasNextComments(commentsData.data.has_next || false);
    }
  }, [commentsData, commentsPage]);

  // Update URL when tab changes
  const handleTabChange = (tab: SearchTab): void => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('q', searchQuery);
    params.set('tab', tab);

    const newUrl = `/explore?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
    router.replace(newUrl);
  };

  // Filter change handler
  const handleFilterChange = (key: string, value: string | boolean | null): void => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === null || value === undefined || value === '') {
      params.delete(key);
    } else {
      params.set(key, value.toString());
    }

    // Ensure search query and tab are preserved
    params.set('q', searchQuery);
    params.set('tab', activeTab);

    const newUrl = `/explore?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
    router.replace(newUrl);
  };

  // Infinite scroll callbacks
  const lastPollRef = useCallback(
    (node: HTMLElement | null) => {
      if (pollsLoading) return;
      if (pollsObserver.current) pollsObserver.current.disconnect();
      pollsObserver.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPolls) {
          setPollsPage((prev) => prev + 1);
        }
      });
      if (node) pollsObserver.current.observe(node);
    },
    [pollsLoading, hasNextPolls]
  );

  const lastCommentRef = useCallback(
    (node: HTMLElement | null) => {
      if (commentsLoading) return;
      if (commentsObserver.current) commentsObserver.current.disconnect();
      commentsObserver.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextComments) {
          setCommentsPage((prev) => prev + 1);
        }
      });
      if (node) commentsObserver.current.observe(node);
    },
    [commentsLoading, hasNextComments]
  );

  // Skeleton components
  const Skeleton: React.FC = () => (
    <div className="border-border-subtle animate-pulse border-b p-3">
      <div className="flex space-x-3">
        <div className="bg-surface-elevated h-8 w-8 rounded-full"></div>
        <div className="flex-1">
          <div className="bg-surface-elevated mb-1 h-3 w-3/4 rounded"></div>
          <div className="bg-surface-elevated h-3 w-1/2 rounded"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mt-4">
      {/* Tabs */}
      <div className="border-border mb-4 border-b">
        <nav className="flex space-x-6 px-4">
          {[
            { id: 'polls' as const, label: 'Polls', icon: TrendingUp },
            { id: 'comments' as const, label: 'Comments', icon: MessageCircle },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={`flex items-center gap-2 border-b-2 px-1 py-2 text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'border-primary text-primary'
                  : 'text-text-secondary hover:text-text border-transparent'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Horizontal Filters */}
      <HorizontalFilters activeTab={activeTab} onFilterChange={handleFilterChange} />

      {/* Results */}
      <div className="px-4">
        {activeTab === 'polls' && (
          <div>
            {polls.map((poll, index) => (
              <Poll
                key={poll.id}
                poll={poll}
                isLastPoll={index === polls.length - 1}
                lastPollElementCallback={index === polls.length - 1 ? lastPollRef : undefined}
              />
            ))}
            {pollsLoading && <Skeleton />}
            {!hasNextPolls && polls.length > 0 && (
              <div className="text-text-muted py-6 text-center">
                <p className="text-sm">You've seen all poll results!</p>
              </div>
            )}
            {polls.length === 0 && !pollsLoading && (
              <div className="text-text-muted py-8 text-center">
                <TrendingUp size={40} className="text-text-muted mx-auto mb-3 opacity-50" />
                <p className="text-sm">No polls found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'comments' && (
          <div>
            {comments.map((comment, index) => (
              <div
                key={comment.id}
                ref={index === comments.length - 1 ? lastCommentRef : null}
                className="border-border-subtle hover:bg-surface-elevated/30 border-b p-3 transition-colors"
              >
                <div className="flex space-x-3">
                  <div className="bg-primary text-background flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium">
                    {comment.author_info?.display_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-text text-sm font-medium">
                        {comment.author_info?.display_name || 'Unknown User'}
                      </span>
                      <span className="text-text-secondary text-xs">
                        @{comment.author_info?.username || 'unknown'}
                      </span>
                      <span className="text-text-secondary">·</span>
                      <span className="text-text-secondary text-xs">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-text mb-2 text-sm">{comment.content}</p>
                    {comment.poll_content && (
                      <div className="border-border bg-surface-elevated rounded-lg border p-2">
                        <div className="text-text-secondary mb-1 text-xs">Commented on poll:</div>
                        <div className="text-text text-sm font-medium">
                          {comment.poll_content.title}
                        </div>
                      </div>
                    )}
                    <div className="text-text-muted mt-2 flex items-center gap-3 text-xs">
                      <span>{comment.like_count || 0} likes</span>
                      <span>{comment.reply_count || 0} replies</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {commentsLoading && <Skeleton />}
            {!hasNextComments && comments.length > 0 && (
              <div className="text-text-muted py-6 text-center">
                <p className="text-sm">You've seen all comment results!</p>
              </div>
            )}
            {comments.length === 0 && !commentsLoading && (
              <div className="text-text-muted py-8 text-center">
                <MessageCircle size={40} className="text-text-muted mx-auto mb-3 opacity-50" />
                <p className="text-sm">No comments found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Main Explore component
const Explore: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { accessToken } = useProfileStore();

  // Get query parameters
  const urlQuery = searchParams.get('q') || '';
  const urlTab = (searchParams.get('tab') as SearchTab) || 'polls';
  // const urlMode = searchParams.get('mode'); // Add this to track search mode

  // State management
  const [searchState, setSearchState] = useState<SearchState>('default');
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [activeSearchTab, setActiveSearchTab] = useState<SearchTab>(urlTab);

  // Update state when URL changes
  useEffect(() => {
    const newQuery = searchParams.get('q') || '';
    const newTab = (searchParams.get('tab') as SearchTab) || 'polls';
    const newMode = searchParams.get('mode');

    setSearchQuery(newQuery);
    setActiveSearchTab(newTab);

    // Determine search state based on URL parameters
    if (newMode === 'search') {
      setSearchState('focused');
    } else if (newQuery.trim()) {
      setSearchState('results');
    } else {
      setSearchState('default');
    }
  }, [searchParams]);

  // Fetch trending polls
  const { data: trendingData, isLoading: trendingLoading } = useKeyopollsPollsApiGeneralListPolls(
    {
      sort: 'trending',
      page_size: 12,
      status: ['active'],
    },
    {
      request: {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      },
      query: {
        enabled: !searchQuery.trim() && searchState === 'default',
        refetchOnWindowFocus: false,
      },
    }
  );

  const handleSearch = (query?: string): void => {
    const finalQuery = query || searchQuery;
    if (finalQuery.trim()) {
      const params = new URLSearchParams();
      params.set('q', finalQuery.trim());
      params.set('tab', 'polls');
      // Remove mode parameter when showing results

      setSearchState('results');
      router.push(`/explore?${params.toString()}`);
    }
  };

  const handleSearchFocus = (): void => {
    // Update URL to include search mode
    const params = new URLSearchParams(searchParams.toString());
    params.set('mode', 'search');

    setSearchState('focused');
    router.push(`/explore?${params.toString()}`);
  };

  const handleBackToDefault = (): void => {
    setSearchState('default');
    setSearchQuery(''); // Clear search query when going back
    router.push('/explore'); // Go back to clean URL
  };

  // Update the SearchOverlay setSearchState handler
  const handleSearchOverlayClose = (): void => {
    // If there was a previous query, go back to results, otherwise go to default
    if (urlQuery.trim()) {
      const params = new URLSearchParams();
      params.set('q', urlQuery);
      params.set('tab', activeSearchTab);
      router.push(`/explore?${params.toString()}`);
    } else {
      router.push('/explore');
    }
  };

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Search Overlay */}
      <SearchOverlay
        searchState={searchState}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setSearchState={handleSearchOverlayClose}
        onSearch={handleSearch}
      />

      {/* Main Content - show default when no query or state is default */}
      {searchState === 'default' && (
        <div className="p-4">
          {/* Search Bar */}
          <div className="mb-4">
            <button
              onClick={handleSearchFocus}
              className="border-border bg-surface text-text focus:border-primary focus:ring-primary/20 relative w-full cursor-pointer rounded-full border py-3 pr-4 pl-10 text-left text-sm focus:ring-2 focus:outline-none"
            >
              <span className="text-text-muted">Search polls and comments...</span>
              <Search
                size={18}
                className="text-text-muted pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 transform"
              />
            </button>
          </div>

          {/* Poll of the Day */}
          <PollOfTheDay />

          {/* Trending Polls Section */}
          <section className="mb-6">
            <h2 className="text-text mb-4 flex items-center gap-2 text-xl font-bold">
              <TrendingUp size={20} />
              Trending Polls
            </h2>

            {trendingLoading ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="border-border bg-surface animate-pulse rounded-lg border p-3"
                  >
                    <div className="bg-surface-elevated mb-2 h-3 w-3/4 rounded"></div>
                    <div className="bg-surface-elevated mb-2 h-3 w-1/2 rounded"></div>
                    <div className="bg-surface-elevated h-2 w-1/4 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {trendingData?.data?.items?.slice(0, 12).map((poll) => (
                  <TrendingPollCard key={poll.id} poll={poll} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Search Results */}
      {searchQuery.trim() && searchState === 'results' && (
        <div>
          {/* Header with back button and search query */}
          <div className="mb-4 flex items-center gap-3 p-4">
            <button
              onClick={handleBackToDefault}
              className="hover:bg-surface-elevated rounded-full p-2"
            >
              <ArrowLeft size={18} className="text-text" />
            </button>
            <div>
              <h1 className="text-text text-lg font-bold">Search Results</h1>
              <p className="text-text-secondary text-sm">Results for "{searchQuery}"</p>
            </div>
          </div>

          <SearchResults
            searchQuery={searchQuery}
            activeTab={activeSearchTab}
            setActiveTab={setActiveSearchTab}
          />
        </div>
      )}
      <BottomNavigation />
    </div>
  );
};

export default Explore;
