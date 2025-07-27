'use client';

import React, { useCallback, useEffect, useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { ArrowLeft, Check, DollarSign, Edit3, Globe, Lock, Plus, Search, X } from 'lucide-react';

import { useKeyopollsCommonApiBookmarkGetBookmarkFolders } from '@/api/bookmarks/bookmarks';
import { useKeyopollsCommonApiBookmarkCreateBookmarkFolder } from '@/api/bookmarks/bookmarks';
import { useKeyopollsCommonApiBookmarkUpdateBookmarkFolder } from '@/api/bookmarks/bookmarks';
import { useKeyopollsCommunitiesApiGeneralListCommunities } from '@/api/communities-general/communities-general';
import { BookmarkFolderDetailsSchema, CommunityDetails } from '@/api/schemas';
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

interface FilterState {
  community_id: number | null;
  content_type: 'Poll' | 'Article' | null;
  access_level: 'private' | 'public' | 'paid' | null;
  is_todo_folder: boolean | null;
  search: string;
}

interface FolderFormData {
  name: string;
  description: string;
  color: string;
  access_level: 'private' | 'public' | 'paid';
  content_type: 'Poll' | 'Article';
  price?: number;
}

const PRESET_COLORS = [
  '#3B82F6',
  '#EF4444',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#84CC16',
  '#F97316',
  '#6366F1',
];

const Lists = () => {
  const { accessToken } = useProfileStore();
  const { communityDetails } = useCommunityStore();
  const router = useRouter();

  // State management
  const [filters, setFilters] = useState<FilterState>({
    community_id: communityDetails?.id || null,
    content_type: 'Poll',
    access_level: null,
    is_todo_folder: null,
    search: '',
  });

  const [allFolders, setAllFolders] = useState<BookmarkFolderDetailsSchema[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showCommunitySelector, setShowCommunitySelector] = useState(false);
  const [communitySearch, setCommunitySearch] = useState('');

  // Folder creation/editing state
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [editingFolder, setEditingFolder] = useState<BookmarkFolderDetailsSchema | null>(null);
  const [folderForm, setFolderForm] = useState<FolderFormData>({
    name: '',
    description: '',
    color: '#3B82F6',
    access_level: 'private',
    content_type: 'Poll',
  });

  // API calls
  const { data, isLoading, error, refetch } = useKeyopollsCommonApiBookmarkGetBookmarkFolders(
    {
      page: currentPage,
      page_size: 20,
      ...(filters.community_id && { community_id: filters.community_id }),
      ...(filters.content_type && { content_type: filters.content_type }),
      ...(filters.access_level && { access_level: filters.access_level }),
      ...(filters.is_todo_folder !== null && { is_todo_folder: filters.is_todo_folder }),
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

  const { mutate: createFolder, isPending: isCreatingFolder } =
    useKeyopollsCommonApiBookmarkCreateBookmarkFolder({
      request: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      mutation: {
        onSuccess: () => {
          toast.success('Folder created successfully!');
          resetFolderForm();
          setShowCreateFolder(false);
          refetchData();
        },
        onError: (error) => {
          toast.error('Failed to create folder');
          console.error('Create folder error:', error);
        },
      },
    });

  const { mutate: updateFolder, isPending: isUpdatingFolder } =
    useKeyopollsCommonApiBookmarkUpdateBookmarkFolder({
      request: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      mutation: {
        onSuccess: () => {
          toast.success('Folder updated successfully!');
          resetFolderForm();
          setEditingFolder(null);
          setShowCreateFolder(false);
          refetchData();
        },
        onError: (error) => {
          toast.error('Failed to update folder');
          console.error('Update folder error:', error);
        },
      },
    });

  // Handle data updates
  useEffect(() => {
    if (data?.data) {
      if (currentPage === 1) {
        setAllFolders(data.data.folders);
      } else {
        setAllFolders((prev) => [...prev, ...data.data.folders]);
      }

      setHasMore(data.data.pagination.has_next);
      setIsLoadingMore(false);
    }
  }, [data, currentPage]);

  // Reset when filters change
  useEffect(() => {
    setCurrentPage(1);
    setAllFolders([]);
    setHasMore(true);
  }, [filters]);

  // Utility functions
  const refetchData = () => {
    setCurrentPage(1);
    setAllFolders([]);
    setHasMore(true);
    refetch();
  };

  const resetFolderForm = () => {
    setFolderForm({
      name: '',
      description: '',
      color: '#3B82F6',
      access_level: 'private',
      content_type: 'Poll',
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
  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleCommunitySelect = (community: CommunityDetails | null) => {
    setFilters((prev) => ({ ...prev, community_id: community?.id || null }));
    setShowCommunitySelector(false);
    setCommunitySearch('');
  };

  // Folder form handlers
  const handleCreateFolder = () => {
    if (!folderForm.name.trim()) {
      toast.error('Folder name is required');
      return;
    }

    const createData: any = {
      name: folderForm.name.trim(),
      description: folderForm.description.trim(),
      color: folderForm.color,
      access_level: folderForm.access_level,
      content_type: folderForm.content_type,
      is_todo_folder: false,
    };

    if (folderForm.access_level === 'paid' && folderForm.price) {
      createData.price = folderForm.price;
    }

    createFolder({ data: createData });
  };

  const handleUpdateFolder = () => {
    if (!editingFolder || !folderForm.name.trim()) {
      toast.error('Folder name is required');
      return;
    }

    const updateData: any = {
      name: folderForm.name.trim(),
      description: folderForm.description.trim(),
      color: folderForm.color,
    };

    if (!editingFolder.is_paid) {
      updateData.access_level = folderForm.access_level;
      if (folderForm.access_level === 'paid' && folderForm.price) {
        updateData.price = folderForm.price;
      }
    }

    updateFolder({
      folderId: editingFolder.id,
      data: updateData,
    });
  };

  const handleEditFolder = (folder: BookmarkFolderDetailsSchema) => {
    setEditingFolder(folder);
    setFolderForm({
      name: folder.name,
      description: folder.description,
      color: folder.color,
      access_level: folder.access_level as 'private' | 'public' | 'paid',
      content_type: (folder.content_type as 'Poll' | 'Article') || 'Poll',
      price: folder.price ? parseFloat(folder.price) : undefined,
    });
    setShowCreateFolder(true);
  };

  const getCommunityInitial = (name: string) => name.charAt(0).toUpperCase();

  const selectedCommunity = communitiesData?.data?.communities.find(
    (c) => c.id === filters.community_id
  );

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="border-border animate-pulse rounded-lg border p-4">
          <div className="mb-3 flex items-start justify-between">
            <div className="bg-surface-elevated h-4 w-4 rounded-full"></div>
            <div className="bg-surface-elevated h-4 w-4 rounded"></div>
          </div>
          <div className="mb-3 space-y-2">
            <div className="bg-surface-elevated h-5 w-3/4 rounded"></div>
            <div className="bg-surface-elevated h-4 w-full rounded"></div>
            <div className="bg-surface-elevated h-4 w-2/3 rounded"></div>
          </div>
          <div className="flex items-center justify-between">
            <div className="bg-surface-elevated h-3 w-16 rounded"></div>
            <div className="flex items-center space-x-2">
              <div className="bg-surface-elevated h-5 w-12 rounded"></div>
              <div className="bg-surface-elevated h-3 w-12 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-background border-border sticky top-0 z-40 border-b">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="hover:bg-surface-elevated rounded-full p-1.5 transition-colors"
                title="Go back"
              >
                <ArrowLeft className="text-text h-5 w-5" />
              </button>
              <h1 className="text-text text-xl font-bold">Your Lists</h1>
            </div>
            <button
              onClick={() => {
                resetFolderForm();
                setEditingFolder(null);
                setShowCreateFolder(true);
              }}
              className="bg-primary text-background flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-opacity hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              New List
            </button>
          </div>

          {/* Filters */}
          <div className="space-y-3">
            {/* Community & Search Row */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowCommunitySelector(true)}
                className="border-border bg-background hover:bg-surface-elevated flex flex-1 items-center space-x-2 rounded-lg border px-3 py-2 text-left transition-colors"
              >
                {selectedCommunity ? (
                  <>
                    {selectedCommunity.avatar ? (
                      <Image
                        src={selectedCommunity.avatar}
                        alt={selectedCommunity.name}
                        className="h-5 w-5 rounded-full object-cover"
                        width={20}
                        height={20}
                      />
                    ) : (
                      <div className="bg-primary flex h-5 w-5 items-center justify-center rounded-full">
                        <span className="text-background text-xs font-semibold">
                          {getCommunityInitial(selectedCommunity.name)}
                        </span>
                      </div>
                    )}
                    <span className="text-text truncate text-sm">{selectedCommunity.name}</span>
                  </>
                ) : (
                  <>
                    <div className="bg-text-muted/20 flex h-5 w-5 items-center justify-center rounded-full">
                      <svg
                        className="text-text-muted h-3 w-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-text-muted text-sm">All Communities</span>
                  </>
                )}
              </button>

              <div className="relative flex-1">
                <Search className="text-text-muted absolute top-2.5 left-3 h-4 w-4" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search lists..."
                  className="border-border bg-background text-text placeholder-text-muted focus:border-primary focus:ring-primary/20 w-full rounded-lg border py-2 pr-4 pl-10 text-sm focus:ring-2 focus:outline-none"
                />
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {/* Content Type Pills */}
              <button
                onClick={() =>
                  handleFilterChange(
                    'content_type',
                    filters.content_type === 'Poll' ? null : 'Poll'
                  )
                }
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  filters.content_type === 'Poll'
                    ? 'bg-primary text-background'
                    : 'bg-surface-elevated text-text-muted hover:bg-border'
                }`}
              >
                Polls
              </button>
              <button
                onClick={() =>
                  handleFilterChange(
                    'content_type',
                    filters.content_type === 'Article' ? null : 'Article'
                  )
                }
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  filters.content_type === 'Article'
                    ? 'bg-secondary text-background'
                    : 'bg-surface-elevated text-text-muted hover:bg-border'
                }`}
              >
                Articles
              </button>

              {/* Access Level Pills */}
              <button
                onClick={() =>
                  handleFilterChange(
                    'access_level',
                    filters.access_level === 'private' ? null : 'private'
                  )
                }
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  filters.access_level === 'private'
                    ? 'bg-text text-background'
                    : 'bg-surface-elevated text-text-muted hover:bg-border'
                }`}
              >
                Private
              </button>
              <button
                onClick={() =>
                  handleFilterChange(
                    'access_level',
                    filters.access_level === 'public' ? null : 'public'
                  )
                }
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  filters.access_level === 'public'
                    ? 'bg-success text-background'
                    : 'bg-surface-elevated text-text-muted hover:bg-border'
                }`}
              >
                Public
              </button>
              <button
                onClick={() =>
                  handleFilterChange(
                    'access_level',
                    filters.access_level === 'paid' ? null : 'paid'
                  )
                }
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  filters.access_level === 'paid'
                    ? 'bg-warning text-background'
                    : 'bg-surface-elevated text-text-muted hover:bg-border'
                }`}
              >
                Paid
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-4 py-4">
        {/* Loading State */}
        {isLoading && currentPage === 1 && <LoadingSkeleton />}

        {/* Error State */}
        {error && (
          <div className="py-12 text-center">
            <div className="text-error mx-auto mb-4 h-12 w-12">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="h-full w-full">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-error mb-4">Failed to load lists</p>
            <button
              onClick={() => refetch()}
              className="bg-primary text-background rounded-lg px-4 py-2 text-sm transition-opacity hover:opacity-90"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Lists Grid */}
        {!isLoading && allFolders.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {allFolders.map((folder) => (
              <div
                key={folder.id}
                className="group border-border hover:bg-surface-elevated/30 cursor-pointer rounded-lg border p-4 transition-colors"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div
                    className="h-4 w-4 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: folder.color }}
                  />
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditFolder(folder);
                      }}
                      className="hover:bg-surface rounded-full p-1.5 opacity-0 transition-all group-hover:opacity-100"
                      title="Edit folder"
                    >
                      <Edit3 className="text-text-muted h-3 w-3" />
                    </button>
                    {folder.access_level === 'paid' && (
                      <DollarSign className="text-warning h-4 w-4" />
                    )}
                    {folder.is_todo_folder && (
                      <svg
                        className="text-warning h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    )}
                  </div>
                </div>

                <h3 className="text-text mb-2 line-clamp-2 font-semibold">{folder.name}</h3>

                {folder.description && (
                  <p className="text-text-muted mb-3 line-clamp-2 text-sm">{folder.description}</p>
                )}

                <div className="text-text-secondary flex items-center justify-between text-xs">
                  <span>{folder.bookmark_count} items</span>
                  <div className="flex items-center space-x-2">
                    {folder.content_type && (
                      <span className="bg-surface-elevated rounded-full px-2 py-1">
                        {folder.content_type}
                      </span>
                    )}
                    <span className="capitalize">{folder.access_level}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Loading */}
        {isLoadingMore && (
          <div className="py-8 text-center">
            <div className="border-primary mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"></div>
            <p className="text-text-secondary text-sm">Loading more...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && allFolders.length === 0 && (
          <div className="py-12 text-center">
            <div className="text-text-muted mx-auto mb-4 h-16 w-16">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="h-full w-full">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-text mb-2 font-medium">No lists found</h3>
            <p className="text-text-muted mb-4 text-sm">
              {filters.search ||
              filters.community_id ||
              filters.content_type ||
              filters.access_level
                ? 'Try adjusting your filters'
                : 'Start by creating your first list'}
            </p>
            <button
              onClick={() => {
                resetFolderForm();
                setEditingFolder(null);
                setShowCreateFolder(true);
              }}
              className="bg-primary text-background rounded-lg px-4 py-2 text-sm transition-opacity hover:opacity-90"
            >
              Create Your First List
            </button>
          </div>
        )}

        {/* No More Items */}
        {!hasMore && allFolders.length > 0 && (
          <div className="py-8 text-center">
            <p className="text-text-secondary text-sm">You've reached the end!</p>
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
                className="border-border bg-background text-text placeholder-text-muted focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-3 py-2 pl-10 text-sm focus:ring-2 focus:outline-none"
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
              <div className="flex items-center space-x-3">
                <div className="bg-text-muted/20 flex h-10 w-10 items-center justify-center rounded-full">
                  <svg className="text-text-muted h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-text font-medium">All Communities</h4>
                  <p className="text-text-muted text-sm">View lists from all communities</p>
                </div>
              </div>
            </button>

            {communitiesLoading && (
              <div className="text-text-secondary p-8 text-center">
                <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"></div>
                <p>Loading communities...</p>
              </div>
            )}

            {communitiesData?.data?.communities.map((community) => (
              <button
                key={community.id}
                onClick={() => handleCommunitySelect(community)}
                className={`border-border-subtle hover:bg-surface-elevated w-full border-b p-4 text-left transition-colors last:border-b-0 ${
                  filters.community_id === community.id ? 'bg-surface-elevated' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
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
                      <p className="text-text-muted mt-1 line-clamp-2 text-xs leading-relaxed">
                        {community.description}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Create/Edit Folder Modal */}
      {showCreateFolder && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div className="bg-background border-border flex max-h-[90vh] w-full flex-col rounded-t-xl border sm:max-w-lg sm:rounded-xl">
            {/* Header */}
            <div className="border-border flex items-center justify-between border-b p-4">
              <h3 className="text-text font-semibold">
                {editingFolder ? 'Edit List' : 'Create New List'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateFolder(false);
                  setEditingFolder(null);
                  resetFolderForm();
                }}
                className="hover:bg-surface-elevated rounded-full p-1 transition-colors"
              >
                <X className="text-text-muted h-5 w-5" />
              </button>
            </div>

            {/* Form Content */}
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {/* Folder Name */}
              <div>
                <label className="text-text mb-2 block text-sm font-medium">List Name *</label>
                <input
                  type="text"
                  value={folderForm.name}
                  onChange={(e) => setFolderForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="My Awesome List"
                  maxLength={100}
                  className="border-border focus:ring-primary focus:border-primary text-text bg-surface w-full rounded-lg border px-3 py-2 focus:ring-2"
                />
              </div>

              {/* Folder Description */}
              <div>
                <label className="text-text mb-2 block text-sm font-medium">
                  Description (Optional)
                </label>
                <textarea
                  value={folderForm.description}
                  onChange={(e) =>
                    setFolderForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Describe what this list is for..."
                  rows={3}
                  maxLength={500}
                  className="border-border focus:ring-primary focus:border-primary text-text bg-surface w-full resize-none rounded-lg border px-3 py-2 focus:ring-2"
                />
              </div>

              {/* Content Type */}
              <div>
                <label className="text-text mb-2 block text-sm font-medium">Content Type *</label>
                <select
                  value={folderForm.content_type}
                  onChange={(e) =>
                    setFolderForm((prev) => ({
                      ...prev,
                      content_type: e.target.value as 'Poll' | 'Article',
                    }))
                  }
                  disabled={editingFolder?.is_paid} // Paid folders can't change content type
                  className="border-border focus:ring-primary focus:border-primary text-text bg-surface w-full rounded-lg border px-3 py-2 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Poll">Polls</option>
                  <option value="Article">Articles</option>
                </select>
                {editingFolder?.is_paid && (
                  <p className="text-text-muted mt-1 text-xs">
                    Content type cannot be changed for paid folders
                  </p>
                )}
              </div>

              {/* Access Level */}
              <div>
                <label className="text-text mb-2 block text-sm font-medium">Access Level *</label>
                <div className="space-y-2">
                  {/* Private Option */}
                  <button
                    type="button"
                    onClick={() => setFolderForm((prev) => ({ ...prev, access_level: 'private' }))}
                    disabled={editingFolder?.is_paid}
                    className={`w-full rounded-lg border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      folderForm.access_level === 'private'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:bg-surface-elevated'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Lock className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-text font-medium">Private</div>
                        <div className="text-text-muted text-xs">Only you can see this list</div>
                      </div>
                      {folderForm.access_level === 'private' && (
                        <Check className="text-primary ml-auto h-4 w-4" />
                      )}
                    </div>
                  </button>

                  {/* Public Option */}
                  <button
                    type="button"
                    onClick={() => setFolderForm((prev) => ({ ...prev, access_level: 'public' }))}
                    disabled={editingFolder?.is_paid}
                    className={`w-full rounded-lg border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      folderForm.access_level === 'public'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:bg-surface-elevated'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-green-500" />
                      <div>
                        <div className="text-text font-medium">Public</div>
                        <div className="text-text-muted text-xs">
                          Anyone can discover and save this list
                        </div>
                      </div>
                      {folderForm.access_level === 'public' && (
                        <Check className="text-primary ml-auto h-4 w-4" />
                      )}
                    </div>
                  </button>

                  {/* Paid Option - Only for Polls */}
                  {folderForm.content_type === 'Poll' && (
                    <button
                      type="button"
                      onClick={() => setFolderForm((prev) => ({ ...prev, access_level: 'paid' }))}
                      disabled={editingFolder?.is_paid}
                      className={`w-full rounded-lg border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                        folderForm.access_level === 'paid'
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:bg-surface-elevated'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-4 w-4 text-yellow-500" />
                        <div>
                          <div className="text-text font-medium">Paid</div>
                          <div className="text-text-muted text-xs">
                            Users pay to access your curated polls
                          </div>
                        </div>
                        {folderForm.access_level === 'paid' && (
                          <Check className="text-primary ml-auto h-4 w-4" />
                        )}
                      </div>
                    </button>
                  )}
                </div>

                {editingFolder?.is_paid && (
                  <p className="text-text-muted mt-2 text-xs">
                    Access level cannot be changed for paid folders
                  </p>
                )}
              </div>

              {/* Price Input for Paid Folders */}
              {folderForm.access_level === 'paid' && (
                <div>
                  <label className="text-text mb-2 block text-sm font-medium">Price (USD) *</label>
                  <div className="relative">
                    <span className="text-text-muted absolute top-2.5 left-3">$</span>
                    <input
                      type="number"
                      value={folderForm.price || ''}
                      onChange={(e) =>
                        setFolderForm((prev) => ({
                          ...prev,
                          price: e.target.value ? parseFloat(e.target.value) : undefined,
                        }))
                      }
                      placeholder="9.99"
                      min="0.01"
                      step="0.01"
                      className="border-border focus:ring-primary focus:border-primary text-text bg-surface w-full rounded-lg border py-2 pr-3 pl-8 focus:ring-2"
                    />
                  </div>
                  <p className="text-text-muted mt-1 text-xs">
                    Set a price for access to your curated poll collection
                  </p>
                </div>
              )}

              {/* Color Picker */}
              <div>
                <label className="text-text mb-2 block text-sm font-medium">Color Theme</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFolderForm((prev) => ({ ...prev, color }))}
                      className={`h-8 w-8 rounded-full border-2 transition-all ${
                        folderForm.color === color
                          ? 'border-text scale-110'
                          : 'border-border hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="mt-2">
                  <input
                    type="color"
                    value={folderForm.color}
                    onChange={(e) => setFolderForm((prev) => ({ ...prev, color: e.target.value }))}
                    className="border-border h-10 w-full cursor-pointer rounded-lg border"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-border border-t p-4">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCreateFolder(false);
                    setEditingFolder(null);
                    resetFolderForm();
                  }}
                  className="border-border text-text hover:bg-surface-elevated flex-1 rounded-lg border px-4 py-2 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingFolder ? handleUpdateFolder : handleCreateFolder}
                  disabled={
                    !folderForm.name.trim() ||
                    (folderForm.access_level === 'paid' &&
                      (!folderForm.price || folderForm.price <= 0)) ||
                    isCreatingFolder ||
                    isUpdatingFolder
                  }
                  className="bg-primary text-background hover:bg-primary/90 flex-1 rounded-lg px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCreatingFolder || isUpdatingFolder
                    ? editingFolder
                      ? 'Updating...'
                      : 'Creating...'
                    : editingFolder
                      ? 'Update List'
                      : 'Create List'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <BottomNavigation />
    </div>
  );
};

export default Lists;
