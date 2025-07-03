'use client';

import React, { useEffect, useState } from 'react';

import { LucideIcon, ThumbsDown } from 'lucide-react';

import { useKeyopollsCommonApiReactionToggleReaction } from '@/api/reactions/reactions';
import { ContentTypeEnum } from '@/api/schemas';
import { toast } from '@/components/ui/toast';
import { useProfileStore } from '@/stores/useProfileStore';

interface DislikeButtonProps {
  contentType: ContentTypeEnum;
  objectId: number;
  initialIsDisliked?: boolean;
  className?: string;
  size?: number;
  icon?: LucideIcon;
  onReactionChange?: (
    objectId: number,
    reactionType: 'like' | 'dislike',
    isActive: boolean
  ) => void;
}

const DislikeButton: React.FC<DislikeButtonProps> = ({
  contentType,
  objectId,
  initialIsDisliked = false,
  className = '',
  size = 16,
  icon: Icon = ThumbsDown,
  onReactionChange,
}) => {
  const { accessToken, isAuthenticated } = useProfileStore();

  // Local state
  const [isDisliked, setIsDisliked] = useState(initialIsDisliked);
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
      onError: () => {
        // Could add error handling here if needed
        // For now, keeping optimistic update
      },
    },
  });

  // Update local state when props change (for external updates)
  useEffect(() => {
    setIsDisliked(initialIsDisliked);
  }, [initialIsDisliked]);

  const handleDislike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated()) {
      toast.error('You must be logged in to dislike content.', {
        duration: 3000,
      });
      return;
    }

    if (!accessToken) {
      toast.error('Please log in to your account to dislike content.', {
        duration: 3000,
      });
      return;
    }

    // Immediate optimistic update
    const newIsDisliked = !isDisliked;

    setIsDisliked(newIsDisliked);

    // Notify parent component for UI manipulation
    if (onReactionChange) {
      onReactionChange(objectId, 'dislike', newIsDisliked);
    }

    // Trigger animation for dislikes
    if (newIsDisliked) {
      setIsAnimating(true);
      setTimeout(() => {
        setIsAnimating(false);
      }, 600);
    }

    // Call API in background
    toggleReaction({
      contentType,
      objectId,
      data: { reaction_type: 'dislike' },
    });
  };

  return (
    <button
      className={`group flex items-center rounded-full p-1.5 transition-all duration-200 ${
        isDisliked
          ? 'text-orange-500 hover:bg-orange-500/10'
          : 'text-text-muted hover:bg-orange-500/10 hover:text-orange-500'
      } ${className}`}
      onClick={handleDislike}
      aria-label={isDisliked ? 'Remove dislike' : 'Dislike'}
    >
      <Icon
        size={size}
        className={`transition-all duration-300 ${isAnimating ? 'scale-125' : 'scale-100'}`}
        fill={isDisliked ? 'currentColor' : 'none'}
        strokeWidth={2}
      />
    </button>
  );
};

export default DislikeButton;
