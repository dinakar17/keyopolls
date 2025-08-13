'use client';

import React, { useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Briefcase, Menu, Target, Users, Wallet, X, Zap } from 'lucide-react';

import { useKeyopollsTransactionsApiGetCreditsSummary } from '@/api/transactions/transactions';
import SideBar from '@/components/common/SideBar';
import { useProfileStore } from '@/stores/useProfileStore';

interface CombinedHeaderProps {
  activeCategory?: string;
  onCategoryChange?: (categoryId: string) => void;
}

const CombinedHeader: React.FC<CombinedHeaderProps> = () => {
  const router = useRouter();
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Get user data from store
  const { profileData, isAuthenticated, accessToken } = useProfileStore();

  // Check if user is authenticated
  const userIsAuthenticated = isAuthenticated();

  // Fetch credits summary
  const { data: summaryData, isLoading: summaryLoading } =
    useKeyopollsTransactionsApiGetCreditsSummary({
      request: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

  // Extract credits data
  const creditsSummary = summaryData?.data;

  // User profile data with fallbacks
  const userProfile = {
    name: profileData?.display_name || 'Set your name',
    username: profileData?.username || 'Set your username',
    avatar: profileData?.display_name?.[0]?.toUpperCase() || 'U',
    totalAura: profileData?.total_aura || 0,
  };

  // Helper function to format amount
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(Math.abs(amount));
  };

  // Handle scroll to show/hide header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Handle opening sidebar
  const handleOpenSidebar = () => {
    setIsProfileDrawerOpen(true);
  };

  // Handle opening info modal
  const handleOpenInfoModal = () => {
    setIsInfoModalOpen(true);
  };

  // Handle closing info modal
  const handleCloseInfoModal = () => {
    setIsInfoModalOpen(false);
  };

  // Handle credits click
  const handleCreditsClick = () => {
    router.push('/account/credits');
  };

  return (
    <>
      {/* Combined Header */}
      <header
        className={`bg-background sticky top-0 z-20 my-1 transition-transform duration-300 ease-in-out ${
          isVisible ? 'transform-none' : '-translate-y-full'
        }`}
      >
        {/* Top Header Row */}
        <div className="border-border-subtle border-b py-1">
          <div className="mx-auto max-w-2xl px-4">
            <div className="flex h-14 items-center justify-between">
              {/* Left side - Profile Avatar or Menu Button */}
              <div
                className="flex cursor-pointer flex-col items-center"
                onClick={handleOpenSidebar}
              >
                {userIsAuthenticated ? (
                  <div className="relative">
                    {userProfile.avatar.startsWith('http') ? (
                      <Image
                        src={userProfile.avatar}
                        alt={`${userProfile.username}'s avatar`}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="bg-primary text-background flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-transform duration-200 hover:scale-105">
                        {userProfile.username[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                ) : (
                  // Show menu icon for unauthenticated users
                  <div className="text-text-muted hover:text-text hover:bg-surface-elevated rounded-full p-2 transition-colors duration-200">
                    <Menu size={20} />
                  </div>
                )}
              </div>

              {/* Center - Logo, brand name and subtitle - Now clickable */}
              <div
                className="flex cursor-pointer flex-col items-center transition-opacity hover:opacity-80"
                onClick={handleOpenInfoModal}
              >
                <div className="flex items-start space-x-3">
                  <Image src="/logo.svg" alt="Pulse Logo" width={24} height={24} priority />
                  <span className="text-primary text-lg font-bold">Pulse</span>
                </div>
                <p className="text-text-muted text-xs font-medium">Learn in minutes not hours.</p>
                <p className="text-text-muted text-xs font-medium">
                  Time to Think, Talk, and Learn
                </p>
              </div>

              {/* Right side - Credits or Login */}
              <div className="flex items-center">
                {userIsAuthenticated ? (
                  // Show credits summary when authenticated
                  <div
                    className="flex cursor-pointer flex-col items-end text-right transition-opacity hover:opacity-80"
                    onClick={handleCreditsClick}
                  >
                    {summaryLoading ? (
                      <div className="h-4 w-12 animate-pulse rounded bg-gray-200" />
                    ) : (
                      <>
                        <div className="flex items-center gap-1">
                          <Wallet className="text-text-secondary h-3 w-3" />
                          <span className="text-text text-xs font-medium">
                            {formatAmount(creditsSummary?.total_credits || 0)}
                          </span>
                        </div>
                        {creditsSummary?.total_earned && creditsSummary.total_earned > 0 && (
                          <div className="text-text-secondary text-xs">
                            Earned: {formatAmount(creditsSummary.total_earned)}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  // Show login link for unauthenticated users
                  <Link href="/auth">
                    <button className="bg-primary text-background hover:bg-primary/90 rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200">
                      Sign In
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Info Modal - Simplified */}
      {isInfoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background border-border w-full max-w-sm rounded-lg border shadow-lg">
            {/* Modal Header */}
            <div className="border-border-subtle flex items-center justify-between border-b p-4">
              <h2 className="text-text text-lg font-semibold">Welcome to Pulse</h2>
              <button
                onClick={handleCloseInfoModal}
                className="text-text-muted hover:text-text rounded-full p-1 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content - Clear but Concise */}
            <div className="space-y-3 p-4">
              {/* What is Pulse */}
              <div className="mb-4 text-center">
                <div className="bg-primary/10 mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full">
                  <Users size={16} className="text-primary" />
                </div>
                <h3 className="text-text text-sm font-medium">Micro-learning platform</h3>
                <p className="text-text-secondary text-xs">
                  Learn from professionals in bite-sized lessons
                </p>
              </div>

              {/* How it works */}
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Zap size={14} className="flex-shrink-0 text-yellow-600" />
                  <span className="text-text-secondary text-xs">
                    Answer polls & review flashcards daily
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Target size={14} className="text-success flex-shrink-0" />
                  <span className="text-text-secondary text-xs">
                    Build Aura points & learning streaks
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Briefcase size={14} className="text-info flex-shrink-0" />
                  <span className="text-text-secondary text-xs">
                    Apply for jobs in your interest areas
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-border-subtle border-t p-4">
              <button
                onClick={handleCloseInfoModal}
                className="bg-primary text-background w-full rounded-lg py-2 text-sm font-medium transition-opacity hover:opacity-90"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Sidebar - Slides from left */}
      <SideBar isOpen={isProfileDrawerOpen} onClose={() => setIsProfileDrawerOpen(false)} />
    </>
  );
};

export default CombinedHeader;
