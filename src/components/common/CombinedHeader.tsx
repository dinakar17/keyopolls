'use client';

import React, { useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import {
  AlertCircle,
  BookOpen,
  Briefcase,
  Camera,
  ChefHat,
  Coffee,
  Film,
  Gamepad2,
  Globe,
  GraduationCap,
  Hammer,
  Heart,
  Home,
  Laptop,
  Menu,
  MessageCircle,
  Microscope,
  Music,
  Palette,
  Plane,
  Settings,
  Shield,
  TreePine,
  Trophy,
  Users,
  Vote,
  X,
  Zap,
} from 'lucide-react';

import SideBar from '@/components/common/SideBar';
import { type Category, getUserOrderedCategories } from '@/constants/categories';
import { useProfileStore } from '@/stores/useProfileStore';

// Icon mapping for poll categories
const iconMap = {
  Home,
  Laptop,
  Gamepad2,
  Trophy,
  Film,
  Coffee,
  GraduationCap,
  Briefcase,

  Heart,
  Palette,
  Microscope,
  Vote,
  ChefHat,
  Plane,
  Camera,
  Music,
  BookOpen,
  TreePine,
  Hammer,
  Globe,
  Users,
  AlertCircle,
};

interface CombinedHeaderProps {
  activeCategory?: string;
  onCategoryChange?: (categoryId: string) => void;
}

const CombinedHeader: React.FC<CombinedHeaderProps> = ({ activeCategory, onCategoryChange }) => {
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);

  // Refs for scroll positioning
  const categoriesScrollRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Add ref to track if initial scroll positioning is done
  const hasInitialScrollPositioned = useRef(false);

  // Get user data from store
  const { profileData, isAuthenticated } = useProfileStore();

  // Check if user is authenticated
  const userIsAuthenticated = isAuthenticated();

  // User profile data with fallbacks
  const userProfile = {
    name: profileData?.display_name || 'Set your name',
    username: profileData?.username || 'Set your username',
    avatar: profileData?.display_name?.[0]?.toUpperCase() || 'U',
    totalAura: profileData?.total_aura || 0,
  };

  // Load categories on mount and listen for storage changes
  useEffect(() => {
    const loadCategories = () => {
      const orderedCategories = getUserOrderedCategories();
      setCategories(orderedCategories);
    };

    // Initial load
    loadCategories();

    // Listen for storage changes (when user updates order in edit page)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user_categories_order') {
        loadCategories();
      }
    };

    // Listen for custom event when categories are updated within the same tab
    const handleCategoriesUpdate = () => {
      loadCategories();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('categoriesOrderUpdated', handleCategoriesUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('categoriesOrderUpdated', handleCategoriesUpdate);
    };
  }, []);

  // Effect to scroll to active category on initial load and when activeCategory changes
  useEffect(() => {
    if (categories.length > 0 && activeCategory && categoriesScrollRef.current) {
      // Use a small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        scrollToActiveCategory();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [categories, activeCategory]);

  // Function to scroll to active category
  const scrollToActiveCategory = () => {
    if (!activeCategory) return;
    const categoryElement = categoryRefs.current[activeCategory];
    if (categoryElement && categoriesScrollRef.current) {
      const container = categoriesScrollRef.current;
      const containerRect = container.getBoundingClientRect();
      const elementRect = categoryElement.getBoundingClientRect();

      const scrollLeft =
        container.scrollLeft +
        elementRect.left -
        containerRect.left -
        containerRect.width / 2 +
        elementRect.width / 2;

      container.scrollTo({
        left: scrollLeft,
        behavior: hasInitialScrollPositioned.current ? 'smooth' : 'auto', // No animation on initial load
      });

      // Mark that initial positioning is done
      if (!hasInitialScrollPositioned.current) {
        hasInitialScrollPositioned.current = true;
      }
    }
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

  // Haptic feedback function
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10); // Very short vibration
    }
  };

  // Handle category change - simplified to only handle manual selection
  const handleCategoryChange = (categorySlug: string) => {
    // Scroll to selected category
    scrollToActiveCategory();
    triggerHaptic();
    onCategoryChange?.(categorySlug);
  };

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

  // Get icon component
  const getIconComponent = (iconName: string, size: number = 20) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent ? <IconComponent size={size} /> : <Home size={size} />;
  };

  return (
    <>
      {/* Combined Header */}
      <header
        className={`bg-background sticky top-0 z-20 mt-1 transition-transform duration-300 ease-in-out ${
          isVisible ? 'transform-none' : '-translate-y-full'
        }`}
      >
        {/* Top Header Row */}
        <div className="border-border-subtle border-b">
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
                <div className="flex items-start space-x-2">
                  <Image src="/logo.svg" alt="Keyo Logo" width={24} height={24} priority />
                  <span className="text-primary text-lg font-bold">Keyo</span>
                </div>
                <p className="text-text-muted text-xs font-medium">Where opinions matter</p>
              </div>

              {/* Right side - Empty space for balance */}
              <div className="flex items-center">
                {userIsAuthenticated ? (
                  // Empty space for balance when authenticated
                  <div className="w-8"></div>
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

        {/* Categories Row - Only show if categories are available */}
        {categories.length > 0 && activeCategory && (
          <div className="border-border-subtle border-b">
            <div className="mx-auto max-w-2xl pl-4">
              <div
                ref={categoriesScrollRef}
                className="scrollbar-hide flex items-center overflow-x-auto scroll-smooth py-3"
                style={{
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {/* Categories */}
                <div className="flex items-center space-x-6">
                  {categories.map((category) => (
                    <div
                      key={category.slug}
                      className="flex-shrink-0 cursor-pointer"
                      ref={(el) => {
                        if (el) categoryRefs.current[category.slug] = el;
                      }}
                    >
                      <button
                        onClick={() => handleCategoryChange(category.slug)}
                        className={`relative flex items-center px-1 py-2 whitespace-nowrap transition-all duration-200 ${
                          activeCategory === category.slug
                            ? 'text-text'
                            : 'text-text-muted hover:text-text'
                        }`}
                      >
                        <span
                          className="mr-2"
                          style={{
                            color:
                              activeCategory === category.slug ? category.icon_color : undefined,
                          }}
                        >
                          {getIconComponent(category.icon)}
                        </span>
                        <span className="text-sm font-medium">{category.name}</span>

                        {/* Underline indicator */}
                        <div
                          className={`absolute right-0 -bottom-1 left-0 h-0.5 transition-all duration-200 ${
                            activeCategory === category.slug
                              ? 'scale-x-100 opacity-100'
                              : 'scale-x-0 opacity-0'
                          }`}
                          style={{
                            backgroundColor:
                              activeCategory === category.slug ? category.icon_color : undefined,
                          }}
                        />
                      </button>
                    </div>
                  ))}

                  {/* Edit Categories Button - Only show for authenticated users */}
                  {userIsAuthenticated && (
                    <div className="ml-4 flex-shrink-0">
                      <Link href="/account/edit-categories">
                        <button className="text-text-muted hover:text-text hover:bg-surface-elevated rounded-full p-2 transition-colors">
                          <Settings size={18} />
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Info Modal */}
      {isInfoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background border-border w-full max-w-md rounded-lg border shadow-lg">
            {/* Modal Header */}
            <div className="border-border-subtle flex items-center justify-between border-b p-4">
              <h2 className="text-text text-lg font-semibold">What Makes Keyo Special</h2>
              <button
                onClick={handleCloseInfoModal}
                className="text-text-muted hover:text-text rounded-full p-1 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4 p-4">
              {/* Point 1: Opinion-First & Micro Learning Platform */}
              <div className="flex items-start space-x-3">
                <div className="bg-primary/10 flex-shrink-0 rounded-full p-2">
                  <Vote size={16} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-text text-sm font-medium">Opinion-First Micro Learning</h3>
                  <p className="text-text-secondary text-xs">
                    Share your thoughts on diverse topics while learning something new every day.
                    Every opinion counts and teaches.
                  </p>
                </div>
              </div>

              {/* Point 2: Aura System & Daily Streaks */}
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 rounded-full bg-yellow-500/10 p-2">
                  <Zap size={16} className="text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-text text-sm font-medium">Build Daily Learning Streaks</h3>
                  <p className="text-text-secondary text-xs">
                    Earn Aura points and maintain daily streaks by participating in polls and
                    discussions. Turn curiosity into a habit.
                  </p>
                </div>
              </div>

              {/* Point 3: Zero Promotional Content */}
              <div className="flex items-start space-x-3">
                <div className="bg-success/10 flex-shrink-0 rounded-full p-2">
                  <Shield size={16} className="text-success" />
                </div>
                <div>
                  <h3 className="text-text text-sm font-medium">Zero Promotional Polls</h3>
                  <p className="text-text-secondary text-xs">
                    Our AI moderation ensures absolutely no ads or promotional content. Only genuine
                    opinions and meaningful discussions.
                  </p>
                </div>
              </div>

              {/* Point 4: Quality Over Quantity */}
              <div className="flex items-start space-x-3">
                <div className="bg-info/10 flex-shrink-0 rounded-full p-2">
                  <MessageCircle size={16} className="text-info" />
                </div>
                <div>
                  <h3 className="text-text text-sm font-medium">Quality-First Discussions</h3>
                  <p className="text-text-secondary text-xs">
                    Only 3 polls per community per day to prevent spam and engagement farming. Every
                    poll matters.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-border-subtle border-t p-4">
              <button
                onClick={handleCloseInfoModal}
                className="bg-primary text-background w-full rounded-lg py-2 text-sm font-medium transition-opacity hover:opacity-90"
              >
                Start Polling!
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
