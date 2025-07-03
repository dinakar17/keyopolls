'use client';

import React, { useEffect, useState } from 'react';

import { LucideIcon, Share2 } from 'lucide-react';

import { useKeyopollsCommonApiReactionShareContent } from '@/api/reactions/reactions';
import { ContentTypeEnum } from '@/api/schemas';
import ShareDrawer from '@/components/common/ShareDrawer';
import { useProfileStore } from '@/stores/useProfileStore';

interface ShareButtonProps {
  contentType: ContentTypeEnum;
  objectId: number;
  initialShareCount: number;
  className?: string;
  showCount?: boolean;
  size?: number;
  icon?: LucideIcon;
  // ShareDrawer specific props
  postContent: string;
  authorUsername: string | null | undefined;
  postUrl?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  contentType,
  objectId,
  initialShareCount,
  className = '',
  showCount = true,
  size = 16,
  icon: Icon = Share2,
  postContent,
  authorUsername,
  postUrl,
}) => {
  const { accessToken } = useProfileStore();

  // Local state
  const [shareCount, setShareCount] = useState(initialShareCount);
  const [isAnimating, setIsAnimating] = useState(false);

  // API mutation - always uses public profile or no auth for sharing
  const { mutate: trackShare, isPending } = useKeyopollsCommonApiReactionShareContent({
    request: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    mutation: {
      onSuccess: (response) => {
        if (response?.data) {
          // Update state with API response
          setShareCount(response.data.total_shares || 0);

          // Trigger animation if it was a new share
          if (response.data.success && !response.data.already_shared) {
            setIsAnimating(true);
            setTimeout(() => {
              setIsAnimating(false);
            }, 600);
          }
        }
      },
      onError: (error) => {
        console.error('Failed to track share:', error);
      },
    },
  });

  // Update local state when props change
  useEffect(() => {
    setShareCount(initialShareCount);
  }, [initialShareCount]);

  // Function to track share via API
  const handleTrackShare = async (platform: string, referrer?: string) => {
    if (isPending) return;

    // Call API (works with or without authentication)
    trackShare({
      contentType,
      objectId,
      data: {
        platform: platform,
        referrer: referrer || window.location.href,
      },
    });
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  // Enhanced ShareDrawer with share tracking
  const EnhancedShareDrawer = ({ children }: { children: React.ReactNode }) => {
    return (
      <ShareDrawer
        postId={String(objectId)}
        postContent={postContent}
        authorUsername={authorUsername}
        postUrl={postUrl}
        onShare={handleTrackShare} // Pass the tracking function
      >
        {children}
      </ShareDrawer>
    );
  };

  return (
    <EnhancedShareDrawer>
      <button
        className={`group flex items-center rounded-full transition-all duration-200 ${
          shareCount > 0
            ? 'text-success hover:bg-success/10'
            : 'text-text-muted hover:text-success hover:bg-success/10'
        } ${isPending ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} ${className}`}
        disabled={isPending}
        aria-label="Share"
      >
        <Icon
          size={size}
          className={`transition-all duration-300 ${
            isAnimating ? 'scale-125' : 'scale-100'
          } ${showCount ? 'mr-1.5' : ''}`}
          strokeWidth={2}
        />
        {showCount && shareCount > 0 && (
          <span
            className={`text-xs font-medium tabular-nums transition-colors ${
              shareCount > 0 ? 'text-success' : 'text-text-muted group-hover:text-success'
            }`}
          >
            {formatCount(shareCount)}
          </span>
        )}
      </button>
    </EnhancedShareDrawer>
  );
};

export default ShareButton;
