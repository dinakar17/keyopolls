'use client';

import React, { useState } from 'react';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

import {
  Archive,
  ArrowLeft,
  Crown,
  Info,
  MoreVertical,
  Phone,
  Star,
  Trash2,
  Video,
  VolumeX,
  X,
} from 'lucide-react';

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
  const [showMoreMenu, setShowMoreMenu] = useState(false);

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
    if (!lastSeen) return 'Never seen';

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

  const handleCall = (type: 'voice' | 'video') => {
    if (mentorData?.data) {
      console.log(`Initiating ${type} call with ${mentorData.data.display_name}`);
    } else {
      console.log(`Mentor data is unavailable. Cannot initiate ${type} call.`);
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
            onClick={() => handleCall('voice')}
            className="text-text-secondary hover:text-primary hover:bg-surface-elevated rounded-full p-2 transition-colors"
          >
            <Phone className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleCall('video')}
            className="text-text-secondary hover:text-primary hover:bg-surface-elevated rounded-full p-2 transition-colors"
          >
            <Video className="h-5 w-5" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="text-text-secondary hover:text-text hover:bg-surface-elevated rounded-full p-2 transition-colors"
            >
              <MoreVertical className="h-5 w-5" />
            </button>

            {showMoreMenu && (
              <div className="bg-surface border-border absolute top-full right-0 z-10 mt-1 w-48 rounded-lg border shadow-lg">
                <button
                  onClick={() => {
                    setShowMentorInfo(true);
                    setShowMoreMenu(false);
                  }}
                  className="hover:bg-surface-elevated flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors"
                >
                  <Info className="h-4 w-4" />
                  Mentor info
                </button>
                <button className="hover:bg-surface-elevated flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors">
                  <Star className="h-4 w-4" />
                  Pin chat
                </button>
                <button className="hover:bg-surface-elevated flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors">
                  <VolumeX className="h-4 w-4" />
                  Mute notifications
                </button>
                <button className="hover:bg-surface-elevated flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors">
                  <Archive className="h-4 w-4" />
                  Archive chat
                </button>
                <hr className="border-border" />
                <button className="hover:bg-surface-elevated text-error flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors">
                  <Trash2 className="h-4 w-4" />
                  Delete chat
                </button>
              </div>
            )}
          </div>
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
                    handleCall('voice');
                    setShowMentorInfo(false);
                  }}
                  className="border-border bg-surface hover:bg-surface-elevated flex w-full items-center gap-3 rounded-lg border p-3 transition-colors"
                >
                  <Phone className="text-primary h-5 w-5" />
                  <span className="text-text text-sm font-medium">Voice Call</span>
                </button>

                <button
                  onClick={() => {
                    handleCall('video');
                    setShowMentorInfo(false);
                  }}
                  className="border-border bg-surface hover:bg-surface-elevated flex w-full items-center gap-3 rounded-lg border p-3 transition-colors"
                >
                  <Video className="text-primary h-5 w-5" />
                  <span className="text-text text-sm font-medium">Video Call</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside handler for dropdowns */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setShowMoreMenu(false)} />
      )}
    </div>
  );
};

export default ChatDetailPage;
