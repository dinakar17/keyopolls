'use client';

import React, { useCallback, useState } from 'react';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

import { ArrowLeft, Crown, MessageSquare, Phone, Video, X } from 'lucide-react';

import {
  useKeyopollsChatsApiMessagesGetMentorDetails,
  useKeyopollsChatsApiMessagesGetTimelineItems,
} from '@/api/chat-messages/chat-messages';
import { useProfileStore } from '@/stores/useProfileStore';

import MessageInput from './MessageInput';
import MessageList from './MessageList';

const ChatDetailPage = () => {
  const { chatId } = useParams();
  const router = useRouter();
  const { accessToken, profileData } = useProfileStore();

  const [showComingSoonPopup, setShowComingSoonPopup] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [allTimelineItems, setAllTimelineItems] = useState<any[]>([]);

  // Get mentor details for header
  const { data: mentorData, isLoading: mentorLoading } =
    useKeyopollsChatsApiMessagesGetMentorDetails(String(chatId), {
      request: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
      query: {
        enabled: !!accessToken && !!chatId,
      },
    });

  // Get timeline items (messages)
  const {
    data: timelineData,
    isLoading: timelineLoading,
    refetch,
    isFetching,
  } = useKeyopollsChatsApiMessagesGetTimelineItems(
    {
      chat_id: String(chatId),
      page: currentPage,
      per_page: 50,
      include_broadcasts: true,
    },
    {
      request: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
      query: {
        enabled: !!accessToken && !!chatId,
      },
    }
  );

  // Check if current user is a mentor
  const isMentor = profileData?.id === mentorData?.data?.id;

  // Handle timeline data updates
  React.useEffect(() => {
    if (timelineData?.data?.timeline_items) {
      if (currentPage === 1) {
        // Reset for new data
        setAllTimelineItems(timelineData.data.timeline_items);
      } else {
        // Append new data for pagination
        setAllTimelineItems((prev) => [...prev, ...timelineData.data.timeline_items]);
      }
    }
  }, [timelineData, currentPage]);

  // Load more messages
  const handleLoadMore = useCallback(() => {
    if (timelineData?.data?.has_next && !isFetching) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [timelineData?.data?.has_next, isFetching]);

  // Refresh messages (reset to page 1)
  const handleRefresh = useCallback(() => {
    setCurrentPage(1);
    setAllTimelineItems([]);
    refetch();
  }, [refetch]);

  // Navigate to profile page
  const handleProfileClick = useCallback(() => {
    if (mentorData?.data?.username) {
      router.push(`/profiles/${mentorData.data.username}`);
    }
  }, [mentorData?.data?.username, router]);

  const getLastSeenText = (lastSeen: string | null | undefined): string => {
    if (!lastSeen) return '';

    const now = new Date();
    const diffMs = now.getTime() - new Date(lastSeen).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Last seen just now';
    if (diffMins < 60) return `Last seen ${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `Last seen ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `Last seen ${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return `Last seen ${new Date(lastSeen).toLocaleDateString()}`;
  };

  const handleFeatureClick = (feature: 'voice' | 'video' | 'live-chat') => {
    setComingSoonFeature(feature);
    setShowComingSoonPopup(true);
  };

  const getFeatureDisplayName = (feature: string) => {
    switch (feature) {
      case 'voice':
        return 'Voice Call';
      case 'video':
        return 'Video Call';
      case 'live-chat':
        return 'Live Chat';
      default:
        return 'Feature';
    }
  };

  const displayItems =
    currentPage === 1 ? timelineData?.data?.timeline_items || [] : allTimelineItems;

  const isInitialLoading = timelineLoading && currentPage === 1;

  return (
    <div className="bg-background flex h-screen flex-col">
      {/* Header */}
      <div className="border-border bg-surface flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-text-secondary hover:text-text hover:bg-surface-elevated rounded-full p-2 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <button
            onClick={handleProfileClick}
            className="hover:bg-surface-elevated flex items-center gap-3 rounded-lg p-2 transition-colors"
            disabled={mentorLoading}
          >
            <div className="relative">
              {mentorLoading ? (
                <div className="bg-surface-elevated flex h-10 w-10 items-center justify-center rounded-full">
                  <div className="border-primary h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
                </div>
              ) : mentorData?.data?.avatar ? (
                <Image
                  src={mentorData.data.avatar}
                  alt={mentorData.data.display_name}
                  className="h-10 w-10 rounded-full object-cover"
                  width={40}
                  height={40}
                />
              ) : (
                <div className="bg-surface-elevated flex h-10 w-10 items-center justify-center rounded-full">
                  <span className="text-text text-sm font-medium">
                    {mentorData?.data?.display_name?.charAt(0)?.toUpperCase() || 'M'}
                  </span>
                </div>
              )}
              {!mentorLoading && mentorData?.data?.is_online && (
                <div className="bg-success border-surface absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2" />
              )}
              {!mentorLoading && (
                <div className="bg-warning border-surface absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2">
                  <Crown className="h-2.5 w-2.5 text-white" />
                </div>
              )}
            </div>

            <div className="text-left">
              {mentorLoading ? (
                <div className="space-y-1">
                  <div className="bg-surface-elevated h-4 w-20 animate-pulse rounded" />
                  <div className="bg-surface-elevated h-3 w-16 animate-pulse rounded" />
                </div>
              ) : (
                <>
                  <h3 className="text-text text-sm font-semibold">
                    {mentorData?.data?.display_name || 'Mentor'}
                  </h3>
                  <p className="text-text-secondary text-xs">
                    {mentorData?.data?.is_online
                      ? 'Online'
                      : getLastSeenText(mentorData?.data?.last_seen)}
                  </p>
                </>
              )}
            </div>
          </button>
        </div>

        {/* Action buttons - only show for non-mentors */}
        {!isMentor && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleFeatureClick('voice')}
              className="text-text-secondary hover:text-primary hover:bg-surface-elevated rounded-full p-2 transition-colors disabled:opacity-50"
              disabled={mentorLoading}
            >
              <Phone className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleFeatureClick('video')}
              className="text-text-secondary hover:text-primary hover:bg-surface-elevated rounded-full p-2 transition-colors disabled:opacity-50"
              disabled={mentorLoading}
            >
              <Video className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleFeatureClick('live-chat')}
              className="text-text-secondary hover:text-primary hover:bg-surface-elevated rounded-full p-2 transition-colors disabled:opacity-50"
              disabled={mentorLoading}
            >
              <MessageSquare className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Messages List with loading state */}
      <div className="relative flex flex-1 flex-col">
        {isInitialLoading && (
          <div className="bg-background/50 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-surface border-border rounded-lg border p-6 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
                <span className="text-text font-medium">Loading conversation...</span>
              </div>
            </div>
          </div>
        )}

        <MessageList
          timelineItems={displayItems}
          mentorData={mentorData?.data}
          onRefresh={handleRefresh}
          onLoadMore={handleLoadMore}
          hasMore={timelineData?.data?.has_next || false}
          isLoadingMore={isFetching && currentPage > 1}
        />
      </div>

      {/* Message Input */}
      <MessageInput
        chatId={String(chatId)}
        onMessageSent={handleRefresh}
        mentorData={mentorData?.data}
        // disabled={isInitialLoading}
      />

      {/* Coming Soon Popup */}
      {showComingSoonPopup && (
        <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-surface border-border mx-4 w-full max-w-md rounded-xl border shadow-xl">
            {/* Header */}
            <div className="border-border flex items-center justify-between border-b p-4">
              <h2 className="text-text text-lg font-semibold">Coming Soon!</h2>
              <button
                onClick={() => setShowComingSoonPopup(false)}
                className="text-text-muted hover:text-text hover:bg-surface-elevated rounded-full p-1.5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 text-center">
              <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                {comingSoonFeature === 'voice' && <Phone className="h-8 w-8" />}
                {comingSoonFeature === 'video' && <Video className="h-8 w-8" />}
                {comingSoonFeature === 'live-chat' && <MessageSquare className="h-8 w-8" />}
              </div>

              <h3 className="text-text mb-2 text-xl font-semibold">
                {getFeatureDisplayName(comingSoonFeature)} is Coming Soon!
              </h3>

              <p className="text-text-secondary mb-6 text-sm leading-relaxed">
                This exciting feature is currently in development. It's as simple as choosing the
                available slot and booking using credits available in your wallet.
              </p>

              <div className="bg-surface-elevated mb-4 rounded-lg p-4">
                <h4 className="text-text mb-2 text-sm font-semibold">How it will work:</h4>
                <ul className="text-text-secondary space-y-1 text-left text-xs">
                  <li>• Browse available time slots</li>
                  <li>• Select your preferred slot</li>
                  <li>• Pay with wallet credits</li>
                  <li>• Connect instantly</li>
                </ul>
              </div>

              <button
                onClick={() => setShowComingSoonPopup(false)}
                className="bg-primary text-background w-full rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatDetailPage;
