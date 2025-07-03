'use client';

import React, { useEffect, useState } from 'react';

import { Heart, LucideIcon } from 'lucide-react';

import { useKeyopollsCommonApiReactionToggleReaction } from '@/api/reactions/reactions';
import { ContentTypeEnum } from '@/api/schemas';
import { toast } from '@/components/ui/toast';
import { useProfileStore } from '@/stores/useProfileStore';

interface LikeButtonProps {
  contentType: ContentTypeEnum;
  objectId: number;
  initialLikeCount: number;
  initialIsLiked?: boolean;
  className?: string;
  showCount?: boolean;
  size?: number;
  icon?: LucideIcon;
  onReactionChange?: (
    objectId: number,
    reactionType: 'like' | 'dislike',
    isActive: boolean
  ) => void;
}

const LikeButton: React.FC<LikeButtonProps> = ({
  contentType,
  objectId,
  initialLikeCount,
  initialIsLiked = false,
  className = '',
  showCount = true,
  size = 16,
  icon: Icon = Heart,
  onReactionChange,
}) => {
  const { accessToken, isAuthenticated } = useProfileStore();

  // Local state
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isAnimating, setIsAnimating] = useState(false);

  // API mutation - always uses public profile
  const { mutate: toggleReaction } = useKeyopollsCommonApiReactionToggleReaction({
    request: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    mutation: {
      onSuccess: () => {
        // Keep the optimistic update
      },
      onError: (error) => {
        console.error('Failed to toggle reaction:', error);
        // Could add error handling here if needed
        // For now, keeping optimistic update
      },
    },
  });

  // Update local state when props change (for external updates)
  useEffect(() => {
    setLikeCount(initialLikeCount);
    setIsLiked(initialIsLiked);
  }, [initialLikeCount, initialIsLiked]);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated()) {
      toast.error('You must be logged in to like content.', {
        duration: 3000,
      });
      return;
    }

    if (!accessToken) {
      toast.error('Please log in to your account to like content.', {
        duration: 3000,
      });
      return;
    }

    // Immediate optimistic update
    const newIsLiked = !isLiked;
    const newLikeCount = newIsLiked ? likeCount + 1 : likeCount - 1;

    setIsLiked(newIsLiked);
    setLikeCount(Math.max(0, newLikeCount));

    // Notify parent component for UI manipulation
    if (onReactionChange) {
      onReactionChange(objectId, 'like', newIsLiked);
    }

    // Trigger animation for likes
    if (newIsLiked) {
      setIsAnimating(true);
      setTimeout(() => {
        setIsAnimating(false);
      }, 600);
    }

    // Call API in background
    toggleReaction({
      contentType,
      objectId,
      data: { reaction_type: 'like' },
    });
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <button
      className={`group flex items-center rounded-full p-1.5 transition-all duration-200 ${
        isLiked
          ? 'text-error hover:bg-error/10'
          : 'text-text-muted hover:text-error hover:bg-error/10'
      } ${className}`}
      onClick={handleLike}
      aria-label={isLiked ? 'Unlike' : 'Like'}
    >
      <Icon
        size={size}
        className={`transition-all duration-300 ${
          isAnimating ? 'scale-125' : 'scale-100'
        } ${showCount ? 'mr-1.5' : ''} ${
          isLiked ? 'text-error' : 'text-text-muted group-hover:text-error'
        }`}
        fill={isLiked ? 'currentColor' : 'none'}
        strokeWidth={2}
      />
      {showCount && likeCount > 0 && (
        <span
          className={`text-xs font-medium tabular-nums transition-colors ${
            isLiked ? 'text-error' : 'text-text-muted group-hover:text-error'
          }`}
        >
          {formatCount(likeCount)}
        </span>
      )}
    </button>
  );
};

export default LikeButton;
