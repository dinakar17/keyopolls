import React, { useCallback, useEffect, useState } from 'react';

import { Check, List, Loader2, Plus, Search, X } from 'lucide-react';

import {
  useKeyopollsPollsApiListsGetPollLists,
  useKeyopollsPollsApiListsManagePollInList,
} from '@/api/poll-lists/poll-lists';
import { PollListDetailsSchema } from '@/api/schemas';
import { toast } from '@/components/ui/toast';
import { useProfileStore } from '@/stores/useProfileStore';

interface PollListManagerProps {
  pollId: number;
  pollListId?: number;
  isOpen: boolean;
  onClose: () => void;
  triggerElement: React.ReactNode;
}

const PollListManager: React.FC<PollListManagerProps> = ({
  pollId,
  isOpen,
  onClose,
  triggerElement,
  pollListId,
}) => {
  const { accessToken } = useProfileStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [allLists, setAllLists] = useState<PollListDetailsSchema[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [processingLists, setProcessingLists] = useState<Set<number>>(new Set());

  // Fetch user's lists
  const { data, isLoading, error, refetch } = useKeyopollsPollsApiListsGetPollLists(
    {
      list_type: 'list', // Only show poll lists, not folders
      owner_only: true, // Only user's own lists
      page: currentPage,
      page_size: 20,
      ordering: '-updated_at',
      search: searchQuery || undefined,
    },
    {
      request: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      query: {
        enabled: isOpen, // Only fetch when modal is open
      },
    }
  );

  // Manage poll in list mutation
  const { mutate: managePollInList } = useKeyopollsPollsApiListsManagePollInList({
    request: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    mutation: {
      onSuccess: (response) => {
        const listId = response.data.list_id;
        setProcessingLists((prev) => {
          const newSet = new Set(prev);
          newSet.delete(listId);
          return newSet;
        });

        if (response.data.action === 'added') {
          toast.success(`Added to ${getList(listId)?.title || 'list'}`);
        } else {
          toast.success(`Removed from ${getList(listId)?.title || 'list'}`);
        }
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.message || 'Failed to update list';
        toast.error(errorMessage);
      },
    },
  });

  // Handle API response
  useEffect(() => {
    if (data?.data?.lists) {
      if (currentPage === 1) {
        setAllLists(data.data.lists);
      } else {
        setAllLists((prev) => [...prev, ...data.data.lists]);
      }

      setHasMore(data.data.pagination?.has_next || false);
      setIsLoadingMore(false);
    }
  }, [data, currentPage, pollId, pollListId]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      setAllLists([]);
      setHasMore(true);
      setSearchQuery('');
      setProcessingLists(new Set());
    }
  }, [isOpen, pollListId]);

  // Search effect
  useEffect(() => {
    if (!isOpen) return;

    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      setAllLists([]);
      refetch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, isOpen, refetch]);

  // Load more function
  const loadMore = useCallback(() => {
    if (hasMore && !isLoadingMore && !isLoading) {
      setIsLoadingMore(true);
      setCurrentPage((prev) => prev + 1);
    }
  }, [hasMore, isLoadingMore, isLoading]);

  // Scroll to load more
  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (
        target.scrollHeight - target.scrollTop <= target.clientHeight + 100 &&
        hasMore &&
        !isLoadingMore &&
        !isLoading
      ) {
        loadMore();
      }
    };

    const modalContent = document.querySelector('[data-poll-list-modal-content]');
    if (modalContent) {
      modalContent.addEventListener('scroll', handleScroll);
      return () => modalContent.removeEventListener('scroll', handleScroll);
    }
  }, [isOpen, hasMore, isLoadingMore, isLoading, loadMore]);

  const getList = (listId: number): PollListDetailsSchema | undefined =>
    allLists.find((list) => list.id === listId);

  const handleToggleList = (listId: number) => {
    if (processingLists.has(listId)) return;

    setProcessingLists((prev) => new Set([...prev, listId]));

    const isPollCurrentlyInList = pollListId === listId;

    // Determine the action based on current state
    let action: 'add' | 'remove';

    if (isPollCurrentlyInList) {
      // If poll is currently in this list, remove it
      action = 'remove';
    } else {
      // If poll is not in this list, add it
      action = 'add';
    }

    managePollInList({
      listId,
      data: {
        poll_id: pollId,
        action,
      },
    });
  };

  const handleCreateList = () => {
    onClose();
    // Navigate to create list page
    if (typeof window !== 'undefined') {
      window.open('/lists', '_blank');
    }
  };

  const handleManageLists = () => {
    onClose();
    if (typeof window !== 'undefined') {
      window.open('/lists', '_blank');
    }
  };

  if (!isOpen) return <>{triggerElement}</>;

  return (
    <>
      {triggerElement}

      {/* Modal Backdrop */}
      <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-surface border-border flex max-h-[80vh] w-full max-w-md flex-col rounded-xl border shadow-xl">
          {/* Header */}
          <div className="border-border flex items-center justify-between border-b p-4">
            <h2 className="text-text text-lg font-semibold">Add to Lists</h2>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text hover:bg-surface-elevated rounded-full p-1.5 transition-colors"
              type="button"
            >
              <X size={18} />
            </button>
          </div>

          {/* Search */}
          <div className="border-border border-b p-4">
            <div className="relative">
              <Search className="text-text-muted absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your lists..."
                className="bg-surface-elevated border-border focus:border-primary text-text placeholder-text-muted focus:ring-primary/20 w-full rounded-lg border py-2.5 pr-4 pl-10 text-sm focus:ring-2 focus:outline-none"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4" data-poll-list-modal-content>
            {isLoading && currentPage === 1 ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex animate-pulse items-center gap-3 p-3">
                    <div className="bg-surface-elevated rounded-lg p-2">
                      <div className="bg-border h-4 w-4 rounded" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-border mb-1.5 h-4 w-3/4 rounded" />
                      <div className="bg-border h-3 w-1/2 rounded" />
                    </div>
                    <div className="bg-border h-5 w-5 rounded" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="py-8 text-center">
                <p className="text-text-secondary mb-4">Failed to load lists</p>
                <button
                  onClick={() => refetch()}
                  className="bg-primary text-background rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
                  type="button"
                >
                  Try Again
                </button>
              </div>
            ) : allLists.length === 0 ? (
              <div className="py-8 text-center">
                <div className="bg-surface-elevated mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                  <List className="text-text-muted h-5 w-5" />
                </div>
                <h3 className="text-text mb-2 font-medium">
                  {searchQuery ? 'No lists found' : 'No lists yet'}
                </h3>
                <p className="text-text-secondary mb-4 text-sm">
                  {searchQuery
                    ? `No lists match "${searchQuery}"`
                    : 'Create your first poll list to organize your polls'}
                </p>
                {!searchQuery && (
                  <button
                    onClick={handleCreateList}
                    className="bg-primary text-background inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
                    type="button"
                  >
                    <Plus size={16} />
                    Create List
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {allLists.map((list) => {
                  const isPollInThisList = pollListId === list.id;
                  const isProcessing = processingLists.has(list.id);
                  const isFull =
                    list.max_polls != null && list.direct_polls_count >= list.max_polls;
                  const cannotAdd = isFull && !isPollInThisList;

                  return (
                    <button
                      key={list.id}
                      onClick={() => handleToggleList(list.id)}
                      disabled={isProcessing || cannotAdd}
                      className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all ${
                        isPollInThisList
                          ? 'bg-primary/10 border-primary/20 border'
                          : 'hover:bg-surface-elevated border border-transparent'
                      } ${isProcessing || cannotAdd ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                      type="button"
                    >
                      {/* List Icon */}
                      <div
                        className={`rounded-lg p-2 ${
                          isPollInThisList ? 'bg-primary/20' : 'bg-surface-elevated'
                        }`}
                      >
                        <List
                          size={16}
                          className={isPollInThisList ? 'text-primary' : 'text-text-muted'}
                        />
                      </div>

                      {/* List Info */}
                      <div className="min-w-0 flex-1">
                        <div
                          className={`truncate font-medium ${isPollInThisList ? 'text-primary' : 'text-text'}`}
                        >
                          {list.title}
                        </div>
                        <div className="text-text-secondary mt-0.5 flex items-center gap-1.5 text-xs">
                          <span>{list.direct_polls_count || 0} polls</span>
                          {list.max_polls != null && (
                            <>
                              <span>•</span>
                              <span>Max: {list.max_polls}</span>
                            </>
                          )}
                          {cannotAdd && (
                            <>
                              <span>•</span>
                              <span className="text-warning">Full</span>
                            </>
                          )}
                          {isPollInThisList && (
                            <>
                              <span>•</span>
                              <span className="text-primary">Added</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Status Icon */}
                      <div className="flex-shrink-0">
                        {isProcessing ? (
                          <Loader2 className="text-text-muted h-5 w-5 animate-spin" />
                        ) : isPollInThisList ? (
                          <div className="bg-primary rounded-full p-0.5">
                            <Check size={14} className="text-background" />
                          </div>
                        ) : (
                          <div className="border-border h-5 w-5 rounded-full border-2" />
                        )}
                      </div>
                    </button>
                  );
                })}

                {/* Load More */}
                {isLoadingMore && (
                  <div className="py-4 text-center">
                    <Loader2 className="text-text-muted mx-auto h-5 w-5 animate-spin" />
                  </div>
                )}

                {!hasMore && allLists.length > 10 && (
                  <div className="py-4 text-center">
                    <p className="text-text-muted text-xs">All {allLists.length} lists shown</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-border border-t p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">
                {pollListId ? 'Poll is in a list' : 'Poll not in any list'}
              </span>
              <button
                onClick={handleManageLists}
                className="text-primary font-medium transition-opacity hover:opacity-80"
                type="button"
              >
                Manage Lists
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PollListManager;
