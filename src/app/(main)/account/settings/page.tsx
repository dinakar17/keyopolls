'use client';

import React, { useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  ArrowLeft,
  Bell,
  ChevronRight,
  Eye,
  HelpCircle,
  LogOut,
  Moon,
  Settings,
  Shield,
  Smartphone,
  Vote,
  X,
  Zap,
} from 'lucide-react';

import { useProfileStore } from '@/stores/useProfileStore';

const SettingsPage = () => {
  const router = useRouter();
  const { resetProfile } = useProfileStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      // Reset profile from the store
      resetProfile();

      // Small delay for UX
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Redirect to login page
      router.replace('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          icon: <Shield size={20} />,
          label: 'Privacy & Security',
          description: 'Control your privacy settings',
          href: '/settings/privacy',
          comingSoon: true,
        },
        {
          icon: <Bell size={20} />,
          label: 'Notifications',
          description: 'Manage your notifications',
          href: '/settings/notifications',
        },
        {
          icon: <Zap size={20} />,
          label: 'Aura Settings',
          description: 'View your aura breakdown',
          href: '/settings/aura',
          comingSoon: true,
        },
      ],
    },
    {
      title: 'Polls & Content',
      items: [
        {
          icon: <Vote size={20} />,
          label: 'Poll Preferences',
          description: 'Customize poll display settings',
          href: '/settings/polls',
          comingSoon: true,
        },
        {
          icon: <Eye size={20} />,
          label: 'Content Filters',
          description: 'Control what polls you see',
          href: '/settings/content',
          comingSoon: true,
        },
        {
          icon: <Settings size={20} />,
          label: 'Categories',
          description: 'Manage your poll categories',
          href: '/settings/categories',
        },
      ],
    },
    {
      title: 'Community',
      items: [
        {
          icon: <Moon size={20} />,
          label: 'Blocked Accounts',
          description: 'Manage blocked users',
          href: '/settings/blocked',
          comingSoon: true,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: <HelpCircle size={20} />,
          label: 'Help Center',
          description: 'Get help and support',
          href: '/help',
        },
        {
          icon: <Smartphone size={20} />,
          label: 'About Keyo',
          description: 'App version and information',
          href: '/about',
          comingSoon: true,
        },
      ],
    },
  ];

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="bg-background/80 border-border sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center">
              <Link href="/">
                <button className="text-text-muted hover:text-text hover:bg-surface-elevated -ml-2 rounded-full p-2 transition-colors">
                  <ArrowLeft size={20} />
                </button>
              </Link>
              <h1 className="text-text ml-2 text-lg font-semibold">Settings</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        {/* Settings Sections */}
        <div className="space-y-8">
          {settingsSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <h2 className="text-text-secondary mb-3 text-sm font-medium tracking-wider uppercase">
                {section.title}
              </h2>
              <div className="space-y-1">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="relative">
                    {item.comingSoon ? (
                      <div className="border-border bg-surface-elevated/30 flex items-center justify-between rounded-lg border p-4 opacity-60">
                        <div className="flex items-center">
                          <div className="bg-surface-elevated mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg">
                            <span className="text-text-muted">{item.icon}</span>
                          </div>
                          <div>
                            <h3 className="text-text font-medium">{item.label}</h3>
                            <p className="text-text-secondary text-sm">{item.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="bg-warning/10 text-warning mr-2 rounded-full px-2 py-1 text-xs font-medium">
                            Coming Soon
                          </span>
                          <ChevronRight size={16} className="text-text-muted" />
                        </div>
                      </div>
                    ) : (
                      <Link href={item.href}>
                        <div className="border-border hover:bg-surface-elevated flex items-center justify-between rounded-lg border p-4 transition-colors">
                          <div className="flex items-center">
                            <div className="bg-primary/10 mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg">
                              <span className="text-primary">{item.icon}</span>
                            </div>
                            <div>
                              <h3 className="text-text font-medium">{item.label}</h3>
                              <p className="text-text-secondary text-sm">{item.description}</p>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-text-muted" />
                        </div>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Logout Section */}
          <div>
            <h2 className="text-text-secondary mb-3 text-sm font-medium tracking-wider uppercase">
              Account Actions
            </h2>
            <div className="space-y-1">
              <button
                onClick={() => setShowLogoutModal(true)}
                className="border-border hover:bg-error/5 hover:border-error/20 group flex w-full items-center justify-between rounded-lg border p-4 transition-colors"
              >
                <div className="flex items-center">
                  <div className="bg-error/10 group-hover:bg-error/20 mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg transition-colors">
                    <LogOut size={20} className="text-error" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-error font-medium">Sign Out</h3>
                    <p className="text-text-secondary text-sm">Sign out of your account</p>
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  className="text-text-muted group-hover:text-error transition-colors"
                />
              </button>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="text-text-muted mt-12 text-center">
          <p className="mb-1 text-sm">Keyo</p>
          <p className="text-xs">Version 1.0.0 • Where opinions matter</p>
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-surface border-border w-full max-w-md rounded-2xl border shadow-xl">
            {/* Modal Header */}
            <div className="border-border flex items-center justify-between border-b p-6">
              <h2 className="text-text text-lg font-semibold">Confirm Sign Out</h2>
              <button
                onClick={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
                className="text-text-muted hover:text-text hover:bg-surface-elevated rounded-full p-1 transition-colors disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-4 flex items-start">
                <div className="bg-error/10 mr-4 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full">
                  <LogOut size={24} className="text-error" />
                </div>
                <div>
                  <h3 className="text-text mb-2 font-medium">
                    You'll be signed out of your account
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    This will sign you out of Keyo. You'll need to sign in again to create polls,
                    vote, and engage in discussions.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="border-border flex items-center justify-end space-x-3 border-t p-6">
              <button
                onClick={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
                className="text-text-secondary hover:text-text px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="bg-error text-background flex items-center rounded-lg px-6 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <>
                    <div className="border-background mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                    Signing out...
                  </>
                ) : (
                  'Sign Out'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
