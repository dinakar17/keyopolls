import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { MessageCircle } from 'lucide-react';

import { MentorDetails, TimelineItemSchema } from '@/api/schemas';

import AttachmentGallery from './AttachmentGallery';
import MessageItem from './MessageItem';

interface MessageListProps {
  timelineItems: TimelineItemSchema[];
  mentorData: MentorDetails | undefined;
  onRefresh: () => void;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
}

const MessageList = ({
  timelineItems,
  mentorData,
  onRefresh,
  onLoadMore,
  hasMore,
  isLoadingMore,
}: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Gallery state
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedAttachmentIndex, setSelectedAttachmentIndex] = useState(0);
  const [selectedMessageId, setSelectedMessageId] = useState('');

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

  // Handle attachment click
  const handleAttachmentClick = useCallback((attachmentIndex: number, messageId: string) => {
    setSelectedAttachmentIndex(attachmentIndex);
    setSelectedMessageId(messageId);
    setGalleryOpen(true);
  }, []);

  // Handle go to message from gallery
  const handleGoToMessage = useCallback((messageId: string) => {
    const messageElement = messageRefs.current.get(messageId);
    if (messageElement) {
      messageElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      // Highlight the message briefly
      messageElement.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
      messageElement.style.transition = 'background-color 0.3s ease';

      setTimeout(() => {
        messageElement.style.backgroundColor = 'transparent';
      }, 2000);
    }
  }, []);

  // Set ref for messages
  const setMessageRef = useCallback((messageId: string, element: HTMLDivElement | null) => {
    if (element) {
      messageRefs.current.set(messageId, element);
    } else {
      messageRefs.current.delete(messageId);
    }
  }, []);

  return (
    <>
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
              <div key={item.id} ref={(el) => setMessageRef(item.id, el)}>
                <MessageItem
                  timelineItem={item}
                  onRefresh={onRefresh}
                  onAttachmentClick={handleAttachmentClick}
                />
              </div>
            ))}
          </div>
        ))}

        {/* Loading more indicator */}
        {isLoadingMore && (
          <div className="mb-4 flex justify-center">
            <div className="bg-surface-elevated rounded-full px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                <span className="text-text-secondary text-xs">Loading more messages...</span>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {timelineItems.length === 0 && !isLoadingMore && (
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

      {/* Attachment Gallery */}
      <AttachmentGallery
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        initialAttachmentIndex={selectedAttachmentIndex}
        initialMessageId={selectedMessageId}
        timelineItems={timelineItems}
        onLoadMore={onLoadMore}
        hasMore={hasMore}
        isLoading={isLoadingMore}
        onGoToMessage={handleGoToMessage}
      />
    </>
  );
};

export default MessageList;
