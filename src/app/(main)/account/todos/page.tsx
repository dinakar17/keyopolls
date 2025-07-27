'use client';

import React, { useCallback, useEffect, useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { ArrowLeft, CheckSquare, Edit3, Search, X } from 'lucide-react';

import { useKeyopollsCommonApiBookmarkGetBookmarkFolders } from '@/api/bookmarks/bookmarks';
import { useKeyopollsCommonApiBookmarkCreateBookmarkFolder } from '@/api/bookmarks/bookmarks';
import { useKeyopollsCommonApiBookmarkUpdateBookmarkFolder } from '@/api/bookmarks/bookmarks';
import { useKeyopollsCommunitiesApiGeneralListCommunities } from '@/api/communities-general/communities-general';
import { BookmarkFolderDetailsSchema, CommunityDetails, ContentTypeEnum } from '@/api/schemas';
import BottomNavigation from '@/components/common/BottomNavigation';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import toast from '@/components/ui/toast';
import { useCommunityStore } from '@/stores/useCommunityStore';
import { useProfileStore } from '@/stores/useProfileStore';

interface TodoFilterState {
  community_id: number | null;
  search: string;
}

interface TodoFolderFormData {
  name: string;
  description: string;
  color: string;
}

const PRESET_TODO_COLORS = [
  '#F59E0B',
  '#EF4444',
  '#10B981',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#84CC16',
  '#F97316',
  '#6366F1',
];

const Todos = () => {
  const { accessToken } = useProfileStore();
  const { communityDetails } = useCommunityStore();
  const router = useRouter();

  // State management
  const [filters, setFilters] = useState<TodoFilterState>({
    community_id: communityDetails?.id || null,
    search: '',
  });

  const [allTodoFolders, setAllTodoFolders] = useState<BookmarkFolderDetailsSchema[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showCommunitySelector, setShowCommunitySelector] = useState(false);
  const [communitySearch, setCommunitySearch] = useState('');

  // Todo folder creation/editing state
  const [showCreateTodoFolder, setShowCreateTodoFolder] = useState(false);
  const [editingTodoFolder, setEditingTodoFolder] = useState<BookmarkFolderDetailsSchema | null>(
    null
  );
  const [todoFolderForm, setTodoFolderForm] = useState<TodoFolderFormData>({
    name: '',
    description: '',
    color: '#F59E0B',
  });

  // API calls
  const { data, isLoading, error, refetch } = useKeyopollsCommonApiBookmarkGetBookmarkFolders(
    {
      page: currentPage,
      page_size: 20,
      is_todo_folder: true,
      content_type: 'PollTodo',
      access_level: 'private',
      ...(filters.community_id && { community_id: filters.community_id }),
      ...(filters.search && { search: filters.search }),
      ordering: '-created_at',
    },
    {
      request: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  );

  const { data: communitiesData, isLoading: communitiesLoading } =
    useKeyopollsCommunitiesApiGeneralListCommunities(
      {
        page: 1,
        page_size: 50,
        search: communitySearch,
      },
      {
        query: {
          enabled: showCommunitySelector,
        },
      }
    );

  const { mutate: createTodoFolder, isPending: isCreatingTodoFolder } =
    useKeyopollsCommonApiBookmarkCreateBookmarkFolder({
      request: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      mutation: {
        onSuccess: () => {
          toast.success('Todo folder created successfully!');
          resetTodoFolderForm();
          setShowCreateTodoFolder(false);
          refetchData();
        },
        onError: (error) => {
          toast.error('Failed to create todo folder');
          console.error('Create todo folder error:', error);
        },
      },
    });

  const { mutate: updateTodoFolder, isPending: isUpdatingTodoFolder } =
    useKeyopollsCommonApiBookmarkUpdateBookmarkFolder({
      request: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      mutation: {
        onSuccess: () => {
          toast.success('Todo folder updated successfully!');
          resetTodoFolderForm();
          setEditingTodoFolder(null);
          setShowCreateTodoFolder(false);
          refetchData();
        },
        onError: (error) => {
          toast.error('Failed to update todo folder');
          console.error('Update todo folder error:', error);
        },
      },
    });

  // Handle data updates
  useEffect(() => {
    if (data?.data) {
      if (currentPage === 1) {
        setAllTodoFolders(data.data.folders);
      } else {
        setAllTodoFolders((prev) => [...prev, ...data.data.folders]);
      }

      setHasMore(data.data.pagination.has_next);
      setIsLoadingMore(false);
    }
  }, [data, currentPage]);

  // Reset when filters change
  useEffect(() => {
    setCurrentPage(1);
    setAllTodoFolders([]);
    setHasMore(true);
  }, [filters]);

  // Utility functions
  const refetchData = () => {
    setCurrentPage(1);
    setAllTodoFolders([]);
    setHasMore(true);
    refetch();
  };

  const resetTodoFolderForm = () => {
    setTodoFolderForm({
      name: '',
      description: '',
      color: '#F59E0B',
    });
  };

  // Load more function
  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !isLoading) {
      setIsLoadingMore(true);
      setCurrentPage((prev) => prev + 1);
    }
  }, [isLoadingMore, hasMore, isLoading]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  // Filter handlers
  const handleFilterChange = (key: keyof TodoFilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleCommunitySelect = (community: CommunityDetails | null) => {
    setFilters((prev) => ({ ...prev, community_id: community?.id || null }));
    setShowCommunitySelector(false);
    setCommunitySearch('');
  };

  // Todo folder form handlers
  const handleCreateTodoFolder = () => {
    if (!todoFolderForm.name.trim()) {
      toast.error('Todo folder name is required');
      return;
    }

    const createData = {
      name: todoFolderForm.name.trim(),
      description: todoFolderForm.description.trim(),
      color: todoFolderForm.color,
      access_level: 'private',
      content_type: 'PollTodo' as ContentTypeEnum,
      is_todo_folder: true,
    };

    createTodoFolder({ data: createData });
  };

  const handleUpdateTodoFolder = () => {
    if (!editingTodoFolder || !todoFolderForm.name.trim()) {
      toast.error('Todo folder name is required');
      return;
    }

    const updateData = {
      name: todoFolderForm.name.trim(),
      description: todoFolderForm.description.trim(),
      color: todoFolderForm.color,
    };

    updateTodoFolder({
      folderId: editingTodoFolder.id,
      data: updateData,
    });
  };

  const handleEditTodoFolder = (folder: BookmarkFolderDetailsSchema) => {
    setEditingTodoFolder(folder);
    setTodoFolderForm({
      name: folder.name,
      description: folder.description,
      color: folder.color,
    });
    setShowCreateTodoFolder(true);
  };

  const getCommunityInitial = (name: string) => name.charAt(0).toUpperCase();

  const selectedCommunity = communitiesData?.data?.communities.find(
    (c) => c.id === filters.community_id
  );

  // Loading skeleton components
  const TodoCardSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="border-border animate-pulse rounded-lg border p-4">
          <div className="mb-3 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-surface-elevated h-4 w-4 rounded-full"></div>
              <div className="bg-surface-elevated h-4 w-4 rounded"></div>
            </div>
            <div className="bg-surface-elevated h-4 w-4 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="bg-surface-elevated h-5 w-3/4 rounded"></div>
            <div className="bg-surface-elevated h-4 w-full rounded"></div>
            <div className="bg-surface-elevated h-4 w-1/2 rounded"></div>
          </div>
          <div className="border-border-subtle mt-3 border-t pt-3">
            <div className="bg-surface-elevated mb-2 h-3 w-1/4 rounded"></div>
            <div className="bg-surface-elevated h-1.5 w-full rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const CommunitySkeleton = () => (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="border-border-subtle animate-pulse border-b p-4">
          <div className="flex items-center gap-3">
            <div className="bg-surface-elevated h-10 w-10 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="bg-surface-elevated h-4 w-1/2 rounded"></div>
              <div className="bg-surface-elevated h-3 w-1/3 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-background min-h-screen pb-16">
      {/* Header */}
      <div className="bg-background border-border sticky top-0 z-40 border-b">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="hover:bg-surface-elevated rounded-lg p-2 transition-colors"
              >
                <ArrowLeft className="text-text h-5 w-5" />
              </button>
              <div className="bg-warning rounded-lg p-2">
                <CheckSquare className="text-background h-5 w-5" />
              </div>
              <h1 className="text-text text-xl font-bold">Todo Lists</h1>
            </div>
            {/* <button
          onClick={() => {
            resetTodoFolderForm();
            setEditingTodoFolder(null);
            setShowCreateTodoFolder(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-warning px-3 py-2 text-background font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm">New List</span>
        </button> */}
          </div>

          {/* Filters */}
          <div className="space-y-3">
            {/* Community Filter */}
            <button
              onClick={() => setShowCommunitySelector(true)}
              className="border-border hover:bg-surface-elevated flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors"
            >
              {selectedCommunity ? (
                <>
                  {selectedCommunity.avatar ? (
                    <Image
                      src={selectedCommunity.avatar}
                      alt={selectedCommunity.name}
                      className="h-6 w-6 rounded-full object-cover"
                      width={24}
                      height={24}
                    />
                  ) : (
                    <div className="bg-primary flex h-6 w-6 items-center justify-center rounded-full">
                      <span className="text-background text-xs font-semibold">
                        {getCommunityInitial(selectedCommunity.name)}
                      </span>
                    </div>
                  )}
                  <span className="text-text text-sm">{selectedCommunity.name}</span>
                </>
              ) : (
                <>
                  <div className="bg-text-muted/20 flex h-6 w-6 items-center justify-center rounded-full">
                    <CheckSquare className="text-text-muted h-3 w-3" />
                  </div>
                  <span className="text-text-muted text-sm">All Communities</span>
                </>
              )}
              <ArrowLeft className="text-text-muted ml-auto h-4 w-4 rotate-90" />
            </button>

            {/* Search */}
            <div className="relative">
              <Search className="text-text-muted absolute top-2.5 left-3 h-4 w-4" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search todo lists..."
                className="border-border bg-background text-text placeholder-text-muted focus:border-warning focus:ring-warning/20 w-full rounded-lg border py-2 pr-4 pl-10 text-sm focus:ring-2 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-4 py-4">
        {/* Loading State */}
        {isLoading && currentPage === 1 ? (
          <TodoCardSkeleton />
        ) : error ? (
          <div className="py-12 text-center">
            <div className="bg-error/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <X className="text-error h-6 w-6" />
            </div>
            <p className="text-error mb-4">Failed to load todo lists</p>
            <button
              onClick={() => refetch()}
              className="bg-warning text-background rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
            >
              Try Again
            </button>
          </div>
        ) : allTodoFolders.length > 0 ? (
          <div className="space-y-3">
            {allTodoFolders.map((folder) => (
              <div
                key={folder.id}
                className="group border-border hover:bg-surface-elevated/30 cursor-pointer rounded-lg border p-4 transition-colors"
                onClick={() => {
                  router.push(`/account/todos/${folder.slug}`);
                }}
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 w-4 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: folder.color }}
                    />
                    <CheckSquare className="text-warning h-4 w-4" />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditTodoFolder(folder);
                    }}
                    className="hover:bg-surface-elevated rounded-full p-1.5 opacity-0 transition-all group-hover:opacity-100"
                    title="Edit todo folder"
                  >
                    <Edit3 className="text-text-muted h-3 w-3" />
                  </button>
                </div>

                <h3 className="text-text group-hover:text-warning mb-2 line-clamp-1 font-semibold transition-colors">
                  {folder.name}
                </h3>

                {folder.description && (
                  <p className="text-text-secondary mb-3 line-clamp-2 text-sm">
                    {folder.description}
                  </p>
                )}

                <div className="text-text-secondary flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="text-warning h-3 w-3" />
                    <span>{folder.bookmark_count} items</span>
                  </div>
                  <span className="bg-warning/10 text-warning rounded-full px-2 py-1 text-xs font-medium">
                    Private
                  </span>
                </div>

                {/* Progress indicator */}
                <div className="border-border-subtle mt-3 border-t pt-3">
                  <div className="text-text-muted mb-1 flex items-center justify-between text-xs">
                    <span>Progress</span>
                    <span>0/{folder.bookmark_count}</span>
                  </div>
                  <div className="bg-surface-elevated h-1.5 w-full rounded-full">
                    <div
                      className="bg-warning h-1.5 rounded-full transition-all duration-300"
                      style={{ width: '0%' }}
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Load More Loading */}
            {isLoadingMore && (
              <div className="py-6 text-center">
                <div className="border-warning mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"></div>
                <p className="text-text-secondary text-sm">Loading more...</p>
              </div>
            )}

            {/* No More Items */}
            {!hasMore && (
              <div className="py-6 text-center">
                <p className="text-text-secondary text-sm">You've reached the end!</p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="bg-warning/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <CheckSquare className="text-warning h-8 w-8" />
            </div>
            <h3 className="text-text mb-2 font-medium">No todo lists found</h3>
            <p className="text-text-secondary mb-4 text-sm">
              {filters.search || filters.community_id
                ? 'Try adjusting your filters'
                : 'Create your first todo list to get started'}
            </p>
            {/* <button
              onClick={() => {
                resetTodoFolderForm();
                setEditingTodoFolder(null);
                setShowCreateTodoFolder(true);
              }}
              className="rounded-lg bg-warning px-4 py-2 text-sm text-background font-medium hover:opacity-90 transition-opacity"
            >
              Create Your First Todo List
            </button> */}
          </div>
        )}
      </div>

      {/* Community Selection Drawer */}
      <Drawer open={showCommunitySelector} onOpenChange={setShowCommunitySelector}>
        <DrawerContent className="max-h-[80vh]">
          <DrawerHeader className="border-border border-b">
            <div className="flex items-center justify-between">
              <DrawerTitle>Select Community</DrawerTitle>
              <DrawerClose asChild>
                <button className="hover:bg-surface-elevated rounded-full p-1 transition-colors">
                  <X className="text-text-muted h-5 w-5" />
                </button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="border-border border-b p-4">
            <div className="relative">
              <Search className="text-text-muted absolute top-2.5 left-3 h-4 w-4" />
              <input
                type="text"
                value={communitySearch}
                onChange={(e) => setCommunitySearch(e.target.value)}
                placeholder="Search communities..."
                className="border-border bg-background text-text placeholder-text-muted focus:border-warning focus:ring-warning/20 w-full rounded-lg border py-2 pr-4 pl-10 text-sm focus:ring-2 focus:outline-none"
                autoFocus
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <button
              onClick={() => handleCommunitySelect(null)}
              className={`border-border-subtle hover:bg-surface-elevated w-full border-b p-4 text-left transition-colors ${
                !filters.community_id ? 'bg-surface-elevated' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="bg-text-muted/20 flex h-10 w-10 items-center justify-center rounded-full">
                  <CheckSquare className="text-text-muted h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-text font-medium">All Communities</h4>
                  <p className="text-text-muted text-sm">View todo lists from all communities</p>
                </div>
              </div>
            </button>

            {communitiesLoading ? (
              <div className="p-4">
                <CommunitySkeleton />
              </div>
            ) : (
              communitiesData?.data?.communities.map((community) => (
                <button
                  key={community.id}
                  onClick={() => handleCommunitySelect(community)}
                  className={`border-border-subtle hover:bg-surface-elevated w-full border-b p-4 text-left transition-colors last:border-b-0 ${
                    filters.community_id === community.id ? 'bg-surface-elevated' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {community.avatar ? (
                        <Image
                          src={community.avatar}
                          alt={community.name}
                          className="h-10 w-10 rounded-full object-cover"
                          width={40}
                          height={40}
                        />
                      ) : (
                        <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-full">
                          <span className="text-background text-sm font-semibold">
                            {getCommunityInitial(community.name)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-text truncate font-medium">{community.name}</h4>
                      <p className="text-text-secondary text-sm">
                        {community.member_count.toLocaleString()} members
                      </p>
                      {community.description && (
                        <p className="text-text-muted mt-1 line-clamp-2 text-xs">
                          {community.description}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Create/Edit Todo Folder Drawer */}
      <Drawer open={showCreateTodoFolder} onOpenChange={setShowCreateTodoFolder}>
        <DrawerContent>
          <DrawerHeader className="border-border border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-warning rounded-lg p-2">
                  <CheckSquare className="text-background h-4 w-4" />
                </div>
                <DrawerTitle>
                  {editingTodoFolder ? 'Edit Todo List' : 'Create Todo List'}
                </DrawerTitle>
              </div>
              <DrawerClose asChild>
                <button
                  onClick={() => {
                    setEditingTodoFolder(null);
                    resetTodoFolderForm();
                  }}
                  className="hover:bg-surface-elevated rounded-full p-1 transition-colors"
                >
                  <X className="text-text-muted h-5 w-5" />
                </button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="space-y-4 p-4">
            {/* Name */}
            <div>
              <label className="text-text mb-2 block text-sm font-medium">List Name *</label>
              <input
                type="text"
                value={todoFolderForm.name}
                onChange={(e) => setTodoFolderForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="My Important Todos"
                maxLength={100}
                className="border-border bg-background text-text focus:border-warning focus:ring-warning/20 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-text mb-2 block text-sm font-medium">
                Description (Optional)
              </label>
              <textarea
                value={todoFolderForm.description}
                onChange={(e) =>
                  setTodoFolderForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Describe this todo list..."
                rows={3}
                maxLength={500}
                className="border-border bg-background text-text focus:border-warning focus:ring-warning/20 w-full resize-none rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
              />
            </div>

            {/* Color Picker */}
            <div>
              <label className="text-text mb-2 block text-sm font-medium">Color</label>
              <div className="mb-3 flex flex-wrap gap-2">
                {PRESET_TODO_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setTodoFolderForm((prev) => ({ ...prev, color }))}
                    className={`h-8 w-8 rounded-full border-2 transition-all ${
                      todoFolderForm.color === color
                        ? 'border-text scale-110'
                        : 'border-border hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <input
                type="color"
                value={todoFolderForm.color}
                onChange={(e) => setTodoFolderForm((prev) => ({ ...prev, color: e.target.value }))}
                className="border-border h-10 w-full cursor-pointer rounded-lg border"
              />
            </div>

            {/* Info */}
            <div className="border-warning/20 bg-warning/5 rounded-lg border p-3">
              <div className="flex items-start gap-2">
                <CheckSquare className="text-warning mt-0.5 h-4 w-4 flex-shrink-0" />
                <div className="text-text-secondary text-sm">
                  <p className="text-text mb-1 font-medium">About Todo Lists:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Organize poll-related tasks and action items</li>
                    <li>• All lists are private and only visible to you</li>
                    <li>• Track progress on community activities</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <DrawerClose asChild>
                <button
                  onClick={() => {
                    setEditingTodoFolder(null);
                    resetTodoFolderForm();
                  }}
                  className="border-border text-text hover:bg-surface-elevated flex-1 rounded-lg border px-4 py-2 transition-colors"
                >
                  Cancel
                </button>
              </DrawerClose>
              <button
                onClick={editingTodoFolder ? handleUpdateTodoFolder : handleCreateTodoFolder}
                disabled={
                  !todoFolderForm.name.trim() || isCreatingTodoFolder || isUpdatingTodoFolder
                }
                className="bg-warning text-background flex-1 rounded-lg px-4 py-2 font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCreatingTodoFolder || isUpdatingTodoFolder
                  ? editingTodoFolder
                    ? 'Updating...'
                    : 'Creating...'
                  : editingTodoFolder
                    ? 'Update List'
                    : 'Create List'}
              </button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <BottomNavigation />
    </div>
  );
};

export default Todos;
