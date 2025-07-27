'use client';

import React, { useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronDown,
  Crown,
  Filter,
  Loader2,
  MoreVertical,
  RefreshCw,
  Search,
  Shield,
  UserCheck,
  Users,
} from 'lucide-react';

import { useKeyopollsCommunitiesApiGeneralGetCommunity } from '@/api/communities-general/communities-general';
import { useKeyopollsCommunitiesApiAdminChangeMemberRole } from '@/api/default/default';
import { useKeyopollsProfileApiGeneralGetUsersList } from '@/api/profile-general/profile-general';
import { UserListItemSchema } from '@/api/schemas';
import { toast } from '@/components/ui/toast';
import { useProfileStore } from '@/stores/useProfileStore';

interface RoleChangeConfirmation {
  user: UserListItemSchema;
  newRole: string;
}

const ROLES = [
  { value: 'member', label: 'Member', icon: Users, color: 'text-text-secondary' },
  { value: 'recruiter', label: 'Recruiter', icon: UserCheck, color: 'text-secondary' },
  { value: 'moderator', label: 'Moderator', icon: Shield, color: 'text-success' },
];

const ROLE_FILTERS = [{ value: '', label: 'All Roles' }, ...ROLES];

const SORT_OPTIONS = [
  { value: '-created_at', label: 'Recently Joined' },
  { value: 'created_at', label: 'Oldest Members' },
  { value: '-total_aura', label: 'Highest Aura' },
  { value: 'username', label: 'Username A-Z' },
];

