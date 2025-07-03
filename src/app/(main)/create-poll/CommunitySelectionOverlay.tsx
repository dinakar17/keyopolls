'use client';

import { useState } from 'react';

import Image from 'next/image';

import { useKeyopollsCommunitiesApiGeneralListCommunities } from '@/api/communities-general/communities-general';
import { CommunityDetails } from '@/api/schemas';
import { useCommunityStore } from '@/stores/useCommunityStore';

interface CommunitySelectionOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommunitySelectionOverlay({
  isOpen,
  onClose,
}: CommunitySelectionOverlayProps) {
  const [communitySearch, setCommunitySearch] = useState('');
  const { setCommunityDetails } = useCommunityStore();

  const { data, isLoading, error } = useKeyopollsCommunitiesApiGeneralListCommunities(
    {
      page: 1,
      page_size: 50,
      search: communitySearch,
    },
    {
      query: {
        enabled: isOpen,
      },
    }
  );

  const communities = data?.data?.communities || [];

  const handleCommunitySelect = (community: CommunityDetails) => {
    setCommunityDetails(community);
    onClose();
    setCommunitySearch('');
  };

  // Get community name initial for fallback avatar
  const getCommunityInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  if (!isOpen) return null;

  return (
    <div className="bg-background fixed inset-0 z-50 flex flex-col">
      {/* Header */}
      <div className="border-border flex items-center justify-between border-b p-4">
        <button
          onClick={onClose}
          className="hover:bg-surface-elevated text-text-muted hover:text-text rounded-full p-1.5 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h3 className="text-text text-lg font-semibold">Select Community</h3>
        <div className="w-8"></div>
      </div>

      {/* Search */}
      <div className="border-border border-b p-4">
        <input
          type="text"
          value={communitySearch}
          onChange={(e) => setCommunitySearch(e.target.value)}
          placeholder="Search communities..."
          className="border-border bg-surface text-text placeholder-text-muted focus:ring-primary focus:border-primary w-full rounded-lg border p-3 text-sm transition-colors focus:ring-2 focus:outline-none"
          autoFocus
        />
      </div>

      {/* Communities List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="text-text-secondary p-8 text-center">
            <div className="border-border border-t-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2"></div>
            <p>Loading communities...</p>
          </div>
        )}

        {error && (
          <div className="text-error p-8 text-center">
            <svg
              className="text-error mx-auto mb-4 h-12 w-12 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p>Failed to load communities</p>
            <p className="text-text-muted mt-1 text-xs">Please try again</p>
          </div>
        )}

        {!isLoading && !error && communities.length > 0 && (
          <>
            {communities.map((community) => (
              <button
                key={community.id}
                onClick={() => handleCommunitySelect(community)}
                className="border-border-subtle hover:bg-surface-elevated w-full border-b p-4 text-left transition-colors last:border-b-0"
              >
                <div className="flex items-center space-x-3">
                  {/* Community Avatar - Reddit Style */}
                  <div className="flex-shrink-0">
                    {community.avatar ? (
                      <div className="relative">
                        <Image
                          src={community.avatar}
                          alt={community.name}
                          className="h-10 w-10 rounded-full object-cover"
                          width={40}
                          height={40}
                        />
                        {/* Optional: Add a small border ring for premium communities */}
                        <div className="ring-border absolute inset-0 rounded-full ring-1"></div>
                      </div>
                    ) : (
                      <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-full">
                        <span className="text-background text-sm font-semibold">
                          {getCommunityInitial(community.name)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Community Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1">
                      <h4 className="text-text truncate font-medium">{community.name}</h4>
                    </div>
                    <div className="mt-0.5 flex items-center space-x-2">
                      <span className="text-text-secondary text-sm">
                        {community.member_count.toLocaleString()} members
                      </span>
                    </div>
                    {community.description && (
                      <p className="text-text-muted mt-1 line-clamp-2 text-xs leading-relaxed">
                        {community.description}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </>
        )}

        {!isLoading && !error && communities.length === 0 && (
          <div className="text-text-secondary p-8 text-center">
            <svg
              className="text-text-muted mx-auto mb-4 h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p>No communities found</p>
            <p className="text-text-muted mt-1 text-xs">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
}
