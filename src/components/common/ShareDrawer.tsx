'use client';

import React, { useEffect, useState } from 'react';

import { Check, Code, Facebook, Link, MoreHorizontal, Share, Twitter } from 'lucide-react';

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { toast } from '@/components/ui/toast';

interface ShareDrawerProps {
  children: React.ReactNode;
  postId: string;
  postContent: string;
  authorUsername: string | null | undefined;
  postUrl?: string;
  onShare?: (platform: string, referrer?: string) => Promise<any>; // Add callback for tracking
}

const ShareDrawer: React.FC<ShareDrawerProps> = ({
  children,
  postId,
  postContent,
  authorUsername,
  postUrl,
  onShare,
}) => {
  const [open, setOpen] = useState(false);
  const [copiedStates, setCopiedStates] = useState({
    link: false,
    embed: false,
  });
  const [lastShareAction, setLastShareAction] = useState<string | null>(null);

  // Show toast when drawer closes after a share action
  useEffect(() => {
    if (!open && lastShareAction) {
      const getShareMessage = (action: string) => {
        switch (action) {
          case 'link':
            return 'Link copied and share recorded!';
          case 'embed':
            return 'Embed code copied and share recorded!';
          case 'twitter':
            return 'Shared to Twitter!';
          case 'facebook':
            return 'Shared to Facebook!';
          case 'native':
            return 'Shared successfully!';
          default:
            return 'Share recorded!';
        }
      };

      toast.success(getShareMessage(lastShareAction), {
        duration: 3000,
      });

      setLastShareAction(null);
    }
  }, [open, lastShareAction]);

  // Generate URLs
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const fullPostUrl = postUrl || `${baseUrl}/posts/${postId}`;
  const encodedUrl = encodeURIComponent(fullPostUrl);
  const encodedText = encodeURIComponent(
    `Check out this post by ${authorUsername}: ${postContent.slice(0, 100)}${postContent.length > 100 ? '...' : ''}`
  );

  // Generate embed code
  const embedCode = `<iframe src="${fullPostUrl}/embed" width="500" height="300" frameborder="0"></iframe>`;

  // Copy to clipboard helper with share tracking
  const copyToClipboard = async (text: string, type: 'link' | 'embed') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates((prev) => ({ ...prev, [type]: true }));

      // Track the share
      if (onShare) {
        await onShare(type);
      }

      // Set last share action for toast
      setLastShareAction(type);

      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [type]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedStates((prev) => ({ ...prev, [type]: true }));

      // Track the share
      if (onShare) {
        await onShare(type);
      }

      // Set last share action for toast
      setLastShareAction(type);

      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [type]: false }));
      }, 2000);
    }
  };

  // Popular sharing platforms
  const popularPlatforms = [
    {
      name: 'twitter',
      displayName: 'Twitter',
      icon: <Twitter size={18} />,
      url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      color: 'text-[#1DA1F2]',
    },
    {
      name: 'facebook',
      displayName: 'Facebook',
      icon: <Facebook size={18} />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'text-[#1877F2]',
    },
  ];

  const handleShare = async (platform: (typeof popularPlatforms)[0]) => {
    // Track the share first
    if (onShare) {
      await onShare(platform.name);
    }

    // Set last share action for toast
    setLastShareAction(platform.name);

    // Then open the sharing window
    window.open(platform.url, '_blank', 'noopener,noreferrer');
    setOpen(false);
  };

  // Native share API for more options
  const handleMoreOptions = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${authorUsername}`,
          text: postContent,
          url: fullPostUrl,
        });

        // Track native share
        if (onShare) {
          await onShare('native');
        }

        // Set last share action for toast
        setLastShareAction('native');
        setOpen(false);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="max-h-[70vh]">
        <DrawerHeader className="pb-4">
          <DrawerTitle className="text-text flex items-center gap-2">
            <Share size={18} />
            Share Post
          </DrawerTitle>
        </DrawerHeader>

        <div className="space-y-4 px-4 pb-6">
          {/* Primary Actions */}
          <div className="space-y-2">
            {/* Copy Link */}
            <button
              onClick={() => copyToClipboard(fullPostUrl, 'link')}
              className="hover:bg-surface-elevated flex w-full items-center gap-3 rounded-lg p-3 transition-colors"
            >
              {copiedStates.link ? (
                <Check size={18} className="text-success" />
              ) : (
                <Link size={18} className="text-text-muted" />
              )}
              <span className="text-text font-medium">
                {copiedStates.link ? 'Link Copied!' : 'Copy Link'}
              </span>
            </button>

            {/* Get Embed Code */}
            <button
              onClick={() => copyToClipboard(embedCode, 'embed')}
              className="hover:bg-surface-elevated flex w-full items-center gap-3 rounded-lg p-3 transition-colors"
            >
              {copiedStates.embed ? (
                <Check size={18} className="text-success" />
              ) : (
                <Code size={18} className="text-text-muted" />
              )}
              <span className="text-text font-medium">
                {copiedStates.embed ? 'Embed Code Copied!' : 'Get Embed Code'}
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="border-border-subtle border-t"></div>

          {/* Popular Platforms */}
          <div className="space-y-2">
            {popularPlatforms.map((platform) => (
              <button
                key={platform.name}
                onClick={() => handleShare(platform)}
                className="hover:bg-surface-elevated flex w-full items-center gap-3 rounded-lg p-3 transition-colors"
              >
                <span className={platform.color}>{platform.icon}</span>
                <span className="text-text font-medium">Share on {platform.displayName}</span>
              </button>
            ))}
          </div>

          {/* More Options */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <>
              <div className="border-border-subtle border-t"></div>
              <button
                onClick={handleMoreOptions}
                className="hover:bg-surface-elevated flex w-full items-center gap-3 rounded-lg p-3 transition-colors"
              >
                <MoreHorizontal size={18} className="text-text-muted" />
                <span className="text-text font-medium">More Options</span>
              </button>
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ShareDrawer;
