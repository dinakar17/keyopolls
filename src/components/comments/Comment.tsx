import React, { useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { ArrowDown, ArrowUp, ExternalLink, MessageSquare, MoreVertical } from 'lucide-react';

import { CommentOut } from '@/api/schemas';
import DislikeButton from '@/components/common/DislikeButton';
import LikeButton from '@/components/common/LikeButton';
import MediaViewer from '@/components/common/MediaViewer';
import { formatDate } from '@/utils';

interface CommentProps {
  comment: CommentOut;
  depth?: number;
  parentId?: string | null;
  isCollapsed: boolean;
  highlightedLine: number | null;
  isExpanded: boolean;
  onToggleCollapse: () => void;
  onToggleReadMore: () => void;
  onLineClick: (commentId: number) => void;
  onShowMoreReplies: (commentId: string) => void;
  onReply: (comment: CommentOut) => void;
  onActionMenu: (comment: CommentOut) => void;
  // Add these props to handle nested state
  getIsCollapsed: (commentId: number) => boolean;
  getIsExpanded: (commentId: number) => boolean;
  onToggleCollapseById: (commentId: number) => void;
  onToggleReadMoreById: (commentId: number) => void;
}

const Comment: React.FC<CommentProps> = ({
  comment,
  depth = 0,
  parentId = null,
  isCollapsed,
  highlightedLine,
  isExpanded,
  onToggleCollapse,
  onToggleReadMore,
  onLineClick,
  onShowMoreReplies,
  onReply,
  onActionMenu,
  // New props for nested state handling
  getIsCollapsed,
  getIsExpanded,
  onToggleCollapseById,
  onToggleReadMoreById,
}) => {
  const router = useRouter();
  const hasReplies = comment.replies && comment.replies.length > 0;
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  // Add MediaViewer state
  const [isMediaViewerOpen, setIsMediaViewerOpen] = useState(false);
  const [mediaViewerIndex, setMediaViewerIndex] = useState(0);

  const showReplies = hasReplies && !isCollapsed;
  const isLong = comment.content.length > 150;

  // Local state for UI manipulation of reactions
  const [localUserReactions, setLocalUserReactions] = useState(comment.user_reactions || {});
  const [localLikeCount, setLocalLikeCount] = useState(comment.like_count);

  // Fix the highlighting logic
  const isThisLineHighlighted = highlightedLine === comment.id;
  const isDirectChildOfHighlighted = parentId !== null && Number(parentId) === highlightedLine;

  // Measure content height after render
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.offsetHeight);
    }
  }, [isExpanded, isCollapsed, comment.content]);

  const countTotalReplies = (comment: CommentOut): number => {
    if (!comment.replies || comment.replies.length === 0) return 0;
    let total = comment.replies.length;
    comment.replies.forEach((reply) => {
      total += countTotalReplies(reply);
    });
    return total;
  };

  // Measure content height after render - only up to the text content
  useEffect(() => {
    if (contentRef.current) {
      // Find the content body element within the container
      const contentBody = contentRef.current.querySelector('[data-content-body]');
      if (contentBody) {
        // Get the position relative to the main container
        const containerRect = contentRef.current.getBoundingClientRect();
        const contentRect = contentBody.getBoundingClientRect();
        const relativeBottom = contentRect.bottom - containerRect.top; // Add some padding
        setContentHeight(relativeBottom);
      } else {
        // Fallback to full height if content body not found
        setContentHeight(contentRef.current.offsetHeight);
      }
    }
  }, [isExpanded, isCollapsed, comment.content]);

  const totalReplies = countTotalReplies(comment);

  // Handle insights click - navigate to comment insights page
  const handleInsightsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/posts/comments/insights`);
  };

  const handleMediaClick = (index: number = 0) => {
    setMediaViewerIndex(index);
    setIsMediaViewerOpen(true);
  };

  const handleCloseMediaViewer = () => {
    setIsMediaViewerOpen(false);
  };

  // Handle reaction changes for UI manipulation
  const handleReactionChange = (
    objectId: number,
    reactionType: 'like' | 'dislike',
    isActive: boolean
  ) => {
    if (objectId !== comment.id) return;

    const wasLiked = localUserReactions.like || false;

    // Update local state for mutually exclusive reactions
    if (isActive) {
      // User is activating a reaction, deactivate the opposite one
      const oppositeReaction = reactionType === 'like' ? 'dislike' : 'like';
      setLocalUserReactions({
        [reactionType]: true,
        [oppositeReaction]: false,
      });

      // Update like count based on what changed
      if (reactionType === 'like') {
        // User liked: increment count
        setLocalLikeCount((prev) => prev + 1);
      } else if (reactionType === 'dislike' && wasLiked) {
        // User disliked something they had liked: decrement count
        setLocalLikeCount((prev) => Math.max(0, prev - 1));
      }
    } else {
      // User is deactivating a reaction
      setLocalUserReactions((prev) => ({
        ...prev,
        [reactionType]: false,
      }));

      // Update like count if they're removing a like
      if (reactionType === 'like') {
        setLocalLikeCount((prev) => Math.max(0, prev - 1));
      }
    }
  };

  // Don't render deleted comments with no replies
  if (comment.is_deleted && !hasReplies) {
    return null;
  }

  return (
    <div className="relative" data-comment-level={depth}>
      {/* Vertical line - starts from bottom of content */}
      {showReplies && (
        <>
          <div
            className="absolute cursor-pointer"
            style={{
              left: `${depth * 40 + 12}px`,
              top: `${contentHeight + 10}px`,
              width: '20px',
              height: `calc(100% - ${contentHeight + 10}px)`,
              zIndex: 2,
            }}
            onClick={() => onLineClick(comment.id)}
          />
          <div
            className={`pointer-events-none absolute w-0.5 transition-all duration-300 ${
              isThisLineHighlighted ? 'bg-primary shadow-lg' : 'bg-border'
            }`}
            style={{
              left: `${depth * 40 + 20}px`,
              top: `${contentHeight + 10}px`,
              width: '0.5px',
              height: `calc(100% - ${contentHeight + 10}px)`,
              zIndex: 1,
            }}
          />
        </>
      )}

      {/* Horizontal connector */}
      {depth > 0 && (
        <svg
          className="pointer-events-none absolute"
          style={{
            left: `${(depth - 1) * 40 + 20}px`,
            top: '6px',
            width: '24px',
            height: '24px',
            zIndex: 2,
          }}
        >
          <path
            d="M 0 10 A 12 12 0 0 0 12 24 L 20 24"
            stroke={isDirectChildOfHighlighted ? 'var(--color-primary)' : 'var(--color-border)'}
            strokeWidth="1"
            fill="none"
            className="transition-colors duration-300"
          />
        </svg>
      )}

      {/* Comment content */}
      <div
        ref={contentRef}
        className="hover:bg-surface-elevated relative z-10 transition-colors"
        style={{ marginLeft: `${depth * 40}px` }}
      >
        {/* Avatar and Header Row */}
        <div className="flex gap-3 px-2 pt-2">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {comment.is_deleted ? (
              <div className="bg-surface-elevated text-text-muted flex h-5 w-5 items-center justify-center rounded-full text-sm font-semibold">
                ?
              </div>
            ) : comment.author_info.avatar ? (
              <Image
                src={comment.author_info.avatar}
                alt={comment.author_info.username}
                className="h-8 w-8 rounded-full object-cover"
                width={20}
                height={20}
              />
            ) : (
              <div className="bg-primary text-background flex h-5 w-5 items-center justify-center rounded-full text-sm font-semibold">
                {comment.author_info.username[0].toUpperCase()}
              </div>
            )}
          </div>

          {/* Header Info */}
          <div className="min-w-0 flex-1">
            {/* Clickable Header */}
            <div
              className="hover:bg-surface-elevated -mx-2 -my-0.5 mb-1 flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 text-sm transition-colors"
              onClick={onToggleCollapse}
            >
              <span className="text-text-secondary text-sm font-semibold">
                {comment.is_deleted ? '[deleted]' : comment.author_info.username}
              </span>
              <span className="text-text-muted">•</span>
              <span className="text-text-muted text-xs">{formatDate(comment.created_at)}</span>
              {!comment.is_deleted && comment.is_edited && (
                <span className="text-text-muted text-xs">(edited)</span>
              )}
              {isCollapsed && totalReplies > 0 && (
                <span className="text-text-muted ml-1 text-xs">
                  [{totalReplies} {totalReplies === 1 ? 'reply' : 'replies'}]
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content Body - Positioned below avatar+header */}
        <div
          className="text-text mb-2 px-2 text-sm leading-relaxed"
          style={{ marginLeft: '10px' }}
          data-content-body
        >
          {isCollapsed ? (
            <div className="text-text-secondary overflow-hidden text-ellipsis whitespace-nowrap italic">
              {!comment.is_deleted && comment.content}
            </div>
          ) : (
            <>
              {!comment.is_deleted && (
                <>
                  <div
                    className={isLong && !isExpanded ? 'line-clamp-4' : ''}
                    style={{
                      display: isLong && !isExpanded ? '-webkit-box' : 'block',
                      WebkitLineClamp: isLong && !isExpanded ? 4 : 'none',
                      WebkitBoxOrient: 'vertical',
                      overflow: isLong && !isExpanded ? 'hidden' : 'visible',
                    }}
                  >
                    {comment.content}
                  </div>
                  {isLong && (
                    <button
                      onClick={onToggleReadMore}
                      className="text-primary mt-1 text-xs transition-colors hover:opacity-80"
                    >
                      {isExpanded ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </>
              )}
            </>
          )}
        </div>
        {/* Media or Link - Only show if not deleted */}
        {!isCollapsed && !comment.is_deleted && (
          <div className="px-2" style={{ marginLeft: '44px' }}>
            {comment.media && comment.media.file_url && (
              <div className="mb-3">
                <div className="cursor-pointer" onClick={() => handleMediaClick(0)}>
                  <Image
                    src={comment.media.file_url}
                    alt={comment.media.alt_text || 'Comment media'}
                    className="border-border h-auto max-w-full rounded-lg border shadow-sm"
                    style={{ maxHeight: '400px', objectFit: 'cover' }}
                    width={comment.media.width || 600}
                    height={comment.media.height || 400}
                  />
                  {comment.media.media_type === 'gif' && (
                    <span className="text-text-muted mt-1 block text-xs">GIF</span>
                  )}
                </div>
              </div>
            )}

            {comment.link && (
              <div className="border-border bg-surface-elevated hover:bg-surface mb-3 rounded-lg border p-3 transition-colors">
                <a
                  href={comment.link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <div className="flex items-start gap-2">
                    <ExternalLink size={16} className="text-text-muted mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-text group-hover:text-primary text-sm font-medium transition-colors">
                        {comment.link.title}
                      </h4>
                      <p className="text-text-secondary mt-1 line-clamp-2 text-xs">
                        {comment.link.description}
                      </p>
                      <p className="text-primary mt-1 truncate text-xs">{comment.link.url}</p>
                    </div>
                  </div>
                </a>
              </div>
            )}
          </div>
        )}

        {/* Actions - Show limited actions for deleted comments */}
        {!isCollapsed && (
          <div
            className="text-text-muted mr-4 flex flex-col items-end justify-center px-2 text-sm"
            style={{ marginLeft: '44px' }}
          >
            <div className="flex items-center gap-4">
              {!comment.is_deleted ? (
                <>
                  <div className="flex items-center gap-1">
                    <LikeButton
                      objectId={comment.id}
                      contentType="GenericComment"
                      initialLikeCount={localLikeCount}
                      initialIsLiked={localUserReactions?.like || false}
                      icon={ArrowUp}
                      size={16}
                      onReactionChange={handleReactionChange}
                    />
                    <DislikeButton
                      objectId={comment.id}
                      contentType="GenericComment"
                      initialIsDisliked={localUserReactions?.dislike || false}
                      icon={ArrowDown}
                      size={16}
                      onReactionChange={handleReactionChange}
                    />
                  </div>

                  <button
                    onClick={() => onReply(comment)}
                    className="hover:text-primary flex items-center gap-1 transition-colors"
                  >
                    <MessageSquare size={14} />
                    <span>{comment.reply_count}</span>
                  </button>

                  <button
                    onClick={() => onActionMenu(comment)}
                    className="hover:text-text flex items-center gap-1 p-1 transition-colors"
                  >
                    <MoreVertical size={14} />
                  </button>
                </>
              ) : (
                // For deleted comments, only show reply count if there are replies
                hasReplies && (
                  <div className="text-text-muted flex items-center gap-1">
                    <MessageSquare size={14} />
                    <span>{comment.reply_count}</span>
                  </div>
                )
              )}
            </div>

            {/* Show more replies button */}
            {comment.has_more_replies && (
              <button
                onClick={() => onShowMoreReplies(comment.id.toString())}
                className="text-primary mt-1 text-xs transition-colors hover:opacity-80"
              >
                Show more replies...
              </button>
            )}

            {/* See More Insights for Author */}
            {!comment.is_deleted && comment.is_author && comment.like_count > 0 && (
              <button
                onClick={handleInsightsClick}
                className="text-accent hover:text-accent/80 mt-1 text-xs font-medium transition-colors"
              >
                See more insights
              </button>
            )}
          </div>
        )}
      </div>

      {/* Replies */}
      {showReplies && (
        <div className="relative">
          {comment.replies?.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              parentId={comment.id.toString()}
              isCollapsed={getIsCollapsed(reply.id)}
              highlightedLine={highlightedLine}
              isExpanded={getIsExpanded(reply.id)}
              onToggleCollapse={() => onToggleCollapseById(reply.id)}
              onToggleReadMore={() => onToggleReadMoreById(reply.id)}
              onLineClick={onLineClick}
              onShowMoreReplies={onShowMoreReplies}
              onReply={onReply}
              onActionMenu={onActionMenu}
              getIsCollapsed={getIsCollapsed}
              getIsExpanded={getIsExpanded}
              onToggleCollapseById={onToggleCollapseById}
              onToggleReadMoreById={onToggleReadMoreById}
            />
          ))}
        </div>
      )}
      {comment.media && comment.media.file_url && (
        <MediaViewer
          media={[comment.media]}
          initialIndex={mediaViewerIndex}
          isOpen={isMediaViewerOpen}
          onClose={handleCloseMediaViewer}
        />
      )}
    </div>
  );
};

export default Comment;
