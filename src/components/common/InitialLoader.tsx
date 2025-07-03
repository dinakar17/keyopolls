'use client';

import React from 'react';

import Image from 'next/image';

const InitialLoader = () => {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        {/* App Logo */}
        <div className="relative">
          <Image src="/logo.svg" alt="Connect Logo" width={64} height={64} />
        </div>

        {/* Loading spinner */}
        <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"></div>
      </div>
    </div>
  );
};

export default InitialLoader;
