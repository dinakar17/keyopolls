'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import {
  useKeyopollsCommentsApiGetCommentThread,
  useKeyopollsCommentsApiGetComments,
} from '@/api/comments/comments';
import {
  CommentOut,
  CommentSearchResultOut,
  CommentSearchTypeEnum,
  CommentSortEnum,
  ContentTypeEnum,
} from '@/api/schemas';
import { useKeyopollsCommentsApiSearchSearchComments } from '@/api/search-comments/search-comments';
import ActionMenu from '@/components/comments/ActionMenu';
import Comment from '@/components/comments/Comment';
import CommentDrawer from '@/components/comments/CommentDrawer';
import EmptyState from '@/components/comments/EmptyState';
import SearchResult from '@/components/comments/SearchResult';
import { useCommentsUIStore } from '@/stores/useCommentsUIStore';
import { useProfileStore } from '@/stores/useProfileStore';

interface CommentsSectionProps {
  contentType: ContentTypeEnum;
  objectId: number;
  allowedMediaTypes: ('images' | 'video' | 'link' | 'gif' | 'poll' | 'location' | 'emoji')[];
  className?: string;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({
  contentType,
  objectId,
  allowedMediaTypes,
  className = '',
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Parse URL parameters - this is our source of truth
  const viewMode =
    searchParams.get('view') === 'thread'
      ? 'thread'
      : searchParams.get('view') === 'search'
        ? 'search'
        : 'all';
  const focusedCommentId = searchParams.get('commentId') || null;
  const searchQuery = searchParams.get('q') || '';
  const searchType = (searchParams.get('search_type') || 'all') as CommentSearchTypeEnum;
  const sortOption = (searchParams.get('sort') || 'newest') as CommentSortEnum;

  // Local state for comments and search results
  const [allCommentsData, setAllCommentsData] = useState<CommentOut[]>([]);
  const [searchResultsData, setSearchResultsData] = useState<CommentSearchResultOut[]>([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const currentPageRef = useRef(1);

  // Get UI state and actions from stores (only what we need for UI, not URL sync)
  const {
    openReplyDrawer,
    openActionMenu,
    toggleCollapse,
    toggleReadMore,
    setHighlightedLine,
    isCollapsed,
    isExpanded,
    getHighlightedLine,
    initializeCollapsedState,
  } = useCommentsUIStore();

  const { accessToken } = useProfileStore();

  // Build auth headers
  const getAuthHeaders = () => {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };
    return headers;
  };

  // Reset state when URL parameters change
  useEffect(() => {
    setAllCommentsData([]);
    setSearchResultsData([]);
    currentPageRef.current = 1;
    setHasNextPage(true);
    setIsLoadingMore(false);
  }, [contentType, objectId, sortOption, searchQuery, viewMode, searchType, focusedCommentId]);

  // All comments query
  const allCommentsQuery = useKeyopollsCommentsApiGetComments(
    contentType,
    objectId,
    {
      sort: sortOption,
      page: currentPageRef.current,
      page_size: 20,
    },
    {
      request: {
        headers: getAuthHeaders(),
      },
      query: {
        enabled: viewMode === 'all',
        refetchOnWindowFocus: false,
      },
    }
  );

  // Thread query
  const threadQuery = useKeyopollsCommentsApiGetCommentThread(
    Number(focusedCommentId),
    {
      parent_levels: 3,
      reply_depth: 6,
    },
    {
      request: {
        headers: getAuthHeaders(),
      },
      query: {
        enabled: viewMode === 'thread' && !!focusedCommentId,
        refetchOnWindowFocus: false,
      },
    }
  );

  // Search query
  const searchQuery_API = useKeyopollsCommentsApiSearchSearchComments(
    {
      q: searchQuery,
      search_type: searchType,
      content_type: contentType,
      object_id: objectId,
      page: currentPageRef.current,
      page_size: 20,
      sort: sortOption,
    },
    {
      request: {
        headers: getAuthHeaders(),
      },
      query: {
        enabled: viewMode === 'search' && searchQuery.trim().length >= 2,
        refetchOnWindowFocus: false,
      },
    }
  );

  // Handle new data when all comments query completes
  useEffect(() => {
    if (allCommentsQuery.data?.data?.items && viewMode === 'all') {
      const newItems = allCommentsQuery.data.data.items;

      if (currentPageRef.current === 1) {
        // First page - replace all data
        setAllCommentsData(newItems);
      } else {
        // Subsequent pages - append data, avoiding duplicates
        setAllCommentsData((prev) => {
          const existingIds = new Set(prev.map((item) => item.id));
          const uniqueNewItems = newItems.filter((item) => !existingIds.has(item.id));
          return [...prev, ...uniqueNewItems];
        });
      }

      // Update pagination state
      const pagination = allCommentsQuery.data.data;
      setHasNextPage(pagination.has_next || false);
      setIsLoadingMore(false);
    }
  }, [allCommentsQuery.data, viewMode]);

  // Handle new data when search query completes
  useEffect(() => {
    if (searchQuery_API.data?.data?.items && viewMode === 'search') {
      const newItems = searchQuery_API.data.data.items;

      if (currentPageRef.current === 1) {
        // First page - replace all data
        setSearchResultsData(newItems);
      } else {
        // Subsequent pages - append data, avoiding duplicates
        setSearchResultsData((prev) => {
          const existingIds = new Set(prev.map((item) => item.id));
          const uniqueNewItems = newItems.filter((item) => !existingIds.has(item.id));
          return [...prev, ...uniqueNewItems];
        });
      }

      // Update pagination state
      const pagination = searchQuery_API.data.data;
      setHasNextPage(pagination.has_next || false);
      setIsLoadingMore(false);
    }
  }, [searchQuery_API.data, viewMode]);

  // Initialize collapsed state based on default_collapsed property
  useEffect(() => {
    if (allCommentsData.length > 0 || threadQuery.data?.data?.focal_comment) {
      let comments: CommentOut[] = [];

      if (viewMode === 'thread' && threadQuery.data?.data?.focal_comment) {
        comments = [threadQuery.data.data.focal_comment];
      } else if (viewMode === 'all') {
        comments = allCommentsData;
      }

      if (comments.length > 0) {
        initializeCollapsedState(comments);
      }
    }
  }, [
    allCommentsData.length,
    threadQuery.data,
    viewMode,
    allCommentsData,
    initializeCollapsedState,
  ]);

  // Get current data based on view mode
  const getCurrentComments = (): CommentOut[] => {
    if (viewMode === 'thread' && threadQuery.data?.data?.focal_comment) {
      return [threadQuery.data.data.focal_comment];
    }
    if (viewMode === 'all') {
      return allCommentsData;
    }
    return [];
  };

  const getCurrentSearchResults = (): CommentSearchResultOut[] => {
    return viewMode === 'search' ? searchResultsData : [];
  };

  const getCurrentPagination = () => {
    if (viewMode === 'all') {
      return {
        total: allCommentsQuery.data?.data?.total || 0,
        hasMore: hasNextPage,
        currentCount: allCommentsData.length,
      };
    }
    if (viewMode === 'search') {
      return {
        total: searchQuery_API.data?.data?.total || 0,
        hasMore: hasNextPage,
        currentCount: searchResultsData.length,
      };
    }
    return null;
  };

  const getThreadContext = () => {
    return viewMode === 'thread' ? threadQuery.data?.data?.parent_context || [] : [];
  };

  // Load more function for infinite scroll
  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasNextPage) {
      return;
    }

    setIsLoadingMore(true);
    currentPageRef.current += 1;

    if (viewMode === 'all') {
      allCommentsQuery.refetch();
    } else if (viewMode === 'search') {
      searchQuery_API.refetch();
    }
  }, [isLoadingMore, hasNextPage, viewMode, allCommentsQuery, searchQuery_API]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasNextPage && !isLoadingMore && !isInitialLoading) {
          console.log('Intersection Observer triggered loadMore');
          loadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '300px 0px',
      }
    );

    observer.observe(loadMoreRef.current);

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [loadMore, hasNextPage, isLoadingMore]);

  // Event handlers
  const handleShowMoreReplies = useCallback(
    (commentId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('view', 'thread');
      params.set('commentId', commentId);
      const newUrl = `?${params.toString()}`;
      router.replace(newUrl, { scroll: false });
    },
    [searchParams, router]
  );

  const handleSearchResultClick = useCallback(
    (resultId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('view', 'thread');
      params.set('commentId', resultId);
      const newUrl = `?${params.toString()}`;
      router.replace(newUrl, { scroll: false });
    },
    [searchParams, router]
  );

  const handleLineClick = useCallback(
    (commentId: number) => {
      setHighlightedLine(commentId);
    },
    [setHighlightedLine]
  );

  const handleReply = useCallback(
    (comment: CommentOut) => {
      openReplyDrawer(comment);
    },
    [openReplyDrawer]
  );

  const handleActionMenu = useCallback(
    (comment: CommentOut) => {
      openActionMenu(comment);
    },
    [openActionMenu]
  );

  // Manual load more handler (for button click if needed)
  const handleLoadMoreClick = useCallback(() => {
    if (!isLoadingMore && hasNextPage) {
      console.log('Manual load more clicked');
      loadMore();
    }
  }, [loadMore, isLoadingMore, hasNextPage]);

  // Get current data
  const comments = getCurrentComments();
  const searchResults = getCurrentSearchResults();
  const pagination = getCurrentPagination();
  const threadContext = getThreadContext();

  // Loading states
  const isInitialLoading =
    (allCommentsQuery.isLoading && currentPageRef.current === 1) ||
    threadQuery.isLoading ||
    (searchQuery_API.isLoading && currentPageRef.current === 1);

  const hasError = !!(allCommentsQuery.error || threadQuery.error || searchQuery_API.error);

  // Add these helper functions in CommentsSection
  const addCommentToList = (newComment: CommentOut) => {
    if (viewMode === 'all') {
      setAllCommentsData((prev) => [newComment, ...prev]);
    }
    // For thread mode, trigger a refetch since thread structure is complex
    if (viewMode === 'thread') {
      threadQuery.refetch();
    }
  };

  const updateCommentInList = (updatedComment: CommentOut) => {
    const updateCommentRecursively = (comments: CommentOut[]): CommentOut[] => {
      return comments.map((comment) => {
        if (comment.id === updatedComment.id) {
          return { ...comment, ...updatedComment };
        }
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: updateCommentRecursively(comment.replies),
          };
        }
        return comment;
      });
    };

    if (viewMode === 'all') {
      setAllCommentsData((prev) => updateCommentRecursively(prev));
    }
    if (viewMode === 'thread') {
      threadQuery.refetch();
    }
  };

  const removeCommentFromList = (commentId: number) => {
    const markCommentAsDeletedRecursively = (comments: CommentOut[]): CommentOut[] => {
      return comments.map((comment) => {
        if (comment.id === commentId) {
          // Mark the comment as deleted instead of removing it
          return {
            ...comment,
            is_deleted: true,
            content: '', // Clear the content
            // Optionally clear other sensitive data
            media: undefined,
            link: undefined,
          };
        }
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: markCommentAsDeletedRecursively(comment.replies),
          };
        }
        return comment;
      });
    };

    if (viewMode === 'all') {
      setAllCommentsData((prev) => markCommentAsDeletedRecursively(prev));
    }
    if (viewMode === 'thread') {
      threadQuery.refetch();
    }
  };

  const addReplyToComment = (parentId: number, newReply: CommentOut) => {
    const addReplyRecursively = (comments: CommentOut[]): CommentOut[] => {
      return comments.map((comment) => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [newReply, ...(comment.replies || [])],
            reply_count: (comment.reply_count || 0) + 1,
          };
        }
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: addReplyRecursively(comment.replies),
          };
        }
        return comment;
      });
    };

    if (viewMode === 'all') {
      setAllCommentsData((prev) => addReplyRecursively(prev));
    }
    if (viewMode === 'thread') {
      threadQuery.refetch();
    }
  };

  // Loading state
  if (isInitialLoading) {
    return (
      <div className={`bg-background ${className}`}>
        <div className="mx-auto max-w-2xl">
          <div className="animate-pulse space-y-4 p-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="bg-surface-elevated h-8 w-8 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="bg-surface-elevated h-3 w-1/4 rounded"></div>
                  <div className="bg-surface-elevated h-3 w-3/4 rounded"></div>
                  <div className="bg-surface-elevated h-3 w-1/2 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (hasError) {
    return (
      <div className={`bg-background ${className}`}>
        <div className="mx-auto max-w-2xl">
          <div className="text-error p-4 text-center">
            Error loading comments. Please try again.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-background ${className}`}>
      {/* Main comments display */}
      <div className="mx-auto max-w-2xl space-y-4">
        {/* Parent context (only in thread view) */}
        {viewMode === 'thread' && threadContext.length > 0 && (
          <div className="border-border-subtle bg-surface-elevated border-b p-4">
            <div className="text-text-secondary mb-3 text-sm">Context:</div>
            <div className="space-y-2">
              {threadContext.map((parent, index) => (
                <div key={parent.id} className="flex gap-2 text-sm">
                  <span className="text-text-muted">{'→'.repeat(index + 1)}</span>
                  <span className="text-text font-medium">{parent.author_info.display_name}:</span>
                  <span className="text-text-secondary">{parent.content}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content based on view mode */}
        {viewMode === 'search' ? (
          /* Search Results with Infinite Scroll */
          <div>
            {searchResults.map((result) => (
              <SearchResult
                key={result.id}
                result={result}
                onClick={() => handleSearchResultClick(result.id.toString())}
              />
            ))}

            {/* Load more trigger for search results */}
            {searchResults.length > 0 && hasNextPage && !isInitialLoading && (
              <div ref={loadMoreRef} className="py-6 text-center">
                {isLoadingMore ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="border-primary h-5 w-5 animate-spin rounded-full border-b-2"></div>
                    <span className="text-text-secondary">Loading more results...</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-text-secondary text-sm">Scroll for more results</div>
                    <button
                      onClick={handleLoadMoreClick}
                      className="text-primary hover:text-primary-dark text-sm underline"
                    >
                      Load More ({searchResults.length} of {pagination?.total || 0})
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Regular Comments with Infinite Scroll */
          <div className="divide-border-subtle divide-y">
            {comments.map((comment) => (
              <Comment
                key={comment.id}
                comment={comment}
                depth={0}
                parentId={null}
                isCollapsed={isCollapsed(comment.id)}
                highlightedLine={getHighlightedLine()}
                isExpanded={isExpanded(comment.id)}
                onToggleCollapse={() => toggleCollapse(comment.id)}
                onToggleReadMore={() => toggleReadMore(comment.id)}
                onLineClick={handleLineClick}
                onShowMoreReplies={handleShowMoreReplies}
                onReply={handleReply}
                onActionMenu={handleActionMenu}
                getIsCollapsed={isCollapsed}
                getIsExpanded={isExpanded}
                onToggleCollapseById={toggleCollapse}
                onToggleReadMoreById={toggleReadMore}
              />
            ))}

            {/* Load more trigger for comments (not in thread view) */}
            {viewMode !== 'thread' && comments.length > 0 && hasNextPage && !isInitialLoading && (
              <div ref={loadMoreRef} className="py-6 text-center">
                {isLoadingMore ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="border-primary h-5 w-5 animate-spin rounded-full border-b-2"></div>
                    <span className="text-text-secondary">Loading more comments...</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-text-secondary text-sm">Scroll for more comments</div>
                    <button
                      onClick={handleLoadMoreClick}
                      className="text-primary hover:text-primary-dark text-sm underline"
                    >
                      Load More ({comments.length} of {pagination?.total || 0})
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {((viewMode === 'all' && comments.length === 0 && !isInitialLoading) ||
          (viewMode === 'search' && searchResults.length === 0 && !isInitialLoading) ||
          (viewMode === 'thread' && comments.length === 0 && !isInitialLoading)) && (
          <EmptyState
            viewMode={viewMode}
            searchQuery={searchQuery}
            searchQueryLength={searchQuery.length}
          />
        )}

        {/* Back to Top Button (appears after scrolling) */}
        {((viewMode === 'all' && comments.length > 10) ||
          (viewMode === 'search' && searchResults.length > 10)) && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-primary text-primary-foreground hover:bg-primary-dark fixed right-6 bottom-6 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-colors"
            aria-label="Back to top"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Comment creation/editing drawer */}
      <CommentDrawer
        allowedMediaTypes={allowedMediaTypes}
        onCommentCreated={addCommentToList}
        onReplyCreated={addReplyToComment}
        onCommentUpdated={updateCommentInList}
      />

      {/* Action menu for edit/delete */}
      <ActionMenu onCommentDeleted={removeCommentFromList} />
    </div>
  );
};

export default CommentsSection;