const CommunityMembersPage = () => {
  const { accessToken } = useProfileStore();
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [sortBy, setSortBy] = useState('-created_at');
  const [currentPage, setCurrentPage] = useState(1);
  const [allUsers, setAllUsers] = useState<UserListItemSchema[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [roleChangeConfirmation, setRoleChangeConfirmation] =
    useState<RoleChangeConfirmation | null>(null);
  const [showRoleDropdown, setShowRoleDropdown] = useState<number | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [shouldLoadMore, setShouldLoadMore] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset when filters change
  useEffect(() => {
    setAllUsers([]);
    setCurrentPage(1);
    setHasMore(true);
    setShouldLoadMore(false);
  }, [debouncedSearchQuery, selectedRole, sortBy]);

  // Fetch community data
  const { data: communityData, isLoading: communityLoading } =
    useKeyopollsCommunitiesApiGeneralGetCommunity(slug, {
      request: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

  const community = communityData?.data;
  const membership = community?.membership_details;
  const isCreator = membership?.role === 'creator';
  const canManageRoles = isCreator;

  // Prepare query parameters for the hook
  const queryParams = {
    page: currentPage,
    per_page: 20,
    order_by: sortBy,
    ...(community?.id && { community_id: community.id }),
    ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
    ...(selectedRole && { role: selectedRole }),
  };

  // Use the hook to fetch users
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: usersError,
    refetch: refetchUsers,
  } = useKeyopollsProfileApiGeneralGetUsersList(queryParams, {
    request: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    query: {
      enabled: !!community?.id && !!accessToken,
    },
  });

  // Handle new data from the hook
  useEffect(() => {
    if (usersData?.data) {
      const newUsers = usersData.data.users || [];

      if (currentPage === 1) {
        // First page or filter change
        setAllUsers(newUsers);
      } else if (shouldLoadMore) {
        // Append new users for infinite scroll
        setAllUsers((prev) => [...prev, ...newUsers]);
        setShouldLoadMore(false);
      }

      setHasMore(usersData.data.has_next || false);
      setIsLoadingMore(false);
    }
  }, [usersData, currentPage, shouldLoadMore]);

  // Infinite scroll intersection observer
  useEffect(() => {
    if (!loadingRef.current || !hasMore || isLoadingUsers || isLoadingMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingUsers && !isLoadingMore) {
          setIsLoadingMore(true);
          setShouldLoadMore(true);
          setCurrentPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(loadingRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoadingUsers, isLoadingMore]);

  // Role change mutation
  const { mutate: changeRole, isPending: isChangingRole } =
    useKeyopollsCommunitiesApiAdminChangeMemberRole({
      request: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      mutation: {
        onSuccess: (response) => {
          toast.success(response.data.message);
          setRoleChangeConfirmation(null);
          // Update the user in the local state
          setAllUsers((prev) =>
            prev.map((user) =>
              user.id === roleChangeConfirmation?.user.id
                ? { ...user, role: roleChangeConfirmation.newRole }
                : user
            )
          );
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || 'Failed to change role');
          setRoleChangeConfirmation(null);
        },
      },
    });

  // Handlers
  const handleRoleChange = (user: UserListItemSchema, newRole: string) => {
    if (user.role === newRole) return;
    setRoleChangeConfirmation({ user, newRole });
    setShowRoleDropdown(null);
  };

  const confirmRoleChange = () => {
    if (!roleChangeConfirmation || !community) return;

    changeRole({
      communityId: community.id,
      data: {
        user_id: roleChangeConfirmation.user.id,
        new_role: roleChangeConfirmation.newRole,
      },
    });
  };

  const handleRefresh = () => {
    setAllUsers([]);
    setCurrentPage(1);
    setHasMore(true);
    setShouldLoadMore(false);
    refetchUsers();
  };

  const handleFilterChange = (newRole: string) => {
    setSelectedRole(newRole);
    setShowFilterDropdown(false);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setShowSortDropdown(false);
  };

  const getRoleIcon = (role: string) => {
    const roleData = ROLES.find((r) => r.value === role);
    if (!roleData) return Users;
    return roleData.icon;
  };

  const getRoleColor = (role: string) => {
    const roleData = ROLES.find((r) => r.value === role);
    if (!roleData) return 'text-text-secondary';
    return roleData.color;
  };

  // Loading state
  if (communityLoading) {
    return (
      <div className="bg-background min-h-screen">
        <div className="mx-auto max-w-2xl px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="bg-surface-elevated h-8 w-64 rounded"></div>
            <div className="bg-surface-elevated h-12 w-full rounded-lg"></div>
            <div className="space-y-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="bg-surface-elevated h-16 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state or no community
  if (!community) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="text-error mx-auto mb-4 h-12 w-12" />
          <h2 className="text-text mb-2 text-xl font-bold">Community not found</h2>
          <p className="text-text-secondary">Please check the URL and try again.</p>
          <button
            onClick={() => router.push('/communities')}
            className="bg-primary text-background mt-4 rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
          >
            Go to Communities
          </button>
        </div>
      </div>
    );
  }

  // Access control
  if (!canManageRoles) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <Shield className="text-error mx-auto mb-4 h-12 w-12" />
          <h2 className="text-text mb-2 text-xl font-bold">Access Denied</h2>
          <p className="text-text-secondary">You don't have permission to manage members.</p>
          <button
            onClick={() => router.push(`/communities/${slug}/admin`)}
            className="bg-primary text-background mt-4 rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
          >
            Back to Admin
          </button>
        </div>
      </div>
    );
  }

  const totalCount = usersData?.data?.total_count || 0;
  const isInitialLoading = isLoadingUsers && currentPage === 1;

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-2xl px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push(`/communities/${slug}/admin`)}
            className="text-text-secondary hover:text-text mb-4 flex items-center gap-2 text-sm transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Admin
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-text text-xl font-bold">Manage Members</h1>
              <p className="text-text-secondary text-sm">
                {community.name} • {totalCount} members
              </p>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isInitialLoading}
              className="text-text-muted hover:text-text rounded-full p-2 transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw size={18} className={isInitialLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-4 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="text-text-muted absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-border bg-background text-text placeholder:text-text-muted focus:border-primary w-full rounded-lg border py-3 pr-4 pl-10 text-sm transition-colors focus:outline-none"
            />
          </div>

          {/* Filters Row */}
          <div className="flex gap-2">
            {/* Role Filter */}
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="border-border bg-background text-text hover:bg-surface-elevated flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors"
              >
                <Filter size={14} />
                {ROLE_FILTERS.find((r) => r.value === selectedRole)?.label || 'All Roles'}
                <ChevronDown size={14} />
              </button>

              {showFilterDropdown && (
                <div className="border-border bg-surface absolute top-full left-0 z-10 mt-1 w-40 rounded-lg border shadow-lg">
                  {ROLE_FILTERS.map((role) => (
                    <button
                      key={role.value}
                      onClick={() => handleFilterChange(role.value)}
                      className="hover:bg-surface-elevated flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      {role.value && (
                        <div className={getRoleColor(role.value)}>
                          {React.createElement(getRoleIcon(role.value), { size: 14 })}
                        </div>
                      )}
                      {role.label}
                      {selectedRole === role.value && <Check className="ml-auto h-3 w-3" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="border-border bg-background text-text hover:bg-surface-elevated flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors"
              >
                Sort
                <ChevronDown size={14} />
              </button>

              {showSortDropdown && (
                <div className="border-border bg-surface absolute top-full right-0 z-10 mt-1 w-44 rounded-lg border shadow-lg">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className="hover:bg-surface-elevated flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      {option.label}
                      {sortBy === option.value && <Check className="h-3 w-3" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Members List */}
        <div>
          {isInitialLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="border-border-subtle flex items-center gap-3 border-b py-3">
                    <div className="bg-surface-elevated h-10 w-10 rounded-full"></div>
                    <div className="min-w-0 flex-1">
                      <div className="bg-surface-elevated mb-1 h-4 w-28 rounded"></div>
                      <div className="bg-surface-elevated h-3 w-20 rounded"></div>
                    </div>
                    <div className="bg-surface-elevated h-5 w-16 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : usersError ? (
            <div className="py-12 text-center">
              <AlertCircle className="text-error mx-auto mb-4 h-12 w-12" />
              <h3 className="text-text mb-2 text-lg font-medium">Failed to load members</h3>
              <p className="text-text-secondary mb-4 text-sm">Please try again later.</p>
              <button
                onClick={handleRefresh}
                className="bg-primary text-background rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
              >
                Retry
              </button>
            </div>
          ) : allUsers.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="text-text-muted mx-auto mb-4 h-12 w-12" />
              <h3 className="text-text mb-2 text-lg font-medium">No members found</h3>
              <p className="text-text-secondary text-sm">
                {searchQuery || selectedRole
                  ? 'Try adjusting your search or filters.'
                  : 'This community has no members yet.'}
              </p>
            </div>
          ) : (
            <div ref={scrollContainerRef}>
              {allUsers.map((user, index) => (
                <div
                  key={`${user.id}-${index}`}
                  className="border-border-subtle hover:bg-surface-elevated/30 flex items-center gap-3 border-b py-3 transition-colors last:border-b-0"
                >
                  {/* Avatar */}
                  <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.username}
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="bg-primary flex h-full w-full items-center justify-center">
                        <Users className="text-background h-5 w-5" />
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-text truncate text-sm font-medium">
                        {user.display_name}
                      </h3>
                      <span className="text-text-muted text-xs">@{user.username}</span>
                    </div>
                    <div className="text-text-secondary flex items-center gap-3 text-xs">
                      <span>{user.total_aura} aura</span>
                      {user.joined_at && (
                        <span>Joined {new Date(user.joined_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>

                  {/* Role Badge */}
                  <div className="flex flex-shrink-0 items-center gap-2">
                    {user.role && user.role !== 'creator' && (
                      <div className={`flex items-center gap-1 ${getRoleColor(user.role)}`}>
                        {React.createElement(getRoleIcon(user.role), { size: 14 })}
                        <span className="text-xs font-medium capitalize">{user.role}</span>
                      </div>
                    )}

                    {user.role === 'creator' && (
                      <div className="text-warning flex items-center gap-1">
                        <Crown size={14} />
                        <span className="text-xs font-medium">Creator</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {canManageRoles && user.role !== 'creator' && (
                    <div className="relative flex-shrink-0">
                      <button
                        onClick={() =>
                          setShowRoleDropdown(showRoleDropdown === user.id ? null : user.id)
                        }
                        className="text-text-muted hover:text-text hover:bg-surface-elevated rounded-full p-1.5 transition-colors"
                      >
                        <MoreVertical size={14} />
                      </button>

                      {showRoleDropdown === user.id && (
                        <div className="border-border bg-surface absolute top-full right-0 z-10 mt-1 w-40 rounded-lg border shadow-lg">
                          <div className="border-border border-b px-3 py-2">
                            <div className="text-text text-xs font-medium">Change Role</div>
                          </div>
                          {ROLES.map((role) => (
                            <button
                              key={role.value}
                              onClick={() => handleRoleChange(user, role.value)}
                              disabled={user.role === role.value}
                              className="hover:bg-surface-elevated flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors last:rounded-b-lg disabled:opacity-50"
                            >
                              <div className={role.color}>
                                {React.createElement(role.icon, { size: 14 })}
                              </div>
                              {role.label}
                              {user.role === role.value && <Check className="ml-auto h-3 w-3" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Loading indicator for infinite scroll */}
              {hasMore && (
                <div ref={loadingRef} className="flex items-center justify-center py-4">
                  {isLoadingMore ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="text-primary h-4 w-4 animate-spin" />
                      <span className="text-text-secondary text-sm">Loading more...</span>
                    </div>
                  ) : (
                    <div className="text-text-secondary text-sm">Scroll to load more</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Role Change Confirmation Modal */}
        {roleChangeConfirmation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-background border-border w-full max-w-sm rounded-lg border p-6">
              <div className="mb-4">
                <h2 className="text-text text-lg font-semibold">Change Role</h2>
                <p className="text-text-secondary mt-1 text-sm">
                  Change <strong>{roleChangeConfirmation.user.display_name}</strong>'s role to{' '}
                  <strong>{roleChangeConfirmation.newRole}</strong>?
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setRoleChangeConfirmation(null)}
                  className="border-border bg-background text-text hover:bg-surface-elevated flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors"
                  disabled={isChangingRole}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRoleChange}
                  disabled={isChangingRole}
                  className="bg-primary text-background flex-1 rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {isChangingRole ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Changing...
                    </div>
                  ) : (
                    'Confirm'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Click outside handlers */}
      {(showFilterDropdown || showSortDropdown || showRoleDropdown) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setShowFilterDropdown(false);
            setShowSortDropdown(false);
            setShowRoleDropdown(null);
          }}
        />
      )}
    </div>
  );
};

export default CommunityMembersPage;
