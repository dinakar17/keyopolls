'use client';

import React, { useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import {
  ArrowLeft,
  Bell,
  Edit3,
  Flag,
  MoreVertical,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react';

import { useKeyopollsPollsApiOperationsDeletePoll } from '@/api/polls/polls';
import { CommentSearchTypeEnum, CommentSortEnum, PollDetails } from '@/api/schemas';
import { DeleteConfirmationModal } from '@/components/common/ConfirmationModal';
import EditPollModal from '@/components/common/EditPollModal';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import toast from '@/components/ui/toast';
import { useProfileStore } from '@/stores/useProfileStore';

interface PollHeaderProps {
  poll: PollDetails;
  refetchPoll?: () => void; // Optional refetch function
}

const PollHeader: React.FC<PollHeaderProps> = ({ poll, refetchPoll }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { accessToken } = useProfileStore();

  // Get current URL state
  const currentView =
    searchParams.get('view') === 'thread'
      ? 'thread'
      : searchParams.get('view') === 'search'
        ? 'search'
        : 'all';
  const currentSearchQuery = searchParams.get('q') || '';
  const currentSearchType = (searchParams.get('search_type') || 'all') as CommentSearchTypeEnum;
  const currentSort = (searchParams.get('sort') || 'newest') as CommentSortEnum;
  const isEditModalOpen = searchParams.get('edit') === 'true';

  // Local state for header modes and drawers
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchInput, setSearchInputLocal] = useState(currentSearchQuery);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // URL update helper
  const updateURL = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (
        value === null ||
        value === '' ||
        (key === 'sort' && value === 'newest') ||
        (key === 'view' && value === 'all') ||
        (key === 'search_type' && value === 'all')
      ) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    router.replace(newUrl, { scroll: false });
  };

  // Delete poll hook
  const deletePostMutation = useKeyopollsPollsApiOperationsDeletePoll({
    request: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  // Navigation handlers
  const handleBack = () => {
    if (currentView === 'search' || currentView === 'thread') {
      updateURL({ view: null, commentId: null, q: null, search_type: null, edit: null });
    } else {
      router.back();
    }
  };

  const handleNotifications = () => {
    toast.info(
      'You can follow a poll to get notifications about new comments. This feature is coming soon!'
    );
  };

  // Search handlers
  const handleSearchIconClick = () => {
    setIsSearchMode(true);
    setSearchInputLocal(currentSearchQuery);
  };

  const handleSearchClose = () => {
    setIsSearchMode(false);
    setSearchInputLocal('');
    if (currentView === 'search') {
      updateURL({ view: null, q: null, search_type: null });
    }
  };

  const handleSearchInputChange = (value: string) => {
    setSearchInputLocal(value);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
    if (e.key === 'Escape') {
      handleSearchClose();
    }
  };

  const handleSearchSubmit = () => {
    if (searchInput.trim().length >= 2) {
      updateURL({
        view: 'search',
        q: searchInput.trim(),
        search_type: currentSearchType !== 'all' ? currentSearchType : null,
      });
    }
  };

  const handleClearSearchInput = () => {
    setSearchInputLocal('');
  };

  // Search type change handler
  const handleSearchTypeChange = (newType: CommentSearchTypeEnum) => {
    updateURL({
      search_type: newType !== 'all' ? newType : null,
    });
  };

  // Sort change handler
  const handleSortChange = (newSort: CommentSortEnum) => {
    updateURL({
      sort: newSort !== 'newest' ? newSort : null,
    });
    setIsFiltersOpen(false);
  };

  // Options handlers
  const handleEdit = () => {
    setIsOptionsOpen(false);
    updateURL({ edit: 'true' });
  };

  const handleEditModalClose = () => {
    updateURL({ edit: null });
  };

  const handleDeleteClick = () => {
    setIsOptionsOpen(false);
    setDeleteModalOpen(true);
  };

  // Handle actual poll deletion (called from modal)
  const handleConfirmDelete = async () => {
    if (!poll.id) return Promise.reject(new Error('No poll ID provided'));

    return new Promise<void>((resolve, reject) => {
      deletePostMutation.mutate(
        { pollId: poll.id },
        {
          onSuccess: () => {
            toast.success('Poll deleted successfully');
            setDeleteModalOpen(false);

            // If we're on the individual poll page, redirect to home
            if (window.location.pathname === `/posts/${poll.id}`) {
              router.back();
            }

            resolve();
          },
          onError: (error) => {
            console.error('Error deleting poll:', error);
            const errorMessage =
              error.response?.data?.message || error.message || 'Failed to delete poll';
            toast.error(errorMessage);
            reject(error);
          },
        }
      );
    });
  };

  const handleReportPost = () => {
    setIsOptionsOpen(false);
    toast.info('Report feature coming soon!');
  };

  // Get poll preview for delete modal
  const getPostPreview = () => {
    const preview = poll.title.length > 100 ? poll.title.substring(0, 100) + '...' : poll.title;
    return preview || 'This poll';
  };

  // Format date for delete modal
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // Render search mode - Mobile optimized
  if (isSearchMode) {
    return (
      <div className="bg-background border-border-subtle sticky top-0 z-20 border-b">
        <div className="px-4">
          {/* Search Header */}
          <div className="flex h-12 items-center gap-3">
            <button
              onClick={handleSearchClose}
              className="text-text-muted hover:text-text hover:bg-surface-elevated flex h-8 w-8 items-center justify-center rounded-full transition-colors"
              title="Close search"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="relative flex-1">
              <Search
                size={14}
                className="text-text-muted absolute top-1/2 left-3 -translate-y-1/2"
              />
              <input
                type="text"
                placeholder="Search comments..."
                value={searchInput}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="border-border bg-background text-text placeholder-text-muted focus:border-primary w-full rounded-full border py-2 pr-16 pl-9 text-sm transition-colors focus:outline-none"
                autoFocus
              />
              <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1">
                {searchInput && (
                  <button
                    onClick={handleClearSearchInput}
                    className="text-text-muted hover:text-text flex h-6 w-6 items-center justify-center rounded-full transition-colors"
                    title="Clear"
                  >
                    <X size={12} />
                  </button>
                )}
                <button
                  onClick={handleSearchSubmit}
                  disabled={searchInput.trim().length < 2}
                  className="bg-primary text-background rounded-full px-3 py-1 text-xs font-medium transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Go
                </button>
              </div>
            </div>
          </div>

          {/* Search Filters - Mobile optimized */}
          {currentView === 'search' && (
            <div className="flex items-center gap-2 pb-3">
              <select
                value={currentSearchType}
                onChange={(e) => handleSearchTypeChange(e.target.value as CommentSearchTypeEnum)}
                className="border-border bg-background text-text focus:border-primary rounded-full border px-3 py-1.5 text-xs focus:outline-none"
              >
                <option value="all">All</option>
                <option value="content">Content</option>
                <option value="author">Author</option>
                <option value="media">Media</option>
                <option value="links">Links</option>
              </select>

              <select
                value={currentSort}
                onChange={(e) => handleSortChange(e.target.value as CommentSortEnum)}
                className="border-border bg-background text-text focus:border-primary flex-1 rounded-full border px-3 py-1.5 text-xs focus:outline-none"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="most_liked">Most Liked</option>
                <option value="most_replies">Most Replies</option>
              </select>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render normal mode - Mobile optimized
  return (
    <>
      <header className="bg-background border-border-subtle sticky top-0 z-20 border-b">
        <div className="px-4">
          <div className="flex h-12 items-center justify-between">
            {/* Left side */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleBack}
                className="text-text-muted hover:text-text hover:bg-surface-elevated flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                title="Back"
              >
                <ArrowLeft size={18} />
              </button>
              <h1 className="text-text font-medium">
                {currentView === 'search' ? 'Search' : currentView === 'thread' ? 'Thread' : 'Poll'}
              </h1>
            </div>

            {/* Right side */}
            <div className="flex items-center">
              {/* Search icon */}
              <button
                onClick={handleSearchIconClick}
                className="text-text-muted hover:text-text hover:bg-surface-elevated flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                title="Search"
              >
                <Search size={18} />
              </button>

              {/* Filters icon */}
              <Drawer open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <DrawerTrigger asChild>
                  <button
                    className="text-text-muted hover:text-text hover:bg-surface-elevated flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                    title="Filter"
                  >
                    <SlidersHorizontal size={18} />
                  </button>
                </DrawerTrigger>
                <DrawerContent className="max-h-[80vh]">
                  <DrawerHeader className="text-center">
                    <DrawerTitle>Sort Comments</DrawerTitle>
                    <DrawerDescription>Choose how to sort the comments</DrawerDescription>
                  </DrawerHeader>

                  <div className="px-4 pb-4">
                    <div className="space-y-3">
                      {[
                        { value: 'newest', label: 'Newest first' },
                        { value: 'oldest', label: 'Oldest first' },
                        { value: 'most_liked', label: 'Most liked' },
                        { value: 'most_replies', label: 'Most replies' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleSortChange(option.value as CommentSortEnum)}
                          className={`flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors ${
                            currentSort === option.value
                              ? 'bg-primary/10 text-primary'
                              : 'hover:bg-surface-elevated text-text'
                          }`}
                        >
                          <span className="font-medium">{option.label}</span>
                          {currentSort === option.value && (
                            <div className="bg-primary h-2 w-2 rounded-full" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <DrawerFooter className="pt-0">
                    <DrawerClose asChild>
                      <button className="border-border text-text hover:bg-surface-elevated w-full rounded-lg border py-3 font-medium transition-colors">
                        Close
                      </button>
                    </DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>

              {/* Notifications icon */}
              <button
                onClick={handleNotifications}
                className="text-text-muted hover:text-text hover:bg-surface-elevated flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                title="Notifications"
              >
                <Bell size={18} />
              </button>

              {/* Options menu */}
              <Drawer open={isOptionsOpen} onOpenChange={setIsOptionsOpen}>
                <DrawerTrigger asChild>
                  <button
                    className="text-text-muted hover:text-text hover:bg-surface-elevated flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                    title="Options"
                  >
                    <MoreVertical size={18} />
                  </button>
                </DrawerTrigger>
                <DrawerContent className="max-h-[50vh]" onClick={(e) => e.stopPropagation()}>
                  <DrawerHeader className="text-center">
                    <DrawerTitle>Poll Options</DrawerTitle>
                    <DrawerDescription>Additional actions for this poll</DrawerDescription>
                  </DrawerHeader>

                  <div className="space-y-2 px-4 pb-4">
                    {/* Edit option - Only show if user is the author */}
                    {poll.is_author && (
                      <button
                        type="button"
                        onClick={handleEdit}
                        className="hover:bg-surface-elevated flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors"
                      >
                        <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                          <Edit3 size={16} className="text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="text-text font-medium">Edit Poll</div>
                          <div className="text-text-secondary text-xs">
                            Make changes to your poll
                          </div>
                        </div>
                      </button>
                    )}

                    {/* Delete option - Only show if user is the author */}
                    {poll.is_author && (
                      <button
                        type="button"
                        onClick={handleDeleteClick}
                        className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-red-50"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                          <Trash2 size={16} className="text-red-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-red-600">Delete Poll</div>
                          <div className="text-xs text-red-500">Permanently remove this poll</div>
                        </div>
                      </button>
                    )}

                    {/* Report option - Always show */}
                    <button
                      type="button"
                      onClick={handleReportPost}
                      className="hover:bg-surface-elevated flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors"
                    >
                      <div className="bg-error/10 flex h-8 w-8 items-center justify-center rounded-full">
                        <Flag size={16} className="text-error" />
                      </div>
                      <div className="flex-1">
                        <div className="text-text font-medium">Report Poll</div>
                        <div className="text-text-secondary text-xs">
                          Report inappropriate content
                        </div>
                      </div>
                    </button>
                  </div>

                  <DrawerFooter className="pt-0">
                    <DrawerClose asChild>
                      <button className="border-border text-text hover:bg-surface-elevated w-full rounded-lg border py-3 font-medium transition-colors">
                        Cancel
                      </button>
                    </DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            </div>
          </div>
        </div>
      </header>

      {/* Edit Poll Modal */}
      <EditPollModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        poll={{
          id: poll.id,
          title: poll.title,
          description: poll.description,
          tags: poll.tags || [],
          explanation: poll.explanation,
        }}
        refetch={refetchPoll}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={deletePostMutation.isPending}
        itemName="poll"
        title="Delete Poll?"
        description={
          <div className="space-y-3">
            <p>Are you sure you want to delete this poll? This action cannot be undone.</p>
            <div className="rounded-lg border-l-4 border-gray-300 bg-gray-50 p-3">
              <p className="text-sm text-gray-700 italic">"{getPostPreview()}"</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                <span>by {poll.author_username}</span>
                <span>•</span>
                <span>{formatDate(poll.created_at)}</span>
              </div>
            </div>
          </div>
        }
      />
    </>
  );
};

export default PollHeader;
