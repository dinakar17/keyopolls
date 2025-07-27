'use client';

import React from 'react';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  ChevronRight,
  Crown,
  Flag,
  Settings,
  Shield,
  Users,
} from 'lucide-react';

import { useKeyopollsCommunitiesApiGeneralGetCommunity } from '@/api/communities-general/communities-general';
import { useProfileStore } from '@/stores/useProfileStore';

interface AdminOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  variant: 'default' | 'warning' | 'danger';
  disabled?: boolean;
}

const CommunityAdminPage = () => {
  const { accessToken } = useProfileStore();
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();

  // Fetch community data
  const {
    data: communityData,
    isLoading,
    error,
  } = useKeyopollsCommunitiesApiGeneralGetCommunity(slug, {
    request: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  const community = communityData?.data;
  const membership = community?.membership_details;

  // Check if user has admin permissions
  const isCreator = membership?.role === 'creator';
  const isAdmin = membership?.role === 'admin';
  const canManage = isCreator || isAdmin;

  const adminOptions: AdminOption[] = [
    {
      id: 'edit-details',
      title: 'Edit Community Details',
      description: 'Update description, rules, avatar, and banner',
      icon: <Settings size={20} />,
      href: `/communities/${slug}/admin/edit-community-details`,
      variant: 'default',
    },
    {
      id: 'manage-members',
      title: 'Manage Members',
      description: 'View members, assign roles, and handle membership',
      icon: <Users size={20} />,
      href: `/communities/${slug}/admin/members`,
      variant: 'default',
    },
    {
      id: 'moderation',
      title: 'Content Moderation',
      description: 'Review reported content and manage community posts',
      icon: <Shield size={20} />,
      href: `/communities/${slug}/admin/moderation`,
      variant: 'default',
    },
    {
      id: 'analytics',
      title: 'Community Analytics',
      description: 'View insights, engagement metrics, and growth data',
      icon: <BarChart3 size={20} />,
      href: `/communities/${slug}/admin/analytics`,
      variant: 'default',
    },
    {
      id: 'reports',
      title: 'Reports & Issues',
      description: 'Handle user reports and community violations',
      icon: <Flag size={20} />,
      href: `/communities/${slug}/admin/reports`,
      variant: 'warning',
    },
    ...(isCreator
      ? [
          {
            id: 'danger-zone',
            title: 'Danger Zone',
            description: 'Delete community or transfer ownership',
            icon: <AlertTriangle size={20} />,
            href: `/communities/${slug}/admin/danger`,
            variant: 'danger' as const,
          },
        ]
      : []),
  ];

  const handleOptionClick = (option: AdminOption) => {
    if (option.disabled) return;
    router.push(option.href);
  };

  const getOptionStyles = (variant: AdminOption['variant'], disabled: boolean = false) => {
    const baseStyles =
      'group relative flex items-center gap-4 rounded-xl border p-6 transition-all duration-200 cursor-pointer';

    if (disabled) {
      return `${baseStyles} border-border bg-surface-elevated cursor-not-allowed opacity-50`;
    }

    switch (variant) {
      case 'warning':
        return `${baseStyles} border-warning/20 bg-warning/5 hover:border-warning/30 hover:bg-warning/10 hover:shadow-sm`;
      case 'danger':
        return `${baseStyles} border-error/20 bg-error/5 hover:border-error/30 hover:bg-error/10 hover:shadow-sm`;
      default:
        return `${baseStyles} border-border bg-surface hover:border-border-subtle hover:bg-surface-elevated hover:shadow-sm`;
    }
  };

  const getIconStyles = (variant: AdminOption['variant']) => {
    switch (variant) {
      case 'warning':
        return 'text-warning bg-warning/10';
      case 'danger':
        return 'text-error bg-error/10';
      default:
        return 'text-primary bg-primary/10';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-background min-h-screen">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="animate-pulse">
            <div className="bg-surface-elevated mb-8 h-8 w-64 rounded"></div>
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-surface-elevated h-24 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-text mb-2 text-xl font-bold">Community not found</h2>
          <p className="text-text-secondary">The community you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  if (!canManage) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="bg-error/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <Shield className="text-error h-8 w-8" />
          </div>
          <h2 className="text-text mb-2 text-xl font-bold">Access Denied</h2>
          <p className="text-text-secondary">You don't have permission to access admin tools.</p>
          <button
            onClick={() => router.replace(`/communities/${slug}`)}
            className="bg-primary text-background mt-4 rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:opacity-90"
          >
            Back to Community
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/communities/${slug}`)}
            className="text-text-secondary hover:text-text mb-4 flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Community
          </button>

          <div className="flex items-center gap-4">
            {/* Community Avatar */}
            <div className="border-border bg-surface-elevated h-16 w-16 overflow-hidden rounded-full border-2 shadow-sm">
              {community.avatar ? (
                <Image
                  src={community.avatar}
                  alt={community.name}
                  className="h-full w-full object-cover"
                  width={64}
                  height={64}
                />
              ) : (
                <div className="bg-primary flex h-full w-full items-center justify-center">
                  <Users className="text-background h-6 w-6" />
                </div>
              )}
            </div>

            <div>
              <h1 className="text-text text-2xl font-bold">Community Admin</h1>
              <div className="text-text-secondary flex items-center gap-2 text-sm">
                <span>{community.name}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  {isCreator ? (
                    <Crown className="text-warning h-3 w-3" />
                  ) : (
                    <Shield className="text-primary h-3 w-3" />
                  )}
                  <span className="capitalize">{membership?.role}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Options Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {adminOptions.map((option) => (
            <div
              key={option.id}
              onClick={() => handleOptionClick(option)}
              className={getOptionStyles(option.variant, option.disabled)}
            >
              {/* Icon */}
              <div
                className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg ${getIconStyles(option.variant)}`}
              >
                {option.icon}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <h3 className="text-text group-hover:text-text font-semibold">{option.title}</h3>
                <p className="text-text-secondary group-hover:text-text mt-1 text-sm">
                  {option.description}
                </p>
              </div>

              {/* Arrow */}
              <ChevronRight
                className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-1 ${
                  option.disabled
                    ? 'text-text-muted'
                    : 'text-text-muted group-hover:text-text-secondary'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Help Section */}
        <div className="border-primary/20 bg-primary/5 mt-12 rounded-xl border p-6">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
              <Shield className="text-primary h-4 w-4" />
            </div>
            <div>
              <h3 className="text-text font-medium">Need Help?</h3>
              <p className="text-text-secondary mt-1 text-sm">
                Check out our community management guide or contact support if you need assistance
                with admin tools.
              </p>
              <div className="mt-3 flex gap-3">
                <button className="text-primary text-sm font-medium hover:opacity-80">
                  View Guide
                </button>
                <button className="text-primary text-sm font-medium hover:opacity-80">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityAdminPage;
