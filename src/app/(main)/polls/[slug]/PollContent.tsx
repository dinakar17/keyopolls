'use client';

import React, { useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { ArrowDown, ArrowUp, Info, Send } from 'lucide-react';

import { useKeyopollsPollsApiGeneralCastVote } from '@/api/polls/polls';
import { CastVoteSchema, PollDetails } from '@/api/schemas';
import BookmarkButton from '@/components/common/BookmarkButton';
import DislikeButton from '@/components/common/DislikeButton';
import LikeButton from '@/components/common/LikeButton';
import MediaViewer from '@/components/common/MediaViewer';
import ShareButton from '@/components/common/ShareButton';
import toast from '@/components/ui/toast';
import { useProfileStore } from '@/stores/useProfileStore';

interface PollContentProps {
  poll: PollDetails;
  onPollDataUpdate: (updatedPoll: PollDetails) => void;
}

const PollContent: React.FC<PollContentProps> = ({ poll, onPollDataUpdate }) => {
  const router = useRouter();
  const { accessToken } = useProfileStore();

  // State for managing votes and UI
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [rankedOptions, setRankedOptions] = useState<number[]>([]);
  const [textInput, setTextInput] = useState('');
  const [mediaViewerOpen, setMediaViewerOpen] = useState(false);
  const [mediaViewerIndex, setMediaViewerIndex] = useState(0);

  // Local state for UI manipulation of reactions
  const [localUserReactions, setLocalUserReactions] = useState(poll?.user_reactions || {});
  const [localLikeCount, setLocalLikeCount] = useState(poll?.like_count || 0);

  // Refs
  const textInputRef = useRef<HTMLInputElement>(null);

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
        // Update poll data with response from cast vote API
        if (response.data) {
          onPollDataUpdate(response.data);
          // Clear text input after successful submission
          if (response.data.poll_type === 'text_input') {
            setTextInput('');
          }
        }
      },
    },
  });

  // Update local reactions when poll data changes
  useEffect(() => {
    if (poll) {
      setLocalUserReactions(poll.user_reactions || {});
      setLocalLikeCount(poll.like_count || 0);
    }
  }, [poll]);

  // Get images from options (only for option-based polls)
  const pollImages =
    poll?.poll_type === 'text_input' && poll?.image_url
      ? [poll.image_url]
      : poll?.poll_type !== 'text_input' && poll?.options
        ? poll.options.filter((option) => option.image_url).map((option) => option.image_url!)
        : [];

  const handleSingleChoiceVote = (optionId: number) => {
    if (!poll || poll.user_has_voted || !poll.user_can_vote) return;

    const voteData: CastVoteSchema = {
      poll_id: poll.id,
      votes: [{ option_id: optionId }],
    };

    castVote({ data: voteData });
  };

  const handleUnauthenticatedClick = () => {
    toast.error('Login/Create your account to vote now!', {
      action: {
        label: 'Sign Up',
        onClick: () => router.push('/auth'),
      },
    });
  };

  const handleMultipleChoiceToggle = (optionId: number) => {
    if (!poll || poll.user_has_voted || !poll.user_can_vote) return;

    setSelectedOptions((prev) => {
      const isSelected = prev.includes(optionId);
      const newSelection = isSelected ? prev.filter((id) => id !== optionId) : [...prev, optionId];

      if (poll.max_choices && newSelection.length > poll.max_choices) {
        return prev;
      }

      return newSelection;
    });
  };

  const handleMultipleChoiceSubmit = () => {
    if (!poll || selectedOptions.length === 0) return;

    const voteData: CastVoteSchema = {
      poll_id: poll.id,
      votes: selectedOptions.map((optionId) => ({ option_id: optionId })),
    };

    castVote({ data: voteData });
  };

  const handleRankingOptionClick = (optionId: number) => {
    if (!poll || poll.user_has_voted || !poll.user_can_vote) return;

    setRankedOptions((prev) => {
      if (prev.includes(optionId)) {
        return prev.filter((id) => id !== optionId);
      }
      return [...prev, optionId];
    });
  };

  const handleRankingSubmit = () => {
    if (!poll || rankedOptions.length !== poll.options?.length) return;

    const voteData: CastVoteSchema = {
      poll_id: poll.id,
      votes: rankedOptions.map((optionId, index) => ({
        option_id: optionId,
        rank: index + 1,
      })),
    };

    castVote({ data: voteData });
  };

  const handleTextInputSubmit = () => {
    if (!poll || !textInput.trim()) return;

    const trimmedInput = textInput.trim();

    // Validate text input
    if (trimmedInput.includes(' ')) {
      toast.error('Text response cannot contain spaces');
      return;
    }

    if (trimmedInput.length > 50) {
      toast.error('Text response cannot exceed 50 characters');
      return;
    }

    const voteData: CastVoteSchema = {
      poll_id: poll.id,
      text_value: trimmedInput,
    };

    castVote({ data: voteData });
  };

  const handleTextInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextInputSubmit();
    }

    // Prevent spaces
    if (e.key === ' ') {
      e.preventDefault();
      toast.error('Spaces are not allowed in text responses');
    }
  };

  const getRankForOption = (optionId: number): number | null => {
    const index = rankedOptions.indexOf(optionId);
    return index === -1 ? null : index + 1;
  };

  // Handle reaction changes for UI manipulation
  const handleReactionChange = (
    objectId: number,
    reactionType: 'like' | 'dislike',
    isActive: boolean
  ) => {
    if (!poll || objectId !== poll.id) return;

    const wasLiked = localUserReactions.like || false;

    // Update local state for mutually exclusive reactions
    if (isActive) {
      // User is activating a reaction, deactivate the opposite one
      const oppositeReaction = reactionType === 'like' ? 'dislike' : 'like';
      setLocalUserReactions({
        [reactionType]: true,
        [oppositeReaction]: false,
      });

      // Update like count based on what changed
      if (reactionType === 'like') {
        // User liked: increment count
        setLocalLikeCount((prev) => prev + 1);
      } else if (reactionType === 'dislike' && wasLiked) {
        // User disliked something they had liked: decrement count
        setLocalLikeCount((prev) => Math.max(0, prev - 1));
      }
    } else {
      // User is deactivating a reaction
      setLocalUserReactions((prev) => ({
        ...prev,
        [reactionType]: false,
      }));

      // Update like count if they're removing a like
      if (reactionType === 'like') {
        setLocalLikeCount((prev) => Math.max(0, prev - 1));
      }
    }
  };

  const formatRankLabel = (rank: number): string => {
    if (rank === 1) return '1st';
    if (rank === 2) return '2nd';
    if (rank === 3) return '3rd';
    return `${rank}th`;
  };

  // Check if user voted for this option
  const isUserVotedOption = (optionId: number): boolean => {
    if (!poll?.user_has_voted || !poll.user_votes) return false;
    return poll.user_votes.some((vote) => vote.option_id === optionId);
  };

  // Get user's rank for this option (for ranking polls)
  const getUserRankForOption = (optionId: number): number | null => {
    if (!poll?.user_votes || poll.poll_type !== 'ranking') return null;
    const userVote = poll.user_votes.find((vote) => vote.option_id === optionId);
    return userVote?.rank || null;
  };

  // Handle media click to open MediaViewer
  const handleMediaClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent post navigation
    setMediaViewerIndex(index);
    setMediaViewerOpen(true);
  };

  const canInteract = poll.user_can_vote && !poll.user_has_voted && poll.is_active;

  // Show vote button immediately for multiple choice and ranking polls when user can interact
  const showVoteButton =
    canInteract && (poll.poll_type === 'multiple' || poll.poll_type === 'ranking');

  // Updated condition: only show results if user has voted
  const showResults = poll.user_has_voted;

  return (
    <>
      {/* Poll Content */}
      <div className="px-4">
        {/* Title */}
        <h1 className="text-text mb-3 text-lg font-semibold">{poll.title}</h1>

        {/* Image Display - For all poll types with images */}
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

        {/* Description */}
        {poll.description && <p className="text-text-secondary mb-4 text-sm">{poll.description}</p>}

        {/* Poll Content - Text Input vs Options */}
        {poll.poll_type === 'text_input' ? (
          /* Text Input Poll */
          <div className="mb-4">
            {showResults ? (
              /* Show text responses as bubbles */
              <div className="space-y-4">
                {poll.text_responses && poll.text_responses.length > 0 ? (
                  <>
                    {/* Bubble cloud */}
                    <div className="scrollbar-hide -mx-4 overflow-x-auto px-4">
                      <div className="flex gap-3 pb-2" style={{ width: 'max-content' }}>
                        {poll.text_responses.map((response, index) => {
                          // Calculate bubble size based on response count
                          const maxCount = Math.max(
                            ...(poll.text_responses || []).map((r) => r.response_count)
                          );
                          const minCount = Math.min(
                            ...(poll.text_responses || []).map((r) => r.response_count)
                          );
                          const countRange = maxCount - minCount || 1;
                          const normalizedSize = (response.response_count - minCount) / countRange;

                          // Size classes from smallest to largest
                          const sizeClasses = [
                            'px-3 py-1.5 text-xs', // smallest
                            'px-3 py-2 text-sm', // small
                            'px-4 py-2 text-base', // medium
                            'px-5 py-2.5 text-lg', // large
                            'px-6 py-3 text-xl font-medium', // largest
                          ];

                          const sizeIndex = Math.floor(normalizedSize * (sizeClasses.length - 1));
                          const sizeClass = sizeClasses[sizeIndex];

                          const isUserResponse =
                            poll.user_text_response?.text_value === response.text_value;

                          return (
                            <div
                              key={index}
                              className={`inline-flex items-center gap-2 rounded-full font-mono whitespace-nowrap transition-all duration-200 ${sizeClass} ${
                                response.is_correct && poll.has_correct_answer
                                  ? 'bg-success/20 border-success text-success border-2'
                                  : isUserResponse
                                    ? 'bg-primary/20 border-primary text-primary border-2'
                                    : 'bg-surface-elevated border-border text-text border'
                              } `}
                              title={`${response.response_count} ${response.response_count === 1 ? 'response' : 'responses'} (${response.percentage.toFixed(1)}%)`}
                            >
                              {response.is_correct && poll.has_correct_answer && (
                                <span className="text-success">✓</span>
                              )}
                              <span>{response.text_value}</span>
                              <span
                                className={`text-xs font-normal opacity-75 ${
                                  response.is_correct && poll.has_correct_answer
                                    ? 'text-success'
                                    : isUserResponse
                                      ? 'text-primary'
                                      : 'text-text-secondary'
                                } `}
                              >
                                {response.response_count}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-text-secondary py-8 text-center">No responses yet</div>
                )}

                {/* Show user's response indicator if they voted */}
                {poll.user_text_response && (
                  <div className="border-primary/30 bg-primary/5 rounded-lg border p-3">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-text-secondary text-sm">Your response:</span>
                      <span className="text-primary font-mono font-medium">
                        {poll.user_text_response.text_value}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Text input form */
              <div className="space-y-3">
                <div className="relative">
                  <input
                    ref={textInputRef}
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyPress={handleTextInputKeyPress}
                    placeholder="Enter your response (no spaces allowed)"
                    disabled={!canInteract || isPending}
                    maxLength={50}
                    className="border-border focus:border-primary w-full rounded-lg border px-4 py-3 pr-12 font-mono transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <button
                    onClick={handleTextInputSubmit}
                    disabled={!textInput.trim() || !canInteract || isPending}
                    className="text-primary hover:text-primary/80 absolute top-1/2 right-3 -translate-y-1/2 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Send size={18} />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary">{textInput.length}/50 characters</span>
                  {textInput.includes(' ') && (
                    <span className="text-error">Spaces not allowed</span>
                  )}
                </div>

                {!accessToken && (
                  <button
                    onClick={handleUnauthenticatedClick}
                    className="text-text-secondary hover:text-primary w-full text-center transition-colors"
                  >
                    Sign in to respond
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Option-based polls */
          <div className="mb-4 space-y-2">
            {poll.options?.map((option) => {
              const isSelected = selectedOptions.includes(option.id);
              const rank = getRankForOption(option.id);
              const isVoted = isUserVotedOption(option.id);
              const percentage = showResults
                ? poll.poll_type === 'ranking'
                  ? option.best_rank_percentage || 0
                  : option.vote_percentage
                : 0;

              return (
                <div
                  key={option.id}
                  className={`relative overflow-hidden rounded-lg border transition-all duration-200 ${
                    canInteract ? 'hover:border-primary/50 cursor-pointer' : 'cursor-default'
                  } ${
                    isVoted && showResults
                      ? 'border-primary'
                      : option.is_correct && showResults && poll.has_correct_answer
                        ? 'border-success'
                        : 'border-border'
                  }`}
                  onClick={() => {
                    if (!accessToken) {
                      handleUnauthenticatedClick();
                      return;
                    }
                    if (!canInteract) return;

                    if (poll.poll_type === 'single') {
                      handleSingleChoiceVote(option.id);
                    } else if (poll.poll_type === 'multiple') {
                      handleMultipleChoiceToggle(option.id);
                    } else if (poll.poll_type === 'ranking') {
                      handleRankingOptionClick(option.id);
                    }
                  }}
                >
                  {/* Background bar for results */}
                  {showResults && percentage > 0 && (
                    <div
                      className={`absolute inset-0 transition-all duration-300 ${
                        isVoted
                          ? 'bg-primary/20'
                          : option.is_correct && poll.has_correct_answer
                            ? 'bg-success/20'
                            : 'bg-surface-elevated'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  )}

                  <div className="relative flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      {/* Correct answer indicator */}
                      {option.is_correct && showResults && poll.has_correct_answer && (
                        <div className="text-success text-sm font-medium">✓</div>
                      )}

                      {/* Option indicator */}
                      {poll.poll_type === 'single' && (
                        <div
                          className={`h-4 w-4 rounded-full border-2 ${
                            isVoted && showResults ? 'border-primary' : 'border-border'
                          }`}
                        >
                          {isVoted && showResults && (
                            <div className="bg-primary m-0.5 h-2 w-2 rounded-full" />
                          )}
                        </div>
                      )}
                      {poll.poll_type === 'multiple' && (
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
                      {poll.poll_type === 'ranking' && (
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

                      <span className={`text-text ${isVoted && showResults ? 'font-medium' : ''}`}>
                        {option.text}
                      </span>
                    </div>

                    {/* Percentage display */}
                    {showResults && (
                      <div className="flex items-center gap-2">
                        {poll.poll_type === 'ranking' && option.best_rank && (
                          <span className="text-text-secondary text-xs">
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
        )}

        {/* Vote Button - Shows immediately for multiple choice and ranking */}
        {showVoteButton && (
          <div className="mb-4">
            {poll.poll_type === 'multiple' && (
              <button
                onClick={handleMultipleChoiceSubmit}
                disabled={selectedOptions.length === 0 || isPending}
                className="bg-primary text-background w-full rounded-full px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending
                  ? 'Voting...'
                  : selectedOptions.length === 0
                    ? 'Select options to vote'
                    : `Vote (${selectedOptions.length} selected)`}
              </button>
            )}

            {poll.poll_type === 'ranking' && (
              <button
                onClick={handleRankingSubmit}
                disabled={rankedOptions.length !== poll.options?.length || isPending}
                className="bg-primary text-background w-full rounded-full px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending
                  ? 'Submitting...'
                  : rankedOptions.length === 0
                    ? 'Click options in order of preference'
                    : rankedOptions.length === poll.options?.length
                      ? 'Submit Ranking'
                      : `Rank all options (${rankedOptions.length}/${poll.options?.length})`}
              </button>
            )}
          </div>
        )}

        {/* Subtle note about what becomes available after answering */}
        {!poll.user_has_voted && (
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">After you answer this poll:</p>
                <ul className="mt-1 text-xs text-blue-700">
                  <li>• You'll see detailed results and statistics</li>
                  <li>• The author's explanation will be revealed</li>
                  <li>• You can join the discussion in comments</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Explanation - Only shown after user has voted */}
        {showResults && poll.explanation && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="text-green-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-green-800">Explanation</h3>
            </div>
            <p className="text-sm leading-relaxed text-green-700">{poll.explanation}</p>
          </div>
        )}

        {/* Correct Answer Stats - Only shown after user has voted */}
        {showResults && poll.has_correct_answer && poll.correct_answer_stats && (
          <div className="border-success/20 bg-success/10 mb-4 rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <span className="text-success text-sm font-medium">✓</span>
              <span className="text-success text-sm">
                {poll.correct_answer_stats.correct_count} out of {poll.total_voters} got it right (
                {poll.correct_answer_stats.correct_percentage}%)
              </span>
            </div>
          </div>
        )}

        {/* Multiple Choice Distribution Stats - Only shown after user has voted */}
        {showResults &&
          poll.poll_type === 'multiple' &&
          poll.multiple_choice_stats &&
          poll.multiple_choice_stats.length > 0 && (
            <div className="mb-4">
              <h3 className="text-text-secondary mb-2 text-sm font-medium">Choice Distribution</h3>
              <div className="space-y-1">
                {poll.multiple_choice_stats.map((stat) => (
                  <div
                    key={stat.choice_count}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-text-secondary">
                      {stat.choice_count} {stat.choice_count === 1 ? 'choice' : 'choices'}:
                    </span>
                    <span className="text-text">
                      {stat.user_count} {stat.user_count === 1 ? 'person' : 'people'} (
                      {stat.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Total Votes - Only shown after user has voted */}
        {showResults && poll && (
          <div className="text-text-secondary mb-4 text-right text-sm">
            {poll.poll_type === 'text_input'
              ? `${poll.total_voters} ${poll.total_voters === 1 ? 'response' : 'responses'}`
              : `${poll.total_votes} ${poll.total_votes === 1 ? 'vote' : 'votes'}`}
          </div>
        )}
      </div>

      {/* Subtle Author Attribution */}
      <div className="px-4 pb-2">
        <button
          onClick={() => router.push(`/profiles/${poll.author_username}`)}
          className="text-text-muted hover:text-primary text-xs transition-colors"
        >
          Created by @{poll.author_username}
        </button>
      </div>

      {/* Action Bar - Updated with better layout and view count */}
      <div className="border-border border-y px-4 py-2">
        <div className="flex max-w-lg items-center justify-between">
          {/* Dislike Button */}
          <DislikeButton
            contentType="Poll"
            objectId={poll.id}
            initialIsDisliked={localUserReactions?.dislike || false}
            size={16}
            icon={ArrowDown}
            className="text-text-muted hover:text-error hover:bg-error/10 group flex items-center rounded-full p-2 transition-all"
            onReactionChange={handleReactionChange}
          />

          {/* Like Button - Left side */}
          <LikeButton
            contentType="Poll"
            objectId={poll.id}
            initialLikeCount={localLikeCount}
            initialIsLiked={localUserReactions?.like || false}
            size={16}
            icon={ArrowUp}
            className="text-text-muted hover:text-success hover:bg-success/10 group -ml-2 flex items-center rounded-full p-2 transition-all"
            onReactionChange={handleReactionChange}
          />

          {/* Share Button */}
          <ShareButton
            contentType="Poll"
            objectId={poll.id}
            initialShareCount={poll.share_count || 0}
            showCount={true}
            size={16}
            postContent={poll.title}
            authorUsername={poll.author_username}
            className="text-text-muted hover:text-primary hover:bg-primary/10 group flex items-center rounded-full p-2 transition-all"
          />

          {/* Bookmark Button - Right side */}
          <BookmarkButton
            contentType="Poll"
            objectId={poll.id}
            initialIsBookmarked={poll.is_bookmarked || false}
            size={16}
            showTooltip={false}
            className="text-text-muted hover:text-text hover:bg-surface-elevated flex items-center rounded-full p-2 transition-all"
          />
        </div>
      </div>

      {/* Vote Error */}
      {voteError && (
        <div className="border-error/20 bg-error/10 mx-4 mb-4 rounded-lg border p-3">
          <p className="text-error text-sm">Error: {voteError.message}</p>
        </div>
      )}

      {/* Media Viewer - For all polls with images */}
      {poll && pollImages.length > 0 && (
        <MediaViewer
          // pass id, image_url to the media
          media={
            poll.poll_type === 'text_input' && poll.image_url
              ? [
                  {
                    id: poll.id,
                    file_url: poll.image_url,
                    media_type: 'image',
                  },
                ]
              : poll.options
                  ?.filter((option) => option.image_url)
                  .map((option) => ({
                    id: option.id,
                    file_url: option.image_url!,
                    media_type: 'image',
                  })) || []
          }
          initialIndex={mediaViewerIndex}
          isOpen={mediaViewerOpen}
          onClose={() => setMediaViewerOpen(false)}
        />
      )}
    </>
  );
};

export default PollContent;
