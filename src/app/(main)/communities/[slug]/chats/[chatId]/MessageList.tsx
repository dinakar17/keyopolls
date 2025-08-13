import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import { MessageCircle } from 'lucide-react';

import { MentorDetails, TimelineItemSchema } from '@/api/schemas';

import MessageItem from './MessageItem';

interface MessageListProps {
  timelineItems: TimelineItemSchema[];
  mentorData: MentorDetails | undefined;
  onRefresh: () => void;
}

const MessageList = ({ timelineItems, mentorData, onRefresh }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const formatDate = useCallback((date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [timelineItems, scrollToBottom]);

  // Group timeline items by date
  const itemsByDate = useMemo(() => {
    const groups: Record<string, TimelineItemSchema[]> = {};

    // Sort timeline items by created_at (oldest first)
    const sortedItems = [...timelineItems].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    sortedItems.forEach((item) => {
      const date = new Date(item.created_at);
      const dateKey = date.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(item);
    });

    return groups;
  }, [timelineItems]);

  return (
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto scroll-smooth p-4"
      style={{
        backgroundImage:
          'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cpattern id="chat-bg" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse"%3E%3Cpath d="M0 0h100v100H0z" fill="%23f5f5f5"/%3E%3Cpath d="M20 20h60v60H20z" fill="none" stroke="%23e0e0e0" stroke-width="0.5" opacity="0.3"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100%25" height="100%25" fill="url(%23chat-bg)"/%3E%3C/svg%3E")',
        backgroundSize: '100px 100px',
      }}
    >
      {Object.entries(itemsByDate).map(([dateKey, itemsForDate]) => (
        <div key={dateKey}>
          {/* Date separator */}
          <div className="mb-4 flex justify-center">
            <div className="bg-surface-elevated text-text-secondary rounded-full px-3 py-1 text-xs font-medium">
              {formatDate(new Date(dateKey))}
            </div>
          </div>

          {/* Timeline items for this date */}
          {itemsForDate.map((item) => (
            <MessageItem key={item.id} timelineItem={item} onRefresh={onRefresh} />
          ))}
        </div>
      ))}

      {/* Empty state */}
      {timelineItems.length === 0 && (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="bg-surface-elevated mb-4 rounded-full p-6">
              <MessageCircle className="text-text-secondary mx-auto h-12 w-12" />
            </div>
            <h3 className="text-text mb-2 text-lg font-medium">Start a conversation</h3>
            <p className="text-text-secondary text-sm">
              Send a message to {mentorData?.display_name || 'start chatting'}
            </p>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
