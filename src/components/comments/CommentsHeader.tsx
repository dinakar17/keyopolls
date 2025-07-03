import React from 'react';

import { ArrowLeft, Search, X } from 'lucide-react';

import { CommentSearchTypeEnum, CommentSortEnum } from '@/api/schemas';

interface CommentsHeaderProps {
  viewMode: 'all' | 'thread' | 'search';
  searchInputValue: string;
  searchType: CommentSearchTypeEnum;
  sortOption: CommentSortEnum;
  actualSearchQuery: string;
  totalComments: number;
  searchTimeMs?: number;
  threadDepth?: number;
  onViewAllComments: () => void;
  onSearchInputChange: (value: string) => void;
  onSearchKeyDown: (e: React.KeyboardEvent) => void;
  onExecuteSearch: () => void;
  onClearSearch: () => void;
  onSearchTypeChange: (type: CommentSearchTypeEnum) => void;
  onSortChange: (sort: CommentSortEnum) => void;
}

const CommentsHeader: React.FC<CommentsHeaderProps> = ({
  viewMode,
  searchInputValue,
  searchType,
  sortOption,
  actualSearchQuery,
  totalComments,
  searchTimeMs,
  threadDepth,
  onViewAllComments,
  onSearchInputChange,
  onSearchKeyDown,
  onExecuteSearch,
  onClearSearch,
  onSearchTypeChange,
  onSortChange,
}) => {
  // Handle search type change and re-execute search if we're in search mode
  const handleSearchTypeChange = (newType: CommentSearchTypeEnum) => {
    onSearchTypeChange(newType);
    // If we're already in search mode with a query, re-execute the search
    if (viewMode === 'search' && actualSearchQuery.trim().length >= 2) {
      // Small delay to ensure state is updated
      setTimeout(() => {
        onExecuteSearch();
      }, 0);
    }
  };

  return (
    <div className="border-border-subtle bg-background border-b">
      {/* Main header row */}
      <div className="flex items-center justify-between p-3">
        {/* Left side - Back button and title */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {/* Back buttons */}
          {(viewMode === 'thread' || viewMode === 'search') && (
            <button
              onClick={onViewAllComments}
              className="text-primary flex flex-shrink-0 items-center gap-2 transition-colors hover:opacity-80"
            >
              <ArrowLeft size={16} />
              <span className="text-sm">Back</span>
            </button>
          )}
          {viewMode === 'search' && (
            <div className="min-w-0">
              <h3 className="text-text truncate text-base font-semibold">
                Results ({totalComments})
              </h3>
              {searchTimeMs && <span className="text-text-muted text-xs">({searchTimeMs}ms)</span>}
            </div>
          )}

          {viewMode === 'thread' && (
            <div className="text-text-secondary truncate text-sm">
              Thread {threadDepth && `• Depth ${threadDepth}`}
            </div>
          )}
        </div>
      </div>

      {/* Search row - mobile optimized */}
      <div className="space-y-2 px-3 pb-3">
        {/* Search input */}
        <div className="relative">
          <Search size={16} className="text-text-muted absolute top-1/2 left-3 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search comments..."
            value={searchInputValue}
            onChange={(e) => onSearchInputChange(e.target.value)} // ✅ Direct call
            onKeyDown={onSearchKeyDown}
            className="border-border bg-background text-text placeholder-text-muted focus:border-primary focus:ring-primary w-full rounded-lg border py-2 pr-10 pl-10 text-sm focus:ring-1 focus:outline-none"
          />
          {searchInputValue && (
            <button
              onClick={onClearSearch} // ✅ Direct call, no custom handler needed
              className="text-text-muted hover:text-text absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-2">
          {/* Search button */}
          <button
            onClick={onExecuteSearch}
            disabled={searchInputValue.trim().length < 2}
            className="bg-primary text-background flex-shrink-0 rounded-lg px-3 py-1.5 text-sm transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Search
          </button>

          {/* Search type selector (only when searching) */}
          {viewMode === 'search' && (
            <select
              value={searchType}
              onChange={(e) => handleSearchTypeChange(e.target.value as CommentSearchTypeEnum)}
              className="border-border bg-background text-text focus:border-primary focus:ring-primary rounded-lg border px-2 py-1.5 text-sm focus:ring-1 focus:outline-none"
            >
              <option value="all">All</option>
              <option value="content">Content</option>
              <option value="author">Author</option>
              <option value="media">Media</option>
              <option value="links">Links</option>
            </select>
          )}

          {/* Sort options (not in thread view) */}
          {viewMode !== 'thread' && (
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as CommentSortEnum)}
              className="border-border bg-background text-text focus:border-primary focus:ring-primary min-w-0 flex-1 rounded-lg border px-2 py-1.5 text-sm focus:ring-1 focus:outline-none"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="most_liked">Most Liked</option>
              <option value="most_replies">Most Replies</option>
            </select>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentsHeader;
