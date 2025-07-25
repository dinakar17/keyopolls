'use client';

import React, { useEffect, useRef, useState } from 'react';

import { useParams, useSearchParams } from 'next/navigation';

import { ArrowDown } from 'lucide-react';

import { useKeyopollsPollsApiGeneralGetPoll } from '@/api/polls/polls';
import { PollDetails } from '@/api/schemas';
import CommentsSection from '@/components/comments/CommentsSection';
import { useCommentsUIStore } from '@/stores/useCommentsUIStore';
import { useProfileStore } from '@/stores/useProfileStore';

import PollContent from './PollContent';
import PollHeader from './PollHeader';
import StickyPollPreview from './StickyPollPreview';

const PollDisplayPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const { accessToken } = useProfileStore();
  const { openCreateDrawer } = useCommentsUIStore();

  // State for managing UI
  const [pollData, setPollData] = useState<PollDetails | null>(null);
  const [showStickyPreview, setShowStickyPreview] = useState(false);
  const [currentCommentIndex, setCurrentCommentIndex] = useState(-1);

  // Refs
  const pollContentRef = useRef<HTMLDivElement>(null);

  // Fetch poll data
  const { data, isLoading, error, refetch } = useKeyopollsPollsApiGeneralGetPoll(Number(slug), {
    request: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  // Use updated poll data if available, otherwise use fetched data
  const poll = pollData || data?.data;

  // Scroll handler for sticky preview
  useEffect(() => {
    const handleScroll = () => {
      if (!pollContentRef.current) return;

      const pollContentRect = pollContentRef.current.getBoundingClientRect();
      const isOutOfView = pollContentRect.bottom < 0;

      setShowStickyPreview(isOutOfView);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle comment navigation
  const handleCommentNavigation = () => {
    // Find all top-level comment elements
    const commentElements = document.querySelectorAll('[data-comment-level="0"]');

    if (commentElements.length === 0) {
      // If no comments found, scroll to end
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      return;
    }

    // Calculate next index
    let nextIndex;
    if (currentCommentIndex === -1) {
      // First click - go to first comment
      nextIndex = 0;
    } else {
      // Subsequent clicks - go to next comment
      nextIndex = currentCommentIndex + 1;
    }

    if (nextIndex >= commentElements.length) {
      // If we've reached the end, scroll to bottom and reset for next cycle
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      setCurrentCommentIndex(-1);
    } else {
      // Scroll to the target comment
      const targetComment = commentElements[nextIndex];
      const headerHeight = 56; // Height of sticky header
      const offset = 50; // Additional offset for better positioning

      const elementTop = targetComment.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementTop - headerHeight - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      setCurrentCommentIndex(nextIndex);
    }
  };

  // Handle poll data update from child component
  const handlePollDataUpdate = (updatedPoll: PollDetails) => {
    setPollData(updatedPoll);
  };

  if (isLoading) {
    return (
      <div className="bg-background mx-auto max-w-2xl">
        <div className="animate-pulse p-4">
          {/* Community header */}
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-surface-elevated h-8 w-8 rounded-full"></div>
            <div className="bg-surface-elevated h-4 w-32 rounded"></div>
            <div className="bg-surface-elevated ml-auto h-3 w-20 rounded"></div>
          </div>

          {/* Title */}
          <div className="bg-surface-elevated mb-4 h-6 w-3/4 rounded"></div>

          {/* Options */}
          <div className="mb-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface-elevated h-12 rounded"></div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-6">
            <div className="bg-surface-elevated h-4 w-16 rounded"></div>
            <div className="bg-surface-elevated h-4 w-12 rounded"></div>
            <div className="bg-surface-elevated h-4 w-12 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="bg-background mx-auto max-w-2xl p-4">
        <div className="border-error/20 bg-error/10 rounded-lg border p-4">
          <h2 className="text-error font-semibold">Error loading poll</h2>
          <p className="text-error/80">{error?.message || 'Poll not found'}</p>
        </div>
      </div>
    );
  }

  // Check if user has voted to determine if comments should be shown
  const showComments = poll.user_has_voted;

  return (
    <>
      {/* Sticky Poll Preview */}
      <StickyPollPreview poll={poll} isVisible={showStickyPreview} />

      {/* PollHeader stays outside the tracked content for proper sticky behavior */}
      <PollHeader poll={poll} refetchPoll={refetch} />

      <div className="bg-background mx-auto mb-20 max-w-2xl">
        <div ref={pollContentRef}>
          {/* Poll Content Component */}
          <PollContent poll={poll} onPollDataUpdate={handlePollDataUpdate} />
        </div>

        {/* Comments Section - Only shown after user has voted */}
        {showComments && (
          <CommentsSection
            contentType="Poll"
            objectId={poll.id}
            allowedMediaTypes={['images', 'link']}
          />
        )}
      </div>

      {/* Bottom Input Bar - Only shown after user has voted */}
      {!searchParams.get('view') && showComments && (
        <div className="border-border bg-background fixed right-0 bottom-0 left-0 z-10 flex border-t p-2 shadow-lg">
          <button
            onClick={() => openCreateDrawer()}
            className="border-border bg-surface hover:border-border-subtle hover:bg-surface-elevated w-full rounded-full border px-4 py-3 text-left shadow-sm transition-colors"
          >
            <span className="text-text-muted text-sm">Join the conversation...</span>
          </button>
          {/* Comment navigation button */}
          <button
            onClick={handleCommentNavigation}
            className="bg-primary text-background mx-2 mt-2 flex h-full w-full flex-1 items-center justify-center rounded-full p-2 transition-opacity hover:opacity-90"
            title="Navigate through comments"
          >
            <ArrowDown size={20} />
          </button>
        </div>
      )}
    </>
  );
};

export default PollDisplayPage;
