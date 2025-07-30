'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Crown,
  Eye,
  Folder,
  List,
  Lock,
  Pen,
  Plus,
  Search,
  Settings,
  Share,
  Shield,
  Star,
  Users,
  X,
} from 'lucide-react';

import { useKeyopollsCommunitiesApiGeneralGetCommunity } from '@/api/communities-general/communities-general';
import { useKeyopollsCommunitiesApiOperationsToggleCommunityMembership } from '@/api/communities/communities';
import { useKeyopollsPollsApiListsGetPollLists } from '@/api/poll-lists/poll-lists';
import { PollListDetailsSchema } from '@/api/schemas';
import BottomNavigation from '@/components/common/BottomNavigation';
import { toast } from '@/components/ui/toast';
import { useCommunityStore } from '@/stores/useCommunityStore';
import { useProfileStore } from '@/stores/useProfileStore';

import CreateEditModal from '../../CreateEditModal';
import PollsContent from '../../PollsContent';

// Loading Skeleton Components
const CommunityHeaderSkeleton = () => (
  <div className="mb-6 flex animate-pulse items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="bg-surface-elevated h-8 w-8 rounded-full" />
      <div>
        <div className="bg-surface-elevated mb-1 h-5 w-32 rounded" />
        <div className="bg-surface-elevated h-3 w-20 rounded" />
      </div>
    </div>
  </div>
);

const BreadcrumbsSkeleton = () => (
  <div className="mb-4 flex animate-pulse items-center gap-2">
    <div className="bg-surface-elevated h-4 w-16 rounded" />
    <div className="bg-surface-elevated h-4 w-4 rounded" />
    <div className="bg-surface-elevated h-4 w-20 rounded" />
    <div className="bg-surface-elevated h-4 w-4 rounded" />
    <div className="bg-surface-elevated h-4 w-24 rounded" />
  </div>
);

const HeaderSkeleton = () => (
  <div className="mb-6 animate-pulse">
    <div className="mb-4 flex items-center justify-between">
      <div>
        <div className="bg-surface-elevated mb-2 h-8 w-48 rounded" />
        <div className="bg-surface-elevated h-4 w-64 rounded" />
      </div>
      <div className="bg-surface-elevated h-9 w-20 rounded" />
    </div>
    <div className="relative">
      <div className="bg-surface-elevated h-10 w-full rounded-lg" />
    </div>
  </div>
);

const ListItemSkeleton = () => (
  <div className="flex animate-pulse items-start gap-4 p-4">
    <div className="bg-surface-elevated h-12 w-12 flex-shrink-0 rounded-lg" />
    <div className="flex-1 space-y-2">
      <div className="flex items-start justify-between">
        <div className="bg-surface-elevated h-5 w-3/4 rounded" />
        <div className="flex gap-1">
          <div className="bg-surface-elevated h-3 w-3 rounded" />
          <div className="bg-surface-elevated h-4 w-4 rounded" />
        </div>
      </div>
      <div className="bg-surface-elevated h-4 w-full rounded" />
      <div className="bg-surface-elevated h-4 w-2/3 rounded" />
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <div className="bg-surface-elevated h-3 w-8 rounded" />
          <div className="bg-surface-elevated h-3 w-10 rounded" />
          <div className="bg-surface-elevated h-3 w-16 rounded" />
        </div>
        <div className="bg-surface-elevated h-6 w-6 rounded" />
      </div>
    </div>
  </div>
);

const ListsSkeleton = () => (
  <div>
    {[...Array(6)].map((_, i) => (
      <div key={i} className={`${i < 5 ? 'border-border-subtle border-b' : ''}`}>
        <ListItemSkeleton />
      </div>
    ))}
  </div>
);

