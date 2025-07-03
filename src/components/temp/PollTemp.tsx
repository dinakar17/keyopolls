'use client';

import React, { useState } from 'react';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  ChartNoAxesColumnIncreasing,
  Edit3,
  Flag,
  MessageCircle,
  MoreVertical,
  Trash2,
} from 'lucide-react';

import {
  useKeyopollsPollsApiGeneralCastVote,
  useKeyopollsPollsApiOperationsDeletePoll,
} from '@/api/polls/polls';
import { CastVoteSchema, PollDetails } from '@/api/schemas';
import BookmarkButton from '@/components/common/BookmarkButton';
import { DeleteConfirmationModal } from '@/components/common/ConfirmationModal';
import DislikeButton from '@/components/common/DislikeButton';
import LikeButton from '@/components/common/LikeButton';
import MediaViewer from '@/components/common/MediaViewer';
import ShareButton from '@/components/common/ShareButton';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { toast } from '@/components/ui/toast';
import { useProfileStore } from '@/stores/useProfileStore';
import { formatDate, formatNumber } from '@/utils';

interface PollProps {
  poll: PollDetails;
  isLastPoll?: boolean;
  lastPollElementCallback?: (node: HTMLElement | null) => void;
  onDelete?: (pollId: number) => void;
}

const Poll: React.FC<PollProps> = ({ poll, isLastPoll, lastPollElementCallback, onDelete }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { accessToken } = useProfileStore();

  // Component state
  const [mediaViewerOpen, setMediaViewerOpen] = useState(false);
  const [mediaViewerIndex, setMediaViewerIndex] = useState(0);
  const [menuDrawerOpen, setMenuDrawerOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Voting state
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [rankedOptions, setRankedOptions] = useState<number[]>([]);
  const [pollData, setPollData] = useState<PollDetails | null>(null);

  // Local state for UI manipulation of reactions
  const [localUserReactions, setLocalUserReactions] = useState(poll.user_reactions || {});
  const [localLikeCount, setLocalLikeCount] = useState(poll.like_count || 0);

  // Use updated poll data if available, otherwise use prop data
  const currentPoll = pollData || poll;

  // Get images from options
  const pollImages =
    currentPoll.options?.filter((option) => option.image_url).map((option) => option.image_url!) ||
    [];

  // Delete poll hook
  const deletePollMutation = useKeyopollsPollsApiOperationsDeletePoll({
    request: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  // Cast vote mutation
  const {
    mutate: castVote,
    isPending,
    error: voteError,
  } = useKeyopollsPollsApiGeneralCastVote({
    request: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    mutation: {
      onSuccess: (response) => {
        if (response.data) {
          setPollData(response.data);
        }
      },
    },
  });

  // Voting handlers
  const handleUnauthenticatedClick = () => {
    toast.error('Create an account to vote on polls', {
      action: {
        label: 'Sign Up',
        onClick: () => router.push('/auth/signup'),
      },
    });
  };

  const handleSingleChoiceVote = (optionId: number) => {
    if (!currentPoll || currentPoll.user_has_voted || !currentPoll.user_can_vote) return;

    const voteData: CastVoteSchema = {
      poll_id: currentPoll.id,
      votes: [{ option_id: optionId }],
    };

    castVote({ data: voteData });
  };

  const handleMultipleChoiceToggle = (optionId: number) => {
    if (!currentPoll || currentPoll.user_has_voted || !currentPoll.user_can_vote) return;

    setSelectedOptions((prev) => {
      const isSelected = prev.includes(optionId);
      const newSelection = isSelected ? prev.filter((id) => id !== optionId) : [...prev, optionId];

      if (currentPoll.max_choices && newSelection.length > currentPoll.max_choices) {
        return prev;
      }

      return newSelection;
    });
  };

  const handleMultipleChoiceSubmit = () => {
    if (!currentPoll || selectedOptions.length === 0) return;

    const voteData: CastVoteSchema = {
      poll_id: currentPoll.id,
      votes: selectedOptions.map((optionId) => ({ option_id: optionId })),
    };

    castVote({ data: voteData });
  };

  const handleRankingOptionClick = (optionId: number) => {
    if (!currentPoll || currentPoll.user_has_voted || !currentPoll.user_can_vote) return;

    setRankedOptions((prev) => {
      if (prev.includes(optionId)) {
        return prev.filter((id) => id !== optionId);
      }
      return [...prev, optionId];
    });
  };

  const handleRankingSubmit = () => {
    if (!currentPoll || rankedOptions.length !== currentPoll.options?.length) return;

    const voteData: CastVoteSchema = {
      poll_id: currentPoll.id,
      votes: rankedOptions.map((optionId, index) => ({
        option_id: optionId,
        rank: index + 1,
      })),
    };

    castVote({ data: voteData });
  };

  const getRankForOption = (optionId: number): number | null => {
    const index = rankedOptions.indexOf(optionId);
    return index === -1 ? null : index + 1;
  };

  const formatRankLabel = (rank: number): string => {
    if (rank === 1) return '1st';
    if (rank === 2) return '2nd';
    if (rank === 3) return '3rd';
    return `${rank}th`;
  };

  // Check if user voted for this option
  const isUserVotedOption = (optionId: number): boolean => {
    if (!currentPoll?.show_results || !currentPoll.user_has_voted || !currentPoll.user_votes)
      return false;
    return currentPoll.user_votes.some((vote) => vote.option_id === optionId);
  };

  // Get user's rank for this option (for ranking polls)
  const getUserRankForOption = (optionId: number): number | null => {
    if (!currentPoll?.user_votes || currentPoll.poll_type !== 'ranking') return null;
    const userVote = currentPoll.user_votes.find((vote) => vote.option_id === optionId);
    return userVote?.rank || null;
  };

  // Handle reaction changes for UI manipulation
  const handleReactionChange = (
    objectId: number,
    reactionType: 'like' | 'dislike',
    isActive: boolean
  ) => {
    if (objectId !== currentPoll.id) return;

    const wasLiked = localUserReactions.like || false;

    if (isActive) {
      const oppositeReaction = reactionType === 'like' ? 'dislike' : 'like';
      setLocalUserReactions({
        [reactionType]: true,
        [oppositeReaction]: false,
      });

      if (reactionType === 'like') {
        setLocalLikeCount((prev) => prev + 1);
      } else if (reactionType === 'dislike' && wasLiked) {
        setLocalLikeCount((prev) => Math.max(0, prev - 1));
      }
    } else {
      setLocalUserReactions((prev) => ({
        ...prev,
        [reactionType]: false,
      }));

      if (reactionType === 'like') {
        setLocalLikeCount((prev) => Math.max(0, prev - 1));
      }
    }
  };

  // Handle media click to open MediaViewer
  const handleMediaClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setMediaViewerIndex(index);
    setMediaViewerOpen(true);
  };

  // Handle poll click navigation
  const handlePollClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('a') ||
      target.closest('[data-media-item]') ||
      target.closest('[data-interactive]')
    ) {
      return;
    }

    // Preserve current category in sessionStorage before navigating
    const currentCategory = searchParams.get('category');
    if (currentCategory && typeof window !== 'undefined') {
      sessionStorage.setItem('polls_active_category', currentCategory);
    }

    router.push(`/polls/${currentPoll.id}`);
  };

  // Handle comments button click
  const handleCommentsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/polls/${currentPoll.id}?create-comment=true`);
  };

  // Handle insights click
  const handleInsightsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/polls/${currentPoll.id}/insights`);
  };

  // Handle edit poll
  const handleEditPoll = () => {
    setMenuDrawerOpen(false);
    router.push(`/polls/${currentPoll.id}?edit=true`);
  };

  // Handle delete poll button click
  const handleDeletePollClick = () => {
    setMenuDrawerOpen(false);
    setDeleteModalOpen(true);
  };

  // Handle actual poll deletion
  const handleConfirmDelete = async () => {
    return new Promise<void>((resolve, reject) => {
      deletePollMutation.mutate(
        { pollId: currentPoll.id },
        {
          onSuccess: () => {
            toast.success('Poll deleted successfully');
            setDeleteModalOpen(false);

            if (onDelete) {
              onDelete(currentPoll.id);
            }

            if (window.location.pathname === `/polls/${currentPoll.id}`) {
              router.push('/');
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

  // Handle report poll
  const handleReportPoll = () => {
    setMenuDrawerOpen(false);
    toast.info('Report feature coming soon!');
  };

  // Handle menu button click
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuDrawerOpen(true);
  };

  // Handle drawer close
  const handleDrawerOpenChange = (open: boolean) => {
    setMenuDrawerOpen(open);
  };

  const isAuthor = currentPoll.is_author;
  const isDeleting = deletePollMutation.isPending;
  const canInteract =
    currentPoll.user_can_vote && !currentPoll.user_has_voted && currentPoll.is_active;
  const showVoteButton =
    canInteract && (currentPoll.poll_type === 'multiple' || currentPoll.poll_type === 'ranking');

  // Get poll preview for delete modal
  const getPollPreview = () => {
    const preview =
      currentPoll.title.length > 100
        ? currentPoll.title.substring(0, 100) + '...'
        : currentPoll.title;
    return preview || 'This poll';
  };

  return (
    <>
      <article
        ref={isLastPoll ? lastPollElementCallback : null}
        data-poll-id={currentPoll.id}
        className="border-border-subtle hover:bg-surface-elevated/30 flex cursor-pointer space-x-3 border-b p-4 transition-colors"
        onClick={handlePollClick}
      >
        <div className="min-w-0 flex-1">
          {/* Community Info */}
          <div className="mb-1 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="text-background relative flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 font-medium transition-opacity hover:opacity-80">
                {currentPoll.community_avatar ? (
                  <Image
                    src={currentPoll.community_avatar}
                    alt="Community"
                    className="h-full w-full rounded-full object-cover"
                    width={20}
                    height={20}
                  />
                ) : (
                  <span className="text-sm">
                    {currentPoll.community_name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <h3 className="text-text cursor-pointer truncate text-sm font-semibold hover:underline">
                {currentPoll.community_name}
              </h3>
              <span className="text-text-secondary text-sm">
                · {formatDate(currentPoll.created_at)}
              </span>
              {currentPoll.is_pinned && (
                <span className="text-accent text-sm font-medium">· Pinned</span>
              )}
            </div>

            {/* More Menu */}
            <div className="relative">
              <Drawer open={menuDrawerOpen} onOpenChange={handleDrawerOpenChange}>
                <DrawerTrigger asChild>
                  <button
                    type="button"
                    className="text-text-muted hover:text-text hover:bg-surface-elevated ml-2 flex-shrink-0 rounded-full p-1 transition-colors"
                    onClick={handleMenuClick}
                    aria-label="Poll options"
                  >
                    <MoreVertical size={14} />
                  </button>
                </DrawerTrigger>
                <DrawerContent onClick={(e) => e.stopPropagation()}>
                  <DrawerHeader>
                    <DrawerTitle>Poll Options</DrawerTitle>
                  </DrawerHeader>
                  <div className="space-y-2 p-4">
                    {isAuthor && (
                      <button
                        type="button"
                        onClick={handleEditPoll}
                        className="hover:bg-surface-elevated flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors"
                      >
                        <Edit3 size={18} className="text-text-secondary" />
                        <span className="text-text font-medium">Edit Poll</span>
                      </button>
                    )}

                    {isAuthor && (
                      <button
                        type="button"
                        onClick={handleDeletePollClick}
                        className="text-error hover:bg-error/10 flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors"
                      >
                        <Trash2 size={18} />
                        <span className="font-medium">Delete Poll</span>
                      </button>
                    )}

                    {!isAuthor && (
                      <button
                        type="button"
                        onClick={handleReportPoll}
                        className="hover:bg-surface-elevated flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors"
                      >
                        <Flag size={18} className="text-text-secondary" />
                        <span className="text-text font-medium">Report Poll</span>
                        <span className="text-text-muted ml-auto text-sm">Coming Soon</span>
                      </button>
                    )}
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
          </div>

          {/* Poll Title */}
          <div className="mb-3">
            <h2 className="text-text leading-relaxed font-semibold">{currentPoll.title}</h2>
          </div>

          {/* Image Display */}
          {pollImages.length > 0 &&
            (pollImages.length === 1 ? (
              /* Full width single image */
              <div className="mb-4" data-media-item="true">
                <div
                  className="w-full cursor-pointer overflow-hidden rounded-xl transition-opacity hover:opacity-90"
                  onClick={(e) => handleMediaClick(0, e)}
                >
                  <Image
                    src={pollImages[0]}
                    alt="Poll image"
                    className="w-full object-cover"
                    width={600}
                    height={400}
                    style={{ aspectRatio: 'auto' }}
                  />
                </div>
              </div>
            ) : (
              /* Horizontal scrollview for multiple images */
              <div className="mb-4 -ml-[52px]" data-media-item="true">
                <div className="scrollbar-hide flex gap-2 overflow-x-auto pl-[52px]">
                  {pollImages.map((imageUrl, index) => (
                    <div
                      key={index}
                      className="h-64 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl transition-opacity hover:opacity-90"
                      onClick={(e) => handleMediaClick(index, e)}
                    >
                      <Image
                        src={imageUrl}
                        alt={`Poll image ${index + 1}`}
                        className="aspect-[3/3] h-full w-full object-cover"
                        width={256}
                        height={192}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

          {/* Poll Options */}
          <div className="mb-3 space-y-2" data-interactive="true">
            {currentPoll.options?.map((option) => {
              const isSelected = selectedOptions.includes(option.id);
              const rank = getRankForOption(option.id);
              const isVoted = isUserVotedOption(option.id);
              const percentage = currentPoll.show_results
                ? currentPoll.poll_type === 'ranking'
                  ? option.best_rank_percentage || 0
                  : option.vote_percentage
                : 0;

              return (
                <div
                  key={option.id}
                  className={`relative overflow-hidden rounded-lg border transition-all duration-200 ${
                    canInteract ? 'hover:border-primary cursor-pointer' : 'cursor-default'
                  } ${isVoted && currentPoll.show_results ? 'border-primary' : 'border-border'}`}
                  onClick={(e) => {
                    e.stopPropagation();

                    if (!accessToken) {
                      handleUnauthenticatedClick();
                      return;
                    }

                    if (!canInteract) return;

                    if (currentPoll.poll_type === 'single') {
                      handleSingleChoiceVote(option.id);
                    } else if (currentPoll.poll_type === 'multiple') {
                      handleMultipleChoiceToggle(option.id);
                    } else if (currentPoll.poll_type === 'ranking') {
                      handleRankingOptionClick(option.id);
                    }
                  }}
                >
                  {/* Background bar for results */}
                  {currentPoll.show_results && percentage > 0 && (
                    <div
                      className={`absolute inset-0 transition-all duration-300 ${
                        isVoted ? 'bg-primary/10' : 'bg-surface-elevated'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  )}

                  <div className="relative flex items-center justify-between p-3">
                    <div className="flex items-center gap-3">
                      {/* Option indicator */}
                      {currentPoll.poll_type === 'single' && (
                        <div
                          className={`h-4 w-4 rounded-full border-2 ${
                            isVoted && currentPoll.show_results ? 'border-primary' : 'border-border'
                          }`}
                        >
                          {isVoted && currentPoll.show_results && (
                            <div className="bg-primary m-0.5 h-2 w-2 rounded-full" />
                          )}
                        </div>
                      )}
                      {currentPoll.poll_type === 'multiple' && (
                        <div
                          className={`h-4 w-4 rounded border-2 ${
                            isSelected || isVoted ? 'border-primary bg-primary' : 'border-border'
                          }`}
                        >
                          {(isSelected || isVoted) && (
                            <svg
                              className="text-background ml-0.5 h-3 w-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      )}
                      {currentPoll.poll_type === 'ranking' && (
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                            rank || getUserRankForOption(option.id)
                              ? 'border-primary bg-primary text-background'
                              : 'border-border text-text-muted'
                          }`}
                        >
                          {rank || getUserRankForOption(option.id) || '?'}
                        </div>
                      )}

                      <span
                        className={`text-text text-sm ${isVoted && currentPoll.show_results ? 'font-medium' : ''}`}
                      >
                        {option.text}
                      </span>
                    </div>

                    {/* Percentage display */}
                    {currentPoll.show_results && (
                      <div className="flex items-center gap-2">
                        {currentPoll.poll_type === 'ranking' && option.best_rank && (
                          <span className="text-text-muted text-xs">
                            {formatRankLabel(option.best_rank)} choice
                          </span>
                        )}
                        <span
                          className={`text-sm font-medium ${
                            isVoted ? 'text-primary' : 'text-text-secondary'
                          }`}
                        >
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Vote Button */}
          {showVoteButton && (
            <div className="mb-3" data-interactive="true">
              {currentPoll.poll_type === 'multiple' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMultipleChoiceSubmit();
                  }}
                  disabled={selectedOptions.length === 0 || isPending}
                  className="bg-primary text-background disabled:bg-text-muted w-full rounded-full px-4 py-2 text-sm font-medium transition-colors hover:opacity-90 disabled:cursor-not-allowed"
                >
                  {isPending
                    ? 'Voting...'
                    : selectedOptions.length === 0
                      ? 'Select options to vote'
                      : `Vote (${selectedOptions.length} selected)`}
                </button>
              )}

              {currentPoll.poll_type === 'ranking' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRankingSubmit();
                  }}
                  disabled={rankedOptions.length !== currentPoll.options?.length || isPending}
                  className="bg-primary text-background disabled:bg-text-muted w-full rounded-full px-4 py-2 text-sm font-medium transition-colors hover:opacity-90 disabled:cursor-not-allowed"
                >
                  {isPending
                    ? 'Submitting...'
                    : rankedOptions.length === 0
                      ? 'Click options in order of preference'
                      : rankedOptions.length === currentPoll.options?.length
                        ? 'Submit Ranking'
                        : `Rank all options (${rankedOptions.length}/${currentPoll.options?.length})`}
                </button>
              )}
            </div>
          )}

          {/* Total Votes */}
          <div className="mb-3 text-right">
            <span className="text-text-secondary text-sm">{currentPoll.total_votes} votes</span>
          </div>

          {/* Poll Actions */}
          <div className="mt-2 flex max-w-lg items-center justify-between" data-interactive="true">
            {/* Comment Button - Left */}
            <button
              className="text-text-muted hover:text-primary hover:bg-primary/10 group -ml-2 flex items-center rounded-full p-2 transition-all"
              onClick={handleCommentsClick}
            >
              <MessageCircle size={14} className="mr-1.5" />
              {currentPoll.comment_count > 0 && (
                <span className="group-hover:text-primary text-xs">
                  {currentPoll.comment_count}
                </span>
              )}
            </button>

            {/* Share Button */}
            <ShareButton
              contentType="Poll"
              objectId={currentPoll.id}
              initialShareCount={currentPoll.share_count || 0}
              showCount={true}
              size={14}
              postContent={currentPoll.title}
              authorUsername={currentPoll.author_username}
              className="text-text-muted hover:text-success hover:bg-success/10 group flex items-center rounded-full p-2 transition-all"
            />

            {/* Like and Dislike Buttons - Right side for easy thumb reach */}
            <div className="flex items-center gap-1">
              <DislikeButton
                contentType="Poll"
                objectId={currentPoll.id}
                initialIsDisliked={localUserReactions?.dislike || false}
                size={16}
                icon={ArrowDown}
                className="text-text-muted hover:text-error hover:bg-error/10 flex items-center rounded-full p-2 transition-all"
                onReactionChange={handleReactionChange}
              />
              <LikeButton
                contentType="Poll"
                objectId={currentPoll.id}
                initialLikeCount={localLikeCount}
                initialIsLiked={localUserReactions?.like || false}
                showCount={true}
                size={16}
                icon={ArrowUp}
                className="text-text-muted hover:text-error hover:bg-error/10 group flex items-center rounded-full p-2 transition-all"
                onReactionChange={handleReactionChange}
              />
            </div>

            {/* Impressions Count */}
            {isAuthor ? (
              <button
                className="text-text-muted hover:text-accent hover:bg-accent/10 flex items-center rounded-full p-2 transition-all"
                onClick={handleInsightsClick}
              >
                <BarChart3 size={14} className="mr-1.5" />
                {currentPoll.view_count && currentPoll.view_count > 0 && (
                  <span className="text-xs">{formatNumber(currentPoll.view_count)}</span>
                )}
              </button>
            ) : (
              currentPoll.view_count > 0 && (
                <button className="text-text-muted hover:text-text hover:bg-surface-elevated flex items-center rounded-full p-2 transition-all">
                  <ChartNoAxesColumnIncreasing size={14} className="mr-1.5" />
                  <span className="text-xs">{formatNumber(currentPoll.view_count)}</span>
                </button>
              )
            )}

            {/* Bookmark Button - Far Right */}
            <BookmarkButton
              contentType="Poll"
              objectId={currentPoll.id}
              initialIsBookmarked={currentPoll.is_bookmarked || false}
              size={14}
              showTooltip={false}
              className="text-text-muted hover:text-text hover:bg-surface-elevated flex items-center rounded-full p-2 transition-all"
            />
          </div>

          {/* Vote Error */}
          {voteError && (
            <div className="border-error bg-error/10 mt-2 rounded-lg border p-2">
              <p className="text-error text-sm">Error: {voteError.message}</p>
            </div>
          )}
        </div>
      </article>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        itemName="poll"
        title="Delete Poll?"
        description={
          <div className="space-y-3">
            <p>Are you sure you want to delete this poll? This action cannot be undone.</p>
            <div className="border-border bg-surface-elevated rounded-lg border-l-4 p-3">
              <p className="text-text text-sm italic">"{getPollPreview()}"</p>
              <div className="text-text-muted mt-2 flex items-center gap-2 text-xs">
                <span>by {currentPoll.author_username}</span>
                <span>•</span>
                <span>{formatDate(currentPoll.created_at)}</span>
                <span>•</span>
                <span>{currentPoll.total_votes} votes</span>
              </div>
            </div>
          </div>
        }
      />

      {/* Media Viewer for poll images */}
      {pollImages.length > 0 && (
        <MediaViewer
          media={pollImages.map((url) => ({
            id: pollImages.indexOf(url),
            created_at: currentPoll.created_at,
            order: pollImages.indexOf(url),
            file_url: url,
            media_type: 'image' as const,
            alt_text: 'Poll image',
          }))}
          initialIndex={mediaViewerIndex}
          isOpen={mediaViewerOpen}
          onClose={() => setMediaViewerOpen(false)}
        />
      )}
    </>
  );
};

export default Poll;
