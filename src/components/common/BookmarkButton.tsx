'use client';

import React, { useEffect, useState } from 'react';

import { Bookmark } from 'lucide-react';

import { useKeyopollsCommonApiBookmarkToggleBookmark } from '@/api/bookmarks/bookmarks';
import { ContentTypeEnum } from '@/api/schemas';
import toast from '@/components/ui/toast';
import { useProfileStore } from '@/stores/useProfileStore';

interface BookmarkButtonProps {
  contentType: ContentTypeEnum;
  objectId: number;
  initialIsBookmarked?: boolean;
  folderId?: number; // Optional folder to add bookmark to
  notes?: string; // Optional notes for the bookmark
  className?: string;
  size?: number;
  showTooltip?: boolean;
}

const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  contentType,
  objectId,
  initialIsBookmarked = false,
  folderId,
  notes = '',
  className = '',
  size = 20,
  showTooltip = true,
}) => {
  const { accessToken, isAuthenticated } = useProfileStore();

  // Local state
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isAnimating, setIsAnimating] = useState(false);

  // API mutation - only uses public profile authentication
  const { mutate: toggleBookmark, isPending } = useKeyopollsCommonApiBookmarkToggleBookmark({
    request: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    mutation: {
      onSuccess: (response) => {
        if (response?.data) {
          // Update state with API response
          setIsBookmarked(response.data.bookmarked || false);

          // Show success toast
          const message = response.data.bookmarked
            ? 'Bookmarked successfully!'
            : 'Bookmark removed';
          toast.success(message, {
            duration: 2000,
          });
        }
      },
      onError: (error) => {
        // Revert optimistic update on error
        setIsBookmarked(!isBookmarked);

        // Show error toast
        const errorMessage = error?.response?.data?.message || 'Failed to toggle bookmark';
        toast.error(errorMessage, {
          duration: 3000,
        });

        console.error('Failed to toggle bookmark:', error);
      },
    },
  });

  // Update local state when props change (useful for real-time updates)
  useEffect(() => {
    setIsBookmarked(initialIsBookmarked);
  }, [initialIsBookmarked]);

  const handleBookmark = () => {
    // Check authentication
    if (!isAuthenticated()) {
      toast.error('You must be logged in to bookmark content.', {
        duration: 3000,
      });
      return;
    }

    // Check if API call is already in progress or no token available
    if (isPending || !accessToken) return;

    // Optimistic update
    const newIsBookmarked = !isBookmarked;
    setIsBookmarked(newIsBookmarked);

    // Trigger animation for bookmarks
    if (newIsBookmarked) {
      setIsAnimating(true);
      setTimeout(() => {
        setIsAnimating(false);
      }, 600);
    }

    // Call API
    toggleBookmark({
      contentType,
      objectId,
      data: {
        folder_id: folderId,
        notes: notes,
      },
    });
  };

  const tooltipText = isBookmarked ? 'Remove bookmark' : 'Add bookmark';

  return (
    <div className="group relative">
      <button
        className={`flex items-center transition-all duration-200 ${
          isBookmarked
            ? 'text-yellow-500 hover:text-yellow-600'
            : 'text-gray-500 hover:text-yellow-500'
        } ${isPending ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} ${className}`}
        onClick={handleBookmark}
        disabled={isPending}
        aria-label={tooltipText}
      >
        <Bookmark
          size={size}
          className={`transition-all duration-300 ${isAnimating ? 'scale-125' : 'scale-100'}`}
          fill={isBookmarked ? 'currentColor' : 'none'}
        />
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 transform rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          {tooltipText}
          <div className="absolute top-full left-1/2 -translate-x-1/2 transform border-2 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

export default BookmarkButton;
