'use client';

import React, { JSX, useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  ArrowLeft,
  AtSign,
  Bell,
  Bookmark,
  CheckCircle,
  Eye,
  Heart,
  MessageCircle,
  RefreshCw,
  Search,
  Share,
  SlidersHorizontal,
  Sparkles,
  Star,
  Trash2,
  UserPlus,
} from 'lucide-react';

import {
  useKeyopollsNotificationsApiGeneralDeleteNotification,
  useKeyopollsNotificationsApiGeneralGetNotifications,
  useKeyopollsNotificationsApiGeneralGetNotificationsSummary,
  useKeyopollsNotificationsApiGeneralMarkAllNotificationsRead,
  useKeyopollsNotificationsApiGeneralMarkNotificationRead,
} from '@/api/notifications/notifications';
import { AuthorSchema, NotificationSchema } from '@/api/schemas';
import BottomNavigation from '@/components/common/BottomNavigation';
import toast from '@/components/ui/toast';
import { useProfileStore } from '@/stores/useProfileStore';
import { formatDate } from '@/utils';

const KeyoPollsInboxPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    unread_only: false,
    recent_only: false,
    priority: '',
    notification_type: '',
  });

  const { accessToken, isAuthenticated } = useProfileStore();

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error('You must be logged in to access your inbox.');
      router.push('/auth');
      return;
    }
  }, [isAuthenticated, router]);

  // Build headers for API calls
  const getHeaders = () => {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };
    return headers;
  };

  // Helper function to map tab to notification type
  interface TabMap {
    [key: string]: string;
  }

  const getNotificationTypeFromTab = (tab: string): string => {
    const tabMap: TabMap = {
      mentions: 'mention',
      likes: 'like',
      comments: 'comment',
      follows: 'follow',
      milestones: 'like_milestone',
    };
    return tabMap[tab] || '';
  };

  // Get notifications with filters
  const {
    data: notificationsData,
    isLoading: notificationsLoading,
    error: notificationsError,
    refetch: refetchNotifications,
  } = useKeyopollsNotificationsApiGeneralGetNotifications(
    {
      page: 1,
      page_size: 50,
      ...filters,
      ...(searchQuery && { search: searchQuery }),
      ...(activeTab !== 'all' && { notification_type: getNotificationTypeFromTab(activeTab) }),
    },
    {
      request: {
        headers: getHeaders(),
      },
      query: {
        enabled: isAuthenticated(),
      },
    }
  );

  // Get summary data
  const { data: summaryData } = useKeyopollsNotificationsApiGeneralGetNotificationsSummary({
    request: {
      headers: getHeaders(),
    },
    query: {
      enabled: isAuthenticated(),
    },
  });

  // Mark single notification as read
  const { mutate: markAsRead } = useKeyopollsNotificationsApiGeneralMarkNotificationRead({
    request: {
      headers: getHeaders(),
    },
    mutation: {
      onSuccess: () => {
        refetchNotifications();
      },
    },
  });

  // Mark all notifications as read
  const { mutate: markAllAsRead, isPending: markingAllAsRead } =
    useKeyopollsNotificationsApiGeneralMarkAllNotificationsRead({
      request: {
        headers: getHeaders(),
      },
      mutation: {
        onSuccess: () => {
          refetchNotifications();
        },
      },
    });

  // Delete notification
  const { mutate: deleteNotification } = useKeyopollsNotificationsApiGeneralDeleteNotification({
    request: {
      headers: getHeaders(),
    },
    mutation: {
      onSuccess: () => {
        refetchNotifications();
      },
    },
  });

  // Get notification tabs with counts from summary
  const getNotificationTabs = () => {
    const summary = summaryData?.data;
    const unreadCount = summary?.unread_count || 0;
    const totalCount = summary?.total_count || 0;
    const unreadByType = summary?.unread_by_type || {};

    return [
      {
        id: 'all',
        name: 'All',
        count: unreadCount,
        total: totalCount,
      },
      {
        id: 'likes',
        name: 'Likes',
        count: (unreadByType.like || 0) + (unreadByType.like_milestone || 0),
      },
      {
        id: 'comments',
        name: 'Comments',
        count: (unreadByType.comment || 0) + (unreadByType.reply || 0),
      },
    ];
  };

  // Get icon for notification type
  interface NotificationIconMap {
    [key: string]: JSX.Element;
  }

  const getNotificationIcon = (type: string): JSX.Element => {
    const iconMap: NotificationIconMap = {
      mention: <AtSign size={12} className="text-primary" />,
      like: <Heart size={12} className="text-error" />,
      comment: <MessageCircle size={12} className="text-primary" />,
      reply: <MessageCircle size={12} className="text-primary" />,
      follow: <UserPlus size={12} className="text-success" />,
      bookmark: <Bookmark size={12} className="text-warning" />,
      share: <Share size={12} className="text-secondary" />,
      view: <Eye size={12} className="text-text-muted" />,
      like_milestone: <Heart size={12} className="text-error" />,
      share_milestone: <Share size={12} className="text-secondary" />,
      view_milestone: <Eye size={12} className="text-text-muted" />,
      bookmark_milestone: <Bookmark size={12} className="text-warning" />,
      follower_milestone: <UserPlus size={12} className="text-success" />,
      verification: <CheckCircle size={12} className="text-success" />,
      welcome: <Sparkles size={12} className="text-primary" />,
      system: <Bell size={12} className="text-text-muted" />,
    };
    return iconMap[type] || <Bell size={12} className="text-text-muted" />;
  };

  // Get display name/initials from actor info
  const getActorDisplay = (actorInfo: AuthorSchema | null) => {
    if (!actorInfo) return { name: 'System', initials: 'SY' };

    const name = actorInfo.display_name || actorInfo.username || 'Unknown';
    const initials = name.length >= 2 ? name.substring(0, 2).toUpperCase() : 'UN';

    return { name, initials };
  };

  // Handle notification click
  const handleNotificationClick = (notification: NotificationSchema) => {
    // Mark as read if not already read
    if (!notification.is_read) {
      markAsRead({ notificationId: notification.id });
    }

    // Navigate to the click URL if available
    if (notification.click_url) {
      router.push(notification.click_url);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Extract data from API responses
  const notifications = notificationsData?.data?.notifications || [];
  const notificationTabs = getNotificationTabs();
  const hasNextPage = notificationsData?.data?.pagination?.has_next || false;
  const unreadCount = summaryData?.data?.unread_count || 0;

  console.log('Notifications Error', notificationsError);

  return (
    <div className="bg-background min-h-screen pb-16">
      {/* Header */}
      <header className="bg-background border-border-subtle sticky top-0 z-20 border-b">
        <div className="mx-auto max-w-2xl px-4">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center">
              <Link href="/">
                <button className="text-text-muted hover:bg-surface-elevated mr-3 rounded-full p-2 transition-colors">
                  <ArrowLeft size={18} />
                </button>
              </Link>
              <h1 className="text-text text-lg font-semibold">Inbox</h1>
              {unreadCount > 0 && (
                <span className="bg-error text-background ml-2 rounded-full px-2 py-0.5 text-xs font-medium">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <button
                className="text-text-muted hover:bg-surface-elevated rounded-full p-2 transition-colors"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal size={16} />
              </button>
              <button
                className="text-text-muted hover:bg-surface-elevated rounded-full p-2 transition-colors"
                onClick={() => refetchNotifications()}
                disabled={notificationsLoading}
              >
                <RefreshCw size={16} className={notificationsLoading ? 'animate-spin' : ''} />
              </button>
              {unreadCount > 0 && (
                <button
                  className="text-primary hover:bg-primary/10 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                  onClick={() => markAllAsRead({})}
                  disabled={markingAllAsRead}
                >
                  {markingAllAsRead ? 'Marking...' : 'Mark All Read'}
                </button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="pb-3">
            <div className="relative">
              <Search
                size={16}
                className="text-text-muted absolute top-1/2 left-3 -translate-y-1/2 transform"
              />
              <input
                type="text"
                placeholder="Search notifications..."
                className="border-border bg-surface-elevated text-text placeholder-text-muted focus:border-primary focus:ring-primary w-full rounded-lg border py-2 pr-4 pl-10 text-sm focus:ring-1 focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="border-border bg-surface-elevated mb-3 rounded-lg border p-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.unread_only}
                    onChange={(e) => handleFilterChange('unread_only', e.target.checked)}
                    className="border-border rounded"
                  />
                  <span className="text-text text-sm">Unread only</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.recent_only}
                    onChange={(e) => handleFilterChange('recent_only', e.target.checked)}
                    className="border-border rounded"
                  />
                  <span className="text-text text-sm">Recent only</span>
                </label>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="scrollbar-hide flex space-x-1 overflow-x-auto pb-3">
            {notificationTabs.map((tab) => (
              <button
                key={tab.id}
                className={`flex items-center rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-muted hover:text-text hover:bg-surface-elevated'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.name}
                {tab.count > 0 && (
                  <span
                    className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs font-medium ${
                      activeTab === tab.id
                        ? 'bg-primary text-background'
                        : 'bg-error text-background'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-2xl">
        {/* Loading Skeletons */}
        {notificationsLoading && (
          <div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="border-border-subtle flex animate-pulse space-x-3 border-b p-4"
              >
                {/* Avatar skeleton */}
                <div className="bg-surface-elevated h-10 w-10 flex-shrink-0 rounded-full"></div>

                {/* Content skeleton */}
                <div className="flex-1 space-y-2">
                  {/* Title row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="bg-surface-elevated h-3 w-3 rounded"></div>
                      <div className="bg-surface-elevated h-4 w-32 rounded"></div>
                    </div>
                    <div className="bg-surface-elevated h-3 w-12 rounded"></div>
                  </div>

                  {/* Message skeleton */}
                  <div className="space-y-1">
                    <div className="bg-surface-elevated h-4 w-full rounded"></div>
                    <div className="bg-surface-elevated h-4 w-3/4 rounded"></div>
                  </div>

                  {/* Action row skeleton */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="bg-surface-elevated h-3 w-16 rounded"></div>
                    <div className="bg-surface-elevated h-3 w-20 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {notificationsError && (
          <div className="border-error/20 bg-error/10 text-error mx-4 mt-4 rounded-lg border p-4 text-center">
            <p>
              Failed to load notifications:{' '}
              {notificationsError?.response?.data?.message || 'Please try again.'}
            </p>
          </div>
        )}

        {!notificationsLoading && !notificationsError && notifications.length === 0 && (
          <div className="py-12 text-center">
            <Bell size={40} className="text-text-muted mx-auto mb-4" />
            <h3 className="text-text mb-2 text-lg font-medium">No notifications yet</h3>
            <p className="text-text-secondary">
              {activeTab === 'all'
                ? "You're all caught up! New notifications will appear here."
                : `No ${activeTab} notifications found.`}
            </p>
          </div>
        )}

        {/* Notifications List */}
        {!notificationsLoading && !notificationsError && notifications.length > 0 && (
          <div>
            {notifications.map((notification) => {
              const actorDisplay = getActorDisplay(notification.actor_info || null);

              return (
                <div
                  key={notification.id}
                  className={`border-border-subtle hover:bg-surface-elevated/30 flex cursor-pointer space-x-3 border-b p-4 transition-colors ${
                    !notification.is_read ? 'border-l-primary bg-primary/5 border-l-4' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {/* User Avatar */}
                  <div className="flex-shrink-0">
                    <div
                      className={`text-background flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium`}
                    >
                      {notification.actor_info?.avatar &&
                      typeof notification.actor_info.avatar === 'string' ? (
                        <Image
                          src={notification.actor_info.avatar}
                          alt={actorDisplay.name}
                          className="h-full w-full rounded-full object-cover"
                          width={40}
                          height={40}
                        />
                      ) : (
                        actorDisplay.initials
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-start justify-between">
                      <div className="flex min-w-0 flex-1 items-center space-x-2">
                        {getNotificationIcon(notification.notification_type)}
                        <span className="text-text truncate text-sm font-medium">
                          {notification.title}
                        </span>
                        {notification.priority === 'high' && (
                          <Star size={10} className="text-warning flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex flex-shrink-0 items-center space-x-2">
                        <span className="text-text-muted text-xs">
                          {formatDate(notification.created_at)}
                        </span>
                        <button
                          className="text-text-muted hover:text-text p-1 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification({ notificationId: notification.id });
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Message */}
                    <p className="text-text-secondary mb-2 text-sm leading-relaxed">
                      {notification.message}
                    </p>

                    {notification.target_info && (
                      <div className="border-border bg-surface-elevated mb-2 rounded-lg border p-2">
                        <p className="text-text-secondary mb-1 text-xs tracking-wide uppercase">
                          {notification.target_info.type}
                        </p>
                        <p className="text-text truncate text-sm font-medium">
                          {notification.target_info.title || notification.target_info.content}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {notification.click_url && (
                          <span className="text-primary text-xs">Tap to view</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {notification.push_sent && (
                          <div className="bg-success/10 text-success rounded px-2 py-0.5 text-xs">
                            Push sent
                          </div>
                        )}
                        {notification.email_sent && (
                          <div className="bg-secondary/10 text-secondary rounded px-2 py-0.5 text-xs">
                            Email sent
                          </div>
                        )}
                        {!notification.is_read && (
                          <button
                            className="text-text-muted hover:text-text flex items-center text-xs transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead({ notificationId: notification.id });
                            }}
                          >
                            <CheckCircle size={12} className="mr-1" />
                            Mark Read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More */}
        {notifications.length > 0 && hasNextPage && (
          <div className="py-6 text-center">
            <button className="border-border bg-surface-elevated text-text hover:bg-surface rounded-lg border px-6 py-2 font-medium transition-colors">
              Load More
            </button>
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default KeyoPollsInboxPage;
