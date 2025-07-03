'use client';

import React from 'react';

import Image from 'next/image';

import { PollDetails } from '@/api/schemas';

interface StickyPollPreviewProps {
  poll: PollDetails;
  isVisible: boolean;
}

const StickyPollPreview: React.FC<StickyPollPreviewProps> = ({ poll, isVisible }) => {
  const truncateContent = (content: string, maxLength: number = 80) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  if (!isVisible) return null;

  return (
    <div
      className={`bg-background border-border-subtle fixed top-10 right-0 left-0 z-50 transform border-b transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="mx-auto max-w-2xl px-4 py-3">
        <div className="flex items-center space-x-3">
          {/* Content */}
          <div className="min-w-0 flex-1">
            <p className="text-text-secondary truncate text-sm">{truncateContent(poll.title)}</p>
            {/* dispaly likes count and comments */}
            <div className="text-text-muted mt-1 flex items-center space-x-2 text-xs">
              <span>{poll.total_votes || 0} Votes</span>
              <span>{poll.like_count || 0} Likes</span>
              <span>{poll.comment_count || 0} Comments</span>
            </div>
          </div>

          {/* Media preview */}
          {poll.options && poll.options.length > 0 && poll.options[0].image_url && (
            <div className="flex-shrink-0">
              <Image
                src={poll.options[0].image_url}
                alt="Media preview"
                className="h-10 w-10 rounded object-cover"
                width={40}
                height={40}
              />
              {poll.options.length > 1 && (
                <div className="bg-text text-background absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full text-xs">
                  {poll.options.length}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StickyPollPreview;
