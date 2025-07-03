import React from 'react';

import { MessageSquare, Search } from 'lucide-react';

interface EmptyStateProps {
  viewMode: 'all' | 'thread' | 'search';
  searchQuery?: string;
  searchQueryLength?: number;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  viewMode,
  searchQuery = '',
  searchQueryLength = 0,
}) => {
  if (viewMode === 'search') {
    if (searchQueryLength < 2) {
      return (
        <div className="p-6 text-center">
          <Search size={32} className="text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary text-sm">
            Enter at least 2 characters to search comments
          </p>
        </div>
      );
    } else {
      return (
        <div className="p-6 text-center">
          <Search size={32} className="text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary mb-1 text-sm">No comments found for "{searchQuery}"</p>
          <p className="text-text-muted text-xs">Try different keywords or search type</p>
        </div>
      );
    }
  }

  if (viewMode === 'thread') {
    return (
      <div className="p-6 text-center">
        <MessageSquare size={32} className="text-text-muted mx-auto mb-3" />
        <p className="text-text-secondary text-sm">
          Comment thread not found or no longer available
        </p>
      </div>
    );
  }

  // viewMode === 'all'
  return (
    <div className="p-6 text-center">
      <MessageSquare size={32} className="text-text-muted mx-auto mb-3" />
      <p className="text-text-secondary mb-1 text-sm">No comments yet</p>
      <p className="text-text-muted text-xs">Be the first to comment!</p>
    </div>
  );
};

export default EmptyState;
