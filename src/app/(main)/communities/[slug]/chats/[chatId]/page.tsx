'use client';

import React, { useState } from 'react';

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
  const { accessToken } = useProfileStore();

  const [showMentorInfo, setShowMentorInfo] = useState(false);
  const [showComingSoonPopup, setShowComingSoonPopup] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState('');

  // Get mentor details for header
  const { data: mentorData } = useKeyopollsChatsApiMessagesGetMentorDetails(String(chatId), {
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
    isLoading,
    refetch,
  } = useKeyopollsChatsApiMessagesGetTimelineItems(
    {
      chat_id: String(chatId),
      page: 1,
      per_page: 100,
      include_broadcasts: true,
    },
    {
      request: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
      query: {
        enabled: !!accessToken && !!chatId,
        refetchInterval: 5000,
      },
    }
  );

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

  if (isLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
          <div className="text-lg font-medium">Loading conversation...</div>
        </div>
      </div>
    );
  }

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
            onClick={() => setShowMentorInfo(true)}
            className="hover:bg-surface-elevated flex items-center gap-3 rounded-lg p-2 transition-colors"
          >
            <div className="relative">
              {mentorData?.data?.avatar ? (
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
              {mentorData?.data?.is_online && (
                <div className="bg-success border-surface absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2" />
              )}
              <div className="bg-warning border-surface absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2">
                <Crown className="h-2.5 w-2.5 text-white" />
              </div>
            </div>

            <div className="text-left">
              <h3 className="text-text text-sm font-semibold">
                {mentorData?.data?.display_name || 'Mentor'}
              </h3>
              <p className="text-text-secondary text-xs">
                {mentorData?.data?.is_online
                  ? 'Online'
                  : getLastSeenText(mentorData?.data?.last_seen)}
              </p>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => handleFeatureClick('voice')}
            className="text-text-secondary hover:text-primary hover:bg-surface-elevated rounded-full p-2 transition-colors"
          >
            <Phone className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleFeatureClick('video')}
            className="text-text-secondary hover:text-primary hover:bg-surface-elevated rounded-full p-2 transition-colors"
          >
            <Video className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleFeatureClick('live-chat')}
            className="text-text-secondary hover:text-primary hover:bg-surface-elevated rounded-full p-2 transition-colors"
          >
            <MessageSquare className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages List */}
      <MessageList
        timelineItems={timelineData?.data?.timeline_items || []}
        mentorData={mentorData?.data}
        onRefresh={refetch}
      />

      {/* Message Input */}
      <MessageInput chatId={String(chatId)} onMessageSent={refetch} />

      {/* Mentor Info Modal */}
      {showMentorInfo && (
        <div className="bg-background/80 fixed inset-0 z-50 flex items-end justify-center backdrop-blur-sm">
          <div className="bg-surface border-border max-h-[80vh] w-full max-w-md overflow-y-auto rounded-t-xl border-t shadow-xl">
            {/* Header */}
            <div className="border-border flex items-center justify-between border-b p-4">
              <h2 className="text-text text-lg font-semibold">Mentor Info</h2>
              <button
                onClick={() => setShowMentorInfo(false)}
                className="text-text-muted hover:text-text hover:bg-surface-elevated rounded-full p-1.5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Mentor Info Content */}
            <div className="p-6">
              {/* Avatar and Name */}
              <div className="mb-6 text-center">
                <div className="relative mx-auto mb-4 w-24">
                  {mentorData?.data?.avatar ? (
                    <Image
                      src={mentorData.data.avatar}
                      alt={mentorData.data.display_name}
                      className="h-24 w-24 rounded-full object-cover"
                      width={96}
                      height={96}
                    />
                  ) : (
                    <div className="bg-surface-elevated flex h-24 w-24 items-center justify-center rounded-full">
                      <span className="text-text text-2xl font-medium">
                        {mentorData?.data?.display_name?.charAt(0)?.toUpperCase() || 'M'}
                      </span>
                    </div>
                  )}
                  <div className="bg-warning border-surface absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2">
                    <Crown className="h-4 w-4 text-white" />
                  </div>
                </div>

                <h3 className="text-text mb-1 text-xl font-semibold">
                  {mentorData?.data?.display_name || 'Mentor'}
                </h3>
                <p className="text-text-secondary text-sm">
                  @{mentorData?.data?.username || 'mentor'}
                </p>

                <div className="bg-warning/10 text-warning mt-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium">
                  <Crown className="h-4 w-4" />
                  Mentor
                </div>
              </div>

              {/* Status */}
              <div className="mb-6">
                <h4 className="text-text mb-2 text-sm font-semibold">Status</h4>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      mentorData?.data?.is_online ? 'bg-success' : 'bg-text-secondary'
                    }`}
                  />
                  <span className="text-text-secondary text-sm">
                    {mentorData?.data?.is_online
                      ? 'Online'
                      : getLastSeenText(mentorData?.data?.last_seen)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <h4 className="text-text text-sm font-semibold">Quick Actions</h4>

                <button
                  onClick={() => {
                    handleFeatureClick('voice');
                    setShowMentorInfo(false);
                  }}
                  className="border-border bg-surface hover:bg-surface-elevated flex w-full items-center gap-3 rounded-lg border p-3 transition-colors"
                >
                  <Phone className="text-primary h-5 w-5" />
                  <span className="text-text text-sm font-medium">Voice Call</span>
                </button>

                <button
                  onClick={() => {
                    handleFeatureClick('video');
                    setShowMentorInfo(false);
                  }}
                  className="border-border bg-surface hover:bg-surface-elevated flex w-full items-center gap-3 rounded-lg border p-3 transition-colors"
                >
                  <Video className="text-primary h-5 w-5" />
                  <span className="text-text text-sm font-medium">Video Call</span>
                </button>

                <button
                  onClick={() => {
                    handleFeatureClick('live-chat');
                    setShowMentorInfo(false);
                  }}
                  className="border-border bg-surface hover:bg-surface-elevated flex w-full items-center gap-3 rounded-lg border p-3 transition-colors"
                >
                  <MessageSquare className="text-primary h-5 w-5" />
                  <span className="text-text text-sm font-medium">Live Chat</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
