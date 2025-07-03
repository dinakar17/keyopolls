import React from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Heart, Image as ImageIcon, Link2, MessageCircle } from 'lucide-react';

import { CommentSearchResultOut } from '@/api/schemas';
import { formatDate } from '@/utils';

interface SearchResultProps {
  result: CommentSearchResultOut;
  onClick?: () => void; // Optional click handler for custom behavior
}

const SearchResult: React.FC<SearchResultProps> = ({ result, onClick }) => {
  const router = useRouter();

  // Get avatar text
  const getAvatarText = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const handleClick = () => {
    // if no onClick function is provided, navigate to the following default route /posts/${result.post_id}?view=thread&commentId=${result.id}
    if (!onClick) {
      router.push(`/posts/${result.poll_content?.id}?view=thread&commentId=${result.id}`);
      return;
    }
    onClick();
  };

  return (
    <div
      className="border-border-subtle hover:bg-surface-elevated/30 cursor-pointer border-b p-3 transition-colors"
      onClick={handleClick}
    >
      {/* Comment Section */}
      <div className="flex space-x-3">
        {/* Comment Author Avatar */}
        <div className="flex-shrink-0">
          <div
            className={`bg-primary text-background flex h-10 w-10 items-center justify-center rounded-full font-medium`}
          >
            {result.author_info.avatar ? (
              <Image
                src={result.author_info.avatar}
                alt={result.author_info.display_name}
                width={40}
                height={40}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              getAvatarText(result.author_info.display_name)
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          {/* Author and metadata */}
          <div className="mb-1 flex items-center text-sm">
            <span className="text-text truncate font-medium">
              {result.author_info.display_name}
            </span>
            <span className="text-text-secondary mx-1">·</span>
            <span className="text-text-secondary flex-shrink-0">
              {formatDate(result.created_at)}
            </span>
            {result.depth > 0 && (
              <>
                <span className="text-text-secondary mx-1">·</span>
                <span className="text-text-secondary">Reply</span>
              </>
            )}
          </div>

          {/* Comment Content */}
          <div className="text-text mb-2 leading-relaxed">
            {result.search_snippet || result.content}
          </div>

          {/* Engagement Stats - Mobile optimized */}
          <div className="text-text-muted flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className="text-text-secondary">in {result.content_type}</span>

            {result.like_count > 0 && (
              <div className="flex items-center">
                <Heart size={12} className="mr-1" />
                <span>{result.like_count}</span>
              </div>
            )}

            {result.reply_count > 0 && (
              <div className="flex items-center">
                <MessageCircle size={12} className="mr-1" />
                <span>{result.reply_count}</span>
              </div>
            )}

            {result.has_media && (
              <div className="flex items-center">
                <ImageIcon size={12} className="mr-1" />
                <span>Media</span>
              </div>
            )}

            {result.has_link && (
              <div className="flex items-center">
                <Link2 size={12} className="mr-1" />
                <span>Link</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Original Post Context */}
      {result.poll_content && (
        <div className="border-border mt-3 ml-13 border-l-2 pl-3">
          <div className="flex space-x-2">
            {/* Post Author Avatar - Smaller */}
            <div className="flex-shrink-0">
              <div
                className={`bg-primary text-background flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium`}
              >
                {result.poll_content.author_info.avatar ? (
                  <Image
                    src={result.poll_content.author_info.avatar}
                    alt={result.poll_content.author_info.display_name}
                    width={24}
                    height={24}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  getAvatarText(result.poll_content.author_info.display_name)
                )}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              {/* Post Author */}
              <div className="mb-1 text-xs">
                <span className="text-text truncate font-medium">
                  {result.poll_content.author_info.display_name}
                </span>
                <span className="text-text-secondary ml-1">original post</span>
              </div>

              {/* Post Content */}
              <div className="text-text-secondary mb-2 line-clamp-2 text-sm">
                {result.poll_content.title}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResult;
