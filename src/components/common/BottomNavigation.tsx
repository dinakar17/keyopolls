'use client';

import React, { useEffect, useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Compass, Home, Inbox, Users } from 'lucide-react';

const BottomNavigation = () => {
  // State for visibility based on scroll
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Get current path
  const pathname = usePathname();

  // Navigation items defined within the component
  const navigationItems = [
    { id: 'home', name: 'Home', icon: Home, path: '/' },
    { id: 'explore', name: 'Explore', icon: Compass, path: '/explore' },
    { id: 'communities', name: 'Communities', icon: Users, path: '/communities' },
    { id: 'inbox', name: 'Inbox', icon: Inbox, path: '/inbox' },
  ];

  // Handle scroll to show/hide navigation
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Determine scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  // Check if path is active (exact match or starts with for nested routes)
  const isActive = (itemPath: string) => {
    if (itemPath === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(itemPath);
  };

  return (
    <nav
      className={`bg-background border-border-subtle fixed right-0 bottom-0 left-0 border-t transition-transform duration-300 ease-in-out ${
        isVisible ? 'transform-none' : 'translate-y-full'
      }`}
    >
      <div className="flex justify-around px-2 py-1">
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.path);

          return (
            <Link href={item.path} key={item.id}>
              <div
                className={`flex flex-col items-center p-3 transition-colors duration-200 ${
                  active ? 'text-primary' : 'text-text-muted hover:text-text'
                }`}
              >
                <IconComponent
                  size={20}
                  strokeWidth={active ? 2.5 : 2}
                  className="transition-all duration-200"
                />
                <span
                  className={`mt-1 text-xs font-medium transition-all duration-200 ${
                    active ? 'opacity-100' : 'opacity-80'
                  }`}
                >
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
