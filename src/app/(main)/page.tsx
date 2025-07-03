'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useSearchParams } from 'next/navigation';

import { Home, RefreshCw } from 'lucide-react';

import { useKeyopollsPollsApiGeneralListPolls } from '@/api/polls/polls';
import { PollDetails } from '@/api/schemas';
import BottomNavigation from '@/components/common/BottomNavigation';
import CombinedHeader from '@/components/common/CombinedHeader';
import CreateButton from '@/components/common/CreateButton';
import Poll from '@/components/common/Poll';
import { getUserOrderedCategories } from '@/constants/categories';
import { useProfileStore } from '@/stores/useProfileStore';

const ConnectHomePage = () => {
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useProfileStore();

  // Get categories from constants
  const categories = getUserOrderedCategories();

  // Get initial category from URL params, sessionStorage, or default to first category
  const getInitialCategory = () => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl && categories.some((cat) => cat.slug === categoryFromUrl)) {
      return categoryFromUrl;
    }

    // Fallback to sessionStorage for navigation back scenarios
    if (typeof window !== 'undefined') {
      const savedCategory = sessionStorage.getItem('connect_active_category');
      if (savedCategory && categories.some((cat) => cat.slug === savedCategory)) {
        return savedCategory;
      }
    }

    return categories[0]?.slug || 'for-you';
  };

  // State for active category and polls data
  const [activeCategory, setActiveCategory] = useState(getInitialCategory);
  const [polls, setPolls] = useState<PollDetails[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);

  // Refs for infinite scrolling
  const observer = useRef<IntersectionObserver | null>(null);
  const lastPollElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoading) return;
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

  // Get category ID from slug
  const getCurrentCategoryId = () => {
    const category = categories.find((cat) => cat.slug === activeCategory);
    return category?.id;
  };

  // API call for polls
  const { data, isLoading, error, refetch } = useKeyopollsPollsApiGeneralListPolls(
    {
      category_id: getCurrentCategoryId(),
      page: currentPage,
      page_size: 20,
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
        enabled: !!getCurrentCategoryId(),
        refetchOnWindowFocus: false,
      },
    }
  );

  // Handle API response
  useEffect(() => {
    if (data?.data.items) {
      setHasLoadedInitialData(true);
      if (currentPage === 1) {
        // First page or category change - replace polls
        setPolls(data.data.items);
      } else {
        // Subsequent pages - append polls
        setPolls((prevPolls) => {
          const existingIds = new Set(prevPolls.map((poll) => poll.id));
          const newPolls = data.data.items.filter((poll) => !existingIds.has(poll.id));
          return [...prevPolls, ...newPolls];
        });
      }
      setHasNextPage(data.data.has_next || false);
    }
  }, [data, currentPage]);

  // Handle category change
  const handleCategoryChange = (newCategory: string) => {
    setActiveCategory(newCategory);
    // Save to sessionStorage for navigation back scenarios
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('connect_active_category', newCategory);
    }
  };

  // Handle poll deletion
  const handlePollDelete = (pollId: number) => {
    setPolls((prevPolls) => prevPolls.filter((poll) => poll.id !== pollId));
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      setCurrentPage(1);
      setHasNextPage(true);
      setHasLoadedInitialData(false);
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Get current category info for display
  const getCurrentCategory = () => {
    return categories.find((cat) => cat.slug === activeCategory);
  };

  // Get current category icon
  const getCurrentCategoryIcon = () => {
    const category = getCurrentCategory();
    return category ? (
      <Home size={24} className="text-text-muted" />
    ) : (
      <Home size={24} className="text-text-muted" />
    );
  };

  // Loading skeleton component
  const PollSkeleton = () => (
    <div className="border-border-subtle animate-pulse border-b p-4">
      <div className="flex space-x-3">
        <div className="bg-surface-elevated h-10 w-10 flex-shrink-0 rounded-full"></div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <div className="bg-surface-elevated h-4 w-24 rounded"></div>
            <div className="bg-surface-elevated h-4 w-16 rounded"></div>
          </div>
          <div className="bg-surface-elevated mb-2 h-5 w-3/4 rounded"></div>
          <div className="bg-surface-elevated mb-3 h-4 w-1/2 rounded"></div>
          <div className="space-y-2">
            <div className="bg-surface-elevated h-10 rounded"></div>
            <div className="bg-surface-elevated h-10 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );

  // Error component
  const ErrorMessage = () => (
    <div className="flex flex-col items-center justify-center px-4 py-12">
      <div className="text-error mb-4">
        <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="text-text mb-2 text-lg font-medium">Unable to load polls</h3>
      <p className="text-text-secondary mb-4 text-center">
        There was an error loading the polls. Please try again.
      </p>
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="bg-primary text-background flex items-center gap-2 rounded-lg px-4 py-2 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
        Try Again
      </button>
    </div>
  );

  // Empty state component
  const EmptyState = () => {
    const currentCategory = getCurrentCategory();

    return (
      <div className="flex flex-col items-center justify-center px-4 py-12">
        <div className="text-text-muted mb-4">{getCurrentCategoryIcon()}</div>
        <h3 className="text-text mb-2 text-lg font-medium">
          No polls in {currentCategory?.name || 'this category'}
        </h3>
        <p className="text-text-secondary mb-4 text-center">
          {currentCategory?.name === 'For You'
            ? isAuthenticated()
              ? "We're building your personalized feed. Try following some communities or check back later!"
              : 'Sign in to see a personalized feed, or explore other categories.'
            : `Be the first to create a poll in ${currentCategory?.name}!`}
        </p>
        {isAuthenticated() && (
          <button
            onClick={() => (window.location.href = '/create-poll')}
            className="bg-primary text-background rounded-lg px-4 py-2 transition-opacity hover:opacity-90"
          >
            Create First Poll
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Header & Categories */}
      <CombinedHeader activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />

      {/* Main Content */}
      <main className="mx-auto min-h-screen max-w-2xl">
        {/* Content Area */}
        <div>
          {/* Error State */}
          {error && !isLoading && <ErrorMessage />}

          {/* Empty State - Only show after initial data has loaded */}
          {!error && !isLoading && polls.length === 0 && hasLoadedInitialData && <EmptyState />}

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
          {isLoading && currentPage === 1 && polls.length === 0 && (
            <div>
              {Array.from({ length: 5 }).map((_, index) => (
                <PollSkeleton key={index} />
              ))}
            </div>
          )}

          {/* Loading More */}
          {isLoading && currentPage > 1 && (
            <div className="py-4">
              <PollSkeleton />
            </div>
          )}

          {/* End of Results */}
          {!hasNextPage && polls.length > 0 && (
            <div className="text-text-secondary py-8 text-center">
              <p className="text-sm">You've reached the end! 🎉</p>
              <button
                onClick={handleRefresh}
                className="text-primary mt-2 text-sm font-medium hover:underline"
              >
                Refresh to see new polls
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Create Button Component */}
      {isAuthenticated() && <CreateButton path="/create-poll" />}

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default ConnectHomePage;
