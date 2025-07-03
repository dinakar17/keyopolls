'use client';

import React, { useEffect, useState } from 'react';

import Link from 'next/link';

import { Edit } from 'lucide-react';

const CreateButton = ({ path = '/create-poll' }) => {
  // State for button visibility
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Handle scroll to show/hide button
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Determine scroll direction and position
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past threshold
        setIsVisible(false);
      } else {
        // Scrolling up or near top
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  return (
    <div
      className={`fixed right-4 bottom-20 z-50 transition-all duration-300 ease-in-out ${
        isVisible
          ? 'transform-none opacity-100'
          : 'pointer-events-none translate-y-10 transform opacity-0'
      }`}
    >
      <Link href={path}>
        <button className="bg-primary text-background flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-200 hover:scale-105 hover:opacity-90 active:scale-95">
          <Edit size={18} strokeWidth={2.5} />
        </button>
      </Link>
    </div>
  );
};

export default CreateButton;
