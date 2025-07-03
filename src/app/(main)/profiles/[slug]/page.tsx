'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

import { BarChart3, Calendar, Edit3, Mail, Star, Users } from 'lucide-react';

import { useKeyopollsPollsApiGeneralListPolls } from '@/api/polls/polls';
import { useKeyopollsProfileApiGeneralGetProfileInfo } from '@/api/profile-general/profile-general';
import { CommentSearchResultOut, PollDetails } from '@/api/schemas';
import { useKeyopollsCommentsApiSearchSearchComments } from '@/api/search-comments/search-comments';
import BottomNavigation from '@/components/common/BottomNavigation';
import Poll from '@/components/common/Poll';
import { useProfileStore } from '@/stores/useProfileStore';
import { formatDate, formatNumber } from '@/utils';

type TabType = 'polls' | 'comments';

const ProfilePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { accessToken } = useProfileStore();
  const router = useRouter();

  // State management
  const [activeTab, setActiveTab] = useState<TabType>('polls');
  const [polls, setPolls] = useState<PollDetails[]>([]);
  const [comments, setComments] = useState<CommentSearchResultOut[]>([]);
  const [pollsPage, setPollsPage] = useState(1);
  const [commentsPage, setCommentsPage] = useState(1);
  const [hasNextPollsPage, setHasNextPollsPage] = useState(true);
  const [hasNextCommentsPage, setHasNextCommentsPage] = useState(true);
  const [profileId, setProfileId] = useState<number | null>(null);

  // Refs for infinite scrolling
  const pollsObserver = useRef<IntersectionObserver | null>(null);
  const commentsObserver = useRef<IntersectionObserver | null>(null);

  // Fetch profile info
  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
  } = useKeyopollsProfileApiGeneralGetProfileInfo(slug, {
    request: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  const profile = profileData?.data;
  const isOwner = profileData?.data?.is_owner;

  // Update profile ID when profile data loads
  useEffect(() => {
    if (profile?.id) {
      setProfileId(profile.id);
    }
  }, [profile]);

  // Fetch polls with different parameters based on ownership
  const pollsQueryParams = {
    author_id: profileId,
    page: pollsPage,
    page_size: 20,
    sort: 'newest',
    my_polls: !!isOwner, // Convert to boolean
    // Don't set status parameter when viewing own polls (backend will handle all statuses),
    // or set it to include all relevant statuses for other users
    ...(isOwner ? {} : { status: ['active', 'closed'] }), // Show active and closed polls for other users
  };

  const {
    data: pollsData,
    isLoading: pollsLoading,
    error: pollsError,
  } = useKeyopollsPollsApiGeneralListPolls(pollsQueryParams, {
    request: {
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : {},
    },
    query: {
      enabled: !!profileId && activeTab === 'polls',
      refetchOnWindowFocus: false,
    },
  });

  // Fetch comments
  const {
    data: commentsData,
    isLoading: commentsLoading,
    error: commentsError,
  } = useKeyopollsCommentsApiSearchSearchComments(
    {
      profile_id: profileId,
      page: commentsPage,
      page_size: 20,
      sort: 'newest',
      include_poll_content: true,
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
        enabled: !!profileId && activeTab === 'comments',
        refetchOnWindowFocus: false,
      },
    }
  );

  // Handle polls data
  useEffect(() => {
    if (pollsData?.data.items) {
      if (pollsPage === 1) {
        setPolls(pollsData.data.items);
      } else {
        setPolls((prevPolls) => {
          const existingIds = new Set(prevPolls.map((poll) => poll.id));
          const newPolls = pollsData.data.items.filter((poll) => !existingIds.has(poll.id));
          return [...prevPolls, ...newPolls];
        });
      }
      setHasNextPollsPage(pollsData.data.has_next || false);
    }
  }, [pollsData, pollsPage]);

  // Handle comments data
  useEffect(() => {
    if (commentsData?.data.items) {
      if (commentsPage === 1) {
        setComments(commentsData.data.items);
      } else {
        setComments((prevComments) => {
          const existingIds = new Set(prevComments.map((comment) => comment.id));
          const newComments = commentsData.data.items.filter(
            (comment) => !existingIds.has(comment.id)
          );
          return [...prevComments, ...newComments];
        });
      }
      setHasNextCommentsPage(commentsData.data.has_next || false);
    }
  }, [commentsData, commentsPage]);

  // Infinite scroll callback for polls
  const lastPollElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (pollsLoading) return;
      if (pollsObserver.current) pollsObserver.current.disconnect();
      pollsObserver.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPollsPage) {
          setPollsPage((prevPage) => prevPage + 1);
        }
      });
      if (node) pollsObserver.current.observe(node);
    },
    [pollsLoading, hasNextPollsPage]
  );

  // Infinite scroll callback for comments
  const lastCommentElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (commentsLoading) return;
      if (commentsObserver.current) commentsObserver.current.disconnect();
      commentsObserver.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextCommentsPage) {
          setCommentsPage((prevPage) => prevPage + 1);
        }
      });
      if (node) commentsObserver.current.observe(node);
    },
    [commentsLoading, hasNextCommentsPage]
  );

  // Handle tab change
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'polls') {
      setPollsPage(1);
    } else {
      setCommentsPage(1);
    }
  };

  // Handle poll deletion
  const handlePollDelete = (pollId: number) => {
    setPolls((prevPolls) => prevPolls.filter((poll) => poll.id !== pollId));
  };

  // Helper function to get poll status badge
  const getPollStatusBadge = (poll: PollDetails) => {
    if (!isOwner) return null; // Only show status badges to poll owner

    const status = poll.status || 'active';

    if (status === 'active') return null; // Don't show badge for active polls

    const statusConfig = {
      pending_moderation: {
        text: 'Pending Review',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      },
      rejected: {
        text: 'Rejected',
        className: 'bg-red-100 text-red-800 border-red-200',
      },
      closed: {
        text: 'Closed',
        className: 'bg-gray-100 text-gray-800 border-gray-200',
      },
      draft: {
        text: 'Draft',
        className: 'bg-blue-100 text-blue-800 border-blue-200',
      },
      archived: {
        text: 'Archived',
        className: 'bg-gray-100 text-gray-600 border-gray-200',
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    return (
      <span
        className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium ${config.className}`}
      >
        {config.text}
      </span>
    );
  };

  // Enhanced Poll component wrapper to show status
  const PollWithStatus = ({
    poll,
    isLastPoll,
    lastPollElementCallback,
    onDelete,
  }: {
    poll: PollDetails;
    isLastPoll: boolean;
    lastPollElementCallback?: (node: HTMLElement | null) => void;
    onDelete: (pollId: number) => void;
  }) => {
    const statusBadge = getPollStatusBadge(poll);

    return (
      <div ref={isLastPoll ? lastPollElementCallback : null} className="relative">
        {statusBadge && <div className="absolute top-2 right-2 z-10">{statusBadge}</div>}
        <Poll poll={poll} isLastPoll={isLastPoll} onDelete={onDelete} />
      </div>
    );
  };

  // Loading skeleton components
  const ProfileSkeleton = () => (
    <div className="animate-pulse">
      <div className="bg-surface-elevated h-32"></div>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="bg-surface-elevated h-20 w-20 rounded-full"></div>
          <div className="flex-1">
            <div className="bg-surface-elevated mb-2 h-5 w-32 rounded"></div>
            <div className="bg-surface-elevated mb-3 h-4 w-24 rounded"></div>
            <div className="bg-surface-elevated h-4 w-20 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );

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
          <div className="space-y-2">
            <div className="bg-surface-elevated h-10 rounded"></div>
            <div className="bg-surface-elevated h-10 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const CommentSkeleton = () => (
    <div className="border-border-subtle animate-pulse border-b p-4">
      <div className="flex space-x-3">
        <div className="bg-surface-elevated h-8 w-8 flex-shrink-0 rounded-full"></div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <div className="bg-surface-elevated h-4 w-20 rounded"></div>
            <div className="bg-surface-elevated h-4 w-12 rounded"></div>
          </div>
          <div className="bg-surface-elevated mb-2 h-4 w-full rounded"></div>
          <div className="bg-surface-elevated h-4 w-2/3 rounded"></div>
        </div>
      </div>
    </div>
  );

  // Comment component
  const CommentItem = ({
    comment,
    isLast,
  }: {
    comment: CommentSearchResultOut;
    isLast: boolean;
  }) => (
    <div
      ref={isLast ? lastCommentElementRef : null}
      className="border-border-subtle hover:bg-surface-elevated/50 border-b p-4 transition-colors"
    >
      <div className="flex space-x-3">
        <div className="bg-primary text-background flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium">
          {comment.author_info.display_name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-text font-medium">{comment.author_info.display_name}</span>
            <span className="text-text-secondary text-sm">@{comment.author_info.username}</span>
            <span className="text-text-muted">·</span>
            <span className="text-text-secondary text-sm">{formatDate(comment.created_at)}</span>
          </div>
          <p className="text-text mb-2 leading-relaxed">{comment.content}</p>

          {/* Show poll context if available */}
          {comment.poll_content && (
            <div className="border-border bg-surface mt-2 rounded-md border p-3">
              <div className="text-text-secondary mb-1 text-xs">Commented on poll:</div>
              <div className="text-text text-sm font-medium">{comment.poll_content.title}</div>
              <div className="text-text-secondary text-xs">
                by @{comment.poll_content.author_info.username} • {comment.poll_content.total_votes}{' '}
                votes
              </div>
            </div>
          )}

          <div className="text-text-muted mt-2 flex items-center gap-4 text-xs">
            <span>{comment.like_count} likes</span>
            <span>{comment.reply_count} replies</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (profileLoading) {
    return (
      <div className="bg-background min-h-screen">
        <div className="mx-auto max-w-2xl">
          <ProfileSkeleton />
        </div>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-text mb-2 text-xl font-bold">Profile not found</h2>
          <p className="text-text-secondary">The profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-2xl">
        {/* Banner */}
        <div className="from-primary to-secondary h-32 overflow-hidden bg-gradient-to-r">
          {profile.banner && (
            <Image
              src={profile.banner}
              alt="Profile banner"
              className="h-full w-full object-cover"
              width={800}
              height={128}
            />
          )}
        </div>

        {/* Profile Info */}
        <div className="p-4 pb-0">
          {/* Avatar and Edit Button Row */}
          <div className="mb-4 flex items-start justify-between">
            {/* Avatar */}
            <div className="relative -mt-10">
              <div className="bg-background border-background h-20 w-20 rounded-full border-2 p-1">
                {profile.avatar ? (
                  <Image
                    src={profile.avatar}
                    alt={profile.display_name}
                    className="h-full w-full rounded-full object-cover"
                    width={80}
                    height={80}
                  />
                ) : (
                  <div className="from-primary to-secondary text-background flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br text-xl font-bold">
                    {profile.display_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Edit Button for Owner */}
            {isOwner && (
              <button
                onClick={() => router.push('/account/edit-profile')}
                className="border-border bg-surface text-text hover:bg-surface-elevated flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors"
              >
                <Edit3 size={14} />
                <span className="hidden sm:inline">Edit Profile</span>
                <span className="sm:hidden">Edit</span>
              </button>
            )}
          </div>

          {/* Profile Details */}
          <div className="mb-4">
            <h1 className="text-text mb-1 text-xl font-bold">{profile.display_name}</h1>
            <p className="text-text-secondary mb-3">@{profile.username}</p>

            <div className="text-text-muted mb-4 flex items-center gap-2 text-xs">
              <Calendar size={14} />
              <span>Joined {formatDate(profile.created_at)}</span>
              {profile.is_email_verified && (
                <>
                  <span>•</span>
                  <Mail size={14} />
                  <span>Verified</span>
                </>
              )}
            </div>

            {/* Aura Stats */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <Star size={14} className="text-warning" />
                <span className="font-medium">{formatNumber(profile.total_aura)}</span>
                <span className="text-text-secondary">Total Aura</span>
              </div>

              {/* Only show detailed aura breakdown to owner */}
              {isOwner && (
                <>
                  <div className="flex items-center gap-1">
                    <BarChart3 size={14} className="text-primary" />
                    <span className="font-medium">{formatNumber(profile.aura_polls)}</span>
                    <span className="text-text-secondary">Poll Aura</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={14} className="text-success" />
                    <span className="font-medium">{formatNumber(profile.aura_comments)}</span>
                    <span className="text-text-secondary">Comment Aura</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-border-subtle border-b">
            <nav className="flex space-x-8">
              <button
                onClick={() => handleTabChange('polls')}
                className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'polls'
                    ? 'border-primary text-primary'
                    : 'text-text-secondary hover:border-border hover:text-text border-transparent'
                }`}
              >
                Polls
              </button>
              <button
                onClick={() => handleTabChange('comments')}
                className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'comments'
                    ? 'border-primary text-primary'
                    : 'text-text-secondary hover:border-border hover:text-text border-transparent'
                }`}
              >
                Comments
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'polls' && (
            <div>
              {/* Error State */}
              {pollsError && !pollsLoading && (
                <div className="p-6 text-center">
                  <p className="text-error">Error loading polls. Please try again.</p>
                </div>
              )}

              {/* Empty State */}
              {!pollsError &&
                !pollsLoading &&
                polls.length === 0 &&
                pollsPage === 1 &&
                pollsData && (
                  <div className="p-12 text-center">
                    <div className="text-text-muted mb-4">
                      <BarChart3 size={48} className="mx-auto" />
                    </div>
                    <h3 className="text-text mb-2 text-base font-medium">No polls yet</h3>
                    <p className="text-text-secondary text-sm">
                      {isOwner
                        ? "You haven't created any polls yet."
                        : `${profile.display_name} hasn't created any polls yet.`}
                    </p>
                  </div>
                )}

              {/* Polls List */}
              {polls.length > 0 && (
                <div>
                  {polls.map((poll, index) => (
                    <PollWithStatus
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
              {pollsLoading && pollsPage === 1 && polls.length === 0 && (
                <div>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <PollSkeleton key={index} />
                  ))}
                </div>
              )}

              {pollsLoading && pollsPage > 1 && (
                <div className="py-4">
                  <PollSkeleton />
                </div>
              )}

              {/* End of Results */}
              {!hasNextPollsPage && polls.length > 0 && (
                <div className="text-text-muted py-8 text-center">
                  <p className="text-sm">You've seen all polls! 🎉</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div>
              {/* Error State */}
              {commentsError && !commentsLoading && (
                <div className="p-6 text-center">
                  <p className="text-error">Error loading comments. Please try again.</p>
                </div>
              )}

              {/* Empty State */}
              {!commentsError &&
                !commentsLoading &&
                comments.length === 0 &&
                commentsPage === 1 &&
                commentsData && (
                  <div className="p-12 text-center">
                    <div className="text-text-muted mb-4">
                      <Users size={48} className="mx-auto" />
                    </div>
                    <h3 className="text-text mb-2 text-base font-medium">No comments yet</h3>
                    <p className="text-text-secondary text-sm">
                      {isOwner
                        ? "You haven't commented on any polls yet."
                        : `${profile.display_name} hasn't commented on any polls yet.`}
                    </p>
                  </div>
                )}

              {/* Comments List */}
              {comments.length > 0 && (
                <div>
                  {comments.map((comment, index) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      isLast={index === comments.length - 1}
                    />
                  ))}
                </div>
              )}

              {/* Loading States */}
              {commentsLoading && commentsPage === 1 && comments.length === 0 && (
                <div>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <CommentSkeleton key={index} />
                  ))}
                </div>
              )}

              {commentsLoading && commentsPage > 1 && (
                <div className="py-4">
                  <CommentSkeleton />
                </div>
              )}

              {/* End of Results */}
              {!hasNextCommentsPage && comments.length > 0 && (
                <div className="text-text-muted py-8 text-center">
                  <p className="text-sm">You've seen all comments! 🎉</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default ProfilePage;
