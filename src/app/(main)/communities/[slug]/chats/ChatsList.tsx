'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import {
  Check,
  CheckCheck,
  Info,
  MessageCircle,
  Phone,
  Search,
  User,
  Users,
  Video,
  X,
} from 'lucide-react';

import { useKeyopollsChatsApiGetChatUsers } from '@/api/chats/chats';
import { ChatUserItemSchema } from '@/api/schemas';
import { useProfileStore } from '@/stores/useProfileStore';

// Loading Skeleton Components
const ChatItemSkeleton = () => (
  <div className="flex animate-pulse items-center gap-3 p-4">
    <div className="bg-surface-elevated h-12 w-12 flex-shrink-0 rounded-full" />
    <div className="flex-1 space-y-2">
      <div className="flex items-center justify-between">
        <div className="bg-surface-elevated h-4 w-32 rounded" />
        <div className="bg-surface-elevated h-3 w-12 rounded" />
      </div>
      <div className="bg-surface-elevated h-3 w-3/4 rounded" />
    </div>
    <div className="flex flex-col items-center gap-1">
      <div className="bg-surface-elevated h-5 w-5 rounded-full" />
    </div>
  </div>
);

const ChatsSkeleton = () => (
  <div>
    {[...Array(8)].map((_, i) => (
      <div key={i} className={`${i < 7 ? 'border-border-subtle border-b' : ''}`}>
        <ChatItemSkeleton />
      </div>
    ))}
  </div>
);

// Filter options
const FILTER_OPTIONS = [
  { id: 'all', label: 'All', unread_only: false },
  { id: 'unread', label: 'Unread', unread_only: true },
];

interface ChatsListProps {
  communityId: number;
  communitySlug: string;
}