const UnifiedFolderPage = () => {
  const { accessToken } = useProfileStore();
  const { folderId, slug } = useParams<{ folderId?: string[]; slug: string }>();
  const router = useRouter();
  const { setCommunityDetails, setFolderId } = useCommunityStore();

  // Memoize the current parent ID to prevent unnecessary recalculations
  const currentParentId = useMemo(() => {
    if (!folderId || folderId.length === 0) {
      return null;
    }
    const lastSegment = folderId[folderId.length - 1];
    const parsedId = parseInt(lastSegment);
    return !isNaN(parsedId) ? parsedId : null;
  }, [folderId]);

  // State management
  const [allLists, setAllLists] = useState<PollListDetailsSchema[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ id: number | null; title: string }>>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PollListDetailsSchema | null>(null);

  // Community drawer state
  const [showCommunityDrawer, setShowCommunityDrawer] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // View mode state - prevents flashing
  const [viewMode, setViewMode] = useState<'loading' | 'lists' | 'polls'>('loading');
  const [pollListData, setPollListData] = useState<PollListDetailsSchema | null>(null);

  // Use ref to track if we've already processed the data to prevent infinite loops
  const processedDataRef = useRef<{ parentId: number | null; dataProcessed: boolean }>({
    parentId: null,
    dataProcessed: false,
  });

  // Fetch community data
  const {
    data: communityData,
    isLoading: communityLoading,
    refetch: refetchCommunity,
  } = useKeyopollsCommunitiesApiGeneralGetCommunity(slug, {
    request: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  const community = communityData?.data;

  // Join/Leave membership mutation
  const { mutate: toggleMembership, isPending: isToggling } =
    useKeyopollsCommunitiesApiOperationsToggleCommunityMembership({
      request: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

  // Fetch lists - only enabled when not in polls mode
  const shouldFetchLists = viewMode !== 'polls' && !!slug;

  const { data, isLoading, error, refetch } = useKeyopollsPollsApiListsGetPollLists(
    {
      parent_id: currentParentId || 0,
      page: currentPage,
      page_size: 20,
      ordering: 'order',
      search: searchQuery || undefined,
      community_slug: slug || undefined,
    },
    {
      request: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      query: {
        enabled: shouldFetchLists,
      },
    }
  );

  console.log('Fetched lists data:', data);

  // Handle API response - wrapped in useCallback to prevent unnecessary re-renders
  const handleApiResponse = useCallback(
    (data: any) => {
      if (!data || processedDataRef.current.dataProcessed) return;

      // Check if this is a poll list (no child lists, but has parent info)
      if (data.data.hierarchy && data.data.hierarchy.parent && data.data.lists.length === 0) {
        const parentInfo = data.data.hierarchy.parent;
        setPollListData({
          id: parentInfo.id,
          title: parentInfo.title,
          list_type: 'list',
          description: '',
          direct_polls_count: 0,
          view_count: 0,
          profile: { display_name: '', username: '' },
          visibility: 'public',
          is_featured: false,
          is_collaborative: false,
        } as unknown as PollListDetailsSchema);
        setViewMode('polls');
      } else {
        // This is a folder with lists
        if (currentPage === 1) {
          setAllLists(data.data.lists);
        } else {
          setAllLists((prev) => [...prev, ...data.data.lists]);
        }
        setHasMore(data.data.pagination.has_next);
        setIsLoadingMore(false);
        setViewMode('lists');
      }

      // Set breadcrumbs
      if (data.data.hierarchy) {
        setBreadcrumbs([
          { id: null, title: 'All Lists' },
          ...data.data.hierarchy.breadcrumbs.map((item: any) => ({
            id: item.id,
            title: item.title,
          })),
        ]);
      } else {
        setBreadcrumbs([{ id: null, title: 'All Lists' }]);
      }

      // Mark as processed to prevent infinite loops
      processedDataRef.current.dataProcessed = true;
    },
    [currentPage]
  );

  // Effect to handle API response
  useEffect(() => {
    if (data && viewMode !== 'polls') {
      handleApiResponse(data);
    }
  }, [data, handleApiResponse, viewMode]);

  // Load more function
  const loadMore = useCallback(() => {
    if (hasMore && !isLoadingMore && !isLoading && viewMode === 'lists') {
      setIsLoadingMore(true);
      setCurrentPage((prev) => prev + 1);
      // Reset processed flag when loading more
      processedDataRef.current.dataProcessed = false;
    }
  }, [hasMore, isLoadingMore, isLoading, viewMode]);

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (
        viewMode === 'lists' &&
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 1000
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore, viewMode]);

  // Navigation functions - memoized to prevent re-renders
  const navigateToItem = useCallback(
    (item: PollListDetailsSchema) => {
      const currentPath = (folderId && Array.isArray(folderId) ? folderId.join('/') : '') || '';
      const newPath = currentPath ? `${currentPath}/${item.id}` : `${item.id}`;
      router.push(`/communities/${slug}/lists/${newPath}`);
    },
    [folderId, slug, router]
  );

  const navigateToBreadcrumb = useCallback(
    (breadcrumbId: number | null) => {
      if (breadcrumbId === null) {
        router.push(`/communities/${slug}/lists`);
      } else {
        const breadcrumbIndex = breadcrumbs.findIndex((b) => b.id === breadcrumbId);
        if (breadcrumbIndex >= 0) {
          const pathSegments = breadcrumbs.slice(1, breadcrumbIndex + 1).map((b) => b.id);
          if (pathSegments.length > 0) {
            router.push(`/communities/${slug}/lists/${pathSegments.join('/')}`);
          } else {
            router.push(`/communities/${slug}/lists`);
          }
        }
      }
    },
    [breadcrumbs, slug, router]
  );

  const goBack = useCallback(() => {
    if (folderId && folderId.length > 1) {
      const parentPath = folderId.slice(0, -1).join('/');
      router.push(`/communities/${slug}/lists/${parentPath}`);
    } else {
      router.push(`/communities/${slug}/lists`);
    }
  }, [folderId, slug, router]);

  // Community handlers - memoized
  const handleJoinCommunity = useCallback(() => {
    if (!community) return;
    toggleMembership(
      {
        communityId: community.id,
        data: { action: 'join' },
      },
      {
        onSuccess: (response) => {
          toast.success(response.data.message);
          refetchCommunity();
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || 'Failed to join community');
        },
      }
    );
  }, [community, toggleMembership, refetchCommunity]);

  const handleLeaveCommunity = useCallback(() => {
    if (!community) return;
    toggleMembership(
      {
        communityId: community.id,
        data: { action: 'leave' },
      },
      {
        onSuccess: (response) => {
          toast.success(response.data.message);
          refetchCommunity();
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || 'Failed to leave community');
        },
      }
    );
  }, [community, toggleMembership, refetchCommunity]);

  const handleShare = useCallback(async () => {
    const shareData = {
      title: `${community?.name} Community`,
      text: `Check out the ${community?.name} community!`,
      url: window.location.href.replace('/lists', ''),
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href.replace('/lists', ''));
        toast.success('Community link copied to clipboard!');
      }
    } catch {
      try {
        await navigator.clipboard.writeText(window.location.href.replace('/lists', ''));
        toast.success('Community link copied to clipboard!');
      } catch {
        toast.error('Failed to share community link');
      }
    }
  }, [community]);

  const getVisibilityIcon = useCallback((visibility: string) => {
    switch (visibility) {
      case 'public':
        return <Eye className="text-success h-3 w-3" />;
      case 'unlisted':
        return <Users className="text-warning h-3 w-3" />;
      case 'private':
        return <Lock className="text-error h-3 w-3" />;
      default:
        return null;
    }
  }, []);

  const getCommunityIcon = useCallback((type: string) => {
    switch (type) {
      case 'public':
        return <Users className="h-3 w-3" />;
      case 'private':
        return <Shield className="h-3 w-3" />;
      case 'restricted':
        return <Shield className="h-3 w-3" />;
      default:
        return <Users className="h-3 w-3" />;
    }
  }, []);

  const getRoleIcon = useCallback((role: string) => {
    switch (role) {
      case 'creator':
        return <Crown className="text-warning h-4 w-4" />;
      case 'admin':
        return <Shield className="text-error h-4 w-4" />;
      case 'moderator':
        return <Shield className="text-primary h-4 w-4" />;
      default:
        return <Users className="text-text-secondary h-4 w-4" />;
    }
  }, []);

  const truncateDescription = useCallback((text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }, []);

  const handleSuccess = useCallback(() => {
    setCurrentPage(1);
    setAllLists([]);
    processedDataRef.current.dataProcessed = false;
    refetch();
  }, [refetch]);

  const handleCreatePoll = useCallback(
    (folderId: number | null) => {
      setCommunityDetails(community || null);
      setFolderId(folderId ? folderId.toString() : null);
      router.push(`/create-poll`);
    },
    [community, setCommunityDetails, setFolderId, router]
  );

  // Memoize computed values
  const isRootLevel = useMemo(() => !folderId || folderId.length === 0, [folderId]);
  const membership = useMemo(() => community?.membership_details, [community]);
  const permissions = useMemo(() => community?.user_permissions, [community]);
  const isMember = useMemo(() => membership?.is_active, [membership]);
  const isModerator = useMemo(
    () => ['creator', 'admin', 'moderator'].includes(membership?.role || ''),
    [membership]
  );

  // Community Drawer Component - memoized
  const CommunityDrawer = useMemo(() => {
    const DrawerComponent = () => (
      <div className="bg-background/80 fixed inset-0 z-50 flex items-end justify-center backdrop-blur-sm">
        <div className="bg-surface border-border max-h-[80vh] w-full max-w-md overflow-y-auto rounded-t-xl border-t shadow-xl">
          {/* Header */}
          <div className="border-border flex items-center justify-between border-b p-4">
            <h2 className="text-text text-lg font-semibold">Community Info</h2>
            <button
              onClick={() => setShowCommunityDrawer(false)}
              className="text-text-muted hover:text-text hover:bg-surface-elevated rounded-full p-1.5 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Community Info */}
          <div className="p-4">
            {/* Avatar and Name */}
            <div className="mb-4 flex items-center gap-3">
              {community?.avatar ? (
                <Image
                  src={community.avatar}
                  alt={community.name}
                  className="h-12 w-12 rounded-full object-cover"
                  width={48}
                  height={48}
                />
              ) : (
                <div className="bg-surface-elevated flex h-12 w-12 items-center justify-center rounded-full">
                  <Users className="text-text-muted h-6 w-6" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="text-text text-lg font-semibold">{community?.name}</h3>
                <div className="text-text-muted flex items-center gap-1 text-sm">
                  <Users className="h-3 w-3" />
                  <span>{community?.member_count.toLocaleString()} members</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {community?.description && (
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

            {/* Community Type and Member Status */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <div className="bg-surface-elevated text-text-secondary flex items-center gap-1 rounded-full px-2 py-1 text-xs">
                {getCommunityIcon(community?.community_type || '')}
                <span className="capitalize">{community?.community_type}</span>
              </div>
              {membership && (
                <div className="bg-primary/10 text-primary flex items-center gap-1 rounded-full px-2 py-1 text-xs">
                  {getRoleIcon(membership.role)}
                  <span className="capitalize">{membership.role}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleShare}
                className="border-border bg-surface text-text hover:bg-surface-elevated flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors"
              >
                <Share className="mx-auto h-4 w-4" />
              </button>

              {isMember ? (
                isModerator ? (
                  <button
                    onClick={() => router.push(`/communities/${community?.slug}/admin`)}
                    className="bg-surface border-border text-text hover:bg-surface-elevated flex flex-1 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Manage
                  </button>
                ) : (
                  <button
                    onClick={handleLeaveCommunity}
                    disabled={isToggling}
                    className="bg-error text-background flex-1 rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {isToggling ? 'Leaving...' : 'Leave'}
                  </button>
                )
              ) : permissions?.can_join ? (
                <button
                  onClick={handleJoinCommunity}
                  disabled={isToggling}
                  className="bg-primary text-background flex-1 rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {isToggling ? 'Joining...' : 'Join'}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );

    DrawerComponent.displayName = 'CommunityDrawer';
    return DrawerComponent;
  }, [
    community,
    membership,
    showFullDescription,
    isMember,
    isModerator,
    permissions,
    isToggling,
    handleShare,
    handleJoinCommunity,
    handleLeaveCommunity,
    getCommunityIcon,
    getRoleIcon,
    truncateDescription,
    router,
  ]);

  // Show loading state while determining view mode or loading community
  if (communityLoading && !community) {
    return (
      <div className="bg-background min-h-screen">
        <div className="mx-auto max-w-2xl px-4 py-6">
          <CommunityHeaderSkeleton />
          <BreadcrumbsSkeleton />
          <HeaderSkeleton />
          <ListsSkeleton />
        </div>
      </div>
    );
  }

  // Show loading only when we don't have community data yet
  if (!community) {
    if (communityLoading) {
      return (
        <div className="bg-background min-h-screen">
          <div className="mx-auto max-w-2xl px-4 py-6">
            <CommunityHeaderSkeleton />
            <HeaderSkeleton />
          </div>
        </div>
      );
    }

    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-error mb-2 text-lg font-medium">Community not found</div>
          <div className="text-text-secondary text-sm">
            The community you're looking for doesn't exist or you don't have access to it.
          </div>
        </div>
      </div>
    );
  }

  // POLLS VIEW - Show when we have poll list data
  if (viewMode === 'polls' && pollListData) {
    return (
      <div className="bg-background min-h-screen">
        <div className="mx-auto max-w-2xl px-4 py-6">
          {/* Community Header */}
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => setShowCommunityDrawer(true)}
              className="hover:bg-surface-elevated/30 -ml-2 flex items-center gap-3 rounded-lg p-2 transition-colors"
            >
              {community.avatar ? (
                <Image
                  src={community.avatar}
                  alt={community.name}
                  className="h-8 w-8 rounded-full object-cover"
                  width={32}
                  height={32}
                />
              ) : (
                <div className="bg-surface-elevated flex h-8 w-8 items-center justify-center rounded-full">
                  <Users className="text-text-muted h-4 w-4" />
                </div>
              )}
              <div className="text-left">
                <h1 className="text-text text-lg font-semibold">{community.name}</h1>
                <div className="text-text-secondary text-xs">
                  {community.member_count.toLocaleString()} members
                </div>
              </div>
            </button>
            <button
              onClick={goBack}
              className="text-text-secondary hover:text-text hover:bg-surface-elevated/30 flex items-center gap-2 rounded-lg p-2 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          </div>

          {/* Breadcrumbs */}
          {breadcrumbs.length > 1 && (
            <div className="mb-6 flex items-center gap-2 text-sm">
              {breadcrumbs.map((breadcrumb, index) => (
                <React.Fragment key={`${breadcrumb.id}-${index}`}>
                  <button
                    onClick={() => navigateToBreadcrumb(breadcrumb.id)}
                    className={`hover:text-primary transition-colors ${
                      index === breadcrumbs.length - 1
                        ? 'text-text font-medium'
                        : 'text-text-secondary hover:text-text'
                    }`}
                  >
                    {index === 0 ? (
                      <div className="flex items-center gap-1">
                        <List className="h-4 w-4" />
                        {breadcrumb.title}
                      </div>
                    ) : (
                      breadcrumb.title
                    )}
                  </button>
                  {index < breadcrumbs.length - 1 && (
                    <ChevronRight className="text-text-secondary h-4 w-4" />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* List Header */}
          <div className="border-border-subtle mb-6 border-b pb-6">
            <div className="mb-4">
              <h2 className="text-text mb-2 flex items-center gap-3 text-xl font-bold">
                <List className="text-primary h-5 w-5" />
                {pollListData.title}
              </h2>
              {pollListData.description && (
                <p className="text-text-secondary text-sm">{pollListData.description}</p>
              )}
            </div>
          </div>

          {/* Polls Content */}
          <PollsContent
            key={`polls-${pollListData.id}`}
            communitySlug={slug || ''}
            folderId={pollListData.id}
            isModerator={isModerator}
            onCreatePoll={handleCreatePoll}
          />
        </div>

        {/* Community Drawer */}
        {showCommunityDrawer && <CommunityDrawer />}
      </div>
    );
  }

  // LISTS VIEW - Show folders and lists
  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-2xl px-4 py-6">
        {/* Community Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => setShowCommunityDrawer(true)}
            className="hover:bg-surface-elevated/30 -ml-2 flex items-center gap-3 rounded-lg p-2 transition-colors"
          >
            {community.avatar ? (
              <Image
                src={community.avatar}
                alt={community.name}
                className="h-8 w-8 rounded-full object-cover"
                width={32}
                height={32}
              />
            ) : (
              <div className="bg-surface-elevated flex h-8 w-8 items-center justify-center rounded-full">
                <Users className="text-text-muted h-4 w-4" />
              </div>
            )}
            <div className="text-left">
              <h1 className="text-text text-lg font-semibold">{community.name}</h1>
              <div className="text-text-secondary text-xs">
                {community.member_count.toLocaleString()} members
              </div>
            </div>
          </button>
          {!isRootLevel && (
            <button
              onClick={goBack}
              className="text-text-secondary hover:text-text hover:bg-surface-elevated/30 flex items-center gap-2 rounded-lg p-2 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Header */}
        <div className="mb-6">
          {/* Breadcrumbs */}
          {!isRootLevel && breadcrumbs.length > 1 && (
            <div className="mb-4 flex items-center gap-2 text-sm">
              {breadcrumbs.map((breadcrumb, index) => (
                <React.Fragment key={`${breadcrumb.id}-${index}`}>
                  <button
                    onClick={() => navigateToBreadcrumb(breadcrumb.id)}
                    className={`hover:text-primary transition-colors ${
                      index === breadcrumbs.length - 1
                        ? 'text-text font-medium'
                        : 'text-text-secondary hover:text-text'
                    }`}
                  >
                    {index === 0 ? (
                      <div className="flex items-center gap-1">
                        <List className="h-4 w-4" />
                        {breadcrumb.title}
                      </div>
                    ) : (
                      breadcrumb.title
                    )}
                  </button>
                  {index < breadcrumbs.length - 1 && (
                    <ChevronRight className="text-text-secondary h-4 w-4" />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Title and Actions */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-text mb-1 flex items-center gap-2 text-2xl font-bold">
                {isRootLevel ? (
                  <>
                    <List className="text-primary h-6 w-6" />
                    Lists
                  </>
                ) : (
                  <>
                    <Folder className="text-warning h-6 w-6" />
                    {breadcrumbs[breadcrumbs.length - 1]?.title || 'Folder'}
                  </>
                )}
              </h2>
              <p className="text-text-secondary text-sm">
                {isRootLevel ? 'Explore collections' : 'Browse contents of this folder'}
              </p>
            </div>
            {isModerator && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-primary text-background flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-opacity hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                Create
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="text-text-secondary absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRootLevel ? 'Search lists and folders...' : 'Search in this folder...'}
              className="border-border focus:border-primary bg-surface-elevated text-text placeholder-text-muted focus:ring-primary/20 w-full rounded-lg border py-2.5 pr-4 pl-10 text-sm focus:ring-2 focus:outline-none"
            />
          </div>
        </div>

        {/* Content */}
        {isLoading && currentPage === 1 && allLists.length === 0 ? (
          <ListsSkeleton />
        ) : error ? (
          <div className="py-12 text-center">
            <div className="bg-surface-elevated mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <X className="text-error h-6 w-6" />
            </div>
            <div className="text-text mb-2 text-base font-medium">Failed to load content</div>
            <p className="text-text-secondary mb-4 text-sm">Please try again later</p>
            <button
              onClick={() => refetch()}
              className="bg-primary text-background rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
            >
              Try Again
            </button>
          </div>
        ) : allLists.length === 0 ? (
          <div className="py-12 text-center">
            <div className="bg-surface-elevated mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              {isRootLevel ? (
                <List className="text-text-secondary h-8 w-8" />
              ) : (
                <Folder className="text-text-secondary h-8 w-8" />
              )}
            </div>
            <h3 className="text-text mb-2 text-lg font-semibold">
              {searchQuery ? 'No results found' : isRootLevel ? 'No lists yet' : 'Empty folder'}
            </h3>
            <p className="text-text-secondary mx-auto mb-6 max-w-sm text-sm">
              {searchQuery
                ? `No items match "${searchQuery}". Try a different search term.`
                : isRootLevel
                  ? 'Create your first poll list or folder to start organizing your polls.'
                  : 'This folder is empty. Add some poll lists to organize your content.'}
            </p>
            {!searchQuery && isModerator && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-primary text-background inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                {isRootLevel ? 'Create Your First List' : 'Add First Item'}
              </button>
            )}
          </div>
        ) : (
          <div>
            {allLists.map((item, index) => (
              <div
                key={`${item.id}-${item.title}`}
                className={`hover:bg-surface-elevated/30 group flex cursor-pointer items-start gap-4 p-4 transition-colors ${
                  index < allLists.length - 1 ? 'border-border-subtle border-b' : ''
                }`}
                onClick={() => navigateToItem(item)}
              >
                {/* Icon */}
                <div
                  className={`flex-shrink-0 rounded-lg p-3 transition-all duration-200 ${
                    item.list_type === 'folder'
                      ? 'bg-warning/10 group-hover:scale-105'
                      : 'bg-primary/10 group-hover:scale-105'
                  }`}
                >
                  {item.list_type === 'folder' ? (
                    <Folder className="text-warning h-5 w-5" />
                  ) : (
                    <List className="text-primary h-5 w-5" />
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-start justify-between">
                    <h3 className="text-text group-hover:text-primary truncate pr-2 font-semibold transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex flex-shrink-0 items-center gap-1">
                      {getVisibilityIcon(item.visibility)}
                      {item.is_featured && <Star className="text-warning h-3 w-3" />}
                      {item.is_collaborative && <Users className="text-primary h-3 w-3" />}
                      <ChevronRight className="text-text-secondary group-hover:text-primary ml-1 h-4 w-4 transition-colors" />
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-text-secondary mb-2 line-clamp-2 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-text-secondary flex items-center gap-3 text-xs">
                      {item.list_type === 'folder' ? (
                        <>
                          <span className="flex items-center gap-1">
                            <Folder className="h-3 w-3" />
                            {item.direct_folders_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <List className="h-3 w-3" />
                            {item.total_polls_count}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="flex items-center gap-1">
                            <List className="h-3 w-3" />
                            {item.direct_polls_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {item.view_count}
                          </span>
                        </>
                      )}
                      <span className="truncate">
                        by {item.profile.display_name || item.profile.username}
                      </span>
                    </div>
                    {item.can_edit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingItem(item);
                        }}
                        className=""
                      >
                        <Pen className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Load More Indicator */}
            {isLoadingMore && (
              <div className="py-6 text-center">
                <div className="border-primary mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"></div>
                <p className="text-text-secondary text-xs">Loading more...</p>
              </div>
            )}

            {!hasMore && allLists.length > 0 && (
              <div className="py-6 text-center">
                <p className="text-text-secondary text-xs">
                  You've reached the end. {allLists.length} items total.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Community Drawer */}
        {showCommunityDrawer && <CommunityDrawer />}
      </div>

      {/* Create/Edit Modal */}
      <CreateEditModal
        isOpen={isCreateModalOpen || !!editingItem}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingItem(null);
        }}
        onSuccess={handleSuccess}
        editItem={editingItem}
        parentId={currentParentId}
        communitySlug={slug || ''}
      />
      <BottomNavigation />
    </div>
  );
};

export default UnifiedFolderPage;
