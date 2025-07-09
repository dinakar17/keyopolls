'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { ChevronRight, Crown, Search, Shield, Star, Users, X } from 'lucide-react';

import { useKeyopollsCommunitiesApiGeneralListCommunities } from '@/api/communities-general/communities-general';
import { useKeyopollsCommunitiesApiOperationsToggleCommunityMembership } from '@/api/communities/communities';
import { CommunityDetails } from '@/api/schemas';
import BottomNavigation from '@/components/common/BottomNavigation';
import CombinedHeader from '@/components/common/CombinedHeader';
import { toast } from '@/components/ui/toast';
import { useProfileStore } from '@/stores/useProfileStore';
import { formatNumber } from '@/utils';

const Communities = () => {
  const router = useRouter();
  const { accessToken, isAuthenticated } = useProfileStore();

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [myCommunities, setMyCommunities] = useState<CommunityDetails[]>([]);
  const [allCommunities, setAllCommunities] = useState<CommunityDetails[]>([]);
  const [searchResults, setSearchResults] = useState<CommunityDetails[]>([]);
  const [myCommunitiesPage, setMyCommunitiesPage] = useState(1);
  const [allCommunitiesPage, setAllCommunitiesPage] = useState(1);
  const [searchPage, setSearchPage] = useState(1);
  const [hasNextMyCommunities, setHasNextMyCommunities] = useState(true);
  const [hasNextAllCommunities, setHasNextAllCommunities] = useState(true);
  const [hasNextSearchResults, setHasNextSearchResults] = useState(true);
  const [joiningCommunities, setJoiningCommunities] = useState<Set<number>>(new Set());

  // Refs for infinite scrolling
  const myCommunitiesObserver = useRef<IntersectionObserver | null>(null);
  const allCommunitiesObserver = useRef<IntersectionObserver | null>(null);
  const searchObserver = useRef<IntersectionObserver | null>(null);

  // Determine if we're in search mode
  const isSearchMode = searchQuery.trim().length > 0;

  // Toggle membership mutation
  const { mutate: toggleMembership } =
    useKeyopollsCommunitiesApiOperationsToggleCommunityMembership({
      request: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

  // Fetch my communities (authenticated users only)
  const { data: myCommunitiesData, isLoading: myCommunitiesLoading } =
    useKeyopollsCommunitiesApiGeneralListCommunities(
      {
        my_communities: true,
        page: myCommunitiesPage,
        page_size: 20,
        sort_by: 'updated_at',
        order: 'desc',
      },
      {
        request: {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        },
        query: {
          enabled: isAuthenticated() && !isSearchMode,
          refetchOnWindowFocus: false,
        },
      }
    );

  // Fetch all/discoverable communities
  const {
    data: allCommunitiesData,
    isLoading: allCommunitiesLoading,
    refetch,
  } = useKeyopollsCommunitiesApiGeneralListCommunities(
    {
      page: allCommunitiesPage,
      page_size: 20,
      sort_by: 'member_count',
      order: 'desc',
    },
    {
      request: {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      },
      query: {
        enabled: !isSearchMode,
        refetchOnWindowFocus: false,
      },
    }
  );

  // Fetch search results
  const { data: searchData, isLoading: searchLoading } =
    useKeyopollsCommunitiesApiGeneralListCommunities(
      {
        search: searchQuery,
        page: searchPage,
        page_size: 20,
        sort_by: 'member_count',
        order: 'desc',
      },
      {
        request: {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        },
        query: {
          enabled: isSearchMode,
          refetchOnWindowFocus: false,
        },
      }
    );

  // Handle my communities data
  useEffect(() => {
    if (myCommunitiesData?.data.communities) {
      if (myCommunitiesPage === 1) {
        setMyCommunities(myCommunitiesData.data.communities);
      } else {
        setMyCommunities((prev) => [
          ...prev,
          ...myCommunitiesData.data.communities.filter(
            (community) => !prev.some((existing) => existing.id === community.id)
          ),
        ]);
      }
      setHasNextMyCommunities(!!myCommunitiesData.data.pagination?.has_next);
    }
  }, [myCommunitiesData, myCommunitiesPage]);

  // Handle all communities data
  useEffect(() => {
    if (allCommunitiesData?.data.communities) {
      if (allCommunitiesPage === 1) {
        setAllCommunities(allCommunitiesData.data.communities);
      } else {
        setAllCommunities((prev) => [
          ...prev,
          ...allCommunitiesData.data.communities.filter(
            (community) => !prev.some((existing) => existing.id === community.id)
          ),
        ]);
      }
      setHasNextAllCommunities(!!allCommunitiesData.data.pagination?.has_next);
    }
  }, [allCommunitiesData, allCommunitiesPage]);

  // Handle search results data
  useEffect(() => {
    if (searchData?.data.communities) {
      if (searchPage === 1) {
        setSearchResults(searchData.data.communities);
      } else {
        setSearchResults((prev) => [
          ...prev,
          ...searchData.data.communities.filter(
            (community) => !prev.some((existing) => existing.id === community.id)
          ),
        ]);
      }
      setHasNextSearchResults(!!searchData.data.pagination?.has_next);
    }
  }, [searchData, searchPage]);

  // Reset search when query changes
  useEffect(() => {
    setSearchPage(1);
    setSearchResults([]);
  }, [searchQuery]);

  // Handle search input
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchPage(1);
  };

  // Handle join community
  const handleJoinCommunity = (community: CommunityDetails, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated()) {
      toast.error('Please sign in to join communities');
      return;
    }

    if (!community.user_permissions?.can_join) {
      toast.error('You cannot join this community');
      return;
    }

    setJoiningCommunities((prev) => new Set(prev).add(community.id));

    toggleMembership(
      {
        communityId: community.id,
        data: { action: 'join' },
      },
      {
        onSuccess: (response) => {
          toast.success(response.data.message);
          refetch();
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || 'Failed to join community');
          setJoiningCommunities((prev) => {
            const newSet = new Set(prev);
            newSet.delete(community.id);
            return newSet;
          });
        },
      }
    );
  };

  // Infinite scroll callbacks
  const lastMyCommunityRef = useCallback(
    (node: HTMLElement | null) => {
      if (myCommunitiesLoading) return;
      if (myCommunitiesObserver.current) myCommunitiesObserver.current.disconnect();
      myCommunitiesObserver.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextMyCommunities) {
          setMyCommunitiesPage((prev) => prev + 1);
        }
      });
      if (node) myCommunitiesObserver.current.observe(node);
    },
    [myCommunitiesLoading, hasNextMyCommunities]
  );

  const lastAllCommunityRef = useCallback(
    (node: HTMLElement | null) => {
      if (allCommunitiesLoading) return;
      if (allCommunitiesObserver.current) allCommunitiesObserver.current.disconnect();
      allCommunitiesObserver.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextAllCommunities) {
          setAllCommunitiesPage((prev) => prev + 1);
        }
      });
      if (node) allCommunitiesObserver.current.observe(node);
    },
    [allCommunitiesLoading, hasNextAllCommunities]
  );

  const lastSearchResultRef = useCallback(
    (node: HTMLElement | null) => {
      if (searchLoading) return;
      if (searchObserver.current) searchObserver.current.disconnect();
      searchObserver.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextSearchResults) {
          setSearchPage((prev) => prev + 1);
        }
      });
      if (node) searchObserver.current.observe(node);
    },
    [searchLoading, hasNextSearchResults]
  );

  // Community item component
  const CommunityItem = ({
    community,
    isLast,
    lastElementRef,
    showJoinButton = false,
  }: {
    community: CommunityDetails;
    isLast?: boolean;
    lastElementRef?: (node: HTMLElement | null) => void;
    showJoinButton?: boolean;
  }) => {
    const handleClick = () => {
      router.push(`/communities/${community.slug}`);
    };

    const getRoleIcon = (role?: string) => {
      switch (role) {
        case 'creator':
          return <Crown size={10} className="text-warning" />;
        case 'admin':
          return <Shield size={10} className="text-error" />;
        case 'moderator':
          return <Star size={10} className="text-primary" />;
        default:
          return null;
      }
    };

    const getTypeColor = (type: string) => {
      switch (type) {
        case 'private':
          return 'text-error';
        case 'restricted':
          return 'text-warning';
        default:
          return 'text-success';
      }
    };

    const shouldShowTypeLabel = (type: string) => {
      return type === 'private' || type === 'restricted';
    };

    const isJoined = community.membership_details?.is_active;
    const canJoin = community.user_permissions?.can_join;
    const isJoining = joiningCommunities.has(community.id);

    return (
      <div
        ref={isLast ? lastElementRef : null}
        onClick={handleClick}
        className="border-border-subtle hover:bg-surface-elevated/30 flex cursor-pointer items-center gap-3 border-b p-4 transition-colors"
      >
        {/* Community Avatar */}
        <div className="relative flex-shrink-0">
          {community.avatar ? (
            <Image
              src={community.avatar}
              alt={community.name}
              className="h-12 w-12 rounded-full object-cover"
              width={48}
              height={48}
            />
          ) : (
            <div className="bg-primary text-background flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold">
              {community.name.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Member role indicator */}
          {community.membership_details?.role &&
            community.membership_details?.role !== 'member' && (
              <div className="bg-background absolute -right-1 -bottom-1 rounded-full p-1 shadow-sm">
                {getRoleIcon(community.membership_details.role)}
              </div>
            )}
        </div>

        {/* Community Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-text truncate font-semibold">{community.name}</h3>

            {/* Community type indicator - only show for private/restricted */}
            {shouldShowTypeLabel(community.community_type) && (
              <span className={`text-xs font-medium ${getTypeColor(community.community_type)}`}>
                {community.community_type}
              </span>
            )}
          </div>
          <div className="text-text-muted mb-1 flex items-center gap-3 text-xs">
            <span>{formatNumber(community.member_count)} members</span>
          </div>

          <p className="text-text-secondary mb-1 line-clamp-2 text-xs">{community.description}</p>
        </div>

        {/* Join Button or Arrow */}
        {showJoinButton && !isJoined && canJoin ? (
          <button
            onClick={(e) => handleJoinCommunity(community, e)}
            disabled={isJoining}
            className="bg-primary text-background hover:bg-primary/90 disabled:bg-primary/50 flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed"
          >
            {isJoining ? 'Joining...' : 'Join'}
          </button>
        ) : showJoinButton && isJoined ? (
          <div className="border-success/20 bg-success/10 text-success flex-shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium">
            Joined
          </div>
        ) : (
          <ChevronRight size={16} className="text-text-muted flex-shrink-0" />
        )}
      </div>
    );
  };

  // Loading skeleton
  const CommunitySkeleton = () => (
    <div className="border-border-subtle flex animate-pulse items-center gap-3 border-b p-4">
      <div className="bg-surface-elevated h-12 w-12 flex-shrink-0 rounded-full"></div>
      <div className="flex-1">
        <div className="bg-surface-elevated mb-2 h-4 w-3/4 rounded"></div>
        <div className="bg-surface-elevated mb-2 h-3 w-1/2 rounded"></div>
        <div className="bg-surface-elevated h-3 w-1/4 rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="bg-background min-h-screen pb-16">
      <div className="mx-auto min-h-screen max-w-2xl">
        <CombinedHeader />
        {/* Header */}
        <div className="border-border bg-background/80 sticky top-0 z-10 border-b backdrop-blur-sm">
          <div className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-text text-xl font-bold">Communities</h1>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search communities..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="border-border bg-surface text-text placeholder-text-muted focus:border-primary focus:ring-primary/20 w-full rounded-full border py-2.5 pr-10 pl-10 transition-all focus:ring-2 focus:outline-none"
              />
              <Search
                size={18}
                className="text-text-muted absolute top-1/2 left-3 -translate-y-1/2 transform"
              />

              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="text-text-muted hover:text-text absolute top-1/2 right-3 -translate-y-1/2 transform transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pb-4">
          {/* Search Results */}
          {isSearchMode && (
            <div>
              <div className="border-border-subtle border-b px-4 py-3">
                <h2 className="text-text font-medium">Search Results for "{searchQuery}"</h2>
              </div>

              {searchResults.length > 0 ? (
                <div>
                  {searchResults.map((community, index) => (
                    <CommunityItem
                      key={community.id}
                      community={community}
                      isLast={index === searchResults.length - 1}
                      lastElementRef={lastSearchResultRef}
                      showJoinButton={true}
                    />
                  ))}

                  {searchLoading && searchPage > 1 && <CommunitySkeleton />}

                  {!hasNextSearchResults && searchResults.length > 0 && (
                    <div className="text-text-muted p-6 text-center">
                      <p className="text-sm">You've seen all search results!</p>
                    </div>
                  )}
                </div>
              ) : searchLoading ? (
                <div>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <CommunitySkeleton key={index} />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Users size={40} className="text-text-muted mx-auto mb-4" />
                  <p className="text-text-secondary">No communities found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          )}

          {/* Default View */}
          {!isSearchMode && (
            <>
              {/* My Communities Section (Authenticated users only) */}
              {isAuthenticated() && (
                <div>
                  <div className="border-border-subtle border-b px-4 py-3">
                    <h2 className="text-text flex items-center gap-2 font-medium">
                      <Users size={16} />
                      My Communities
                    </h2>
                  </div>

                  {myCommunities.length > 0 ? (
                    <div>
                      {myCommunities.map((community, index) => (
                        <CommunityItem
                          key={community.id}
                          community={community}
                          isLast={index === myCommunities.length - 1}
                          lastElementRef={lastMyCommunityRef}
                        />
                      ))}

                      {myCommunitiesLoading && myCommunitiesPage > 1 && <CommunitySkeleton />}

                      {!hasNextMyCommunities && myCommunities.length > 0 && (
                        <div className="text-text-muted px-4 py-2 text-center">
                          <p className="text-sm">You've seen all your communities!</p>
                        </div>
                      )}
                    </div>
                  ) : myCommunitiesLoading ? (
                    <div>
                      {Array.from({ length: 3 }).map((_, index) => (
                        <CommunitySkeleton key={index} />
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <Users size={40} className="text-text-muted mx-auto mb-4" />
                      <p className="text-text-secondary mb-2">
                        You haven't joined any communities yet
                      </p>
                      <p className="text-text-muted text-sm">
                        Explore communities below to get started!
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Discover Communities Section */}
              <div>
                <div className="border-border-subtle border-b px-4 py-3">
                  <h2 className="text-text font-medium">
                    {isAuthenticated() ? 'Discover More Communities' : 'Communities to Join'}
                  </h2>
                </div>

                {allCommunities.length > 0 ? (
                  <div>
                    {allCommunities
                      .filter((community) => !community.membership_details?.is_active)
                      .map((community, index, filteredArray) => (
                        <CommunityItem
                          key={community.id}
                          community={community}
                          isLast={index === filteredArray.length - 1}
                          lastElementRef={lastAllCommunityRef}
                          showJoinButton={true}
                        />
                      ))}

                    {allCommunitiesLoading && allCommunitiesPage > 1 && <CommunitySkeleton />}

                    {!hasNextAllCommunities && allCommunities.length > 0 && (
                      <div className="text-text-muted p-6 text-center">
                        <p className="text-sm">You've seen all communities!</p>
                      </div>
                    )}
                  </div>
                ) : allCommunitiesLoading ? (
                  <div>
                    {Array.from({ length: 8 }).map((_, index) => (
                      <CommunitySkeleton key={index} />
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Users size={40} className="text-text-muted mx-auto mb-4" />
                    <p className="text-text-secondary">No communities available</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Communities;
