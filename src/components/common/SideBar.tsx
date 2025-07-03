'use client';

import React, { useEffect, useRef } from 'react';

import Link from 'next/link';

import { Bookmark, Palette, Settings, Users, X } from 'lucide-react';

import { useProfileStore } from '@/stores/useProfileStore';

// Menu Item Component
const DrawerMenuItem = ({
  icon,
  title,
  path,
  rightContent = null,
}: {
  icon: React.ReactNode;
  title: string;
  path: string;
  rightContent?: string | null;
}) => (
  <Link href={path}>
    <button className="hover:bg-surface-elevated flex w-full items-center rounded-lg px-4 py-3 text-left transition-colors duration-200">
      <span className="text-text-muted mr-3">{icon}</span>
      <span className="text-text font-medium">{title}</span>
      {rightContent && <span className="text-text-secondary ml-auto text-sm">{rightContent}</span>}
    </button>
  </Link>
);

const SideBar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const { profileData, isAuthenticated } = useProfileStore();

  // Check if user is authenticated
  const userIsAuthenticated = isAuthenticated();

  // Close drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Handle body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // All menu items
  const allMenuItems = [
    {
      icon: <Users size={18} />,
      title: 'Profile',
      path: `/profiles/${profileData?.username || 'me'}`,
      requiresAuth: true,
    },
    {
      icon: <Bookmark size={18} />,
      title: 'Bookmarks',
      path: '/account/bookmarks',
      requiresAuth: true,
    },
    {
      icon: <Palette size={18} />,
      title: 'Appearance',
      path: '/account/appearance',
      requiresAuth: false,
    },
    {
      icon: <Settings size={18} />,
      title: 'Settings',
      path: '/account/settings',
      requiresAuth: true,
    },
  ];

  // Filter menu items based on authentication status
  const menuItems = allMenuItems.filter((item) => userIsAuthenticated || !item.requiresAuth);

  const formatCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <div
        ref={drawerRef}
        className={`bg-surface border-border absolute left-0 h-full w-4/5 max-w-sm transform border-r shadow-2xl transition-transform duration-300 ease-out sm:w-80 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header with Profile Info - Only show if authenticated */}
        {userIsAuthenticated && profileData && (
          <div className="bg-primary relative p-6">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex flex-1 items-center">
                <div className="bg-background text-primary flex h-14 w-14 items-center justify-center overflow-hidden rounded-full text-lg font-bold shadow-sm">
                  {/* Simple avatar with first letter of display name */}
                  <span>{profileData.display_name?.charAt(0).toUpperCase() || 'U'}</span>
                </div>
                <div className="text-background ml-3 flex-1">
                  <div className="text-base font-semibold">{profileData.display_name}</div>
                  <div className="text-sm opacity-90">@{profileData.username}</div>
                  <div className="mt-1 text-xs opacity-75">{profileData.total_aura} Total Aura</div>
                </div>
              </div>
              <button
                className="text-background/80 hover:bg-background/10 hover:text-background rounded-full p-2 transition-colors"
                onClick={onClose}
              >
                <X size={18} />
              </button>
            </div>

            {/* Aura Stats */}
            <div className="bg-background/10 rounded-lg p-3 backdrop-blur-sm">
              <div className="flex justify-around">
                <div className="text-center">
                  <div className="text-background text-base font-semibold">
                    {formatCount(profileData.aura_polls)}
                  </div>
                  <div className="text-background/75 text-xs">Polls Aura</div>
                </div>
                <div className="text-center">
                  <div className="text-background text-base font-semibold">
                    {formatCount(profileData.aura_comments)}
                  </div>
                  <div className="text-background/75 text-xs">Comments Aura</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header for unauthenticated users */}
        {!userIsAuthenticated && (
          <div className="bg-primary relative p-6">
            <div className="flex items-center justify-between">
              <div className="text-background">
                <div className="text-lg font-semibold">Menu</div>
                <div className="text-sm opacity-90">Explore our features</div>
              </div>
              <button
                className="text-background/80 hover:bg-background/10 hover:text-background rounded-full p-2 transition-colors"
                onClick={onClose}
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Menu Items */}
        <div className="flex-1 space-y-1 p-4">
          {menuItems.map((item, index) => (
            <DrawerMenuItem key={index} icon={item.icon} title={item.title} path={item.path} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SideBar;