const ChatsList = ({ communityId, communitySlug }: ChatsListProps) => {
  const { accessToken } = useProfileStore();
  const router = useRouter();
  const observerRef = useRef(null);
  const loadingRef = useRef(false);

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ChatUserItemSchema | null>(null);

  // Pagination state
  const [chatUsers, setChatUsers] = useState<ChatUserItemSchema[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Get current filter settings
  const currentFilterOption = FILTER_OPTIONS.find((f) => f.id === activeFilter);
  const unreadOnly = currentFilterOption?.unread_only || false;

  // Fetch chat users data
  const {
    data: chatUsersData,
    isLoading: chatUsersLoading,
    error: chatUsersError,
    refetch: refetchChatUsers,
  } = useKeyopollsChatsApiGetChatUsers(
    {
      page: currentPage,
      per_page: 20,
      community_id: communityId || 0,
      search: searchQuery || undefined,
      unread_only: unreadOnly || undefined,
    },
    {
      request: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      query: {
        enabled: !!communityId, // Only fetch when we have community ID
      },
    }
  );

  // Handle API response and pagination
  useEffect(() => {
    if (chatUsersData?.data) {
      const newUsers = chatUsersData.data.users || [];

      if (currentPage === 1) {
        // First page - replace data
        setChatUsers(newUsers);
      } else {
        // Subsequent pages - append data
        setChatUsers((prev) => [...prev, ...newUsers]);
      }

      setHasNextPage(chatUsersData.data.has_next || false);
      setTotalCount(chatUsersData.data.total_count || 0);
      setIsLoadingMore(false);
      loadingRef.current = false;
    }
  }, [chatUsersData, currentPage]);

  // Debounced search effect
  useEffect(() => {
    const debounce = setTimeout(() => {
      if (communityId && currentPage === 1) {
        refetchChatUsers();
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery, activeFilter, communityId, refetchChatUsers, currentPage]);

  // Load more function
  const loadMore = useCallback(() => {
    if (hasNextPage && !isLoadingMore && !chatUsersLoading && !loadingRef.current) {
      loadingRef.current = true;
      setIsLoadingMore(true);
      setCurrentPage((prev) => prev + 1);
    }
  }, [hasNextPage, isLoadingMore, chatUsersLoading]);

  // Infinite scroll effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          loadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px',
      }
    );

    const currentObserverRef = observerRef.current;
    if (currentObserverRef) {
      observer.observe(currentObserverRef);
    }

    return () => {
      if (currentObserverRef) {
        observer.unobserve(currentObserverRef);
      }
    };
  }, [loadMore]);

  // Helper function to get display text for message types
  const getMessageTypeDisplay = useCallback((messageType: string) => {
    const displays: Record<string, string> = {
      voice_call: 'Voice call',
      video_call: 'Video call',
      image: 'Photo',
      video: 'Video',
      document: 'Document',
      audio: 'Voice message',
    };
    return displays[messageType] || messageType;
  }, []);

  // Avatar modal handlers
  const handleAvatarClick = useCallback((user: ChatUserItemSchema) => {
    setSelectedUser(user);
    setShowAvatarModal(true);
  }, []);

  const handleChatClick = useCallback(
    (user: ChatUserItemSchema) => {
      // If chat exists, go to existing chat, otherwise create new one
      if (user.chat_id) {
        router.push(`/communities/${communitySlug}/chats/${user.chat_id}`);
      } else {
        // For new chats, we might want to create the chat first or handle differently
        router.push(
          `/communities/${communitySlug}/chats/new?userId=${user.user_id}&communityId=${communityId}`
        );
      }
    },
    [communitySlug, router, communityId]
  );

  const handleChatFromModal = useCallback(() => {
    if (selectedUser) {
      setShowAvatarModal(false);
      handleChatClick(selectedUser);
    }
  }, [selectedUser, handleChatClick]);

  const handleInfoFromModal = useCallback(() => {
    if (selectedUser) {
      setShowAvatarModal(false);
      router.push(`/communities/${communitySlug}/moderators/${selectedUser.username}`);
    }
  }, [selectedUser, communitySlug, router]);

  // Helper functions
  const formatTime = useCallback((date: Date | null) => {
    if (!date) return '';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, []);

  const getLastMessageText = useCallback(
    (user: ChatUserItemSchema) => {
      if (!user.last_message) return 'Start a conversation';

      const lastMessage = user.last_message;
      const prefix = lastMessage.sender_id !== user.user_id ? 'You: ' : '';

      switch (lastMessage.message_type) {
        case 'text':
          return `${prefix}${lastMessage.content}`;
        case 'image':
          return `${prefix}📷 Photo`;
        case 'video':
          return `${prefix}🎥 Video`;
        case 'audio':
          return `${prefix}🎵 Voice message`;
        case 'document':
          return `${prefix}📄 Document`;
        case 'voice_call':
        case 'video_call':
          return `${prefix}📞 ${lastMessage.content || getMessageTypeDisplay(lastMessage.message_type)}`;
        default:
          return `${prefix}${lastMessage.content || getMessageTypeDisplay(lastMessage.message_type)}`;
      }
    },
    [getMessageTypeDisplay]
  );

  const getMessageStatusIcon = useCallback((user: ChatUserItemSchema) => {
    if (!user.last_message || user.last_message.sender_id === user.user_id) return null;

    if (user.last_message.is_read) {
      return <CheckCheck className="text-primary h-4 w-4" />;
    } else {
      return <Check className="text-text-secondary h-4 w-4" />;
    }
  }, []);

  // Avatar Modal Component
  const AvatarModal = useCallback(() => {
    if (!selectedUser) return null;

    return (
      <div className="bg-background/90 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
        <div className="bg-surface border-border relative max-w-sm rounded-xl border shadow-xl">
          {/* Close button */}
          <button
            onClick={() => setShowAvatarModal(false)}
            className="text-text-secondary hover:text-text absolute top-4 right-4 z-10 rounded-full bg-black/20 p-2 backdrop-blur-sm transition-colors"
          >
            <X size={20} />
          </button>

          {/* Avatar Image */}
          <div className="aspect-square w-80">
            {selectedUser.avatar ? (
              <Image
                src={selectedUser.avatar}
                alt={selectedUser.username}
                className="h-full w-full rounded-t-xl object-cover"
                width={320}
                height={320}
              />
            ) : (
              <div className="bg-surface-elevated flex h-full w-full items-center justify-center rounded-t-xl">
                <Users className="text-text-muted h-24 w-24" />
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="p-4">
            <div className="mb-4 text-center">
              <h3 className="text-text text-lg font-semibold">{selectedUser.display_name}</h3>
              <p className="text-text-secondary text-sm">@{selectedUser.username}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleChatFromModal}
                className="bg-primary text-background flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium transition-opacity hover:opacity-90"
              >
                <MessageCircle className="h-5 w-5" />
                Chat
              </button>
              <button
                onClick={handleInfoFromModal}
                className="border-border bg-surface-elevated text-text hover:bg-surface flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-3 font-medium transition-colors"
              >
                <Info className="h-5 w-5" />
                Info
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }, [selectedUser, handleChatFromModal, handleInfoFromModal]);

  // Show error state for chat users
  if (chatUsersError) {
    return (
      <div className="px-4 py-6">
        <div className="py-12 text-center">
          <div className="bg-surface-elevated mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <X className="text-error h-8 w-8" />
          </div>
          <h3 className="text-text mb-2 text-lg font-semibold">Failed to load chats</h3>
          <p className="text-text-secondary mx-auto mb-4 max-w-sm text-sm">
            There was an error loading the chat users. Please try again.
          </p>
          <button
            onClick={() => refetchChatUsers()}
            className="bg-primary text-background rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4">
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="text-text-secondary absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search conversations..."
          className="border-border focus:border-primary bg-surface-elevated text-text placeholder-text-muted focus:ring-primary/20 w-full rounded-lg border py-2.5 pr-4 pl-10 text-sm focus:ring-2 focus:outline-none"
        />
      </div>

      {/* WhatsApp-style Filter Tiles */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
        {FILTER_OPTIONS.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeFilter === filter.id
                ? 'bg-primary text-background'
                : 'bg-surface-elevated text-text-secondary hover:text-text hover:bg-surface'
            }`}
          >
            {filter.label}
            {filter.id === 'unread' &&
              totalCount > 0 &&
              activeFilter !== 'unread' &&
              (() => {
                const unreadCount = chatUsers.filter((user) => (user.unread_count || 0) > 0).length;
                return unreadCount > 0 ? (
                  <span className="bg-error text-background ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs">
                    {unreadCount}
                  </span>
                ) : null;
              })()}
          </button>
        ))}
      </div>

      {/* Chats List */}
      <div>
        {chatUsersLoading && currentPage === 1 ? (
          <ChatsSkeleton />
        ) : chatUsers.length === 0 ? (
          <div className="py-12 text-center">
            <div className="bg-surface-elevated mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <MessageCircle className="text-text-secondary h-8 w-8" />
            </div>
            <h3 className="text-text mb-2 text-lg font-semibold">
              {searchQuery
                ? 'No conversations found'
                : activeFilter === 'unread'
                  ? 'No unread messages'
                  : 'No conversations yet'}
            </h3>
            <p className="text-text-secondary mx-auto max-w-sm text-sm">
              {searchQuery
                ? `No conversations match "${searchQuery}".`
                : activeFilter === 'unread'
                  ? 'All caught up! No unread messages.'
                  : 'Start chatting with mentors and community members.'}
            </p>
          </div>
        ) : (
          <>
            {chatUsers.map((user, index) => (
              <div
                key={user.user_id}
                className={`hover:bg-surface-elevated/50 flex items-center gap-3 p-4 transition-colors ${
                  index < chatUsers.length - 1 ? 'border-border-subtle border-b' : ''
                }`}
              >
                {/* Avatar with online status - clickable */}
                <div className="relative flex-shrink-0">
                  <button onClick={() => handleAvatarClick(user)} className="group relative block">
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.display_name}
                        className="h-12 w-12 rounded-full object-cover transition-opacity group-hover:opacity-90"
                        width={48}
                        height={48}
                      />
                    ) : (
                      <div className="bg-surface-elevated group-hover:bg-surface flex h-12 w-12 items-center justify-center rounded-full transition-colors">
                        <User className="text-text-muted h-6 w-6" />
                      </div>
                    )}
                    {/* Online status indicator */}
                    {user.is_online && (
                      <div className="bg-success border-background absolute -right-0.5 -bottom-0.5 h-4 w-4 rounded-full border-2" />
                    )}
                  </button>
                </div>

                {/* Chat content - clickable */}
                <div
                  className="min-w-0 flex-1 cursor-pointer"
                  onClick={() => handleChatClick(user)}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-text truncate font-semibold">{user.username}</h3>
                    </div>
                    <div className="flex items-center gap-1">
                      {getMessageStatusIcon(user)}
                      <span className="text-text-secondary text-xs">
                        {user.last_message
                          ? formatTime(new Date(user.last_message.created_at))
                          : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-text-secondary truncate text-sm">
                      {getLastMessageText(user)}
                    </p>
                    <div className="flex items-center gap-2">
                      {/* Quick action buttons */}
                      {user.is_mentor && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle voice call
                            }}
                            className="text-text-secondary hover:text-primary hover:bg-surface-elevated rounded-full p-1.5 transition-colors"
                          >
                            <Phone className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle video call
                            }}
                            className="text-text-secondary hover:text-primary hover:bg-surface-elevated rounded-full p-1.5 transition-colors"
                          >
                            <Video className="h-4 w-4" />
                          </button>
                        </>
                      )}

                      {/* Unread count */}
                      {user.unread_count && user.unread_count > 0 && (
                        <div className="bg-primary text-background flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium">
                          {user.unread_count > 99 ? '99+' : user.unread_count}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Infinite scroll trigger */}
            {hasNextPage && (
              <div ref={observerRef} className="py-4">
                {isLoadingMore ? (
                  <div className="text-center">
                    <div className="border-primary mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"></div>
                    <p className="text-text-secondary text-xs">Loading more conversations...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-text-secondary text-xs">Scroll for more</p>
                  </div>
                )}
              </div>
            )}

            {/* End of list indicator */}
            {!hasNextPage && chatUsers.length > 0 && (
              <div className="py-6 text-center">
                <p className="text-text-secondary text-xs">
                  You've seen all {totalCount} conversations
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Avatar Modal */}
      {showAvatarModal && <AvatarModal />}
    </div>
  );
};

export default ChatsList;
